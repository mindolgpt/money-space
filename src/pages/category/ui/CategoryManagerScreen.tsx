import { CategoryManager } from '@/features/category/category-manager'

type Props = {
  onClose?: () => void
}

export function CategoryManagerScreen({ onClose }: Props) {
  return <CategoryManager onClose={onClose} />
}
