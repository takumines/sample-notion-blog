import { MultiSelectType, Post, PostDetail } from '@/app/_lib/notion/type'
import {
  isMultiSelect,
  isPageObjectResponse,
  isRichText,
  isTitle,
} from '@/app/_lib/notion/type-guard'
import { formatISODateTimeToDate } from '@/app/_utils'
import { Client } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { NotionToMarkdown } from 'notion-to-md'
import { cache } from 'react'
import markdownToHtml from 'zenn-markdown-html'

const notionClient = new Client({
  auth: process.env.NOTION_SECRET_TOKEN,
})

const n2m = new NotionToMarkdown({ notionClient })

/**
 * 記事一覧を取得
 *
 * @param {number} pageSize
 * @returns {Promise<Post[]>}
 */
export const getAllPostList = cache(
  async (pageSize: number = 100): Promise<Post[]> => {
    const res = await notionClient.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      page_size: pageSize,
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
  },
)

/**
 * トップページで表示する記事一覧を取得
 *
 * @returns {Promise<Post[]>}
 */
export const getPostListForTopPage = cache(async () => {
  const allPost = await getAllPostList(4)

  return allPost
})

/**
 * 記事を取得
 *
 * @param {string} slug
 * @returns {Promise<PostDetail | undefined>}
 */
export const getPostBySlug = cache(
  async (slug: string): Promise<PostDetail | undefined> => {
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
      return undefined
    }

    const post = getPageMetaData(PageObject)
    const blocks = await n2m.pageToMarkdown(PageObject.id)
    const blockString = n2m.toMarkdownString(blocks).parent
    const html = markdownToHtml(blockString)

    return {
      content: html,
      ...post,
    }
  },
)

/**
 * 記事のメタデータを取得
 *
 * @param {PageObjectResponse} post
 * @returns {Post}
 */
const getPageMetaData = (post: PageObjectResponse): Post => {
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
