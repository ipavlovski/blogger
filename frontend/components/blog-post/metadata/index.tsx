import { Flex, Stack } from '@mantine/core'

import { BlogpostWithEntries } from 'frontend/apis/queries'
import BlogpostTitle from './title'
import PostDate from './dates'
import TagList from './tags'
import CategoryList from 'components/blog-post/metadata/category'

export default function Metadata({ blogpost }: {blogpost: BlogpostWithEntries}) {
  const { title, id, createdAt, updatedAt, tags, category } = blogpost

  return (
    <Stack ml={72} mt={20} spacing={0}>
      <BlogpostTitle title={title} blogpostId={id}/>

      <Flex gap={24} align={'center'}>
        <CategoryList category={category} blogpostId={id}/>
        <TagList tags={tags} blogpostId={id}/>
        <PostDate createdAt={createdAt} updatedAt={updatedAt}/>
      </Flex>
    </Stack>
  )
}