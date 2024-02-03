import { getPostBySlug } from '@/app/_lib/notion'
import { notFound } from 'next/navigation'

export const revalidate = 60

const Post = async ({ params }: { params: { slug: string } }) => {
  const post = await getPostBySlug(params.slug)

  //  slugに紐づく記事が存在しない場合は、404ページを表示
  if (!post) {
    notFound()
  }

  const { content, date, description, tags, title } = post

  return (
    <section className="container mx-auto mt-20 h-screen px-5 lg:w-2/5 lg:px-2">
      <h2 className="w-full text-2xl font-medium">{title}</h2>
      <div className="mt-1 w-1/3 border-b-2 border-sky-200"></div>
      <span className="text-gray-500">{date}</span>
      <br />
      {tags.map((tag) => (
        <p
          className="mr-2 mt-2 inline-block rounded-xl bg-sky-900 px-2 font-medium text-white"
          key={tag}
        >
          {tag}
        </p>
      ))}
      <div
        className="znc"
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    </section>
  )
}

// export const generateStaticParams = async () => {
//   const postList = await getAllPostList()
//
//   return postList.map((post) => ({
//     slug: post.slug,
//   }))
// }

export default Post
