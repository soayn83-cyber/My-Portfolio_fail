import { WorkProcessList } from "@/components/work-process-list"
import { PageHeader } from "@/components/page-header"
import { getPosts } from "@/lib/site-data"

export default async function WorkProcessPage() {
  const posts = getPosts("work_process")

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-6xl px-4">
        <PageHeader
          title="Work Process"
          description="Behind the scenes of my creative journey"
        />
        <WorkProcessList 
          posts={posts} 
          emptyMessage="No work process posts yet. Check back soon!"
        />
      </div>
    </div>
  )
}
