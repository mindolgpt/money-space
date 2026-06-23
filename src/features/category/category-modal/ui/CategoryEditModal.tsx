import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { colors } from '@/shared/lib/colors'
import {
  CreditCard,
  Shield,
  PartyPopper,
  Wallet,
  Gift,
  Briefcase,
  Building2,
  TrendingUp,
  Utensils,
  Bus,
  Home,
  Smartphone,
  Pill,
  BookOpen,
  Film,
  ShoppingBag,
  User,
  Coffee,
  Gamepad2,
  Shirt,
  Baby,
  Cat,
  Plane,
  Music,
  Laptop,
  Camera,
  Mic,
  Trophy,
  Car,
  Dumbbell,
  Smile,
  Palette,
  type LucideIcon,
} from 'lucide-react-native'
import { useUpdateCategory } from '@/entities/category'
import type { Category } from '@/entities/category'

const ICON_DATA: { icon: string | LucideIcon; key: string }[] = [
  { icon: Utensils, key: '🍽️' }, { icon: Bus, key: '🚌' }, { icon: Home, key: '🏠' }, { icon: Smartphone, key: '📱' },
  { icon: Pill, key: '🏥' }, { icon: BookOpen, key: '📚' }, { icon: Film, key: '🎬' }, { icon: ShoppingBag, key: '🛍️' },
  { icon: CreditCard, key: '💳' }, { icon: Shield, key: '🛡️' }, { icon: PartyPopper, key: '🎊' }, { icon: Wallet, key: '💰' },
  { icon: Gift, key: '🎁' }, { icon: Briefcase, key: '💼' }, { icon: Building2, key: '🏦' }, { icon: TrendingUp, key: '📈' },
  { icon: User, key: '👴' }, { icon: Coffee, key: '☕' }, { icon: Gamepad2, key: '🎮' }, { icon: Shirt, key: '👕' },
  { icon: Baby, key: '👶' }, { icon: Cat, key: '🐱' }, { icon: Plane, key: '✈️' }, { icon: Music, key: '🎵' },
  { icon: Laptop, key: '💻' }, { icon: Camera, key: '📷' }, { icon: Mic, key: '🎤' }, { icon: Trophy, key: '⚽' },
  { icon: Car, key: '🚗' }, { icon: Dumbbell, key: '🏋️' }, { icon: Smile, key: '🧘' }, { icon: Palette, key: '🎨' },
]

const ICONS = ICON_DATA.map(d => d.key)

type Props = {
  category: Category
  onClose: () => void
}

const getIconComponent = (iconKey: string): LucideIcon | string => {
  const found = ICON_DATA.find(d => d.key === iconKey)
  return found ? found.icon : iconKey
}

const renderIcon = (iconKey: string, size: number) => {
  const icon = getIconComponent(iconKey)
  if (typeof icon === 'function') {
    const IconComponent = icon as LucideIcon
    return <IconComponent size={size} color={colors.textTertiary} />
  }
  return <Text className="text-lg">{icon}</Text>
}

export function CategoryEditModal({ category, onClose }: Props) {
  const [name, setName] = useState(category.name)
  const [selectedIcon, setSelectedIcon] = useState(category.icon)
  const [nameError, setNameError] = useState('')
  const { mutateAsync: updateCategory, isPending } = useUpdateCategory()

  const onNameChange = (text: string) => {
    if (text.length > 20) return
    setName(text)
    if (text.trim()) setNameError('')
  }

  const onIconSelect = (icon: string) => {
    setSelectedIcon(icon)
  }

  const onSave = async () => {
    if (!selectedIcon) {
      return
    }

    if (!name.trim()) {
      setNameError('카테고리명을 입력해주세요')
      return
    }

    const hasChanged = name.trim() !== category.name || selectedIcon !== category.icon
    if (!hasChanged) {
      onClose()
      return
    }

    try {
      await updateCategory({
        id: category.id,
        input: { name: name.trim(), icon: selectedIcon },
      })
      onClose()
    } catch {
      setNameError('수정에 실패했습니다')
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg-primary">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-accent-green text-base">취소</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary">카테고리 수정</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Preview */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-2xl bg-bg-tertiary items-center justify-center mb-2">
              {renderIcon(selectedIcon, 32)}
            </View>
            <Text className="text-base font-medium text-text-primary">{name || '이름 없음'}</Text>
          </View>

          {/* Icon Picker */}
          <Text className="text-sm text-text-secondary mb-2">아이콘 선택</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                className={`w-11 h-11 rounded-xl items-center justify-center ${
                  selectedIcon === icon ? 'bg-accent-green' : 'bg-bg-tertiary'
                }`}
                onPress={() => onIconSelect(icon)}
              >
                {renderIcon(icon, 20)}
              </TouchableOpacity>
            ))}
          </View>

          {/* Name Input */}
          <Text className="text-sm text-text-secondary mb-2">카테고리명</Text>
          <TextInput
            className={`input mb-1 ${nameError ? 'border-accent-red' : ''}`}
            placeholder="카테고리명 (최대 20자)"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={onNameChange}
            maxLength={20}
            editable={!isPending}
          />
          <View className="flex-row justify-between mb-6">
            {nameError ? (
              <Text className="text-accent-red text-xs">{nameError}</Text>
            ) : null}
            <Text className="text-xs text-text-tertiary ml-auto">{name.length}/20</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`py-4 flex-row justify-center items-center rounded-lg ${
              isPending ? 'bg-accent-green/60' : 'bg-accent-green'
            }`}
            onPress={onSave}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color={colors.white} className="mr-2" />
            ) : null}
            <Text className="text-white font-semibold text-base">
              {isPending ? '저장 중...' : '저장'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  )
}
