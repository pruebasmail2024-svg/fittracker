import { supabase } from '../lib/supabase'

function sessionFromRow(row) {
  return {
    id:              row.id,
    dayIndex:        row.day_index,
    startedAt:       row.started_at,
    completedAt:     row.completed_at,
    durationSeconds: row.duration_seconds,
    volumeKg:        row.volume_kg,
    sessionType:     row.session_type,
    exercises:       row.exercises,
    editadaEl:       row.editada_el,
  }
}

function calcVolume(exercises) {
  return Math.round(
    exercises.reduce((total, ex) =>
      total + ex.sets.reduce((t, s) => t + Number(s.weightKg) * Number(s.reps), 0),
    0)
  )
}

export async function getAllSessions(userId) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: true })

  if (error) throw error
  return data.map(sessionFromRow)
}

export async function saveWorkoutSession(userId, { dayIndex, startedAt, exercises, durationSeconds = 0, sessionType = 'gym' }) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id:          userId,
      session_type:     sessionType,
      day_index:        dayIndex,
      exercises,
      volume_kg:        calcVolume(exercises),
      duration_seconds: Math.round(durationSeconds),
      started_at:       startedAt,
      completed_at:     new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return sessionFromRow(data)
}

export async function updateSession(userId, id, exercises) {
  const { error } = await supabase
    .from('workout_sessions')
    .update({
      exercises,
      volume_kg:  calcVolume(exercises),
      editada_el: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteSession(userId, id) {
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}
