# Sync 도메인 PRD

## 1. 기능 개요

SQLite 기반 로컬 저장 + Supabase 원격 동기화. 네트워크 상태에 따른 자동 오프라인 지원, 동기화 큐 관리, 충돌 해결.

## 2. 데이터 모델

```typescript
// src/entities/sync-queue/model/types.ts

type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE'

interface SyncQueueItem {
  id: string
  tableName: string          // 'entries', 'budgets', 'categories'
  recordId: string            // 로컬 ID
  operation: SyncOperation
  payload: Record<string, any>
  status: 'pending' | 'syncing' | 'failed' | 'completed'
  createdAt: number           // timestamp
  syncedAt?: number           // timestamp
  retryCount: number
  error?: string
}
```

## 3. API 인터페이스

```typescript
// src/entities/sync-queue/api/index.ts

const SYNC_KEYS = {
  queue: () => ['sync', 'queue'] as const,
  status: () => ['sync', 'status'] as const,
}

createSyncApi(supabase: SupabaseClient, db: SQLiteDatabase): {
  addToQueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'createdAt' | 'retryCount'>): Promise<void>
  processQueue(): Promise<SyncResult>
  getPendingItems(): Promise<SyncQueueItem[]>
  markCompleted(itemId: string): Promise<void>
  markFailed(itemId: string, error: string): Promise<void>
  resolveConflict(local: any, remote: any, strategy: 'local' | 'remote' | 'merge'): Promise<any>
}

useSyncStatus(): UseQueryResult<SyncStatus>
useSyncProgress(): UseQueryResult<SyncProgress>
useManualSync(): UseMutationResult<void, Error, void>

// SyncStatus 타입
interface SyncStatus {
  lastSyncedAt: number | null
  pendingCount: number
  isOnline: boolean
  isSyncing: boolean
}
```

## 4. 주요 유저 플로우

```
[App Launch] → [Check Network] → [Load from SQLite] → [Display]
                    │
                    ├── [Online] → [Sync with Supabase]
                    └── [Offline] → [Queue for later]

[Entry Create] → [Save to SQLite] → [Add to Queue] → [Background Sync]
```

## 5. UI 이벤트 스크립트

### 5.1 SyncEngine (백그라운드 동기화)

```typescript
// Events: src/features/sync/sync-engine/model/SyncEngine.ts

// ===== 앱 포그라운드 진입 시 =====
onAppForeground() {
  // 1. 네트워크 상태 확인
  const isOnline = await checkNetworkStatus()

  if (isOnline) {
    // 2. 待处理 항목 있으면 동기화
    const pending = await getPendingItems()
    if (pending.length > 0) {
      await processQueue()
    }
  }

  // 3. Auth 상태 확인 (다른 기기에서 로그아웃된 경우)
  const session = await getSession()
  if (!session) {
    // 로그아웃 처리
    handleSessionExpired()
  }
}

// ===== 네트워크 상태 변경 =====
onNetworkChange(isOnline: boolean) {
  setIsOnline(isOnline)

  if (isOnline) {
    // 온라인 전환 시 동기화
    SyncStatusBar.show('sync')
    await processQueue()
    SyncStatusBar.show('synced')
  } else {
    // 오프라인 전환 알림
    SyncStatusBar.show('offline')
  }
}

// ===== 엔트리 생성 시 (오프라인 우선) =====
async function createEntryOffline(entry: CreateEntryInput) {
  // 1. 로컬 SQLite에 저장
  const localEntry = await db.insert('entries', {
    ...entry,
    id: generateLocalId(),       // UUID v4
    syncStatus: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  // 2. 동기화 큐에 추가
  await addToQueue({
    tableName: 'entries',
    recordId: localEntry.id,
    operation: 'CREATE',
    payload: localEntry,
  })

  // 3. UI 즉시 업데이트 (Optimistic)
  queryClient.setQueryData(
    ENTRY_KEYS.list(userId, year, month),
    (old) => old ? [localEntry, ...old] : [localEntry]
  )

  // 4. 백그라운드 동기화 시도
  if (isOnline) {
    scheduleBackgroundSync()
  }

  return localEntry
}

// ===== 큐 처리 =====
async function processQueue() {
  const pending = await getPendingItems()

  if (pending.length === 0) return

  setIsSyncing(true)

  for (const item of pending) {
    try {
      // 진행 상태 업데이트
      updateProgress(item.id, 'syncing')

      // 실제 API 호출
      await executeSyncOperation(item)

      // 완료 처리
      await markCompleted(item.id)

    } catch (error) {
      // 실패 처리
      await handleSyncError(item, error)
    }
  }

  setIsSyncing(false)
  setLastSyncedAt(Date.now())
}

async function executeSyncOperation(item: SyncQueueItem) {
  const { tableName, recordId, operation, payload } = item

  switch (operation) {
    case 'CREATE':
      return supabase.from(tableName).insert(payload)

    case 'UPDATE':
      return supabase.from(tableName).update(payload).eq('id', recordId)

    case 'DELETE':
      return supabase.from(tableName).delete().eq('id', recordId)
  }
}

async function handleSyncError(item: SyncQueueItem, error: any) {
  if (isRetryableError(error)) {
    // 재시도 가능 에러: 카운트 증가
    await incrementRetryCount(item.id)

    if (item.retryCount >= 3) {
      // 최대 재시도 초과
      await markFailed(item.id, error.message)
      notifySyncFailed(item)
    }
  } else {
    // 재시도 불가 에러 (404 등)
    await markFailed(item.id, error.message)

    if (error.message === 'RECORD_NOT_FOUND') {
      // 원격에 없는 레코드 → 삭제 처리
      await markCompleted(item.id)
    }
  }
}
```

### 5.2 SyncStatusBar 위젯

```typescript
// Events: src/widgets/sync-status/SyncStatus.tsx

// ===== 상태에 따른 표시 =====
useEffect(() => {
  if (isSyncing) {
    // 회전 애니메이션
    rotationAnim.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1
    )
    setStatusText('동기화 중...')
  } else if (!isOnline) {
    setStatusText('오프라인')
    setStatusColor('orange')
  } else if (pendingCount > 0) {
    setStatusText(`${pendingCount}개 대기`)
    setStatusColor('orange')
  } else {
    setStatusText('동기화 완료')
    setStatusColor('green')
  }
}, [isSyncing, isOnline, pendingCount])

// ===== 수동 동기화 트리거 =====
onRefresh() {
  if (isSyncing || !isOnline) return

  Haptics.impact('light')
  processQueue()
}
```

### 5.3 ConflictResolution

```typescript
// Events: 충돌 감지 및 해결

// ===== 충돌 감지 =====
async function checkForConflicts(localId: string, tableName: string) {
  // 1. 원격 데이터 조회
  const remote = await supabase
    .from(tableName)
    .select()
    .eq('id', localId)
    .single()

  if (!remote.data) return null

  // 2. 로컬 데이터 조회
  const local = await db.select(tableName, { id: localId })

  // 3. updatedAt 비교
  if (local.updatedAt !== remote.data.updatedAt) {
    return { local, remote }
  }

  return null
}

// ===== 충돌 해결 선택 =====
async function resolveConflict(
  localId: string,
  tableName: string,
  local: any,
  remote: any,
  strategy: 'local' | 'remote' | 'merge'
) {
  switch (strategy) {
    case 'local':
      // 로컬 데이터로 원격 덮어쓰기
      return await supabase
        .from(tableName)
        .update(local)
        .eq('id', localId)

    case 'remote':
      // 원격 데이터로 로컬 덮어쓰기
      await db.update(tableName, remote, { id: localId })
      queryClient.invalidateQueries({ queryKey: [tableName] })
      return

    case 'merge':
      // 필드별 머지 (최신 것优先)
      const merged = mergeByTimestamp(local, remote)
      await db.update(tableName, merged, { id: localId })
      await supabase.from(tableName).update(merged).eq('id', localId)
      queryClient.invalidateQueries({ queryKey: [tableName] })
      return
  }
}

// ===== 머지 전략 =====
function mergeByTimestamp(local: any, remote: any): any {
  const merged = { ...remote }

  for (const key of Object.keys(local)) {
    if (key === 'id' || key === 'createdAt') continue

    const localTime = new Date(local.updatedAt).getTime()
    const remoteTime = new Date(remote.updatedAt).getTime()

    // 더 최근인 것으로 덮어쓰기
    if (localTime > remoteTime) {
      merged[key] = local[key]
    }
  }

  merged.updatedAt = new Date().toISOString()
  return merged
}
```

### 5.4 SubscribeToRealtime

```typescript
// Events: src/features/sync/sync-engine/lib/subscribe-to-realtime.ts

// ===== 실시간 구독 시작 =====
function subscribeToRealtime() {
  const user = useAuthStore.getState().user
  if (!user) return null

  const entryApi = createEntryApi()

  // Supabase Realtime 구독
  const subscription = entryApi.remote.subscribe(
    user.id,
    (payload: RealtimePayload) => {
      handleEntryChange(payload)
    },
  )

  return subscription
}

// ===== 실시간 변경 처리 =====
function handleEntryChange(payload: RealtimePayload) {
  const entryApi = createEntryApi()

  if (payload.eventType === 'DELETE') {
    // 원격 삭제: 로컬에서도 삭제
    entryApi.local.delete(payload.old.id)
  } else {
    // 원격 생성/수정: 로컬에 반영
    entryApi.local.upsertFromRemote(payload.new)
  }
}

// 다른 기기에서 변경된 데이터를 실시간으로 수신하여 로컬에 반영
```

### 5.5 NetworkStatus

```typescript
// Events: src/features/sync/sync-engine/model/network-status.ts

// ===== 네트워크 상태 조회 =====
getNetworkStatus(): boolean  // 온라인 여부

// ===== 네트워크 상태 설정 =====
setNetworkStatus(isOnline: boolean): void

// ===== 네트워크 변경 콜백 등록 =====
onNetworkChange(callback: (isOnline: boolean) => void): () => void

// ===== Wi-Fi 연결 상태 =====
isWifi(): Promise<boolean>
```

### 5.6 PushPendingChanges

```typescript
// Events: src/features/sync/sync-engine/model/push-pending-changes.ts

// ===== 대기 중인 변경사항 푸시 =====
pushPendingChanges(): Promise<SyncResult>

// isSyncing: boolean - 동기화 진행 중 상태
```

### 5.7 ConflictResolution

```typescript
// Events: src/features/sync/sync-engine/model/conflict-resolution.ts

// ===== 충돌 감지 =====
detectConflict(localId: string, tableName: string): Promise<SyncConflict | null>

// ===== 충돌 해결 =====
resolveConflict(
  localId: string,
  tableName: string,
  local: any,
  remote: any,
  strategy: 'local' | 'remote' | 'merge'
): Promise<void>
```

### 5.8 UseManualSync

```typescript
// Events: src/features/sync/sync-engine/model/use-manual-sync.ts

const { mutate: manualSync, isPending } = useManualSync()

// 수동 동기화 트리거 hook
```

### 5.9 SyncQueueManager (설정 화면)

```typescript
// Events: src/pages/settings/sync/SyncSettings.tsx

// ===== 수동 동기화 버튼 =====
onManualSyncPress() {
  if (!isOnline) {
    showToast('네트워크 연결을 확인해주세요')
    return
  }

  if (isSyncing) {
    showToast('동기화 중입니다')
    return
  }

  Haptics.impact('medium')
  executeManualSync()
}

async function executeManualSync() {
  setIsSyncing(true)

  try {
    await processQueue()

    // 성공 피드백
    Haptics.notification('success')
    showToast('동기화 완료')

  } catch (error) {
    showToast('동기화 실패')
  } finally {
    setIsSyncing(false)
  }
}

// ===== 실패 항목 재시도 =====
onRetryFailed() {
  const failed = pendingItems.filter(i => i.status === 'failed')

  if (failed.length === 0) {
    showToast('재시도할 항목이 없습니다')
    return
  }

  showConfirmDialog({
    title: '재시도',
    message: `${failed.length}개 항목을 재시도하시겠습니까?`,
    confirmText: '재시도',
    cancelText: '취소',
    onConfirm: async () => {
      // 실패 항목 상태 초기화
      for (const item of failed) {
        await resetToPending(item.id)
      }

      // 동기화 실행
      executeManualSync()
    },
  })
}

// ===== 실패 항목 삭제 =====
onDeleteFailed() {
  const failed = pendingItems.filter(i => i.status === 'failed')

  if (failed.length === 0) return

  showConfirmDialog({
    title: '동기화 실패 항목 삭제',
    message: `${failed.length}개 항목이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`,
    confirmText: '삭제',
    cancelText: '취소',
    onConfirm: async () => {
      for (const item of failed) {
        await removeFromQueue(item.id)
      }

      queryClient.invalidateQueries({ queryKey: SYNC_KEYS.queue() })
      showToast('삭제되었습니다')
    },
  })
}
```

## 6. 상태 관리

| 상태 | 위치 | 관리 방식 |
|------|------|----------|
| 동기화 상태 | `SyncStatusBar` | `useState` |
| 큐 상태 | `SyncEngine` (별도 process) | TanStack Query |
| 네트워크 상태 | `NetworkContext` | React Context |

## 7. 폴백/에러 처리

| 시나리오 | 처리 |
|---------|------|
| 네트워크 오프라인 | 로컬 저장, 큐에 추가, 나중에 동기화 |
| 동기화 실패 (일시적) | 3회 재시도, 실패 시 유지 |
| 동기화 실패 (영구적) | 사용자 확인 후 삭제/무시 옵션 |
| 충돌 발생 | 사용자 선택 다이얼로그 (로컬 우선/원격 우선/머지) |
| 세션 만료 | 동기화 중단, 재로그인 요청 |
| DB 마이그레이션 | 앱 업데이트 시 스키마 자동 마이그레이션 |