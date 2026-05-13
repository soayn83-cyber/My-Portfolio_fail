export type SiteConfig = {
  siteName: string
  logoUrl: string | null
  heroImageUrl: string | null
  mainText: string
  subText: string
  profileImageUrl: string | null
}

export interface ProfileItem {
  date: string
  content: string
}

export interface WorkLink {
  title: string
  episodes: string
  role: string
  url: string
}

export interface Profile {
  id: string
  name: string | null
  bio: string | null
  profile_image_url: string | null
  contact_email: string | null
  social_links: Record<string, string> | null
  experience: ProfileItem[] | null
  certifications: ProfileItem[] | null
  education: ProfileItem[] | null
  work_links: WorkLink[] | null
}

export interface EpisodeLink {
  title: string
  url?: string
  images?: string[]
}

export interface WorkStep {
  image_url: string
  description: string
}

export interface Post {
  id: string
  category: string
  title: string
  description: string | null
  thumbnail_url: string | null
  images: string[]
  is_published: boolean
  created_at: string
  episodes?: EpisodeLink[] | null
  pdf_url?: string | null
  keywords?: string | null
  production_date?: string | null
  sub_category?: string | null
  work_steps?: WorkStep[] | null
}

export interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
  deleteKey?: string
}

const siteConfig: SiteConfig = {
  siteName: 'Illustrator Portfolio',
  logoUrl: '/placeholder-logo.png',
  heroImageUrl: '/placeholder.jpg',
  mainText: 'Welcome to My Portfolio',
  subText: 'Explore my creative world of illustrations, webtoons, and artistic journey',
  profileImageUrl: '/placeholder-user.jpg',
}

const profile: Profile = {
  id: 'profile-local',
  name: 'Soay Hyeon',
  bio: 'Illustrator and visual storyteller working across webtoons, editorial illustration, and process-driven artwork.',
  profile_image_url: '/placeholder-user.jpg',
  contact_email: 'hello@example.com',
  social_links: {
    Instagram: 'https://example.com',
    Behance: 'https://example.com',
  },
  experience: [
    { date: '2024 - Present', content: 'Independent illustration and webtoon projects.' },
    { date: '2022 - 2024', content: 'Visual storytelling and character design collaborations.' },
  ],
  certifications: [{ date: '2023', content: 'Digital Illustration Certificate' }],
  education: [{ date: '2020 - 2024', content: 'B.A. in Visual Communication Design' }],
  work_links: [
    {
      title: 'Moonlit Journey',
      episodes: 'Episodes 1 - 3',
      role: 'Webtoon Artist',
      url: '/webtoon/moonlit-journey',
    },
    {
      title: 'Garden Study',
      episodes: 'Selected Works',
      role: 'Illustrator',
      url: '/illustration/garden-study',
    },
  ],
}

const posts: Post[] = [
  {
    id: 'moonlit-journey',
    category: 'webtoon',
    title: 'Moonlit Journey',
    description: 'A serialized fantasy webtoon following a quiet traveler through a city shaped by moonlight.',
    thumbnail_url: '/placeholder.jpg',
    images: ['/placeholder.jpg', '/placeholder-user.jpg'],
    is_published: true,
    created_at: '2026-05-01T09:00:00.000Z',
    episodes: [
      { title: 'Episode 1', images: ['/placeholder.jpg', '/placeholder-user.jpg'] },
      { title: 'Episode 2', images: ['/placeholder.svg'] },
    ],
    pdf_url: '/placeholder.svg',
    keywords: 'fantasy, serialized, moonlight',
    production_date: '2026',
    sub_category: 'serialized',
  },
  {
    id: 'garden-study',
    category: 'illustration',
    title: 'Garden Study',
    description: 'An illustration series focused on foliage, structure, and warm daylight.',
    thumbnail_url: '/placeholder-user.jpg',
    images: ['/placeholder.jpg', '/placeholder.svg'],
    is_published: true,
    created_at: '2026-04-18T09:00:00.000Z',
    keywords: 'type:personal, layout:horizontal, nature',
    production_date: '2026',
  },
  {
    id: 'process-notes',
    category: 'work_process',
    title: 'Process Notes',
    description: 'A compact look at thumbnails, roughs, and final image assembly.',
    thumbnail_url: '/placeholder-user.jpg',
    images: ['/placeholder-user.jpg', '/placeholder.jpg'],
    is_published: true,
    created_at: '2026-03-22T09:00:00.000Z',
    work_steps: [
      { image_url: '/placeholder-user.jpg', description: 'Thumbnail sketch' },
      { image_url: '/placeholder.jpg', description: 'Color block-in' },
      { image_url: '/placeholder.svg', description: 'Final comp' },
    ],
    production_date: '2026',
  },
]

const commentsByPost: Record<string, Comment[]> = {
  'moonlit-journey': [
    {
      id: 'comment-1',
      author_name: 'Reader',
      content: 'The atmosphere is strong and the pacing feels calm in a good way.',
      created_at: '2026-05-02T10:15:00.000Z',
      deleteKey: 'reader123',
    },
  ],
  'garden-study': [
    {
      id: 'comment-2',
      author_name: 'Art Fan',
      content: 'The color rhythm is especially clean here.',
      created_at: '2026-05-03T08:30:00.000Z',
      deleteKey: 'fan123',
    },
  ],
  'process-notes': [],
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function getSiteConfig(): SiteConfig {
  return clone(siteConfig)
}

export function getProfile(): Profile {
  return clone(profile)
}

export function getPosts(category?: string): Post[] {
  const filtered = category ? posts.filter((post) => post.category === category) : posts
  return clone(filtered.filter((post) => post.is_published).sort((left, right) => right.created_at.localeCompare(left.created_at)))
}

export function getPostById(id: string): Post | null {
  const post = posts.find((item) => item.id === id && item.is_published)
  return post ? clone(post) : null
}

export function getCommentsForPost(postId: string): Comment[] {
  return clone(commentsByPost[postId] || [])
}
