import { MultiSelectType } from '@/app/_lib/notion/type'
import {
  isMultiSelect,
  isPageObjectResponse,
  isRichText,
  isTitle,
} from '@/app/_lib/notion/type-guard'
import { Client } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { cache } from 'react'

const notionClient = new Client({
  auth: process.env.NOTION_SECRET_TOKEN,
})

export const getAllPosts = cache(async () => {
  const res = await notionClient.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
  })
  const allPosts = res.results

  return allPosts
    .map((post) => {
      const pageObject = isPageObjectResponse(post) ? post : undefined
      if (!pageObject) {
        return {}
      }
      return getPageMetaData(pageObject)
    })
    .filter((post) => Object.keys(post).length !== 0)
})

const getPageMetaData = (post: PageObjectResponse) => {
  const { created_time, id, properties } = post
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
    date: created_time,
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
