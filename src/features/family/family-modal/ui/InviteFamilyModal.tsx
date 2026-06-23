import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native'
import { colors } from '@/shared/lib/colors'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useGenerateInviteCode } from '@/entities/family'

type Props = {
  familyId: string
  familyName: string
  onClose: () => void
}

export function InviteFamilyModal({ familyId, familyName, onClose }: Props) {
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
      message: `${user.email?.split('@')[0] ?? ''}님이 Money-Space 가족 초대를 보냈습니다.\n\n가족: ${familyName}\n초대 코드: ${inviteCode}\n\n앱에서 코드를 입력하여 참여하세요!`,
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

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg-primary">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-accent-green text-base">닫기</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary">초대하기</Text>
          <View style={{ width: 50 }} />
        </View>

        <View className="flex-1 items-center justify-center p-6">
          <View className="w-24 h-24 rounded-full bg-accent-green/10 items-center justify-center mb-6">
            <Text className="text-4xl">🎉</Text>
          </View>

          <Text className="text-xl font-bold text-text-primary mb-2">
            {familyName}
          </Text>
          <Text className="text-sm text-text-secondary text-center mb-8">
            아래 코드를 공유하여 가족을 초대하세요
          </Text>

          {isPending && !inviteCode ? (
            <ActivityIndicator size="large" color={colors.accentGreen} />
          ) : inviteCode ? (
            <>
              <TouchableOpacity
                className="bg-bg-tertiary px-12 py-4 rounded-2xl mb-6"
                onPress={onCopyCode}
              >
                <Text className="text-3xl font-bold text-text-primary tracking-[6px]">
                  {inviteCode}
                </Text>
              </TouchableOpacity>

              <Text className="text-xs text-text-tertiary mb-8">
                코드를 탭하여 복사
              </Text>

              <TouchableOpacity
                className="bg-accent-green py-4 px-8 rounded-lg mb-3 w-full"
                onPress={onSharePress}
              >
                <Text className="text-white font-semibold text-base text-center">
                  공유하기
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 items-center"
                onPress={onRefreshCode}
              >
                <Text className="text-accent-green text-sm">새 코드 생성</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}