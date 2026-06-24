import { View, Text } from 'react-native'
import { useDeleteAccount } from '@/features/user/delete-account/model/use-delete-account'
import { Button, Input } from '@/shared/ui'

export function DeleteAccount() {
  const {
    password,
    passwordError,
    isPending,
    onPasswordChange,
    onDeletePress,
  } = useDeleteAccount()

  return (
    <View>
      <Text className="text-headline-md font-semibold text-text-primary mb-4">
        계정 삭제
      </Text>

      <View className="card p-4 mb-4 border border-accent-red/20">
        <Text className="text-body-md text-text-secondary mb-2 leading-5">
          계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </Text>

        <Input
          variant="box"
          label="비밀번호 확인"
          placeholder="현재 비밀번호"
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
          error={passwordError}
        />

        <Button
          variant="danger"
          fullWidth
          loading={isPending}
          onPress={onDeletePress}
        >
          {isPending ? '처리 중...' : '계정 삭제'}
        </Button>
      </View>
    </View>
  )
}
