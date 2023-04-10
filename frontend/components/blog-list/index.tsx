import { Flex } from '@mantine/core'
import { useSaveEditorState } from 'frontend/apis/queries'
import { useMarkdownStore } from 'frontend/apis/stores'
import { useEffect } from 'react'
import BlogpostList from './blogposts'
import NewPostButton from './new-blogpost'
import Omnibar from './omnibar'

export default function Blogposts() {
  const saveEditorState = useSaveEditorState()
  const { clearState } = useMarkdownStore((state) => state.actions)

  useEffect(() => {
    saveEditorState().then(() => clearState())
  }, [])

  return (
    < >
      <Flex align={'center'} gap={20} pb={30} ml={72} pt={36}>
        <NewPostButton />
        <Omnibar />
      </Flex>
      <BlogpostList />
    </>
  )
}
