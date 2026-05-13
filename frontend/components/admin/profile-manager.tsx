"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Upload, X } from "lucide-react"
import type { Profile, ProfileItem, WorkLink } from "@/lib/site-data"

interface ProfileManagerProps {
  profile: Profile | null
}

type DraftProfile = {
  name: string
  bio: string
  profile_image_url: string
  contact_email: string
  social_links: string
  experience: string
  certifications: string
  education: string
  work_links: string
}

function safeJson<T>(value: string, fallback: T): T {
  if (!value.trim()) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

export function ProfileManager({ profile }: ProfileManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<DraftProfile>({
    name: profile?.name || "",
    bio: profile?.bio || "",
    profile_image_url: profile?.profile_image_url || "",
    contact_email: profile?.contact_email || "",
    social_links: formatJson(profile?.social_links || {}),
    experience: formatJson(profile?.experience || []),
    certifications: formatJson(profile?.certifications || []),
    education: formatJson(profile?.education || []),
    work_links: formatJson(profile?.work_links || []),
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setFormData((previous) => ({ ...previous, profile_image_url: previewUrl }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const nextProfile = {
        name: formData.name.trim() || null,
        bio: formData.bio.trim() || null,
        profile_image_url: formData.profile_image_url.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        social_links: safeJson<Record<string, string>>(formData.social_links, {}),
        experience: safeJson<ProfileItem[]>(formData.experience, []),
        certifications: safeJson<ProfileItem[]>(formData.certifications, []),
        education: safeJson<ProfileItem[]>(formData.education, []),
        work_links: safeJson<WorkLink[]>(formData.work_links, []),
      }

      console.info("Profile data updated locally", nextProfile)
      setSavedMessage("프로필 설정이 로컬 상태에 반영되었습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const addWorkLink = () => {
    const workLinks = safeJson<WorkLink[]>(formData.work_links, [])
    setFormData((previous) => ({
      ...previous,
      work_links: formatJson([
        ...workLinks,
        { title: "", episodes: "", role: "", url: "" },
      ]),
    }))
  }

  const clearImage = () => {
    setFormData((previous) => ({ ...previous, profile_image_url: "" }))
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="font-serif">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              {formData.profile_image_url && (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-primary/20">
                  <Image src={formData.profile_image_url} alt="Profile" fill className="object-cover" />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-sm">Upload Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {formData.profile_image_url && (
                <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData((previous) => ({ ...previous, name: e.target.value }))} className="border-primary/20" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData((previous) => ({ ...previous, bio: e.target.value }))} rows={4} className="border-primary/20" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" type="email" value={formData.contact_email} onChange={(e) => setFormData((previous) => ({ ...previous, contact_email: e.target.value }))} className="border-primary/20" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_links">Social Links (JSON)</Label>
            <Textarea id="social_links" value={formData.social_links} onChange={(e) => setFormData((previous) => ({ ...previous, social_links: e.target.value }))} rows={4} className="border-primary/20 font-mono text-sm" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (JSON)</Label>
              <Textarea id="experience" value={formData.experience} onChange={(e) => setFormData((previous) => ({ ...previous, experience: e.target.value }))} rows={6} className="border-primary/20 font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education (JSON)</Label>
              <Textarea id="education" value={formData.education} onChange={(e) => setFormData((previous) => ({ ...previous, education: e.target.value }))} rows={6} className="border-primary/20 font-mono text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (JSON)</Label>
            <Textarea id="certifications" value={formData.certifications} onChange={(e) => setFormData((previous) => ({ ...previous, certifications: e.target.value }))} rows={4} className="border-primary/20 font-mono text-sm" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_links">Work Links (JSON)</Label>
            <Textarea id="work_links" value={formData.work_links} onChange={(e) => setFormData((previous) => ({ ...previous, work_links: e.target.value }))} rows={6} className="border-primary/20 font-mono text-sm" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? "Saving..." : "Save locally"}
            </Button>
            <Button type="button" variant="outline" onClick={addWorkLink}>
              <Plus className="mr-2 h-4 w-4" />
              Add placeholder link
            </Button>
          </div>

          {savedMessage && <p className="text-sm text-foreground/60">{savedMessage}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
