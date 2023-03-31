import { Flex } from '@mantine/core'

import { BlogpostWithEntries } from 'frontend/apis/queries'
import BlogpostTitle from './title'
import PostDate from './dates'
import TagList from './tags'
import Toggles from './toggles'

export default function Metadata({ blogpost }: {blogpost: BlogpostWithEntries}) {
  const { title, id, createdAt, updatedAt, tags } = blogpost
  return (
    <>
      <BlogpostTitle title={title} blogpostId={id}/>

      <Flex gap={24} mb={48}>
        <PostDate createdAt={createdAt} updatedAt={updatedAt}/>
        <TagList tags={tags} blogpostId={id}/>
        <Toggles />
      </Flex>
    </>
  )
}