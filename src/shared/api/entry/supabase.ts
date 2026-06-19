import { supabase } from '@/shared/api/supabase'

export function createEntryApi() {
  return {
    fetchAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .or(`user_id.eq.${userId},is_shared.true`)
      if (error) throw error
      return (data ?? []).map(mapRow)
    },

    upsert: async (entry: any) => {
      const { error } = await supabase.from('entries').upsert({
        id: entry.id,
        user_id: entry.userId,
        family_id: entry.familyId,
        category_id: entry.categoryId,
        amount: entry.amount,
        type: entry.type,
        payment_method: entry.paymentMethod,
        note: entry.note,
        date: entry.date,
        photo_urls: entry.photoUrls,
        latitude: entry.latitude,
        longitude: entry.longitude,
        location_name: entry.locationName,
        is_shared: entry.isShared,
        is_recurring: entry.isRecurring,
        recurring_rule: entry.recurringRule,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
    },

    delete: async (id: string) => {
      const { error } = await supabase.from('entries').delete().eq('id', id)
      if (error) throw error
    },

    subscribe: (
      userId: string,
      callback: (payload: {
        eventType: 'INSERT' | 'UPDATE' | 'DELETE'
        new: Record<string, any>
        old: Record<string, any>
      }) => void,
    ) => {
      const channelName = `entries-changes-${userId}-${Date.now()}`
      return supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'entries',
            filter: `user_id=eq.${userId}`,
          },
          callback,
        )
        .subscribe()
    },
  }
}

function mapRow(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id,
    categoryId: row.category_id,
    amount: row.amount,
    type: row.type,
    paymentMethod: row.payment_method,
    note: row.note,
    date: row.date,
    photoUrls: row.photo_urls,
    latitude: row.latitude,
    longitude: row.longitude,
    locationName: row.location_name,
    isShared: row.is_shared,
    isRecurring: row.is_recurring,
    recurringRule: row.recurring_rule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
