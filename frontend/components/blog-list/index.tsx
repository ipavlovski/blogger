import { Container, Flex } from '@mantine/core'
import { BlogpostList, NewPostButton } from './blogposts'
import Omnibar from './omnibar'
import { useEffect } from 'react'
import { useMarkdownStore } from 'frontend/apis/stores'
import { useSaveEditorState } from 'frontend/apis/queries'

export default function Blogposts() {
  const blogpostId = useMarkdownStore((store) => store.blogpostId)

  const saveEditorState = useSaveEditorState()
  const setEditorState = useMarkdownStore((state) => state.setState)

  useEffect(() => {
    if (blogpostId == null) return
    saveEditorState().then(() => setEditorState(null, null, ''))
  }, [])

  return (
    <Container pt={16} size={'sm'}>
      <Flex align={'center'} gap={20} mb={24} >
        <NewPostButton />
        <Omnibar />
      </Flex>
      <BlogpostList />
    </Container>
  )
}
