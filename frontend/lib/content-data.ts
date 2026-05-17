import { createSupabaseReadClient } from "@/lib/supabase/server"
import {
  getAllPosts as getFallbackAllPosts,
  getCommentsForPost as getFallbackCommentsForPost,
  getPostById as getFallbackPostById,
  getPosts as getFallbackPosts,
  getProfile as getFallbackProfile,
  getSiteConfig as getFallbackSiteConfig,
  type Comment,
  type EpisodeLink,
  type Post,
  type Profile,
  type ProfileItem,
  type SiteConfig,
  type WorkLink,
  type WorkStep,
} from "@/lib/site-data"

type RecordLike = Record<string, any>

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
}

function toJsonArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback
}

function withFallback<T>(fallback: T, loader: (client: NonNullable<ReturnType<typeof createSupabaseReadClient>>) => Promise<T>) {
  const client = createSupabaseReadClient()

  if (!client) {
    return Promise.resolve(clone(fallback))
  }

  return loader(client).catch(() => clone(fallback))
}

function mapSiteConfig(row: RecordLike): SiteConfig {
  const fallback = getFallbackSiteConfig()

  return {
    siteName: toStringOrNull(row.site_name) ?? fallback.siteName,
    logoUrl: toStringOrNull(row.site_logo_url),
    heroImageUrl: toStringOrNull(row.hero_image_url),
    mainText: toStringOrNull(row.main_text ?? row.hero_text) ?? fallback.mainText,
    subText: toStringOrNull(row.sub_text) ?? fallback.subText,
    profileImageUrl: toStringOrNull(row.profile_image_url),
  }
}

function mapProfile(row: RecordLike): Profile {
  const fallback = getFallbackProfile()

  return {
    id: typeof row.id === "string" ? row.id : fallback.id,
    name: toStringOrNull(row.name) ?? fallback.name,
    bio: toStringOrNull(row.bio ?? row.profile_text) ?? fallback.bio,
    profile_image_url: toStringOrNull(row.profile_image_url) ?? fallback.profile_image_url,
    contact_email: toStringOrNull(row.contact_email) ?? fallback.contact_email,
    social_links: typeof row.social_links === "object" && row.social_links !== null ? (row.social_links as Record<string, string>) : fallback.social_links,
    experience: toJsonArray<ProfileItem>(row.experience, fallback.experience || []),
    certifications: toJsonArray<ProfileItem>(row.certifications, fallback.certifications || []),
    education: toJsonArray<ProfileItem>(row.education, fallback.education || []),
    work_links: toJsonArray<WorkLink>(row.work_links, fallback.work_links || []),
  }
}

function mapPost(row: RecordLike): Post {
  const fallback = getFallbackPostById(typeof row.id === "string" ? row.id : "")
  const fallbackPost = fallback ?? getFallbackAllPosts().find((post) => post.id === row.id) ?? null
  const fallbackImages = fallbackPost?.images ?? []
  const fallbackEpisodes = fallbackPost?.episodes ?? null
  const fallbackWorkSteps = fallbackPost?.work_steps ?? null

  return {
    id: typeof row.id === "string" ? row.id : fallbackPost?.id ?? "",
    category: typeof row.category === "string" ? row.category : fallbackPost?.category ?? "webtoon",
    title: typeof row.title === "string" ? row.title : fallbackPost?.title ?? "Untitled",
    description: toStringOrNull(row.description) ?? fallbackPost?.description ?? null,
    thumbnail_url: toStringOrNull(row.thumbnail_url) ?? fallbackPost?.thumbnail_url ?? null,
    images: toStringArray(row.images).length > 0 ? toStringArray(row.images) : clone(fallbackImages),
    is_published: typeof row.is_published === "boolean" ? row.is_published : fallbackPost?.is_published ?? false,
    created_at: typeof row.created_at === "string" ? row.created_at : fallbackPost?.created_at ?? new Date().toISOString(),
    episodes: toJsonArray<EpisodeLink>(row.episodes, fallbackEpisodes || []).length > 0 ? toJsonArray<EpisodeLink>(row.episodes, fallbackEpisodes || []) : fallbackEpisodes,
    pdf_url: toStringOrNull(row.pdf_url) ?? fallbackPost?.pdf_url ?? null,
    keywords: toStringOrNull(row.keywords) ?? fallbackPost?.keywords ?? null,
    production_date: toStringOrNull(row.production_date) ?? fallbackPost?.production_date ?? null,
    sub_category: toStringOrNull(row.sub_category) ?? fallbackPost?.sub_category ?? null,
    work_steps: toJsonArray<WorkStep>(row.work_steps, fallbackWorkSteps || []).length > 0 ? toJsonArray<WorkStep>(row.work_steps, fallbackWorkSteps || []) : fallbackWorkSteps,
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return withFallback(getFallbackSiteConfig(), async (client) => {
    const { data, error } = await client.from("site_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle()

    if (error || !data) {
      return getFallbackSiteConfig()
    }

    return mapSiteConfig(data)
  })
}

export async function getProfile(): Promise<Profile> {
  return withFallback(getFallbackProfile(), async (client) => {
    const { data, error } = await client.from("profile").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle()

    if (error || !data) {
      return getFallbackProfile()
    }

    return mapProfile(data)
  })
}

export async function getPosts(category?: string): Promise<Post[]> {
  const fallback = getFallbackPosts(category)

  return withFallback(fallback, async (client) => {
    let query = client.from("posts").select("*").order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error || !data) {
      return fallback
    }

    return data
      .map((row) => mapPost(row))
      .filter((post) => post.is_published)
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
  })
}

export async function getAllPosts(): Promise<Post[]> {
  return withFallback(getFallbackAllPosts(), async (client) => {
    const { data, error } = await client.from("posts").select("*").order("created_at", { ascending: false })

    if (error || !data) {
      return getFallbackAllPosts()
    }

    return data.map((row) => mapPost(row)).sort((left, right) => right.created_at.localeCompare(left.created_at))
  })
}

export async function getPostById(id: string): Promise<Post | null> {
  const fallback = getFallbackPostById(id)

  return withFallback(fallback, async (client) => {
    const { data, error } = await client.from("posts").select("*").eq("id", id).maybeSingle()

    if (error || !data || !data.is_published) {
      return fallback
    }

    return mapPost(data)
  })
}

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const fallback = getFallbackCommentsForPost(postId)

  return withFallback(fallback, async (client) => {
    const { data, error } = await client.from("comments").select("id, author_name, content, created_at").eq("post_id", postId).order("created_at", { ascending: true })

    if (error || !data) {
      return fallback
    }

    return data.map((row) => ({
      id: typeof row.id === "string" ? row.id : `${postId}-${row.created_at}`,
      author_name: typeof row.author_name === "string" ? row.author_name : "Anonymous",
      content: typeof row.content === "string" ? row.content : "",
      created_at: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    }))
  })
}