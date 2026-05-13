"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostsManager } from "./posts-manager"
import { SiteSettingsManager } from "./site-settings-manager"
import { ProfileManager } from "./profile-manager"
import { LogOut, Settings } from "lucide-react"
import { logoutAdmin } from "@/app/admin/login/actions"
import type { Post, Profile, SiteConfig } from "@/lib/site-data"

interface AdminDashboardProps {
  user: { email?: string | null }
  posts: Post[]
  settings: SiteConfig | null
  profile: Profile | null
}

export function AdminDashboard({ user, posts, settings, profile }: AdminDashboardProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logoutAdmin()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-xl font-medium text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/70">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="border-primary/30 hover:bg-primary/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-5 bg-primary/10">
            <TabsTrigger value="main" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Main Page
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Profile
            </TabsTrigger>
            <TabsTrigger value="webtoon" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Webtoon
            </TabsTrigger>
            <TabsTrigger value="work-process" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Work Process
            </TabsTrigger>
            <TabsTrigger value="illustration" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Illustration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="main">
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4 mb-6">
              <h2 className="text-xl font-bold">1. Main Page Settings</h2>
              <ul className="list-disc pl-5 text-sm text-foreground/70 space-y-1 mt-2">
                <li>1-1. 메인 페이지 전체의 배경 이미지 수정</li>
                <li>1-2. 메인 문구 텍스트 수정</li>
                <li>1-3. 메인 문구 텍스트 밑 서브 텍스트 수정</li>
                <li>1-4. 원형의 대표 프로필 이미지 수정</li>
                <li>1-5. 홈페이지 메인 이름 수정</li>
              </ul>
            </div>
            <SiteSettingsManager settings={settings} />
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4 mb-6">
              <h2 className="text-xl font-bold">2. Profile Settings</h2>
              <ul className="list-disc pl-5 text-sm text-foreground/70 space-y-1 mt-2">
                <li>2-1. 프로필 내 대표 이미지 수정</li>
                <li>2-2. 아티스트 이름 수정</li>
                <li>2-3. 작가 설명이 가능한 텍스트 수정</li>
              </ul>
            </div>
            <ProfileManager profile={profile} />
          </TabsContent>
          
          <TabsContent value="webtoon">
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4 mb-6">
              <h2 className="text-xl font-bold">3. Webtoon Settings</h2>
              <ul className="list-disc pl-5 text-sm text-foreground/70 space-y-1 mt-2">
                <li>3-1. 카테고리 메인 문구 수정</li>
                <li>3-2. 카테고리 메인 문구 밑 서브 텍스트 수정</li>
                <li>3-3. 웹툰 작업물 삽입/수정 (대표 이미지, 제목, 로그라인, 여러 웹툰 원고 이미지 세로 스크롤)</li>
              </ul>
            </div>
            {/* You will need to build or modify PostsManager to accept a category filter prop */}
            <PostsManager posts={posts.filter((p) => p.category === 'webtoon')} defaultCategory="webtoon" />
          </TabsContent>

          <TabsContent value="work-process">
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4 mb-6">
              <h2 className="text-xl font-bold">4. Work Process Settings</h2>
              <ul className="list-disc pl-5 text-sm text-foreground/70 space-y-1 mt-2">
                <li>4-1. 카테고리 메인 문구 수정</li>
                <li>4-2. 카테고리 메인 문구 밑 서브 텍스트 수정</li>
                <li>4-3. 장르별 작업과정 이미지 삽입 (장르 텍스트, 장르 탭, 여러 이미지 세로 스크롤)</li>
              </ul>
            </div>
            <PostsManager posts={posts.filter((p) => p.category === 'work_process')} defaultCategory="work_process" />
          </TabsContent>

          <TabsContent value="illustration">
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4 mb-6">
              <h2 className="text-xl font-bold">5. Illustration Settings</h2>
              <ul className="list-disc pl-5 text-sm text-foreground/70 space-y-1 mt-2">
                <li>5-1. 카테고리 메인 문구 수정</li>
                <li>5-2. 카테고리 메인 문구 밑 서브 텍스트 수정</li>
                <li>5-3. 이미지 삽입 및 수정 (여러 이미지, 직접 배치 가능하도록 설정)</li>
              </ul>
            </div>
            <PostsManager posts={posts.filter((p) => p.category === 'illustration')} defaultCategory="illustration" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
