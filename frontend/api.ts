import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { Posts, Post, TagOp } from 'backend/handlers'
import { SERVER_URL } from 'components/app'
import { redirect, useParams } from 'react-router-dom'


/**
 * GET /posts
 */

const fetchGetAllPosts = async (): Promise<Posts> => {
  return await fetch(`${SERVER_URL}/posts`).then((res) => res.json())
}

export const useFetchAllPosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => fetchGetAllPosts()
  })
}


/**
 * GET /post/:id
 */

const fetchGetPost = async (postId: number): Promise<Post> => {
  return fetch(`${SERVER_URL}/post/${postId}`).then((res) => res.json())
}

export const useFetchCurrentPost = () => {
  const { postId } = useParams()
  const id = parseInt(postId!)

  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => fetchGetPost(id)
  })
}


/**
 * POST /post
 * create new post
 */

const fetchPostNewPost = async (): Promise<{ postId: number}> => {
  return fetch(`${SERVER_URL}/post`, { method: 'POST' }).then((res) => res.json())
}

export const useCreateNewPostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => fetchPostNewPost(),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
    },
  })
}

export const newPostAction = (queryClient: QueryClient) => {
  // console.log('clicked?!')
  return async ({ request, params }: {request: any, params: any}) => {
    const postId = await fetchPostNewPost()
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    return redirect(`/posts/${postId}`)
  }
}

/**
 * PUT /post
 * update post deails (title/tags)
 */

const fetchUpdatePost = async ({ postId, title, tags }:
{postId: number, title?: string, tags?: TagOp}) => {

  return fetch(`${SERVER_URL}/post/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, tags }),
  })
}

export const useUpdatePostMutation = (postId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ([{ title, tags }]: Parameters<typeof fetchUpdatePost>) =>
      fetchUpdatePost({ postId, title, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
      queryClient.invalidateQueries(['post', postId])
    },
  })
}

/**
 * Query tags
 */


const fetchGetAllTags = async (): Promise<{ name: string }[]> => {
  return await fetch(`${SERVER_URL}/tags`).then((res) => res.json())
}

export const useTagsQuery = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => fetchGetAllTags()
  })
}


/**
 * Add/Remove tags
 */

const fetchCreateTag = async (name: string) => {
  return fetch(`${SERVER_URL}/tag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export const useCreateTagMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => fetchCreateTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags'])
    },
  })
}