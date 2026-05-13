import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"
import { getCommentsForPost, getPostById } from "@/lib/site-data"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function IllustrationDetailPage({ params }: PageProps) {
  const { id } = await params
  const post = getPostById(id)

  if (!post) {
    notFound()
  }

  const comments = getCommentsForPost(id)

  return (
    <PostDetail
      post={post}
      comments={comments}
      backHref="/illustration"
      backLabel="Back to Illustration"
    />
  )
}
