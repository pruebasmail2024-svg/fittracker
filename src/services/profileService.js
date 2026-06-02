import { dbPromise } from './db'

export async function getProfile() {
  const db = await dbPromise
  return db.get('profile', 'me')
}

export async function saveProfile(profileData) {
  const db = await dbPromise
  return db.put('profile', profileData)
}
