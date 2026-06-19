import { createEntryApi } from '@/entities/entry'
import type {
  SyncConflict,
  ConflictStrategy,
} from '@/entities/sync-queue'

export async function detectConflict(
  localId: string,
  tableName: string,
): Promise<SyncConflict | null> {
  const entryApi = createEntryApi()
  const local = entryApi.local.getById(localId)
  if (!local) return null

  let remote: Record<string, any> | null = null
  try {
    if (tableName === 'entries') {
      const result = await entryApi.remote.fetchAll(local.userId)
      remote = result.find((r: any) => r.id === localId) ?? null
    }
  } catch {
    return null
  }

  if (!remote) return null

  if (local.updatedAt !== remote.updatedAt) {
    return {
      localId,
      tableName,
      local: local as unknown as Record<string, any>,
      remote: remote as unknown as Record<string, any>,
      localUpdatedAt: local.updatedAt,
      remoteUpdatedAt: remote.updatedAt,
    }
  }

  return null
}

export function resolveConflict(
  conflict: SyncConflict,
  strategy: ConflictStrategy,
): Record<string, any> {
  switch (strategy) {
    case 'local':
      return conflict.local
    case 'remote':
      return conflict.remote
    case 'merge':
      return mergeByTimestamp(conflict.local, conflict.remote)
  }
}

function mergeByTimestamp(
  local: Record<string, any>,
  remote: Record<string, any>,
): Record<string, any> {
  const merged = { ...remote }

  for (const key of Object.keys(local)) {
    if (key === 'id' || key === 'createdAt') continue

    const localTime = new Date(local.updatedAt).getTime()
    const remoteTime = new Date(remote.updatedAt).getTime()

    if (localTime > remoteTime) {
      merged[key] = local[key]
    }
  }

  merged.updatedAt = new Date().toISOString()
  return merged
}
