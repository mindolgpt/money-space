import { useState } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useJoinFamily } from '@/entities/family'
import { router } from 'expo-router'

export function useAcceptInvite(initialCode: string) {
  const { user } = useAuthStore()
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState('')
  const { mutateAsync: joinFamily, isPending } = useJoinFamily()

  const onCodeChange = (text: string) => {
    const upper = text.toUpperCase()
    if (upper.length > 6) return
    if (!/^[A-Z0-9]*$/.test(upper)) return
    setCode(upper)
    setError('')
  }

  const handleAccept = async () => {
    if (!user || code.length !== 6) return
    try {
      await joinFamily({ inviteCode: code, userId: user.id })
      router.replace({ pathname: '/(tabs)/shared' } as any)
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg === 'ALREADY_MEMBER') {
        setError('이미 참여한 가족입니다')
      } else if (msg === 'CODE_EXPIRED') {
        setError('초대 코드가 만료되었습니다')
      } else {
        setError('유효하지 않은 초대 코드입니다')
      }
    }
  }

  return {
    code,
    error,
    isPending,
    onCodeChange,
    handleAccept,
  }
}
