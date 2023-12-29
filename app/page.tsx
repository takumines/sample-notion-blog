import { getAllPosts } from '@/app/_lib/notion/client'
import Head from 'next/head'

export const revalidate = 3600

export default async function Home() {
  const allPosts = await getAllPosts()
  console.log(allPosts)
  return (
    <div>
      <Head>
        <title> All Posts</title>
      </Head>
      <p> All Posts</p>
    </div>
  )
}
