import { ProfileContent } from "@/components/profile-content"
import { getProfile } from "@/lib/site-data"

export default async function ProfilePage() {
  return <ProfileContent profile={getProfile()} />
}
