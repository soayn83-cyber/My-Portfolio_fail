"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { persistDataUrlAsPublicUrl } from "@/lib/supabase/storage"
import type { Post, Profile, SiteConfig } from "@/lib/site-data"

type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
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

function isMissingLegacyPostSchema(error: Error) {
  return /updated_at|schema cache/i.test(error.message)
}

type SavedSiteSettings = {
  siteName: string
  mainText: string | null
  subText: string | null
  logoUrl: string | null
  heroImageUrl: string | null
  profileImageUrl: string | null
}

export async function saveSiteSettings(settings: SiteConfig): Promise<ActionResult<SavedSiteSettings>> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const payload = {
    site_name: normalizeText(settings.siteName) ?? "Portfolio",
    site_logo_url: await persistDataUrlAsPublicUrl(client, settings.logoUrl, "site-settings/logo"),
    hero_image_url: await persistDataUrlAsPublicUrl(client, settings.heroImageUrl, "site-settings/hero"),
    main_text: normalizeText(settings.mainText),
    sub_text: normalizeText(settings.subText),
    profile_image_url: await persistDataUrlAsPublicUrl(client, settings.profileImageUrl, "site-settings/profile"),
    updated_at: new Date().toISOString(),
  }

  const legacyPayload = {
    site_name: normalizeText(settings.siteName) ?? "Portfolio",
    site_logo_url: payload.site_logo_url,
    hero_image_url: payload.hero_image_url,
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
  return {
    success: true,
    data: {
      siteName: payload.site_name,
      mainText: payload.main_text,
      subText: payload.sub_text,
      logoUrl: payload.site_logo_url,
      heroImageUrl: payload.hero_image_url,
      profileImageUrl: payload.profile_image_url,
    },
  }
}

export async function saveProfile(profile: Profile): Promise<ActionResult<Profile>> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const payload = {
    name: normalizeText(profile.name),
    bio: normalizeText(profile.bio),
    profile_image_url: await persistDataUrlAsPublicUrl(client, profile.profile_image_url, "profile/image"),
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
  return {
    success: true,
    data: {
      id: profile.id,
      name: payload.name,
      bio: payload.bio,
      profile_image_url: payload.profile_image_url,
      contact_email: payload.contact_email,
      social_links: payload.social_links,
      experience: payload.experience,
      certifications: payload.certifications,
      education: payload.education,
      work_links: payload.work_links,
    },
  }
}

export async function savePost(post: Post): Promise<ActionResult<Post>> {
  const client = createSupabaseServerClient()

  if (!client) {
    return notConfigured()
  }

  const thumbnailUrl = await persistDataUrlAsPublicUrl(client, post.thumbnail_url, `posts/${post.id}/thumbnail`)
  const pdfUrl = await persistDataUrlAsPublicUrl(client, post.pdf_url, `posts/${post.id}/pdf`)
  const images = await Promise.all(
    (post.images ?? []).map((imageUrl, index) => persistDataUrlAsPublicUrl(client, imageUrl, `posts/${post.id}/images/${index + 1}`)),
  )
  const workSteps = await Promise.all(
    (post.work_steps ?? []).map(async (step, index) => ({
      ...step,
      image_url: await persistDataUrlAsPublicUrl(client, step.image_url, `posts/${post.id}/work-steps/${index + 1}`),
    })),
  )

  const payload = {
    id: post.id,
    category: post.category,
    title: normalizeText(post.title) ?? "Untitled",
    description: buildNullishString(post.description),
    thumbnail_url: thumbnailUrl,
    images,
    is_published: post.is_published,
    created_at: post.created_at,
    updated_at: new Date().toISOString(),
    episodes: post.episodes ?? [],
    pdf_url: pdfUrl,
    keywords: buildNullishString(post.keywords),
    production_date: buildNullishString(post.production_date),
    sub_category: buildNullishString(post.sub_category),
    work_steps: workSteps,
  }

  const legacyPayload = {
    id: post.id,
    category: post.category,
    title: normalizeText(post.title) ?? "Untitled",
    description: buildNullishString(post.description),
    thumbnail_url: thumbnailUrl,
    images,
    is_published: post.is_published,
    created_at: post.created_at,
    episodes: post.episodes ?? [],
    pdf_url: pdfUrl,
    keywords: buildNullishString(post.keywords),
    production_date: buildNullishString(post.production_date),
    sub_category: buildNullishString(post.sub_category),
    work_steps: workSteps,
  }

  const { error } = await client.from("posts").upsert(payload, { onConflict: "id" })

  if (error && isMissingLegacyPostSchema(error)) {
    const { error: legacyError } = await client.from("posts").upsert(legacyPayload, { onConflict: "id" })

    if (!legacyError) {
      refreshContent()
      return { success: true, data: { ...post, thumbnail_url: thumbnailUrl, images, pdf_url: pdfUrl, work_steps: workSteps } }
    }

    return { success: false, error: legacyError.message }
  }

  if (error) {
    return { success: false, error: error.message }
  }

  refreshContent()
  return {
    success: true,
    data: {
      ...post,
      thumbnail_url: thumbnailUrl,
      images,
      pdf_url: pdfUrl,
      work_steps: workSteps,
    },
  }
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

  if ((currentResult.error && isMissingLegacyPostSchema(currentResult.error)) || (targetResult.error && isMissingLegacyPostSchema(targetResult.error))) {
    const [legacyCurrentResult, legacyTargetResult] = await Promise.all([
      client.from("posts").update({ created_at: nextCreatedAt }).eq("id", postId),
      client.from("posts").update({ created_at: targetCreatedAt }).eq("id", targetPostId),
    ])

    if (legacyCurrentResult.error) {
      return { success: false, error: legacyCurrentResult.error.message }
    }

    if (legacyTargetResult.error) {
      return { success: false, error: legacyTargetResult.error.message }
    }

    refreshContent()
    return { success: true }
  }

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