import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

type ExtractMultiSelectType<T> = T extends {
  multi_select: infer U
  type: 'multi_select'
}
  ? U
  : never

/**
 * PageObjectResponseのプロパティの型からMultiSelectの型を抽出する
 */
export type MultiSelectType = ExtractMultiSelectType<
  PageObjectResponse['properties'][keyof PageObjectResponse['properties']]
>

export type Post = {
  date: string
  description: string
  id: string
  slug: string
  tags: string[]
  title: string
}

export type PostDetail = Post & {
  content: string
}
