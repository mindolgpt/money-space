# Shared 공통 문서

## 1. 개요

모든 도메인에서 공통으로 사용하는 UI 컴포넌트, 이벤트 패턴, 로딩/에러 상태约定的 문서입니다.

## 2. 공통 UI 컴포넌트

### 2.1 Button

```typescript
// Props
interface ButtonProps {
  onPress: () => void
  title: string
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

// ===== 이벤트 스크립트 =====

// ===== 기본 탭 =====
onPress() {
  // 1. disabled면 무시
  if (disabled || loading) return

  // 2. 햅티 피드백
  Haptics.impact('light')

  // 3. 로딩 상태면 무시 (중복 클릭 방지)
  if (loading) return

  // 4. 콜백 실행
  callback()
}

// ===== 로딩 상태 =====
onLoadingState() {
  // 1. 로딩 스피너 표시
  // 2. 텍스트 대신 "처리 중..." 표시
  // 3. 터치 비활성화
  // 4. opacity 0.6
}

// ===== 비활성화 상태 =====
onDisabledState() {
  // 1. opacity 0.5
  // 2. 터치 이벤트 무시
  // 3. 접근성 announcement: "disabled"
}
```

### 2.2 TextInput

```typescript
// Props
interface TextInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  error?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'numeric' | 'email' | 'phone'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  maxLength?: number
  multiline?: boolean
  numberOfLines?: number
  editable?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  onFocus?: () => void
  onBlur?: () => void
}

// ===== 이벤트 스크립트 =====

// ===== 텍스트 변경 =====
onChangeText(text: string) {
  // 1. maxLength 체크
  if (maxLength && text.length > maxLength) return

  // 2. 상태 업데이트
  onChangeText(text)

  // 3. 에러 상태 클리어 (입력 시작 시)
  if (error) {
    clearError()
  }
}

// ===== 포커스 =====
onFocus() {
  // 1. border 색상 변경 (primary)
  setIsFocused(true)

  // 2. Accessibility: "입력 중"
  announceForAccessibility('입력 중')
}

// ===== 블러 =====
onBlur() {
  // 1. border 색상 복원
  setIsFocused(false)

  // 2. validation 트리거 (필드 레벨)
  if (validator) {
    const validationError = validator(value)
    if (validationError) {
      setError(validationError)
    }
  }
}

// ===== 제출 (Keyboard submit) =====
onSubmitEditing() {
  // 1. 다음 필드로 포커스 이동 (returnKeyType === 'next')
  // 2. 또는 폼 제출 (returnKeyType === 'done')
  focusNextField()
}
```

### 2.3 Modal

```typescript
// Props
interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  showCloseButton?: boolean
  fullScreen?: boolean
  presentationStyle?: 'pageSheet' | 'fullScreen' | 'overFullScreen'
}

// ===== 이벤트 스크립트 =====

// ===== 오픈 =====
onOpen() {
  // 1. fadeIn 애니메이션 (300ms)
  Animated.timing(opacity, {
    toValue: 1,
    duration: 300,
  }).start()

  // 2. 배경 스크롤 방지
  // Lock: { bodyScrollLock: true }

  // 3. 접근성: 모달 열림 announcement
  announceForAccessibility('모달 열림')
}

// ===== 클로즈 (배경 탭) =====
onBackdropPress() {
  if (isLoading) return // 저장 중이면 무시

  onClose()
}

// ===== 클로즈 (버튼) =====
onCloseButtonPress() {
  Haptics.impact('light')
  onClose()
}

// ===== 클로즈 (하드웨어 백) =====
onHardwareBackPress() {
  // Android only
  if (isLoading) return
  onClose()
  return true // 이벤트 소비
}
```

### 2.4 ActionSheet

```typescript
// ===== 옵션 선택 =====
onOptionPress(option: ActionOption) {
  // 1. 햅티 피드백
  Haptics.impact('medium')

  // 2. 선택된 옵션 실행
  option.onPress?.()

  // 3. 시트 닫기
  onClose()
}

// ===== 취소 버튼 =====
onCancel() {
  Haptics.impact('light')
  onClose()
}

// =====-swipe로 닫기 =====
onSwipeDown() {
  // 바닥까지 스와이프하면 닫기
  if (translateY.value > threshold) {
    onClose()
  }
}
```

### 2.5 Toast

```typescript
// ===== 토스트 표시 =====
function showToast(message: string, type?: 'info' | 'success' | 'error' | 'warning') {
  // 1. 타입별 아이콘/색상 설정
  const config = {
    success: { icon: '✓', color: 'green' },
    error: { icon: '✕', color: 'red' },
    warning: { icon: '!', color: 'orange' },
    info: { icon: 'i', color: 'blue' },
  }[type]

  // 2. 자동 표시 (300ms delay)
  setToastConfig({ message, ...config })

  // 3. 3초 후 자동 사라짐
  setTimeout(() => {
    dismissToast()
  }, 3000)
}

// ===== 토스트 탭 =====
onToastPress() {
  // 토스트를 탭하면 상세 정보 표시 또는 액션 실행
  onToastAction?.()
}
```

### 2.6 ConfirmDialog

```typescript
// ===== 확인 버튼 =====
onConfirm() {
  Haptics.notification('success')
  onClose()
  onConfirmCallback?.()
}

// ===== 취소 버튼 =====
onCancel() {
  Haptics.impact('light')
  onClose()
  onCancelCallback?.()
}

// ===== 배경 탭 =====
onBackdropPress() {
  // 확인 다이얼로그는 배경 탭으로 닫지 않음 (실수 방지)
  // 단, destructive dialog는 닫을 수 있음
  if (allowBackdropClose) {
    onCancel()
  }
}
```

### 2.7 DatePicker

```typescript
// ===== 날짜 선택 =====
onDateChange(date: Date) {
  // 1. 즉시 UI 업데이트
  setSelectedDate(date)

  // 2. 형식 변환하여 표시
  setDisplayDate(formatDate(date))
}

// ===== 년/월 선택 =====
onMonthYearChange(year: number, month: number) {
  const newDate = new Date(year, month - 1, 1)
  onDateChange(newDate)
}

// ===== 오늘로 이동 =====
onGoToToday() {
  const today = new Date()
  onDateChange(today)
}
```

### 2.8 CategoryPicker

```typescript
// ===== 카테고리 선택 =====
onSelect(category: Category) {
  // 1. 체크 애니메이션
  Animated.sequence([
    Animated.scale(1.2, { duration: 100 }),
    Animated.scale(1, { duration: 100 }),
  ])

  // 2. 햅티 피드백
  Haptics.selectionChanged()

  // 3. 부모 콜백
  onSelect(category)

  // 4. 자동 닫기 (선택 시)
  if (closeOnSelect) {
    setTimeout(onClose, 200)
  }
}
```

### 2.9 NumberPad

```typescript
// ===== 숫자 입력 =====
onNumberPress(num: string) {
  // 1. 햅티 피드백
  Haptics.impact('light')

  // 2. 현재 값에 추가
  const newValue = currentValue + num

  // 3. 최대 자릿수 체크
  if (newValue.length > maxLength) return

  // 4. 상태 업데이트
  onChange(newValue)
}

// ===== 지우기 =====
onBackspace() {
  Haptics.impact('light')

  const newValue = currentValue.slice(0, -1)
  onChange(newValue)
}

// ===== 전체 지우기 =====
onClear() {
  Haptics.impact('medium')
  onChange('')
}
```

## 3. 공통 상태 패턴

### 3.1 로딩 상태

```typescript
// ===== 초기 로딩 =====
function useInitialLoading() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 데이터 Fetch
    fetchData().finally(() => {
      // minimum 300ms 표시 (flash 방지)
      setTimeout(() => setIsLoading(false), 300)
    })
  }, [])

  return isLoading
}

// ===== 더보기 로딩 =====
function useLoadMore() {
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadMore = async () => {
    if (isLoading || !hasNextPage) return

    setIsLoadingMore(true)
    await fetchNextPage()
    setIsLoadingMore(false)
  }

  return { isLoadingMore, loadMore }
}
```

### 3.2 빈 상태

```typescript
// ===== 빈 상태 표시 =====
function EmptyState({ title, description, icon, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color="gray" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && (
        <Button title={actionLabel} onPress={onAction} />
      )}
    </View>
  )
}

// 사용 예시
// <EmptyState
//   title="기록이 없습니다"
//   description="첫 번째 가계 기록을 남겨보세요"
//   icon="receipt"
//   actionLabel="기록하기"
//   onAction={openAddEntry}
// />
```

### 3.3 에러 상태

```typescript
// ===== 에러 발생 =====
function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Icon name="error" size={64} color="red" />
      <Text style={styles.message}>{message}</Text>
      <Button title="다시 시도" onPress={onRetry} />
    </View>
  )
}

// ===== 에러 바운더리 =====
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    logError(error, info)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState onRetry={() => this.setState({ hasError: false })} />
    }
    return this.props.children
  }
}
```

## 4. 접근성 (Accessibility)

### 4.1Announce

```typescript
// 중요 상태 변경 시
AccessibilityInfo.announceForAccessibility('저장되었습니다')
AccessibilityInfo.announceForAccessibilityWithOptions(
  '3개 항목 선택됨',
  { queue: true }
)

// ===== 토스트 접근성 =====
ToastContainer => {
  useEffect(() => {
    // 토스트 메시지 접근성에 알림
    AccessibilityInfo.announceForAccessibility(message)
  }, [message])
}
```

### 4.2 Role 및 Label

```typescript
// 버튼
<Button
  accessibilityRole="button"
  accessibilityLabel="저장하기"
  accessibilityHint="이 버튼을 누르면表单이 저장됩니다"
/>

// 리스트
<ListItem
  accessibilityRole="button"
  accessibilityLabel={`${entry.amount}원, ${entry.categoryName}, ${entry.date}`}
/>

// 모달
<Modal
  accessibilityRole="alertdialog"
  accessibilityLabel="확인 다이얼로그"
  accessibilitySubrole="alert"
/>
```

## 5. 햅틱 피드백 규칙

| 상황 | 햅틱 타입 |
|------|----------|
| 버튼 탭 | `impact.light` |
| 선택 변경 | `selectionChanged` |
| 성공/완료 | `notification.success` |
| 경고 | `notification.warning` |
| 오류 | `notification.error` |
| 드래그 시작 | `impact.medium` |
| 스와이프 완료 | `impact.heavy` |

## 6. 애니메이션 규칙

| 애니메이션 | duration | easing |
|-----------|----------|--------|
| 모달 열기 | 300ms | ease-in-out |
| 모달 닫기 | 250ms | ease-in |
| 스낵바 ظهور | 200ms | ease-out |
| 버튼 press | 100ms | ease-in-out |
| 페이지 전환 | 350ms | ease-in-out |
| progress bar | 500ms | ease-out |
| fade in | 200ms | ease-out |
| scale up | 150ms | spring |

## 7. 네트워크 상태 처리

```typescript
// ===== 네트워크 감시 =====
useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false)
    })

    return unsubscribe
  }, [])

  return isOnline
}

// ===== 오프라인 배너 =====
function OfflineBanner() {
  const isOnline = useNetworkStatus()

  if (isOnline) return null

  return (
    <View style={styles.banner}>
      <Icon name="wifi-off" size={16} />
      <Text>오프라인 모드</Text>
    </View>
  )
}
```

## 8. 폼 검증 규칙

| 필드 | 규칙 |
|------|------|
| 이메일 | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| 비밀번호 | 8자 이상, 영문/숫자/특수문자 포함 |
| 금액 | 양수, 최대 12자리 |
| 카테고리명 | 1-20자 |
| 메모 | 최대 500자 |
| 이름 | 1-30자 |