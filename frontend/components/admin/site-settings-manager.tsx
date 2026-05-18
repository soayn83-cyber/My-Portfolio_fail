"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import type { SiteConfig } from "@/lib/site-data"
import { saveSiteSettings } from "@/app/admin/actions"

interface SiteSettingsManagerProps {
  settings: SiteConfig | null
}

type DraftSettings = {
  siteTitle: string
  mainText: string
  subText: string
  siteLogoUrl: string
  heroImageUrl: string
  profileImageUrl: string
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function SiteSettingsManager({ settings }: SiteSettingsManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<DraftSettings>({
    siteTitle: settings?.siteName || "Portfolio",
    mainText: settings?.mainText || "",
    subText: settings?.subText || "",
    siteLogoUrl: settings?.logoUrl || "",
    heroImageUrl: settings?.heroImageUrl || "",
    profileImageUrl: settings?.profileImageUrl || "",
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof Pick<DraftSettings, "siteLogoUrl" | "heroImageUrl" | "profileImageUrl">) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const dataUrl = await readFileAsDataUrl(file)

    setFormData((previous) => ({
      ...previous,
      [field]: dataUrl,
    }))
  }

  const clearField = (field: keyof Pick<DraftSettings, "siteLogoUrl" | "heroImageUrl" | "profileImageUrl">) => {
    setFormData((previous) => ({ ...previous, [field]: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await saveSiteSettings({
        siteName: formData.siteTitle,
        mainText: formData.mainText,
        subText: formData.subText,
        logoUrl: formData.siteLogoUrl || null,
        heroImageUrl: formData.heroImageUrl || null,
        profileImageUrl: formData.profileImageUrl || null,
      })

      console.info("Site settings updated locally", formData)
      setMessage(result.success ? "메인 페이지 설정이 Supabase에 저장되었습니다." : `${result.error || "Supabase save failed."} 로컬 상태는 유지됩니다.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="font-serif">1. Main Page Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>대표 로고 이미지</Label>
            <div className="flex flex-col gap-4">
              {formData.siteLogoUrl && (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-primary/20">
                  <Image src={formData.siteLogoUrl} alt="Logo" fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm">Upload Logo Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, "siteLogoUrl")} />
                </label>
                {formData.siteLogoUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => clearField("siteLogoUrl")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>1-1. 전체 배경 이미지</Label>
            <div className="flex flex-col gap-4">
              {formData.heroImageUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg border border-primary/20">
                  <Image src={formData.heroImageUrl} alt="Hero" fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm">Upload Hero Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, "heroImageUrl")} />
                </label>
                {formData.heroImageUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => clearField("heroImageUrl")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_text">1-2. 메인 문구 텍스트</Label>
            <Input id="main_text" value={formData.mainText} onChange={(event) => setFormData((previous) => ({ ...previous, mainText: event.target.value }))} placeholder="예: 안녕하세요. 아티스트 OO입니다." className="border-primary/20" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub_text">1-3. 서브 텍스트</Label>
            <Textarea id="sub_text" value={formData.subText} onChange={(event) => setFormData((previous) => ({ ...previous, subText: event.target.value }))} rows={4} placeholder="예: 일러스트, 웹툰 등의 작업을 진행합니다." className="border-primary/20" />
          </div>

          <div className="space-y-2">
            <Label>1-4. 대표 프로필 이미지</Label>
            <div className="flex items-center gap-4">
              {formData.profileImageUrl && (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-primary/20">
                  <Image src={formData.profileImageUrl} alt="Profile Image" fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm">Upload Profile Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event, "profileImageUrl")} />
                </label>
                {formData.profileImageUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => clearField("profileImageUrl")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_title">1-5. 홈페이지 메인 이름</Label>
            <Input id="site_title" value={formData.siteTitle} onChange={(event) => setFormData((previous) => ({ ...previous, siteTitle: event.target.value }))} className="border-primary/20" placeholder="예: Portfolio" />
          </div>

          <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>

          {message && <p className="text-sm text-foreground/60">{message}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
