import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getPosts, getProfile, getSiteConfig } from "@/lib/site-data"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_auth")?.value === "true"

  if (!isAdmin) {
    redirect("/admin/login")
  }

  const user = { email: "admin@local" }
  const posts = getPosts()
  const settings = getSiteConfig()
  const profile = getProfile()

  return (
    <AdminDashboard
      user={user}
      posts={posts}
      settings={settings}
      profile={profile}
    />
  )
}
