import { View, Text, TouchableOpacity, Image } from 'react-native'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useProfileSettings } from '@/features/user/profile-settings/model/use-profile-settings'
import { Button, Input } from '@/shared/ui'

export function ProfileSettings() {
  const { user } = useAuthStore()
  const {
    profile,
    isLoading,
    name,
    isDirty,
    isPending,
    isUploading,
    onNameChange,
    onSave,
    changeAvatar,
  } = useProfileSettings()

  return (
    <View>
      <Text className="text-headline-md font-semibold text-text-primary mb-4">
        프로필
      </Text>

      {isLoading ? (
        <View className="py-4 items-center">
          <Text className="text-body-md text-text-tertiary">로딩 중...</Text>
        </View>
      ) : (
        <View className="card p-4 mb-4">
          {/* Avatar */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={changeAvatar} disabled={isUploading}>
              {profile?.avatarUrl ? (
                <View className="w-16 h-16 rounded-full overflow-hidden">
                  <Image source={{ uri: profile.avatarUrl }} className="w-full h-full" />
                </View>
              ) : (
                <View className="w-16 h-16 rounded-full bg-accent-green items-center justify-center">
                  <Text className="text-white text-xl font-semibold">
                    {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              {isUploading && (
                <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                  <Text className="text-white text-label-sm">업로드 중...</Text>
                </View>
              )}
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <Text className="text-headline-md font-semibold text-text-primary">
                {profile?.name || user?.name || '사용자'}
              </Text>
              <Text className="text-body-md text-text-secondary">{user?.email}</Text>
              <Text className="text-label-sm text-accent-green mt-1">프로필 사진 변경</Text>
            </View>
          </View>

          {/* Name Input */}
          <Input
            variant="box"
            label="이름"
            placeholder="이름을 입력하세요"
            value={name}
            onChangeText={onNameChange}
          />

          <Button
            variant={isDirty && name.trim() ? 'primary' : 'secondary'}
            fullWidth
            loading={isPending}
            disabled={!isDirty || !name.trim() || isPending}
            onPress={onSave}
          >
            저장하기
          </Button>
        </View>
      )}
    </View>
  )
}
