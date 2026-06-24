import { useState } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useJoinFamily } from '@/entities/family'

export function useJoinFamilyModal(onClose: () => void) {
  const { user } = useAuthStore()
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null)
  const { mutateAsync: joinFamily, isPending } = useJoinFamily()

  const onCodeChange = (text: string) => {
    const upper = text.toUpperCase()
    if (upper.length > 6) return
    if (!/^[A-Z0-9]*$/.test(upper)) return
    setCode(upper)
    setErrorMessage('')
    setIsValidCode(null)
    if (upper.length === 6) {
      setIsValidCode(true)
    }
  }

  const onJoin = async () => {
    if (!code || code.length !== 6 || !user) return
    try {
      await joinFamily({ inviteCode: code, userId: user.id })
      onClose()
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg === 'ALREADY_MEMBER') {
        setErrorMessage('이미 참여한 가족입니다')
      } else if (msg === 'CODE_EXPIRED') {
        setErrorMessage('초대 코드가 만료되었습니다')
      } else if (msg === 'INVALID_CODE') {
        setErrorMessage('유효하지 않은 코드입니다')
      } else {
        setErrorMessage('참여에 실패했습니다')
      }
    }
  }

  return {
    code,
    errorMessage,
    isValidCode,
    isPending,
    onCodeChange,
    onJoin,
  }
}
