import { MultiSelectType, Post } from '@/app/_lib/notion/type'
import {
  isMultiSelect,
  isPageObjectResponse,
  isRichText,
  isTitle,
} from '@/app/_lib/notion/type-guard'
import { formatISODateTimeToDate } from '@/app/_utils'
import { Client } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { cache } from 'react'

const notionClient = new Client({
  auth: process.env.NOTION_SECRET_TOKEN,
})

/**
 *  全ての記事を取得
 *
 * @type {() => Promise<Post[]>}
 */
export const getAllPostList: () => Promise<Post[]> = cache(async () => {
  const res = await notionClient.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
  })
  const allPosts = res.results

  if (!allPosts) {
    return []
  }

  return allPosts
    .map((post) => {
      const pageObject = isPageObjectResponse(post) ? post : undefined
      if (!pageObject) {
        return pageObject
      }
      return getPageMetaData(pageObject)
    })
    .filter((post): post is Post => !!post)
})

/**
 *
 * @type {(slug: string) => Promise<Post>}
 */
export const getPostBySlug: (slug: string) => Promise<Post> = cache(
  async (slug: string) => {
    const response = await notionClient.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        formula: {
          string: {
            equals: slug,
          },
        },
        property: 'Slug',
      },
    })

    const PageObject = isPageObjectResponse(response.results[0])
      ? response.results[0]
      : undefined
    if (!PageObject) {
      // TODO: エラー処理は後で整える
      throw new Error(`Cannot find post with slug: ${slug}`)
    }

    const post = getPageMetaData(PageObject)

    return post
  },
)

/**
 * 記事のメタデータを取得
 *
 * @param {PageObjectResponse} post
 * @returns {{date: string, description: string, id: string, title: string, slug: string, tags: string[]}}
 */
const getPageMetaData = (
  post: PageObjectResponse,
): {
  date: string
  description: string
  id: string
  slug: string
  tags: string[]
  title: string
} => {
  const { created_time, id, properties } = post

  const date = formatISODateTimeToDate(created_time)
  const description = isRichText(properties.Description)
    ? properties.Description.rich_text[0].plain_text
    : ''
  const slug = isRichText(properties.Slug)
    ? properties.Slug.rich_text[0].plain_text
    : ''
  const title = isTitle(properties.Name)
    ? properties.Name.title[0].plain_text
    : ''
  const tags = isMultiSelect(properties.Tags)
    ? getTags(properties.Tags.multi_select)
    : []

  return {
    date,
    description,
    id,
    slug,
    tags,
    title,
  }
}

/**
 * タグの取得
 *
 * @param {MultiSelectType} tags
 * @returns {string[]}
 */
const getTags = (tags: MultiSelectType): string[] => {
  return tags.map((tag) => tag.name)
}
