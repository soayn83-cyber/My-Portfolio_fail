"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Post, Profile, SiteConfig } from "@/lib/site-data"

type ActionResult = {
  success: boolean
  error?: string
}

function refreshContent() {
  revalidatePath("/admin")
  revalidatePath("/", "layout")
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

function buildNullishString(value: string | null | undefined) {
  return normalizeText(value)
}

function notConfigured(): ActionResult {
  return {
    success: false,
    error: "Supabase 환경 변수가 설정되지 않았습니다.",
  }
}

export async function saveSiteSettings(settings: SiteConfig): Promise<ActionResult> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const payload = {
    site_name: normalizeText(settings.siteName) ?? "Portfolio",
    site_logo_url: buildNullishString(settings.logoUrl),
    hero_image_url: buildNullishString(settings.heroImageUrl),
    main_text: normalizeText(settings.mainText),
    sub_text: normalizeText(settings.subText),
    profile_image_url: buildNullishString(settings.profileImageUrl),
    updated_at: new Date().toISOString(),
  }

  const legacyPayload = {
    site_name: normalizeText(settings.siteName) ?? "Portfolio",
    site_logo_url: buildNullishString(settings.logoUrl),
    hero_image_url: buildNullishString(settings.heroImageUrl),
    hero_text: normalizeText(settings.mainText) ?? normalizeText(settings.subText),
    updated_at: payload.updated_at,
  }

  async function upsertSiteSettings(row: Record<string, unknown>) {
    const { data: existingRow, error: readError } = await client.from("site_settings").select("id").order("updated_at", { ascending: false }).limit(1).maybeSingle()

    if (readError) {
      return { error: readError }
    }

    const mutation = existingRow?.id
      ? client.from("site_settings").upsert({ id: existingRow.id, ...row }, { onConflict: "id" })
      : client.from("site_settings").insert(row)

    const { error } = await mutation
    return { error }
  }

  let result = await upsertSiteSettings(payload)

  if (result.error && /main_text|sub_text|profile_image_url|schema cache/i.test(result.error.message)) {
    result = await upsertSiteSettings(legacyPayload)
  }

  if (result.error) {
    return { success: false, error: result.error.message }
  }

  refreshContent()
  return { success: true }
}

export async function saveProfile(profile: Profile): Promise<ActionResult> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const payload = {
    name: normalizeText(profile.name),
    bio: normalizeText(profile.bio),
    profile_image_url: buildNullishString(profile.profile_image_url),
    contact_email: normalizeText(profile.contact_email),
    social_links: profile.social_links ?? {},
    experience: profile.experience ?? [],
    certifications: profile.certifications ?? [],
    education: profile.education ?? [],
    work_links: profile.work_links ?? [],
    updated_at: new Date().toISOString(),
  }

  const { data: existingRow, error: readError } = await client.from("profile").select("id").order("updated_at", { ascending: false }).limit(1).maybeSingle()

  if (readError) {
    return { success: false, error: readError.message }
  }

  const mutation = existingRow?.id
    ? client.from("profile").upsert({ id: existingRow.id, ...payload }, { onConflict: "id" })
    : client.from("profile").insert(payload)

  const { error } = await mutation

  if (error) {
    return { success: false, error: error.message }
  }

  refreshContent()
  return { success: true }
}

export async function savePost(post: Post): Promise<ActionResult> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const payload = {
    id: post.id,
    category: post.category,
    title: normalizeText(post.title) ?? "Untitled",
    description: buildNullishString(post.description),
    thumbnail_url: buildNullishString(post.thumbnail_url),
    images: post.images ?? [],
    is_published: post.is_published,
    created_at: post.created_at,
    updated_at: new Date().toISOString(),
    episodes: post.episodes ?? [],
    pdf_url: buildNullishString(post.pdf_url),
    keywords: buildNullishString(post.keywords),
    production_date: buildNullishString(post.production_date),
    sub_category: buildNullishString(post.sub_category),
    work_steps: post.work_steps ?? [],
  }

  const { error } = await client.from("posts").upsert(payload, { onConflict: "id" })

  if (error) {
    return { success: false, error: error.message }
  }

  refreshContent()
  return { success: true }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const { error } = await client.from("posts").delete().eq("id", postId)

  if (error) {
    return { success: false, error: error.message }
  }

  refreshContent()
  return { success: true }
}

export async function swapPostOrder(postId: string, nextCreatedAt: string, targetPostId: string, targetCreatedAt: string): Promise<ActionResult> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const updatedAt = new Date().toISOString()
  const [currentResult, targetResult] = await Promise.all([
    client.from("posts").update({ created_at: nextCreatedAt, updated_at: updatedAt }).eq("id", postId),
    client.from("posts").update({ created_at: targetCreatedAt, updated_at: updatedAt }).eq("id", targetPostId),
  ])

  if (currentResult.error) {
    return { success: false, error: currentResult.error.message }
  }

  if (targetResult.error) {
    return { success: false, error: targetResult.error.message }
  }

  refreshContent()
  return { success: true }
}

export async function saveComment(postId: string, authorName: string, content: string, deletePassword: string): Promise<ActionResult> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const deleteKeyHash = await bcrypt.hash(deletePassword, 10)
  const { error } = await client.from("comments").insert({
    post_id: postId,
    author_name: authorName,
    content,
    delete_key_hash: deleteKeyHash,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  refreshContent()
  return { success: true }
}

export async function deleteComment(commentId: string, deletePassword: string): Promise<ActionResult> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const { data, error } = await client.from("comments").select("delete_key_hash").eq("id", commentId).maybeSingle()

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data?.delete_key_hash) {
    return { success: false, error: "삭제 비밀번호를 확인할 수 없습니다." }
  }

  const isMatch = await bcrypt.compare(deletePassword, data.delete_key_hash)

  if (!isMatch) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." }
  }

  const removeResult = await client.from("comments").delete().eq("id", commentId)

  if (removeResult.error) {
    return { success: false, error: removeResult.error.message }
  }

  refreshContent()
  return { success: true }
}