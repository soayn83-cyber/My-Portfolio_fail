"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload, X } from "lucide-react"
import type { EpisodeLink, Post, WorkStep } from "@/lib/site-data"
import { deletePost, savePost, swapPostOrder } from "@/app/admin/actions"

const categories = [
  { value: "webtoon", label: "Webtoon" },
  { value: "work_process", label: "Work Process" },
  { value: "illustration", label: "Illustration" },
]

type DraftPost = {
  category: string
  title: string
  description: string
  thumbnail_url: string
  imagesText: string
  is_published: boolean
  episodesText: string
  pdf_url: string
  keywords: string
  production_date: string
  sub_category: string
  workStepsText: string
}

function sortPosts(list: Post[]) {
  return [...list].sort((left, right) => right.created_at.localeCompare(left.created_at))
}

function emptyDraft(category: string): DraftPost {
  return {
    category,
    title: "",
    description: "",
    thumbnail_url: "",
    imagesText: "",
    is_published: false,
    episodesText: "[]",
    pdf_url: "",
    keywords: "",
    production_date: "",
    sub_category: "serialized",
    workStepsText: "[]",
  }
}

function serializeLines(values: string[]) {
  return values.join("\n")
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseJsonArray<T>(value: string, fallback: T[]): T[] {
  if (!value.trim()) {
    return fallback
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}

export function PostsManager({ posts: initialPosts, defaultCategory = "webtoon" }: { posts: Post[], defaultCategory?: string }) {
  const [posts, setPosts] = useState(() => sortPosts(initialPosts))
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftPost>(() => emptyDraft(defaultCategory))
  const [notice, setNotice] = useState<string | null>(null)

  const currentPosts = useMemo(() => sortPosts(posts), [posts])

  const beginCreate = () => {
    setIsCreating(true)
    setEditingId(null)
    setDraft(emptyDraft(defaultCategory))
    setNotice(null)
  }

  const beginEdit = (post: Post) => {
    setIsCreating(true)
    setEditingId(post.id)
    setDraft({
      category: post.category,
      title: post.title,
      description: post.description || "",
      thumbnail_url: post.thumbnail_url || "",
      imagesText: serializeLines(post.images || []),
      is_published: post.is_published,
      episodesText: JSON.stringify(post.episodes || [], null, 2),
      pdf_url: post.pdf_url || "",
      keywords: post.keywords || "",
      production_date: post.production_date || "",
      sub_category: post.sub_category || "serialized",
      workStepsText: JSON.stringify(post.work_steps || [], null, 2),
    })
    setNotice(null)
  }

  const cancelEdit = () => {
    setIsCreating(false)
    setEditingId(null)
    setDraft(emptyDraft(defaultCategory))
  }

  const handleSave = async () => {
    setIsSaving(true)

    const now = new Date().toISOString()
    const images = parseLines(draft.imagesText)
    const episodes = parseJsonArray<EpisodeLink>(draft.episodesText, [])
    const workSteps = parseJsonArray<WorkStep>(draft.workStepsText, [])

    const nextPost: Post = {
      id: editingId || `post-${Date.now()}`,
      category: draft.category,
      title: draft.title.trim() || "Untitled",
      description: draft.description.trim() || null,
      thumbnail_url: draft.thumbnail_url.trim() || null,
      images,
      is_published: draft.is_published,
      created_at: editingId ? currentPosts.find((post) => post.id === editingId)?.created_at || now : now,
      episodes: episodes.length > 0 ? episodes : null,
      pdf_url: draft.pdf_url.trim() || null,
      keywords: draft.keywords.trim() || null,
      production_date: draft.production_date.trim() || null,
      sub_category: draft.sub_category.trim() || null,
      work_steps: workSteps.length > 0 ? workSteps : null,
    }

    const saveResult = await savePost(nextPost)

    setPosts((previous) => {
      const withoutEdited = previous.filter((post) => post.id !== nextPost.id)
      return sortPosts([nextPost, ...withoutEdited])
    })

    setNotice(saveResult.success ? (editingId ? "Post saved to Supabase." : "Post created in Supabase.") : `${saveResult.error || "Supabase save failed."} Local state was updated.`)
    cancelEdit()
    setIsSaving(false)
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const dataUrl = await readFileAsDataUrl(file)
    setDraft((previous) => ({ ...previous, thumbnail_url: dataUrl }))
    e.target.value = ""
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const dataUrl = await readFileAsDataUrl(file)
    setDraft((previous) => ({ ...previous, pdf_url: dataUrl }))
    e.target.value = ""
  }

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) {
      return
    }

    const dataUrls = await Promise.all(files.map((file) => readFileAsDataUrl(file)))
    setDraft((previous) => {
      const existingImages = parseLines(previous.imagesText)
      return {
        ...previous,
        imagesText: serializeLines([...existingImages, ...dataUrls]),
      }
    })
    e.target.value = ""
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 항목을 정말 삭제하시겠습니까?")) {
      return
    }

    setIsSaving(true)
    const result = await deletePost(id)
    setPosts((previous) => previous.filter((post) => post.id !== id))
    setNotice(result.success ? "Post deleted from Supabase." : `${result.error || "Supabase delete failed."} Local state was updated.`)
    setIsSaving(false)
  }

  const handleSwapOrder = async (post: Post, direction: "up" | "down") => {
    const categoryPosts = currentPosts.filter((item) => item.category === post.category)
    const currentIndex = categoryPosts.findIndex((item) => item.id === post.id)
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= categoryPosts.length) {
      return
    }

    const targetPost = categoryPosts[targetIndex]
    const nextDate = targetPost.created_at
    const targetDate = post.created_at

    setIsSaving(true)
    const result = await swapPostOrder(post.id, nextDate, targetPost.id, targetDate)

    setPosts((previous) =>
      previous.map((item) => {
        if (item.id === post.id) {
          return { ...item, created_at: nextDate }
        }

        if (item.id === targetPost.id) {
          return { ...item, created_at: targetDate }
        }

        return item
      }),
    )

    setNotice(result.success ? "Order updated in Supabase." : `${result.error || "Supabase reorder failed."} Local state was updated.`)
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-foreground">Posts Manager</h2>
          {notice && <p className="mt-1 text-sm text-foreground/60">{notice}</p>}
        </div>
        {!isCreating && (
          <Button onClick={beginCreate} variant="outline" className="border-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            새 항목 등록
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="border-primary/20 bg-background/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="font-serif">{editingId ? "Edit Post" : "새 포스트"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={cancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={draft.category} onValueChange={(value) => setDraft((previous) => ({ ...previous, category: value }))}>
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={draft.title}
                  onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="제목을 입력하세요"
                  className="border-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={draft.description}
                onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))}
                rows={4}
                className="border-primary/20"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Thumbnail URL</Label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                    <Upload className="h-4 w-4 text-primary" />
                    <span className="text-sm">썸네일 파일 선택</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                  </label>
                  <Input
                    value={draft.thumbnail_url}
                    onChange={(event) => setDraft((previous) => ({ ...previous, thumbnail_url: event.target.value }))}
                    className="border-primary/20"
                    placeholder="/placeholder.jpg 또는 data URL"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>PDF URL</Label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                    <Upload className="h-4 w-4 text-primary" />
                    <span className="text-sm">PDF 파일 선택</span>
                    <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                  </label>
                  <Input
                    value={draft.pdf_url}
                    onChange={(event) => setDraft((previous) => ({ ...previous, pdf_url: event.target.value }))}
                    className="border-primary/20"
                    placeholder="/placeholder.svg 또는 data URL"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Images (one per line)</Label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/30 px-4 py-2 transition-colors hover:bg-primary/5">
                  <Plus className="h-4 w-4 text-primary" />
                  <span className="text-sm">이미지 파일 여러 개 선택</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesUpload} />
                </label>
                <Textarea
                  value={draft.imagesText}
                  onChange={(event) => setDraft((previous) => ({ ...previous, imagesText: event.target.value }))}
                  rows={4}
                  className="border-primary/20 font-mono text-sm"
                  placeholder="URL 또는 data URL을 한 줄에 하나씩 입력하세요"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Episodes (JSON)</Label>
              <Textarea
                value={draft.episodesText}
                onChange={(event) => setDraft((previous) => ({ ...previous, episodesText: event.target.value }))}
                rows={6}
                className="border-primary/20 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Work Steps (JSON)</Label>
              <Textarea
                value={draft.workStepsText}
                onChange={(event) => setDraft((previous) => ({ ...previous, workStepsText: event.target.value }))}
                rows={6}
                className="border-primary/20 font-mono text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={draft.keywords}
                  onChange={(event) => setDraft((previous) => ({ ...previous, keywords: event.target.value }))}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label>Production Date</Label>
                <Input
                  value={draft.production_date}
                  onChange={(event) => setDraft((previous) => ({ ...previous, production_date: event.target.value }))}
                  className="border-primary/20"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Sub Category</Label>
                <Input
                  value={draft.sub_category}
                  onChange={(event) => setDraft((previous) => ({ ...previous, sub_category: event.target.value }))}
                  className="border-primary/20"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-primary/20 px-4 py-3">
                <div>
                  <Label className="block">Published</Label>
                  <p className="text-sm text-foreground/60">Show this post in public lists</p>
                </div>
                <Switch
                  checked={draft.is_published}
                  onCheckedChange={(checked) => setDraft((previous) => ({ ...previous, is_published: checked }))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {currentPosts.map((post, index) => (
          <Card key={post.id} className="border-primary/20">
            <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-primary/20 bg-primary/5">
                  {post.thumbnail_url ? (
                    <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-serif text-primary/30">{post.title[0]}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/50">
                    <span>{post.category}</span>
                    <span>{post.is_published ? "Published" : "Draft"}</span>
                  </div>
                  <h3 className="mt-1 font-serif text-lg text-foreground">{post.title}</h3>
                  {post.description && <p className="max-w-2xl text-sm text-foreground/60">{post.description}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSwapOrder(post, "up")} disabled={index === 0 || isSaving}>
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Up
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSwapOrder(post, "down")} disabled={index === currentPosts.length - 1 || isSaving}>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Down
                </Button>
                <Button variant="outline" size="sm" onClick={() => beginEdit(post)} disabled={isSaving}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)} disabled={isSaving}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {currentPosts.length === 0 && (
          <div className="rounded-xl border border-dashed border-primary/20 p-8 text-center text-sm text-foreground/60">
            No posts in this section yet.
          </div>
        )}
      </div>
    </div>
  )
}
