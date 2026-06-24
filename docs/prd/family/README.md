# Family 도메인 PRD

## 1. 기능 개요

가족 가계 공유. 가족 그룹 생성, 초대를 통한 멤버 추가, 역할(Role) 기반 권한 관리, 공유된 가계 기록 조회.

## 2. 데이터 모델

```typescript
// src/entities/family/model/types.ts

interface Family {
  id: string
  name: string           // "김씨 가족" 등
  createdAt: string
  inviteCode?: string    // 6자리 초대 코드
}

interface FamilyMember {
  id: string
  familyId: string
  userId: string
  role: 'admin' | 'member' | 'viewer'
  joinedAt: string
  userEmail?: string
  userName?: string
}
```

## 3. API 인터페이스

```typescript
// src/entities/family/api/index.ts

const FAMILY_KEYS = {
  all: () => ['families'] as const,
  lists: () => ['families', 'list'] as const,
  list: (userId: string) => ['families', 'list', { userId }] as const,
  details: () => ['families', 'detail'] as const,
  detail: (familyId: string) => ['families', 'detail', familyId] as const,
  members: (familyId: string) => ['families', 'members', familyId] as const,
}

createFamilyApi(supabase: SupabaseClient): {
  create(name: string, userId: string): Promise<Family>
  update(id: string, name: string): Promise<Family>
  delete(id: string): Promise<void>
  generateInviteCode(familyId: string): Promise<string>
  joinByCode(code: string, userId: string): Promise<FamilyMember>
  leave(familyId: string, userId: string): Promise<void>
  updateMemberRole(familyId: string, userId: string, role: string): Promise<void>
  removeMember(familyId: string, userId: string): Promise<void>
  listMembers(familyId: string): Promise<FamilyMember[]>
  listUserFamilies(userId: string): Promise<Family[]>
  inviteByEmail(email: string, familyId: string): Promise<void>  // 이메일 초대
}

useFamilies(userId: string): UseQueryResult<Family[]>
useFamilyMembers(familyId: string): UseQueryResult<FamilyMember[]>
useCreateFamily(): UseMutationResult<{ family: Family; inviteCode: string }, Error, { name: string }>
useJoinFamily(): UseMutationResult<FamilyMember, Error, { inviteCode: string }>
useLeaveFamily(): UseMutationResult<void, Error, { familyId: string; userId: string }>  // 가족 탈퇴
useUpdateMemberRole(): UseMutationResult<void, Error, { familyId: string; userId: string; role: string }>
useRemoveMember(): UseMutationResult<void, Error, { familyId: string; userId: string }>
useGenerateInviteCode(): UseMutationResult<string, Error, string>  // 초대 코드 생성
useInviteByEmail(): UseMutationResult<void, Error, { email: string; familyId: string }>  // 이메일로 초대
useAcceptInvite(): UseMutationResult<void, Error, { code: string; userId: string }>  // 초대 수락
```

## 4. 주요 유저 플로우

### 4.1 가족 생성
```
[Settings] → [가족 관리] → [가족 생성] → [이름 입력] → [생성 완료]
```

### 4.2 가족 초대
```
[Family Screen] → [초대하기] → [초대 코드 표시/복사] → [공유]
                  OR
[Settings] → [초대 코드 입력] → [참여]
```

### 4.3 공유 가계 보기
```
[HOME] → [가족 선택 토글] → [가족 모드] → [가족 공유 기록 조회]
```

## 5. UI 이벤트 스크립트

### 5.1 FamilyListScreen

```typescript
// Events: 가족 목록 화면

// ===== 화면 진입 =====
onScreenFocus() {
  // 1. 내 가족 목록 Fetch
  queryClient.fetchQuery({
    queryKey: FAMILY_KEYS.list(currentUser.id),
  }).then(families => {
    setFamilies(families)

    // 2. 최근 사용 가족 있으면 선택
    if (families.length > 0) {
      const lastUsed = getLastUsedFamilyId()
      const target = families.find(f => f.id === lastUsed) || families[0]
      setSelectedFamily(target)
    }
  })
}

// ===== 가족 카드 탭 =====
onFamilyCardPress(family: Family) {
  // 1. 선택 상태 업데이트
  setSelectedFamily(family)

  // 2. 마지막 사용 가족 저장
  setLastUsedFamilyId(family.id)

  // 3. 가족 모드 진입
  setIsFamilyMode(true)

  // 4. 해당 가족 데이터 로드
  loadFamilyData(family.id)
}

async function loadFamilyData(familyId: string) {
  // 5. 가족 멤버 Fetch
  const members = await queryClient.fetchQuery({
    queryKey: FAMILY_KEYS.members(familyId),
  })
  setFamilyMembers(members)

  // 6. 공유 기록 Fetch
  queryClient.invalidateQueries({
    queryKey: ENTRY_KEYS.list(currentUser.id, year, month),
  })
}

// ===== 가족 생성 버튼 =====
onCreateFamilyPress() {
  // 1. 생성 모달 오픈
  openCreateModal()
}

// ===== 가족 편집 버튼 =====
onEditFamilyPress(family: Family) {
  if (!isAdmin(family.id)) {
    showToast('관리자만 수정할 수 있습니다')
    return
  }
  openEditModal(family)
}
```

### 5.2 CreateFamilyModal

```typescript
// Events: 가족 생성 모달

// ===== 가족명 입력 =====
onFamilyNameChange(text: string) {
  // 1. 최대 30자 제한
  if (text.length > 30) return

  setFamilyName(text)

  // 2. 미리보기 업데이트
  setPreviewName(text)
}

// ===== 생성 버튼 =====
onCreate() {
  // ===== Validation =====
  if (!familyName.trim()) {
    showToast('가족 이름을 입력해주세요')
    nameInputRef.current?.focus()
    return
  }

  executeCreate()
}

async function executeCreate() {
  setIsSubmitting(true)

  try {
    const family = await createFamily({
      name: familyName.trim(),
      userId: currentUser.id,
    })

    // 초대 코드 자동 생성
    const inviteCode = await generateInviteCode(family.id)

    queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })

    onClose()

    // 3. 성공 후 초대 코드 안내
    showInviteCodeDialog(inviteCode)

  } catch (error) {
    showToast('생성 실패')
  } finally {
    setIsSubmitting(false)
  }
}
```

### 5.3 InviteFamilyModal (초대하기)

```typescript
// Events: 초대 모달

// ===== 초대 코드 생성/조회 =====
onOpenInvite() {
  fetchInviteCode()
}

async function fetchInviteCode() {
  // 이미 코드가 있으면 재사용
  if (selectedFamily?.inviteCode) {
    setInviteCode(selectedFamily.inviteCode)
    setExpiresAt(selectedFamily.inviteCodeExpiresAt)
    return
  }

  // 없으면 새로 생성
  const newCode = await generateInviteCode(selectedFamily.id)
  setInviteCode(newCode)
  // 24시간 후 만료
  setExpiresAt(Date.now() + 86400000)
}

// ===== 코드 복사 =====
onCopyCode() {
  Clipboard.setString(inviteCode)

  // 1. 햅티 feedback
  Haptics.notification('success')

  // 2. 복사 완료 토스트
  showToast('복사되었습니다')

  // 3. 공유 시트 오픈
  setShowShareSheet(true)
}

// ===== 공유 버튼 =====
onSharePress() {
  const message = `${currentUser.name}님이 Money-Space 가족 초대를 보냈습니다.\n초대 코드: ${inviteCode}\n\n앱에서 코드를 입력하여 참여하세요!`

  Share.share({
    message,
    title: '가족 초대',
  })
}

// ===== 코드 새로고침 =====
onRefreshCode() {
  showConfirmDialog({
    title: '코드 새로 생성',
    message: '기존 코드는 사용할 수 없게 됩니다. 계속하시겠습니까?',
    confirmText: '생성',
    cancelText: '취소',
    onConfirm: async () => {
      const newCode = await generateInviteCode(selectedFamily.id)
      setInviteCode(newCode)
      setExpiresAt(Date.now() + 86400000)
      showToast('새 코드가 생성되었습니다')
    },
  })
}
```

### 5.4 JoinFamilyModal (참여하기)

```typescript
// Events: 초대 코드 입력하여 참여

// ===== 코드 입력 =====
onCodeChange(text: string) {
  // 1. 대문자 자동 변환
  const upperText = text.toUpperCase()

  // 2. 6자리 제한
  if (upperText.length > 6) return

  // 3. 영어/숫자만 허용
  if (!/^[A-Z0-9]*$/.test(upperText)) return

  setInviteCode(upperText)

  // 4. 자동 완료 감지
  if (upperText.length === 6) {
    setIsValidating(true)
    validateCode(upperText)
  }
}

async function validateCode(code: string) {
  try {
    const result = await validateInviteCode(code)

    if (result.valid) {
      // 유효한 코드: 가족 정보 표시
      setTargetFamily(result.family)
      setFamilyName(result.family.name)
      setPreviewAdminName(result.adminName)
      setIsValidCode(true)
    } else {
      setIsValidCode(false)
      setErrorMessage(result.message || '유효하지 않은 코드입니다')
    }
  } catch (error) {
    setErrorMessage('코드 검증 실패')
  } finally {
    setIsValidating(false)
  }
}

// ===== 참여 버튼 =====
onJoin() {
  if (!isValidCode || isValidating) return

  showConfirmDialog({
    title: '가족 참여',
    message: `"${familyName}"에 참여하시겠습니까?`,
    confirmText: '참여',
    cancelText: '취소',
    onConfirm: executeJoin,
  })
}

async function executeJoin() {
  setIsSubmitting(true)

  try {
    const member = await joinByCode({
      inviteCode,
      userId: currentUser.id,
    })

    queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })

    onClose()
    showToast('가족에 참여했습니다!')

    // 가족 모드로 자동 전환
    setIsFamilyMode(true)
    setSelectedFamilyId(member.familyId)

  } catch (error) {
    if (error.message === 'ALREADY_MEMBER') {
      showToast('이미 참여한 가족입니다')
    } else if (error.message === 'CODE_EXPIRED') {
      showToast('초대 코드가 만료되었습니다')
    } else {
      showToast('참여 실패')
    }
  } finally {
    setIsSubmitting(false)
  }
}
```

### 5.5 FamilyMemberList

```typescript
// Events: 가족 멤버 목록

// ===== 멤버 탭 =====
onMemberPress(member: FamilyMember) {
  // 본인이면 프로필로, 다른 사람이면 상세 보기
  if (member.userId === currentUser.id) {
    router.push('/settings/profile')
  }
}

// ===== 역할 변경 (Admin만) =====
onRoleChange(member: FamilyMember, newRole: Role) {
  if (!isAdmin(selectedFamily.id)) {
    showToast('관리자만 역할을 변경할 수 있습니다')
    return
  }

  if (member.userId === currentUser.id) {
    showToast('본인의 역할은 변경할 수 없습니다')
    return
  }

  showConfirmDialog({
    title: '역할 변경',
    message: `${member.userName}의 역할을 "${getRoleLabel(newRole)}"(으)로 변경하시겠습니까?`,
    confirmText: '변경',
    cancelText: '취소',
    onConfirm: async () => {
      await updateMemberRole({
        familyId: selectedFamily.id,
        userId: member.userId,
        role: newRole,
      })
      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.members(selectedFamily.id) })
      showToast('역할이 변경되었습니다')
    },
  })
}

// ===== 멤버 추방 (Admin만) =====
onRemoveMember(member: FamilyMember) {
  if (!isAdmin(selectedFamily.id)) return

  if (member.userId === currentUser.id) {
    showToast('본인은 추방할 수 없습니다')
    return
  }

  showConfirmDialog({
    title: '멤버 삭제',
    message: `${member.userName}님을 가족에서 삭제하시겠습니까?`,
    confirmText: '삭제',
    cancelText: '취소',
    onConfirm: async () => {
      await removeMember({
        familyId: selectedFamily.id,
        userId: member.userId,
      })
      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.members(selectedFamily.id) })
      showToast('멤버가 삭제되었습니다')
    },
  })
}

// ===== 탈퇴 =====
onLeaveFamily() {
  showConfirmDialog({
    title: '가족 탈퇴',
    message: '정말 이 가족에서 탈퇴하시겠습니까?',
    confirmText: '탈퇴',
    cancelText: '취소',
    onConfirm: async () => {
      await leaveFamily({
        familyId: selectedFamily.id,
        userId: currentUser.id,
      })

      queryClient.invalidateQueries({ queryKey: FAMILY_KEYS.all() })

      setIsFamilyMode(false)
      setSelectedFamily(null)

      showToast('가족을 탈퇴했습니다')
    },
  })
}
```

### 5.6 FamilyInviteFeature (기능별 접근)

```typescript
// Events: src/features/family/family-invite/FamilyInvite.tsx

// ===== 초대 코드 입력 화면 =====
onCodeSubmit(code: string) {
  // 1. 코드 유효성 검증
  // 2. 가족 정보 표시
  // 3. 참여 확인
}

// ===== 공유からの参加 =====
onDeepLinkJoin(familyId: string, inviteCode: string) {
  // 1. 자동 코드 입력
  setInviteCode(inviteCode)

  // 2. 자동 검증
  validateCode(inviteCode)
}
```

## 6. 상태 관리

| 상태 | 위치 | 관리 방식 |
|------|------|----------|
| 가족 목록 | `useFamilies()` | TanStack Query |
| 멤버 목록 | `useFamilyMembers()` | TanStack Query |
| 선택된 가족 | `FamilyContext` | React Context |
| 가족 모드 여부 | `FamilyContext` | React Context |
| 초대 코드 | `InviteFamilyModal` | `useState` |

## 7. 폴백/에러 처리

| 시나리오 | 처리 |
|---------|------|
| 초대 코드 만료 | "코드가 만료되었습니다. 새로운 코드를 요청하세요." |
| 이미 참여한 가족 | "이미 참여한 가족입니다" 토스트 |
| 탈퇴 시 마지막 관리자 | "마지막 관리자는 탈퇴할 수 없습니다" |
| 가족 삭제 시 남은 멤버 | 관리자가가족을 삭제하면 모든 멤버에게 알림 |
| 초대 코드 오타 | 실시간 검증 후 "유효하지 않은 코드" 표시 |

## 8. 주요 페이지

### 8.1 FamilyManagerScreen

```typescript
// Events: src/pages/family/ui/FamilyManagerScreen.tsx
// src/features/family/family-manager/ui/FamilyManager.tsx

// ===== 가족 목록 조회 =====
onScreenFocus() {
  // 1. 내 가족 목록 Fetch
  // 2. FamilyManagerScreen에 표시
}

// ===== 가족 선택 =====
onFamilySelect(family: Family) {
  // 1. 선택된 가족 상태 업데이트
  // 2. 해당 가족 데이터 로드
  // 3. 가족 모드 진입
}

// ===== 가족 생성 =====
onCreateFamily() {
  openCreateFamilyModal()
}

// ===== 가족 편집 =====
onEditFamily(family: Family) {
  if (!isAdmin(family.id)) {
    showToast('관리자만 수정할 수 있습니다')
    return
  }
  openEditModal(family)
}

// ===== 가족 삭제 =====
onDeleteFamily(family: Family) {
  if (!isAdmin(family.id)) return

  showConfirmDialog({
    title: '가족 삭제',
    message: '이 가족을 삭제하시겠습니까?',
    confirmText: '삭제',
    onConfirm: executeDelete,
  })
}
```

### 8.2 SharedScreen

```typescript
// Events: src/pages/shared/ui/SharedScreen.tsx

// ===== 공유 내역 조회 =====
onScreenFocus() {
  // 1. 선택된 가족의 공유된 Entry Fetch
  // 2. 목록 표시
}

// 특정 가족 그룹과 공유된 가계 기록만 필터링하여 표시
```