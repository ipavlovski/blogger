import { ActionIcon } from '@mantine/core'
import { IconPlaylistAdd } from '@tabler/icons-react'
import { useCreateBlogpost } from 'frontend/apis/queries'
import { useNavigate } from 'react-router-dom'


export default function NewPostButton() {
  const createBlogpost = useCreateBlogpost()
  const navigate = useNavigate()

  const createNewPost = async () => {
    const { id: postId } = await createBlogpost.mutateAsync()
    navigate(`/posts/${postId}`)
  }

  return (
    <ActionIcon onClick={createNewPost} size={34} radius="xl" variant="filled" color='cactus.1'>
      <IconPlaylistAdd stroke={1.5}/>
    </ActionIcon>
  )
}