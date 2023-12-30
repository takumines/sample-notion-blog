import { PostListCard } from '@/app/_components/post'
import { getAllPosts } from '@/app/_lib/notion/client'
import Head from 'next/head'

export const revalidate = 3600

export default async function Home() {
  const allPosts = await getAllPosts()

  return (
    <div className="container mx-auto h-full w-full font-mono">
      <Head>
        <title>Notion Blog</title>
      </Head>
      <main className="container mt-16 w-full">
        <h1 className="mb-16 text-center text-5xl font-medium">
          Notion Blog🚀
        </h1>
        {allPosts.map((post) => (
          <PostListCard key={post.id} post={post} />
        ))}
      </main>
    </div>
  )
}
