import { ActionIcon, createStyles, Flex, MultiSelect, Text } from '@mantine/core'
import { IconFilter, IconPlaylistAdd } from '@tabler/icons-react'
import { useFetchAllPosts } from 'frontend/api'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Posts } from 'backend/handlers'


function PostList() {
  const { data: blogposts } = useFetchAllPosts()
  if (! blogposts) return <h3>No blogposts found.</h3>

  return <>{blogposts.map((post) => <PostItem post={post} key={post.id}/>)}</>
}

function PostItem({ post }: {post: Posts[0]}) {
  const createdAt = post.createdAt as unknown as string

  return <Flex gap={18} mb={5}>
    <Text color='#726f6f' size={15}>{createdAt.substring(0, 10)}</Text>
    <Link to={`posts/${post.id}`} style={{ textDecoration: 'none' }}>
      <Text td='underline' size={15}>{post.title}</Text>
    </Link>
  </Flex>
}


function QueryInput() {
  const [data, setData] = useState<string[]>([])

  return <MultiSelect
    style={{ flexGrow: 1 }}
    data={data}
    placeholder=""
    searchable
    radius={'lg'}
    rightSection={<></>}
    icon={<IconFilter size={24} stroke={2} />}
    label="(query blogposts)"
    mb={24}
    styles={() => ({ input: { padding: 2 }, label: { color: '#2BBC8A', fontSize: 14 } })}

  />
}


export default function Posts() {
  return (<>
    <Flex align={'center'} gap={20} mb={24} >
      <ActionIcon size={42} radius="xl" variant="filled" color='cactus.1'>
        <IconPlaylistAdd size={30} stroke={1.5}/>
      </ActionIcon>
      <QueryInput />
    </Flex>

    <PostList />
  </>)
}
