import { useState } from 'react'
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

type Props = {
  photoUrls: string[]
  onAddPhoto: (uri: string) => void
  onRemovePhoto: (index: number) => void
}

export function PhotoPicker({ photoUrls, onAddPhoto, onRemovePhoto }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const requestPermission = async () => {
    const { status: camera } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: library } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (camera !== 'granted' || library !== 'granted') {
      Alert.alert('권한 필요', '카메라와 사진 라이브러리 접근 권한이 필요합니다')
      return false
    }
    return true
  }

  const onPickImage = async () => {
    const hasPermission = await requestPermission()
    if (!hasPermission) return

    setIsLoading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        onAddPhoto(result.assets[0].uri)
      }
    } catch {
      Alert.alert('오류', '사진을 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const onTakePhoto = async () => {
    const hasPermission = await requestPermission()
    if (!hasPermission) return

    setIsLoading(true)
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        onAddPhoto(result.assets[0].uri)
      }
    } catch {
      Alert.alert('오류', '카메라 촬영에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const showOptions = () => {
    Alert.alert(
      '사진 추가',
      '사진을 선택하세요',
      [
        { text: '카메라로 촬영', onPress: onTakePhoto },
        { text: '라이브러리에서 선택', onPress: onPickImage },
        { text: '취소', style: 'cancel' },
      ],
    )
  }

  const onRemove = (index: number) => {
    Alert.alert(
      '사진 삭제',
      '이 사진을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => onRemovePhoto(index),
        },
      ],
    )
  }

  return (
    <View className="mb-4">
      <Text className="text-sm text-secondary mb-2">사진 ({photoUrls.length}/5)</Text>

      <View className="flex-row flex-wrap gap-2">
        {photoUrls.map((uri, index) => (
          <View key={`${uri}-${index}`} className="relative">
            <Image
              source={{ uri }}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-red items-center justify-center"
              onPress={() => onRemove(index)}
            >
              <Text className="text-white text-xs font-bold">✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {photoUrls.length < 5 && (
          <TouchableOpacity
            className="w-20 h-20 rounded-xl border-2 border-dashed border-subtle items-center justify-center"
            onPress={showOptions}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#0A84FF" />
            ) : (
              <Text className="text-2xl text-tertiary">+</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}