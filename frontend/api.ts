import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Posts, Post } from 'backend/handlers'
import { SERVER_URL } from 'components/app'


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

const fetchGetPost = async (postId: string): Promise<Post> => {
  return fetch(`${SERVER_URL}/post/${postId}`).then((res) => res.json())
}

export const useFetchPost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => fetchGetPost(postId)
  })
}
