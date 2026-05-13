import { WebtoonList } from "@/components/webtoon-list"
import { PageHeader } from "@/components/page-header"
import { getPosts } from "@/lib/site-data"

export default async function WebtoonPage() {
  const posts = getPosts("webtoon")

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4">
        <PageHeader
          title="Webtoon"
          description="Explore my webtoon works and stories"
        />
        <WebtoonList posts={posts} />
      </div>
    </div>
  )
}
