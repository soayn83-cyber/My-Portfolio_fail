import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function resolveSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
}

function resolveSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || ""
}

export function hasSupabaseAdminConfig() {
  return Boolean(resolveSupabaseUrl() && resolveSupabaseServiceRoleKey())
}

export function createSupabaseServerClient(): SupabaseClient | null {
  const url = resolveSupabaseUrl()
  const serviceRoleKey = resolveSupabaseServiceRoleKey()

  if (!url || !serviceRoleKey) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function createSupabaseReadClient(): SupabaseClient | null {
  const url = resolveSupabaseUrl()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anonKey) {
    return null
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}