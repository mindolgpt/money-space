# Auth 도메인 PRD

## 1. 기능 개요

이메일/소셜 로그인, 회원가입, 세션 관리, 토큰 관리 (SecureStore 활용).

## 2. 데이터 모델

```typescript
// src/entities/user/model/types.ts

interface AuthUser {
  id: string
  email: string
  name?: string
}
```

## 3. API 인터페이스

```typescript
// src/entities/user/api/index.ts

const AUTH_KEYS = {
  user: () => ['auth', 'user'] as const,
  session: () => ['auth', 'session'] as const,
}

createAuthApi(supabase: SupabaseClient): {
  signInWithEmail(email: string, password: string): Promise<AuthUser>
  signUpWithEmail(email: string, password: string, name?: string): Promise<AuthUser>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>
  getSession(): Promise<Session | null>
  onAuthStateChange(callback: (event: string, session: Session | null) => void): Unsubscribe
}

useAuthUser(): UseQueryResult<AuthUser | null>
useSignIn(): UseMutationResult<AuthUser, Error, { email: string; password: string }>
useSignUp(): UseMutationResult<AuthUser, Error, { email: string; password: string; name?: string }>
useSignOut(): UseMutationResult<void, Error, void>
useResetPassword(): UseMutationResult<void, Error, string>
```

## 4. 주요 유저 플로우

```
[App Launch] → [Splash] → [Auth Check]
                              │
                              ├── [로그인 상태] → [HOME]
                              └── [미로그인] → [Login Screen]
                                                    │
                                                    ├── [이메일/비밀번호 로그인]
                                                    ├── [회원가입]
                                                    └── [비밀번호 찾기]
```

## 5. UI 이벤트 스크립트

### 5.1 LoginScreen

```typescript
// Events: src/features/auth/auth-manager/ui/LoginScreen.tsx

// ===== 이메일 입력 =====
onEmailChange(text: string) {
  setEmail(text.trim())

  // 이메일 형식 실시간 검증
  if (text && !isValidEmailFormat(text)) {
    setEmailError('유효한 이메일을 입력해주세요')
  } else {
    setEmailError(null)
  }
}

// ===== 비밀번호 입력 =====
onPasswordChange(text: string) {
  setPassword(text)

  // 비밀번호 빈칸 체크 (탭 이동 시)
  if (text.length === 0) {
    setPasswordError('비밀번호를 입력해주세요')
  } else {
    setPasswordError(null)
  }
}

// ===== 로그인 버튼 =====
onLoginPress() {
  // 1. Validation
  if (!email.trim()) {
    setEmailError('이메일을 입력해주세요')
    emailInputRef.current?.focus()
    return
  }

  if (!password) {
    setPasswordError('비밀번호를 입력해주세요')
    passwordInputRef.current?.focus()
    return
  }

  if (!isValidEmailFormat(email)) {
    setEmailError('유효한 이메일을 입력해주세요')
    return
  }

  executeLogin()
}

async function executeLogin() {
  // 1. 로딩 상태 ON
  setIsLoading(true)
  clearErrors()

  try {
    // 2. Supabase 로그인
    const { user } = await signInWithEmail(email, password)

    // 3. 세션 저장 (SecureStore)
    await saveSession(user)

    // 4. AuthStore 업데이트
    authStore.setUser(user)

    // 5. 화면 전환
    router.replace('/(tabs)/home')

  } catch (error) {
    // 6. 에러 처리
    if (error.message === 'Invalid login credentials') {
      setPasswordError('이메일 또는 비밀번호가 올바르지 않습니다')
      setPassword('')
      passwordInputRef.current?.focus()
    } else if (error.message === 'Email not confirmed') {
      showToast('이메일 인증을 완료해주세요')
    } else {
      setGlobalError('로그인에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    setIsLoading(false)
  }
}

// ===== 비밀번호 보기 토글 =====
onPasswordVisibilityToggle() {
  setShowPassword(prev => !prev)
}

// ===== 회원가입 링크 =====
onSignUpPress() {
  router.push('/auth/signup')
}

// ===== 비밀번호 찾기 링크 =====
onForgotPasswordPress() {
  router.push('/auth/forgot-password')
}
```

### 5.2 SignUpScreen

```typescript
// Events: 회원가입 화면

// ===== 이름 입력 =====
onNameChange(text: string) {
  if (text.length > 30) return
  setName(text)
}

// ===== 이메일 입력 =====
onEmailChange(text: string) {
  const trimmed = text.trim()
  setEmail(trimmed)

  if (trimmed && !isValidEmailFormat(trimmed)) {
    setEmailError('유효한 이메일을 입력해주세요')
  } else {
    setEmailError(null)
  }
}

// ===== 비밀번호 입력 =====
onPasswordChange(text: string) {
  setPassword(text)

  // 실시간 강도 체크
  const strength = calculatePasswordStrength(text)
  setPasswordStrength(strength)

  if (text && strength.score < 2) {
    setPasswordError('8자 이상, 영문/숫자/특수문자 포함')
  } else {
    setPasswordError(null)
  }
}

// ===== 비밀번호 확인 입력 =====
onConfirmPasswordChange(text: string) {
  setConfirmPassword(text)

  if (text && text !== password) {
    setConfirmPasswordError('비밀번호가 일치하지 않습니다')
  } else {
    setConfirmPasswordError(null)
  }
}

// ===== 이용약관 동의 =====
onTermsToggle() {
  setIsTermsAgreed(prev => !prev)

  if (!isTermsAgreed) {
    // 체크 해제 시에만 토스트
    // 체크 시는 확인이므로 토스트 없음
  }
}

// ===== 이용약관 보기 =====
onViewTerms() {
  router.push('/terms')
}

// ===== 개인정보 처리方針 보기 =====
onViewPrivacyPolicy() {
  router.push('/privacy')
}

// ===== 회원가입 버튼 =====
onSignUpPress() {
  // ===== Validation =====
  if (!name.trim()) {
    setNameError('이름을 입력해주세요')
    nameInputRef.current?.focus()
    return
  }

  if (!email.trim()) {
    setEmailError('이메일을 입력해주세요')
    emailInputRef.current?.focus()
    return
  }

  if (!isValidEmailFormat(email)) {
    setEmailError('유효한 이메일을 입력해주세요')
    return
  }

  if (!password) {
    setPasswordError('비밀번호를 입력해주세요')
    passwordInputRef.current?.focus()
    return
  }

  if (calculatePasswordStrength(password).score < 2) {
    setPasswordError('비밀번호가 너무 약습니다')
    return
  }

  if (password !== confirmPassword) {
    setConfirmPasswordError('비밀번호가 일치하지 않습니다')
    confirmPasswordInputRef.current?.focus()
    return
  }

  if (!isTermsAgreed) {
    showToast('이용약관에 동의해주세요')
    return
  }

  executeSignUp()
}

async function executeSignUp() {
  setIsLoading(true)
  clearErrors()

  try {
    // 1. Supabase 회원가입
    const { user, error } = await signUp(email, password, name)

    if (error) throw error

    // 2. 이메일 인증 안내
    showEmailVerificationDialog(email)

    // 3. 로그인 화면으로 이동
    router.replace('/auth/login')

  } catch (error) {
    if (error.message === 'User already registered') {
      setEmailError('이미 가입된 이메일입니다')
    } else {
      setGlobalError('회원가입에 실패했습니다')
    }
  } finally {
    setIsLoading(false)
  }
}
```

### 5.3 AuthStore (Zustand)

```typescript
// Events: src/features/auth/auth-manager/model/use-auth-store.ts

// ===== 초기화 =====
onInitialize() {
  // 1. SecureStore에서 세션 복원
  const session = await getStoredSession()

  if (session) {
    // 2. 유효한 세션이면 사용자 설정
    setUser(session.user)
    setIsAuthenticated(true)
  }

  // 3. Auth 상태 리스너 등록
  const unsubscribe = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        setIsAuthenticated(true)
        await saveSession(session)
      } else if (event === 'SIGNED_OUT') {
        clearUser()
        await clearStoredSession()
      } else if (event === 'TOKEN_REFRESHED') {
        // 세션 자동 갱신 시 저장
        if (session) {
          await saveSession(session)
        }
      }
    }
  )

  setUnsubscribe(unsubscribe)
}

// ===== 로그인 =====
setUser(user: AuthUser) {
  set({ user, isAuthenticated: true })
}

// ===== 로그아웃 =====
onSignOut() {
  // 1. 로딩 상태
  set({ isSigningOut: true })

  signOut().then(() => {
    // 2. 상태 클리어
    set({
      user: null,
      isAuthenticated: false,
      isSigningOut: false,
    })

    // 3. SecureStore 클리어
    clearStoredSession()

    // 4. 홈으로 이동
    router.replace('/auth/login')
  }).catch(error => {
    set({ isSigningOut: false })
    showToast('로그아웃 실패')
  })
}
```

### 5.4 PasswordResetScreen

```typescript
// Events: 비밀번호 재설정 화면

// ===== 이메일 입력 =====
onEmailChange(text: string) {
  setEmail(text.trim())
  setEmailError(null)
}

// ===== 재설정 요청 버튼 =====
onResetPress() {
  if (!email.trim()) {
    setEmailError('이메일을 입력해주세요')
    return
  }

  if (!isValidEmailFormat(email)) {
    setEmailError('유효한 이메일을 입력해주세요')
    return
  }

  executeReset()
}

async function executeReset() {
  setIsLoading(true)

  try {
    await resetPassword(email)

    // 성공 화면으로 전환
    setShowSuccess(true)

  } catch (error) {
    if (error.message === 'User not found') {
      setEmailError('존재하지 않는 이메일입니다')
    } else {
      showToast('요청 실패. 다시 시도해주세요.')
    }
  } finally {
    setIsLoading(false)
  }
}
```

## 6. 상태 관리

| 상태 | 위치 | 관리 방식 |
|------|------|----------|
| 인증 상태 | `AuthStore` (Zustand) | 전역 상태 |
| 세션 | `SecureStore` | 암호화 저장 |
| 폼 상태 | 각 화면 컴포넌트 | `useState` |

## 7. 폴백/에러 처리

| 시나리오 | 처리 |
|---------|------|
| 네트워크 오류 | "네트워크 연결을 확인해주세요" 토스트 |
| 세션 만료 | 자동 갱신 시도, 실패 시 로그인 화면 |
| 비밀번호 오류 5회 | 5분 잠금, 캡차 표시 |
| 이메일 미인증 | 인증 안내 다이얼로그 |
| 앱 삭제 후 재설치 | SecureStore 복구 실패 → 재로그인 |