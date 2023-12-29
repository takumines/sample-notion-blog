import { MultiSelectType } from '@/app/_lib/notion/type'
import {
  PageObjectResponse,
  QueryDatabaseResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints'

/**
 * NotionAPIのレスポンスがPageObjectResponseかどうかを判定する
 *
 * @param {QueryDatabaseResponse["results"][number]} post
 * @returns {post is PageObjectResponse}
 */
export const isPageObjectResponse = (
  post: QueryDatabaseResponse['results'][number],
): post is PageObjectResponse => {
  return post.object === 'page'
}

/**
 * PropertyがRichTextかどうかを判定する
 *
 * @param property
 * @returns {property is {rich_text: Array<RichTextItemResponse>}}
 */
export const isRichText = (
  property: any,
): property is { rich_text: Array<RichTextItemResponse> } => {
  return property && property.type === 'rich_text'
}

/**
 * PropertyがTitleかどうかを判定する
 *
 * @param property
 * @returns {property is {title: Array<RichTextItemResponse>}}
 */
export const isTitle = (
  property: any,
): property is { title: Array<RichTextItemResponse> } => {
  return property && property.type === 'title'
}

/**
 * PropertyがMultiSelectかどうかを判定する
 *
 * @param property
 * @returns {property is {multi_select: MultiSelectType}}
 */
export const isMultiSelect = (
  property: any,
): property is { multi_select: MultiSelectType } => {
  return property && property.type === 'multi_select'
}
