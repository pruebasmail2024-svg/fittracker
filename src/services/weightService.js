import { supabase } from '../lib/supabase'

export async function getAllWeightLogs(userId) {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: true })

  if (error) throw error

  return data.map(row => ({
    id:         row.id,
    weightKg:   row.peso_kg,
    recordedAt: row.fecha,
  }))
}

export async function addWeightLog(userId, { weightKg, recordedAt }) {
  const { error } = await supabase
    .from('weight_logs')
    .insert({
      user_id: userId,
      peso_kg: Number(weightKg),
      fecha:   recordedAt ?? new Date().toISOString(),
    })

  if (error) throw error
}
