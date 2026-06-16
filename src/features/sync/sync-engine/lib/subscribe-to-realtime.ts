import { createEntryApi } from '@/entities/entry'
import { useAuthStore } from '@/features/auth/auth-manager'
import type { RealtimePayload } from '@/features/sync/sync-engine/model/types'

export function subscribeToRealtime() {
  const user = useAuthStore.getState().user
  if (!user) return null

  const entryApi = createEntryApi()
  const subscription = entryApi.remote.subscribe(
    user.id,
    (payload: RealtimePayload) => {
      handleEntryChange(payload)
    },
  )

  return subscription
}

function handleEntryChange(payload: RealtimePayload) {
  const entryApi = createEntryApi()

  if (payload.eventType === 'DELETE') {
    entryApi.local.delete(payload.old.id)
  } else {
    entryApi.local.upsertFromRemote(payload.new)
  }
}
