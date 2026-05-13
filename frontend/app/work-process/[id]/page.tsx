import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"
import { getCommentsForPost, getPostById } from "@/lib/site-data"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkProcessDetailPage({ params }: PageProps) {
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
      backHref="/work-process"
      backLabel="Back to Work Process"
    />
  )
}
