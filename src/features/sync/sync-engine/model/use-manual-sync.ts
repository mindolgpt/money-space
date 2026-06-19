import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pushPendingChanges } from '@/features/sync/sync-engine/model/push-pending-changes'
import { SYNC_KEYS } from '@/entities/sync-queue'

export function useManualSync() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await pushPendingChanges()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYNC_KEYS.all() })
    },
  })
}
