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

export const getAllPosts = cache(async (): Promise<Post[]> => {
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

const getPageMetaData = (post: PageObjectResponse) => {
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

const getTags = (tags: MultiSelectType) => {
  return tags.map((tag) => tag.name)
}
