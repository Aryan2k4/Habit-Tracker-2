import { supabase } from './supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { success: false, user: null, error: error.message }
  return { success: true, user: data.user, error: null }
}

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: {
        full_name: name ?? '',
      },
    },
  })

  if (error) return { success: false, user: null, error: error.message }
  return { success: true, user: data.user, error: null }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error: error?.message ?? null }
}

export async function getUserProfile() {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) return null

  return {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.full_name ?? '',
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data.session, error: error?.message ?? null }
}