import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useUserProfile, useUpdateProfile, useUploadAvatar } from '@/entities/user'

export function ProfileSettings() {
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useUserProfile(user?.id)
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile()
  const { mutateAsync: uploadAvatar } = useUploadAvatar()

  const [name, setName] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name)
    } else if (user?.name) {
      setName(user.name)
    }
  }, [profile, user])

  const onNameChange = (text: string) => {
    if (text.length > 30) return
    setName(text)
    setIsDirty(true)
  }

  const onSave = async () => {
    if (!user || !name.trim()) return
    try {
      await updateProfile({ userId: user.id, updates: { name: name.trim() } })
      setIsDirty(false)
    } catch {
      // error handled by query client
    }
  }

  const changeAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (result.canceled || !result.assets?.[0]) return

    setIsUploading(true)
    try {
      const publicUrl = await uploadAvatar({ userId: user!.id, uri: result.assets[0].uri })

      if (publicUrl) {
        await updateProfile({
          userId: user!.id,
          updates: { avatarUrl: publicUrl },
        })
      }
    } catch {
      // error handled
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <View>
      <Text className="text-base font-semibold text-primary mb-4">
        프로필
      </Text>

      {isLoading ? (
        <View className="py-4 items-center">
          <ActivityIndicator />
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
                <View className="w-16 h-16 rounded-full bg-accent-blue items-center justify-center">
                  <Text className="text-white text-xl font-semibold">
                    {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              {isUploading && (
                <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <Text className="font-semibold text-primary text-lg">
                {profile?.name || user?.name || '사용자'}
              </Text>
              <Text className="text-sm text-secondary">{user?.email}</Text>
              <Text className="text-xs text-accent-blue mt-1">프로필 사진 변경</Text>
            </View>
          </View>

          {/* Name Input */}
          <Text className="text-sm text-secondary mb-2">이름</Text>
          <TextInput
            className="input mb-3"
            placeholder="이름을 입력하세요"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={onNameChange}
          />

          <TouchableOpacity
            className={`py-3 rounded-xl items-center ${
              isDirty && name.trim()
                ? 'bg-accent-blue'
                : 'bg-bg-tertiary'
            }`}
            onPress={onSave}
            disabled={!isDirty || !name.trim() || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className={`font-semibold ${
                  isDirty && name.trim()
                    ? 'text-white'
                    : 'text-tertiary'
                }`}
              >
                저장하기
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
