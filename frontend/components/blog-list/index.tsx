import { Container, Flex } from '@mantine/core'
import { BlogpostList, NewPostButton } from './blogposts'
import Omnibar from './omnibar'
import { useEffect } from 'react'
import { useMarkdownStore } from 'frontend/apis/stores'
import { useSaveEditorState } from 'frontend/apis/queries'

export default function Blogposts() {
  const saveEditorState = useSaveEditorState()
  const { clearState } = useMarkdownStore((state) => state.actions)

  useEffect(() => {
    saveEditorState().then(() => clearState())
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
