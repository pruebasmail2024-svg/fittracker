import { supabase } from '../lib/supabase'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // sin filas = sin perfil
    throw error
  }

  return {
    id:        'me',
    age:       data.edad,
    weightKg:  data.peso_inicial_kg,
    heightCm:  data.altura_cm,
    createdAt: data.created_at,
  }
}

export async function saveProfile(userId, profileData) {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id:         userId,
      edad:            profileData.age,
      peso_inicial_kg: profileData.weightKg,
      altura_cm:       profileData.heightCm,
    })

  if (error) throw error
}
