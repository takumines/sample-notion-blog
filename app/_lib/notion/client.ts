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
 * @type {(slug: string) => Promise<PostDetail>}
 */
export const getPostBySlug: (slug: string) => Promise<PostDetail | undefined> =
  cache(async (slug: string) => {
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
  })

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
