import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { Posts, Post, TagOp } from 'backend/handlers'
import { SERVER_URL } from 'components/app'
import { redirect, useParams } from 'react-router-dom'
import { create } from 'zustand'


/**
 * Zustand: filter-store
 */

interface FilterStore {
  tags: string[]
  actions: {
    addTag: (tag: string) => void
    removeTag: (tag: string) => void
    setTags: (tags: string[]) => void
  }
}

export const useFilterStore = create<FilterStore>((set) => ({
  tags: [],
  actions: {
    setTags: (tags) => set(() => ({ tags })),
    addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
    removeTag: (tag) => set((state) => ({ tags: state.tags.filter((t) => t != tag) })),
  },
}))


interface ContentStore {
  editingIds: number[],
  actions: {
    startEdit: (contentId: number) => void
    stopEdit: (contentId: number) => void
  }
}

export const useContentStore = create<ContentStore>((set) => ({
  editingIds: [],
  actions: {
    startEdit: (id) => set((state) => ({ editingIds: [...state.editingIds, id] })),
    stopEdit: (id) => set((state) => ({ editingIds: state.editingIds.filter((t) => t != id) })),
  }
}))


/**
 * GET /posts
 */


const fetchGetAllPosts = async (): Promise<Posts> => {
  return await fetch(`${SERVER_URL}/posts`).then((res) => res.json())
}

// console.log(`?x=${encodeURIComponent('[asdf,sdfasdf,3434:34]')}`)
const fetchFilteredPosts = async (tags: string[]): Promise<Posts> => {
  if (tags.length == 0) return await fetchGetAllPosts()

  const encodedTags = encodeURIComponent(tags.toString())
  return await fetch(`${SERVER_URL}/posts?tags=${encodedTags}`).then((res) => res.json())
}

export const useFetchAllPosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => fetchGetAllPosts()
  })
}

export const useFetchFilteredPosts = () => {
  const tags = useFilterStore((state) => state.tags)
  return useQuery({
    queryKey: ['posts', tags],
    queryFn: () => fetchFilteredPosts(tags),
  })
}


/**
 * GET /post/:id
 */

const fetchGetPost = async (postId: number): Promise<Post> => {
  return fetch(`${SERVER_URL}/post/${postId}`).then((res) => res.json())
}

export const useFetchCurrentPost = () => {
  const { postId: paramsPostId } = useParams()
  const postId = parseInt(paramsPostId!)

  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => fetchGetPost(postId)
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

/**
 * Add new content
 * /post/:id/content
 */


const fetchPostNewContent = async (postId: number) => {
  return fetch(`${SERVER_URL}/post/${postId}/content`, { method: 'POST' })
}

export const useCreateNewContent = () => {
  const queryClient = useQueryClient()

  const { postId: paramsPostId } = useParams()
  const postId = parseInt(paramsPostId!)


  return useMutation({
    mutationFn: () => fetchPostNewContent(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId])
    },
  })
}

/**
 * Update contents
 * PUT /content/:id/markdown
 */

const fetchUpdateContent = async ({ contentId, index, markdown }:
{contentId: number, index?: number, markdown?: string}) => {
  return fetch(`${SERVER_URL}/content/${contentId}/markdown`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, markdown }),
  })
}

export const useUpdateContentText = (contentId: number) => {
  const queryClient = useQueryClient()

  const { postId: paramsPostId } = useParams()
  const postId = parseInt(paramsPostId!)

  return useMutation({
    mutationFn: ({ index, markdown }: {index?: number, markdown?: string}) =>
      fetchUpdateContent({ contentId, index, markdown }),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId])
    },
  })
}


/**
 * Upload images
 * PUT /content/:id/image
 */

const fetchUploadImage = async (contentId: number, formData: FormData) => {
  return fetch(`${SERVER_URL}/content/${contentId}/image`, {
    method: 'PUT',
    body: formData,
  }).then((v) => v.json())
}

export const useUploadImage = (contentId: number) => {
  // const queryClient = useQueryClient()

  const { postId: paramsPostId } = useParams()
  // const postId = parseInt(paramsPostId!)

  return useMutation({
    mutationFn: (formData: FormData) => fetchUploadImage(contentId, formData),
    // onSuccess: () => {
    //   queryClient.invalidateQueries(['post', postId])
    // },
  })
}

/**
 * Upload files
 */

 const fetchUploadFiles = async (postId: number, formData: FormData) => {
  return fetch(`${SERVER_URL}/upload/${postId}/files`, {
    method: 'POST',
    body: formData,
  }).then((v) => v.json())
}

export const useUploadFiles = () => {
  const queryClient = useQueryClient()

  const { postId: paramsPostId } = useParams()
  const postId = parseInt(paramsPostId!)

  return useMutation({
    mutationFn: (formData: FormData) => fetchUploadFiles(postId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId])
    },
  })
}