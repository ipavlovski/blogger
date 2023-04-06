import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'
import { useParams } from 'react-router-dom'
import { useLocalStorage } from '@mantine/hooks'

import type { AppRouter } from 'frontend/../trpc'
import { SERVER_URL } from 'frontend/apis/utils'
import { useFilterStore, useMarkdownStore } from 'frontend/apis/stores'


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

export const useTrpcContext = () => trpc.useContext()

////////////// MUTATIONS

export const useCreateEntry = () => trpc.createEntry.useMutation()
export const useUpdateEntry = () => trpc.updateEntry.useMutation()
export const useCaptureMedia = () => trpc.captureMedia.useMutation()
export const useCreateBlogpost = () => trpc.createBlogpost.useMutation()
export const useUpdateBlogpost = () => trpc.updateBlogpost.useMutation()

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

export const useCategories = () => {
  const createCategory = trpc.createCategory.useMutation()
  const { data: categories = [] } = trpc.getCategories.useQuery()

  return [categories, createCategory] as const
}

export const useTags = () => {
  const createTag = trpc.createTag.useMutation()
  const { data: tags = [] } = trpc.getTags.useQuery()

  return [tags, createTag] as const
}

type EditorValue = {entryId: number | null, markdown: string}

export const useEditorValue = () => {
  const blogpost = useActiveBlogpost()
  const blogpostId = blogpost ? blogpost.id : 0

  const [{ entryId, markdown }, setEntry, clearEntry] = useLocalStorage<EditorValue>({
    key: `cached-${blogpostId}`,
    defaultValue: { entryId: null, markdown: '' },
    serialize: ({ entryId, markdown }) => JSON.stringify({ entryId, markdown }),
    deserialize: (localStorageValue) => JSON.parse(localStorageValue)
  })

  return { entryId, markdown, setEntry, clearEntry, blogpostId }
}

/**
 * Generic 'save' action that can be called from anywhere.
 * Utilizes non-reactive stored blogpostId, entryId, markdown values.
 * Validity of data depends on blogpostId -> if it is null, then not supposed to be calling this.
 * Handles the following scenarios:
 * - entryId is null, markdown is NOT empty: create a new entry
 * - entryId is NOT null, markdown is NOT empty: update an existing entry
 * - entryId is NOT null, markdown is empty: delete the existing entry
 * - entryId is null, markdown is empty: dont do anything
 */
export const useSaveEditorState = () => {
  const createEntry = trpc.createEntry.useMutation()
  const updatEntry = trpc.updateEntry.useMutation()
  const deleteEntry = trpc.deleteEntry.useMutation()

  return async () => {
    const { blogpostId, entryId, markdown } = useMarkdownStore.getState()
    console.log(`useSaveEdit: blogpostId:${blogpostId} entryId:${entryId} md:${markdown}`)

    // when blogpostId == null, there is nothing to save
    if (blogpostId == null) {
      return
    }

    // save data to server
    const trimmedContents = markdown.trim()
    if (trimmedContents != '') {
      console.log(`entryId:${entryId}: ${entryId ? 'updating' : 'creating'}`)
      entryId ?
        await updatEntry.mutateAsync({ entryId, markdown }) :
        await createEntry.mutateAsync({ blogpostId, markdown })
      return
    }

    // if the content is empty, simply delete the entry
    if (trimmedContents == '') {
      entryId && console.log(`Deleting entry: ${entryId}`) 
      entryId && await deleteEntry.mutateAsync({ entryId })
      return
    }
  }
}
