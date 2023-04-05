import { ActionIcon, Flex, Text } from '@mantine/core'
import { IconPlaylistAdd } from '@tabler/icons-react'
import { useCreateBlogpost, useFilteredBlogposts } from 'frontend/apis/queries'
import { Link, useNavigate } from 'react-router-dom'

export function NewPostButton() {
  const createBlogpost = useCreateBlogpost()
  const navigate = useNavigate()

  const createNewPost = async () => {
    const { id: postId } = await createBlogpost.mutateAsync()
    navigate(`/posts/${postId}`)
  }

  return (
    <ActionIcon onClick={createNewPost} size={42} radius="xl" variant="filled" color='cactus.1'>
      <IconPlaylistAdd size={30} stroke={1.5}/>
    </ActionIcon>
  )
}

export function BlogpostList() {
  const blogposts = useFilteredBlogposts()

  return(
    <>
      {blogposts.map((blogpost) => (
        <Flex key={blogpost.id} gap={18} mb={5}>
          <Text color='#726f6f' size={15}>
            {blogpost.createdAt.toISOString().substring(0, 10)}
          </Text>

          <Link to={`posts/${blogpost.id}`} style={{ textDecoration: 'none' }}>
            <Text td='underline' size={15}>{blogpost.title}</Text>
          </Link>
        </Flex>
      ))}
    </>
  )
}
