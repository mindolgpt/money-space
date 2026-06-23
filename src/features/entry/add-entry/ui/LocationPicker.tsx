import { useState } from 'react'
import { View, Text, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native'
import { colors } from '@/shared/lib/colors'
import * as Location from 'expo-location'

type Props = {
  latitude?: number
  longitude?: number
  locationName?: string
  onChange: (location: { latitude: number; longitude: number; locationName: string } | null) => void
}

export function LocationPicker({ latitude, longitude, locationName, onChange }: Props) {
  const [loading, setLoading] = useState(false)

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('위치 권한 필요', '위치 정보를 사용하려면 권한이 필요합니다')
      return
    }

    setLoading(true)
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const geocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
      const place = geocode[0]
      const name = place
        ? [place.region, place.city, place.street, place.name].filter(Boolean).join(' ')
        : `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
      onChange({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        locationName: name,
      })
    } catch {
      Alert.alert('오류', '위치를 가져올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const removeLocation = () => onChange(null)

  const openInMaps = () => {
    if (latitude == null || longitude == null) return
    const url = `https://maps.google.com/maps?q=${latitude},${longitude}`
    Linking.openURL(url)
  }

  const hasLocation = latitude != null && longitude != null

  return (
    <View className="mb-4 py-3 border-b border-border">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-medium text-text-primary">위치</Text>
          {hasLocation ? (
            <TouchableOpacity onPress={openInMaps}>
              <Text className="text-xs text-accent-green mt-0.5 underline" numberOfLines={1}>
                {locationName ?? `${latitude!.toFixed(4)}, ${longitude!.toFixed(4)}`}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-xs text-text-tertiary mt-0.5">거래 위치를 추가합니다</Text>
          )}
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={colors.accentGreen} />
        ) : hasLocation ? (
          <TouchableOpacity onPress={removeLocation} className="p-2">
            <Text className="text-accent-red text-sm">삭제</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={requestLocation}
            className="px-3 py-1.5 rounded-lg bg-accent-green/10"
          >
            <Text className="text-accent-green text-sm font-medium">현재 위치 추가</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
