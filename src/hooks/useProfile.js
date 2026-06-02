import { useState, useEffect, useCallback } from 'react'
import { getProfile, saveProfile } from '../services/profileService'
import { createProfile } from '../models/profile'

export function useProfile() {
  const [profile, setProfile] = useState(undefined) // undefined = todavía cargando
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(async (formData) => {
    const newProfile = createProfile(formData)
    await saveProfile(newProfile)
    setProfile(newProfile)
  }, [])

  return { profile, loading, saveProfile: save }
}
