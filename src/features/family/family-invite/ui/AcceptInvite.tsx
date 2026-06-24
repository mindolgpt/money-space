import { View, Text } from 'react-native'
import { Button, Input } from '@/shared/ui'
import { useAcceptInvite } from '../model/use-accept-invite'

export function AcceptInvite({ code: initialCode }: { code: string }) {
  const { code, error, isPending, onCodeChange, handleAccept } = useAcceptInvite(initialCode)

  return (
    <View className="flex-1 justify-center items-center p-6 bg-bg-primary">
      <Text className="text-headline-md font-bold text-text-primary mb-2 tracking-tight">가계부 초대</Text>
      <Text className="text-body-md text-text-secondary mb-8">
        초대 코드를 입력하여 가족에 참여하세요
      </Text>
      <Input
        variant="box"
        className="text-center text-2xl tracking-[8px]"
        placeholder="ABCDEF"
        value={code}
        onChangeText={onCodeChange}
        autoCapitalize="characters"
        maxLength={6}
        editable={!isPending}
        error={error}
        containerClassName="mb-4"
      />
      <Button
        variant="primary"
        size="lg"
        loading={isPending}
        onPress={handleAccept}
        disabled={isPending || code.length !== 6}
      >
        {isPending ? '처리 중...' : '참여하기'}
      </Button>
    </View>
  )
}
