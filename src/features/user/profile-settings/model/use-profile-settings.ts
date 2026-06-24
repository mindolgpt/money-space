import { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useUserProfile, useUpdateProfile, useUploadAvatar } from '@/entities/user'

export function useProfileSettings() {
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
      // handled by query client
    }
  }

  const changeAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) return

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
      // handled
    } finally {
      setIsUploading(false)
    }
  }

  return {
    profile,
    isLoading,
    name,
    isDirty,
    isPending,
    isUploading,
    onNameChange,
    onSave,
    changeAvatar,
  }
}
