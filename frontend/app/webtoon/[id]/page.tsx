import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"
import { getCommentsForPost, getPostById } from "@/lib/site-data"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ episode?: string }>
}

export default async function WebtoonDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const episodeIndex = resolvedSearchParams.episode ? parseInt(resolvedSearchParams.episode, 10) : undefined;

  const post = getPostById(id);

  if (!post) {
    notFound();
  }

  // If viewing a specific episode with uploaded images
  if (episodeIndex !== undefined && post.episodes && post.episodes[episodeIndex]) {
    const episode = post.episodes[episodeIndex];
    if (episode.images && episode.images.length > 0) {
      post.title = `${post.title} - ${episode.title}`;
      post.images = episode.images;
      post.thumbnail_url = null;
      post.description = null;
    }
  }

  const comments = getCommentsForPost(id);

  return (
    <PostDetail
      post={post}
      comments={comments}
      backHref="/webtoon"
      backLabel="Back to Webtoon"
    />
  );
}