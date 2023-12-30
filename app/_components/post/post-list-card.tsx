import { Post } from '@/app/_lib/notion'
import Link from 'next/link'

type Props = {
  post: Post
}
export const PostListCard = ({ post }: Props) => {
  const { date, description, id, slug, tags, title } = post
  return (
    <section className="mb mx-auto mb-8 rounded-md bg-sky-800 p-5 shadow-2xl transition-all duration-300 hover:translate-y-1 hover:shadow-none lg:w-1/2">
      <div className="flex items-center gap-3">
        <h2 className="mb-2 text-2xl font-medium text-gray-100">
          <Link href={`/posts/${slug}`}>{title}</Link>
        </h2>
        <div className="text-gray-100">{date}</div>
      </div>
      <p className="mb-2 text-white">{description}</p>
      <div className="flex gap-1">
        {tags.map((tag) => (
          <span
            className="track rounded-xl bg-gray-500 px-2 py-1 font-medium text-gray-100"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  )
}
