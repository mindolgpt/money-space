import { Modal } from 'react-native'
import { EntryForm } from '@/features/entry/add-entry/ui/EntryForm'

type Props = {
  visible: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddEntryModal({ visible, onClose, onSuccess }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <EntryForm onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  )
}