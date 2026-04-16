
import { getBlogPost } from "@/components/data/blog/blogdata"
import Banner from "@/components/layout/banner"
import BlogDetail from "@/components/ui/blogs/blogDetailSection"
import { notFound } from "next/navigation"

export default async function BlogDetailPage({ params }) {
  const post = getBlogPost(await (params.id))

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner name="Blog Details" />
      <BlogDetail post={post} />
    </div>
  )
}

export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ]
}
