import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let settled = false
    const finish = (session) => {
      if (settled) return
      settled = true
      setUser(session?.user ?? null)
      setLoading(false)
    }

    // Red de seguridad: si getSession se cuelga (PWA iOS, sin red, lock de token),
    // soltamos la pantalla de carga a los 5s y caemos a login en vez de quedar negros.
    const timeout = setTimeout(() => finish(null), 5000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => finish(session))
      .catch(() => finish(null))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-slate-950">
        <span className="text-slate-600 text-sm">Cargando…</span>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
