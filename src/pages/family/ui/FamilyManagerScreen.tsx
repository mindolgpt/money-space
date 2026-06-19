import { FamilyManager } from '@/features/family/family-manager'

type Props = {
  onClose?: () => void
}

export function FamilyManagerScreen({ onClose }: Props) {
  return <FamilyManager onClose={onClose} />
}