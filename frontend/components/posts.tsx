import { ActionIcon, Button, createStyles, Flex, MultiSelect, Text } from '@mantine/core'
import { IconFilter, IconPlaylistAdd } from '@tabler/icons-react'
import { useCreateNewPostMutation, useFetchAllPosts, useFetchFilteredPosts, useFilterStore, useTagsQuery } from 'frontend/api'
import { useState } from 'react'
import { Form, Link, useNavigate } from 'react-router-dom'
import type { Posts } from 'backend/handlers'
import { create } from 'zustand'


function PostList() {
  const { data: blogposts, status } = useFetchFilteredPosts()
  if (! blogposts) return <h3>No blogposts found.</h3>

  return(
    <>
      {blogposts.sort((p1, p2) => {
        const date1 = p1.createdAt as unknown as string
        const date2 = p2.createdAt as unknown as string
        return new Date(date2).valueOf() - new Date(date1).valueOf()
      }).map((post) => <PostItem post={post} key={post.id}/>)}
    </>
  )
}

function PostItem({ post }: {post: Posts[0]}) {
  const createdAt = post.createdAt as unknown as string

  return (
    <Flex gap={18} mb={5}>
      <Text color='#726f6f' size={15}>{createdAt.substring(0, 10)}</Text>
      <Link to={`posts/${post.id}`} style={{ textDecoration: 'none' }}>
        <Text td='underline' size={15}>{post.title}</Text>
      </Link>
    </Flex>
  )
}


function QueryInput() {
  const selectedTags = useFilterStore((store) => store.tags)
  const { setTags } = useFilterStore((store) => store.actions)
  const { data: allTags } = useTagsQuery()
  if (! allTags) return null


  return (
    <MultiSelect
      style={{ flexGrow: 1 }}
      data={allTags.map(({ name }) => ({ value: name, label: `#${name}` }))}
      searchable
      radius={'lg'}
      rightSection={<></>}
      icon={<IconFilter size={24} stroke={2} />}
      label="(query blogposts)"
      mb={24}
      styles={(theme) => ({
        input: { padding: 2 },
        label: { color: theme.colors.cactus[0], fontSize: 14 } })
      }
      value={selectedTags}
      onChange={setTags}

    />
  )
}


function NewPostButton() {
  const newPostMutation = useCreateNewPostMutation()
  const navigate = useNavigate()

  const createNewPost = async () => {
    const { postId } = await newPostMutation.mutateAsync()
    navigate(`/posts/${postId}`)
  }

  return (
    <ActionIcon onClick={createNewPost} size={42} radius="xl" variant="filled" color='cactus.1'>
      <IconPlaylistAdd size={30} stroke={1.5}/>
    </ActionIcon>
  )
}


export default function Posts() {
  return (
    <>
      <Flex align={'center'} gap={20} mb={24} >
        <NewPostButton />
        <QueryInput />
      </Flex>

      <PostList />
    </>
  )
}
