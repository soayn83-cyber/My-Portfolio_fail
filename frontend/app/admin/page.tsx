import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getAllPosts, getProfile, getSiteConfig } from "@/lib/content-data"
import { hasSupabaseAdminConfig } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_auth")?.value === "true"

  if (!isAdmin) {
    redirect("/admin/login")
  }

  const user = { email: "admin@local" }
  const posts = await getAllPosts()
  const settings = await getSiteConfig()
  const profile = await getProfile()
  const hasAdminWriteAccess = hasSupabaseAdminConfig()

  return (
    <AdminDashboard
      user={user}
      posts={posts}
      settings={settings}
      profile={profile}
      hasAdminWriteAccess={hasAdminWriteAccess}
    />
  )
}
