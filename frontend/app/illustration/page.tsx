import { PageHeader } from "@/components/page-header"
import { IllustrationClient } from "@/components/illustration-client"
import { getPosts } from "@/lib/site-data"

export default async function IllustrationPage() {
  const posts = getPosts("illustration")

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4">
        <PageHeader
          title="Illustration"
          description="A collection of my illustrations and artwork"
        />
        <IllustrationClient posts={posts} />
      </div>
    </div>
  )
}
