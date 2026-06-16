export type RealtimePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Record<string, any>
  old: Record<string, any>
}
