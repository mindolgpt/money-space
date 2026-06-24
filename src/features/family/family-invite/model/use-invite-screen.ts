import { useState } from 'react'
import { useAuthStore } from '@/features/auth/auth-manager'
import { useInviteByEmail } from '@/entities/family'

export function useInviteScreen(familyId: string) {
  const { user } = useAuthStore()
  const [inviteEmail, setInviteEmail] = useState('')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const { mutateAsync: sendInvite, isPending } = useInviteByEmail()

  const handleSend = async () => {
    await sendInvite({ email: inviteEmail, familyId })
    setInviteEmail('')
  }

  return {
    user,
    inviteEmail,
    showJoinModal,
    isPending,
    setInviteEmail,
    setShowJoinModal,
    handleSend,
  }
}
