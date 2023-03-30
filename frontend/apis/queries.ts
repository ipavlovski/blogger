import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'

import type { AppRouter } from 'frontend/../trpc'
import { SERVER_URL } from 'frontend/apis/utils'
import { useFilterStore } from 'frontend/apis/stores'
import { useParams } from 'react-router-dom'


////////////// TRPC / RQ

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${SERVER_URL}/trpc`,
    }),
  ],
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})


////////////// MUTATIONS

export const useCreateEntry = () => trpc.createEntry.useMutation()
export const useUpdateEntry = () => trpc.updateEntry.useMutation()
export const useCaptureMedia = () => trpc.captureMedia.useMutation()
export const useCreateBlogpost = () => trpc.createBlogpost.useMutation()
export const useUpdateBlogpost = () => trpc.updateBlogpost.useMutation()
export const useCreateTag = () => trpc.createTag.useMutation()

////////////// QUERIES

export const useActiveBlogpost = () => {
  const { postId } = useParams()
  const blogpostId = postId ? parseInt(postId) : undefined

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { data: blogpost } = trpc.getActiveBlogpost.useQuery(blogpostId!, { enabled: !!blogpostId })
  return blogpost
}
export type BlogpostWithEntries = NonNullable<ReturnType<typeof useActiveBlogpost>>

export const useFilteredBlogposts = () => {
  const title = useFilterStore((store) => store.title)
  const tags = useFilterStore((store) => store.tags)
  const category = useFilterStore((store) => store.category)

  const { data: blogposts = [] } = trpc.getFilteredBlogposts.useQuery({ title, tags, category })
  return blogposts
}

export const useGetTags = () => {
  const { data: tags = [] } = trpc.getTags.useQuery()
  return tags
}

////////////// CACHE

export const useBlogpostContext = () => trpc.useContext().getActiveBlogpost
export const useTagsContext = () => trpc.useContext().getTags