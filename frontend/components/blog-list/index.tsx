import { Container, Flex } from '@mantine/core'
import { BlogpostList, NewPostButton } from './blogposts'
import Omnibar from './omnibar'

export default function Blogposts() {
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
