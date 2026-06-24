import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native'
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
import { useCategoryEdit } from '@/features/category/category-modal/model/use-category-edit'
import type { Category } from '@/entities/category'
import { Button, Input, Typography } from '@/shared/ui'

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
  const {
    name,
    selectedIcon,
    nameError,
    isPending,
    onNameChange,
    onIconSelect,
    onSave,
  } = useCategoryEdit(category, onClose)

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-bg-primary">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" onPress={onClose}>취소</Button>
          <Typography variant="headline-md">카테고리 수정</Typography>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-2xl bg-bg-tertiary items-center justify-center mb-2">
              {renderIcon(selectedIcon, 32)}
            </View>
            <Typography variant="body-md" weight="medium" color="primary">{name || '이름 없음'}</Typography>
          </View>

          <Typography variant="label-md" color="secondary" className="mb-2">아이콘 선택</Typography>
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

          <Input
            variant="box"
            label="카테고리명"
            placeholder="카테고리명 (최대 20자)"
            value={name}
            onChangeText={onNameChange}
            maxLength={20}
            editable={!isPending}
            containerClassName="mb-1"
          />
          <View className="flex-row justify-between mb-6">
            {nameError ? (
              <Typography variant="label-sm" color="expense">{nameError}</Typography>
            ) : null}
            <Typography variant="label-sm" color="tertiary" className="ml-auto">{name.length}/20</Typography>
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onPress={onSave}
          >
            저장
          </Button>
        </ScrollView>
      </View>
    </Modal>
  )
}
