import { useState, useEffect, useCallback } from 'react'
import { getProfile, saveProfile } from '../services/profileService'
import { createProfile } from '../models/profile'
import { useAuth } from '../contexts/AuthContext'

export function useProfile() {
  const { user }                            = useAuth()
  const [profile, setProfile]               = useState(undefined)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    setError(null)
    getProfile(user.id)
      .then(setProfile)
      .catch(err => { console.error(err); setError(err) })
      .finally(() => setLoading(false))
  }, [user])

  const save = useCallback(async (formData) => {
    const newProfile = createProfile(formData)
    await saveProfile(user.id, newProfile)
    setProfile(newProfile)
  }, [user])

  return { profile, loading, error, saveProfile: save }
}
