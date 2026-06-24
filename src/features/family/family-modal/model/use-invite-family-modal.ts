import { useState, useEffect } from 'react'
import { Alert, Share } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useGenerateInviteCode } from '@/entities/family'

export function useInviteFamilyModal(familyId: string, _familyName: string) {
  const { user } = useAuthStore()
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const { mutateAsync: generateCode, isPending } = useGenerateInviteCode()

  useEffect(() => {
    const loadCode = async () => {
      try {
        const code = await generateCode(familyId)
        setInviteCode(code)
      } catch {
        // silent
      }
    }
    loadCode()
  }, [familyId, generateCode])

  const onCopyCode = () => {
    if (!inviteCode) return
    Alert.alert('초대 코드', inviteCode)
  }

  const onSharePress = async () => {
    if (!inviteCode || !user) return
    await Share.share({
      message: `${user.email?.split('@')[0] ?? ''}님이 Money-Space 가족 초대를 보냈습니다.\n\n가족: ${_familyName}\n초대 코드: ${inviteCode}\n\n앱에서 코드를 입력하여 참여하세요!`,
      title: '가족 초대',
    })
  }

  const onRefreshCode = () => {
    Alert.alert(
      '코드 새로 생성',
      '기존 코드는 사용할 수 없게 됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '생성',
          onPress: async () => {
            const code = await generateCode(familyId)
            setInviteCode(code)
          },
        },
      ],
    )
  }

  return {
    inviteCode,
    isPending,
    onCopyCode,
    onSharePress,
    onRefreshCode,
  }
}
