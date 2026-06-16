# User 도메인 PRD

## 1. 기능 개요

사용자 프로필 관리, 앱 설정, 알림 설정, 데이터 내보내기/가져오기, 계정 보안.

## 2. 데이터 모델

```typescript
// src/entities/user/model/types.ts

interface AuthUser {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt?: string
}

interface UserSettings {
  userId: string
  theme: 'light' | 'dark' | 'system'
  currency: string                    // "KRW", "USD"
  language: string                    // "ko", "en"
  notifications: {
    budgetAlert: boolean               // 예산 경고 알림
    recurringReminder: boolean         // 반복 항목 리마인더
    weeklySummary: boolean             // 주간 요약
    monthlyReport: boolean             // 월간 보고서
  }
  security: {
    biometricEnabled: boolean          // 생체 인증
    autoLockTimeout: number            // 분 단위 (0 = 즉시)
  }
  sync: {
    wifiOnly: boolean                  // Wi-Fi에서만 동기화
    autoSyncInterval: number           // 분 단위 (0 = 수동)
  }
}

interface UserProfile extends AuthUser {
  familyIds: string[]                  //参加的家族リスト
  createdAt: string
  lastActiveAt: string
}
```

## 3. API 인터페이스

```typescript
// src/entities/user/api/index.ts

const USER_KEYS = {
  profile: () => ['user', 'profile'] as const,
  settings: () => ['user', 'settings'] as const,
}

createUserApi(supabase: SupabaseClient): {
  getProfile(): Promise<UserProfile>
  updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>
  getSettings(): Promise<UserSettings>
  updateSettings(updates: Partial<UserSettings>): Promise<UserSettings>
  deleteAccount(password: string): Promise<void>
  exportData(): Promise<ExportData>
  importData(data: ImportData): Promise<ImportResult>
}

useUserProfile(): UseQueryResult<UserProfile | null>
useUserSettings(): UseQueryResult<UserSettings>
useUpdateProfile(): UseMutationResult<UserProfile, Error, Partial<UserProfile>>
useUpdateSettings(): UseMutationResult<UserSettings, Error, Partial<UserSettings>>
useDeleteAccount(): UseMutationResult<void, Error, string>
```

## 4. 주요 유저 플로우

```
[Settings Screen]
  ├── [프로필 수정] → [이름/아바타 변경] → 저장
  ├── [알림 설정] → [토글 On/Off] → 자동 저장
  ├── [테마 설정] → [라이트/다크/시스템] → 자동 적용
  ├── [데이터 내보내기] → [CSV/JSON] → 공유 시트
  ├── [데이터 가져오기] → [파일 선택] → 매핑 → 확인
  └── [계정 삭제] → [비밀번호 확인] → [최종 확인] → 삭제
```

## 5. UI 이벤트 스크립트

### 5.1 ProfileSettingsScreen

```typescript
// Events: 프로필 설정 화면

// ===== 화면 진입 =====
onScreenFocus() {
  // 프로필 데이터 Fetch
  queryClient.fetchQuery({
    queryKey: USER_KEYS.profile(),
  }).then(profile => {
    setFormState({
      name: profile.name || '',
      avatarUrl: profile.avatarUrl || null,
    })
  })
}

// ===== 아바타 변경 =====
onAvatarPress() {
  // 1. 액션 시트 표시
  showActionSheet({
    options: [
      { label: '사진 찍기', onPress: () => launchCamera() },
      { label: '앨범에서 선택', onPress: () => launchImagePicker() },
      { label: '기본 이미지로 변경', onPress: () => clearAvatar() },
      { label: '취소', cancel: true },
    ],
  })
}

async function launchCamera() {
  const { uri } = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  })

  if (uri) {
    await uploadAvatar(uri)
  }
}

async function launchImagePicker() {
  const { uri } = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  })

  if (uri) {
    await uploadAvatar(uri)
  }
}

async function uploadAvatar(uri: string) {
  // 1. 이미지 리사이즈
  const resizedUri = await resizeImage(uri, 200, 200, 0.9)

  // 2. 스토리지 업로드
  const avatarUrl = await uploadToStorage(
    resizedUri,
    `avatars/${currentUser.id}/${Date.now()}.jpg`
  )

  // 3. 폼 상태 업데이트
  setFormState(prev => ({ ...prev, avatarUrl }))

  // 4. 서버 저장
  await updateProfile({ avatarUrl })

  Haptics.notification('success')
}

// ===== 이름 변경 =====
onNameChange(text: string) {
  if (text.length > 30) return
  setFormState(prev => ({ ...prev, name: text }))
}

// ===== 저장 버튼 =====
onSave() {
  if (!formState.name.trim()) {
    showToast('이름을 입력해주세요')
    return
  }

  executeUpdate()
}

async function executeUpdate() {
  setIsSaving(true)

  try {
    await updateProfile({
      name: formState.name.trim(),
      avatarUrl: formState.avatarUrl,
    })

    queryClient.invalidateQueries({ queryKey: USER_KEYS.profile() })

    Haptics.notification('success')
    showToast('프로필이 저장되었습니다')

  } catch (error) {
    showToast('저장 실패')
  } finally {
    setIsSaving(false)
  }
}
```

### 5.2 NotificationSettings

```typescript
// Events: 알림 설정 화면

// ===== 토글 변경 =====
onToggleChange(key: string, value: boolean) {
  // 1. 즉시 UI 업데이트
  setSettings(prev => ({
    ...prev,
    notifications: {
      ...prev.notifications,
      [key]: value,
    },
  }))

  // 2. 서버 저장 (디바운스)
  debouncedSave({ notifications: { [key]: value } })
}

const debouncedSave = useDebouncedCallback(
  async (updates) => {
    try {
      await updateSettings(updates)
    } catch (error) {
      // 실패 시 롤백
      queryClient.invalidateQueries({ queryKey: USER_KEYS.settings() })
      showToast('설정 저장 실패')
    }
  },
  500
)

// ===== 일별 알림 시간 설정 =====
onTimeChange(time: Date) {
  setNotificationTime(time)

  saveSettings({
    notifications: {
      ...settings.notifications,
      dailyReminderTime: toTimeString(time),
    },
  })
}
```

### 5.3 ThemeSettings

```typescript
// Events: 테마 설정 화면

// ===== 테마 선택 =====
onThemeSelect(theme: 'light' | 'dark' | 'system') {
  // 1. 즉시 UI 적용
  setSelectedTheme(theme)

  // 2.Appearance.set({ style: theme })

  // 3. 설정 저장
  updateSettings({ theme })
}
```

### 5.4 DataExport

```typescript
// Events: 데이터 내보내기

// ===== 내보내기 포맷 선택 =====
onFormatSelect(format: 'csv' | 'json') {
  setSelectedFormat(format)
}

// ===== 날짜 범위 선택 =====
onDateRangeSelect(range: { start: Date; end: Date }) {
  setDateRange(range)

  // 해당 기간 데이터 미리보기
  loadPreview(range)
}

async function loadPreview(range: { start: Date; end: Date }) {
  const entries = await queryClient.fetchQuery({
    queryKey: ['entries', 'export', range.start, range.end],
    queryFn: () => getEntriesForExport(range.start, range.end),
  })

  setPreviewData(entries)
  setPreviewCount(entries.length)
}

// ===== 내보내기 실행 =====
onExportPress() {
  showConfirmDialog({
    title: '데이터 내보내기',
    message: `${previewCount}개의 기록을 내보냅니다.`,
    confirmText: '내보내기',
    cancelText: '취소',
    onConfirm: executeExport,
  })
}

async function executeExport() {
  setIsExporting(true)

  try {
    // 1. 데이터 Fetch
    const data = await fetchExportData(dateRange, selectedFormat)

    // 2. 파일 생성
    const fileUri = await createExportFile(data, selectedFormat)

    // 3. 공유 시트 오픈
    await Share.share({
      url: fileUri,
      type: selectedFormat === 'csv' ? 'text/csv' : 'application/json',
    })

    Haptics.notification('success')

  } catch (error) {
    showToast('내보내기 실패')
  } finally {
    setIsExporting(false)
  }
}
```

### 5.5 DataImport

```typescript
// Events: 데이터 가져오기

// ===== 파일 선택 =====
onFileSelect() {
  DocumentPicker.pick({
    type: [DocumentPicker.types.allFiles],
    allowMultiSelection: false,
  }).then(result => {
    const file = result[0]
    setSelectedFile(file)
    parseFile(file)
  })
}

async function parseFile(file: DocumentPickerFile) {
  setIsParsing(true)

  try {
    const content = await FileSystem.readAsStringAsync(file.uri)
    const data = file.name?.endsWith('.csv')
      ? parseCSV(content)
      : JSON.parse(content)

    setParsedData(data)
    setRecordCount(data.length)

    // 매핑 화면으로
    setStep('mapping')

  } catch (error) {
    showToast('파일을 읽을 수 없습니다')
  } finally {
    setIsParsing(false)
  }
}

// ===== 필드 매핑 =====
onMappingChange(targetField: string, sourceColumn: string) {
  setFieldMapping(prev => ({
    ...prev,
    [targetField]: sourceColumn,
  }))
}

// ===== 미리보기 =====
onPreview() {
  const mappedData = applyMapping(parsedData, fieldMapping)
  setPreviewData(mappedData.slice(0, 5)) // 처음 5개
}

// ===== 가져오기 실행 =====
onImportPress() {
  showConfirmDialog({
    title: '데이터 가져오기',
    message: `${parsedData.length}개의 기록을 가져옵니다.`,
    confirmText: '가져오기',
    cancelText: '취소',
    onConfirm: executeImport,
  })
}

async function executeImport() {
  setIsImporting(true)

  try {
    // 1. 매핑 적용
    const mappedData = applyMapping(parsedData, fieldMapping)

    // 2. 각 레코드 생성
    const results = []
    for (const record of mappedData) {
      const result = await createEntryLocally({
        ...record,
        userId: currentUser.id,
        syncStatus: 'pending',
      })
      results.push(result)
    }

    // 3. 동기화 큐에 추가
    for (const record of results) {
      await addToSyncQueue({
        tableName: 'entries',
        recordId: record.id,
        operation: 'CREATE',
        payload: record,
      })
    }

    queryClient.invalidateQueries({ queryKey: ENTRY_KEYS.all() })

    Haptics.notification('success')
    showToast(`${results.length}개 가져왔습니다`)

    // HOME으로 이동
    router.replace('/(tabs)/home')

  } catch (error) {
    showToast('가져오기 실패')
  } finally {
    setIsImporting(false)
  }
}
```

### 5.6 DeleteAccount

```typescript
// Events: 계정 삭제 화면

// ===== 비밀번호 입력 =====
onPasswordChange(text: string) {
  setPassword(text)

  if (text.length > 0) {
    setPasswordError(null)
  }
}

// ===== 삭제 버튼 =====
onDeletePress() {
  // 1. 비밀번호 검증
  if (!password) {
    setPasswordError('비밀번호를 입력해주세요')
    return
  }

  // 2. 최종 확인 다이얼로그
  showConfirmDialog({
    title: '계정 삭제',
    message: '정말로 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.',
    confirmText: '삭제',
    cancelText: '취소',
    destructive: true,
    onConfirm: () => {
      // 3. 처리 중 표시
      setIsDeleting(true)
      executeDelete()
    },
  })
}

async function executeDelete() {
  try {
    // 1. 비밀번호 확인
    await verifyPassword(password)

    // 2. 계정 삭제 API 호출
    await deleteAccount(password)

    // 3. 로컬 데이터 삭제
    await clearLocalDatabase()

    // 4. SecureStore 클리어
    await clearAllStoredData()

    // 5. AuthStore 리셋
    authStore.reset()

    // 6. 온보딩으로 이동
    router.replace('/onboarding')

  } catch (error) {
    if (error.message === 'Invalid password') {
      setPasswordError('비밀번호가 올바르지 않습니다')
      setPassword('')
    } else {
      showToast('계정 삭제 실패')
    }
  } finally {
    setIsDeleting(false)
  }
}
```

## 6. 상태 관리

| 상태 | 위치 | 관리 방식 |
|------|------|----------|
| 프로필 정보 | `useUserProfile()` | TanStack Query |
| 앱 설정 | `useUserSettings()` | TanStack Query |
| 폼 입력 | 각 화면 컴포넌트 | `useState` |
| 선택된 파일 | `DataImport` | `useState` |

## 7. 폴백/에러 처리

| 시나리오 | 처리 |
|---------|------|
| 이미지 업로드 실패 | 원본 이미지 유지, 토스트 안내, 재시도 옵션 |
| 알림 권한 거부 | 설정으로 이동하는 링크 제공 |
| 내보내기 파일过大 | 분할 내보내기 옵션 제공 |
| 가져오기 포맷 오류 | 구체적인 오류 위치 안내 |
| 계정 삭제 실패 | 비밀번호 재입력 요청 |
| 세션 만료 (설정 저장 시) | 재로그인 후 자동 재시도 |