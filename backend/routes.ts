import { inferAsyncReturnType, initTRPC } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { z } from 'zod'
import superjson from 'superjson'

import * as h from 'backend/handlers'

// created for each request, return empty context
export const createContext = ({ req, res, }: trpcExpress.CreateExpressContextOptions) => ({})
type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create({ transformer: superjson, })

export const appRouter = t.router({

  createEntry: t.procedure.input(
    z.object({ blogpostId: z.number(), markdown: z.string(), index: z.number().optional() })
  ).mutation(async ({ input: { blogpostId, markdown, index } }) => {
    return await h.createEntry(blogpostId, markdown, index)
  }),

  updateEntry: t.procedure.input(
    z.object({ entryId: z.number(), markdown: z.string() })
  ).mutation(async ({ input: { entryId, markdown } }) => {
    return await h.updateEntry(entryId, markdown)
  }),

  deleteEntry: t.procedure.input(
    z.object({ entryId: z.number() })
  ).mutation(async ({ input: { entryId } }) => {
    return await h.deleteEntry(entryId)
  }),


  createBlogpost: t.procedure.mutation(async () => {
    return await h.createBlogpost()
  }),

  updateBlogpost: t.procedure.input(
    z.object({
      blogpostId: z.number(),
      title: z.string().optional(),
      tags: z.string().array().optional(),
      category: z.string().optional()
    })
  ).mutation(async ({ input: { blogpostId, ...params } }) => {
    return await h.updateBlogpost(blogpostId, params)
  }),

  captureMedia: t.procedure.input(
    z.object({ blogpostId: z.number(), src: z.string() })
  ).mutation(async ({ input: { blogpostId, src } }) => {
    return await h.captureMedia(blogpostId, src)
  }),

  getActiveBlogpost: t.procedure.input(
    z.number()
  ).query(async ({ input: blogpostId }) => {
    return await h.getActiveBlogpost(blogpostId)
  }),

  getFilteredBlogposts: t.procedure.input(
    z.object({
      title: z.string().nullable(),
      category: z.string().nullable(),
      tags: z.string().array()
    })
  ).query(async ({ input }) => {
    return await h.getFilteredBlogposts(input)
  }),

  getTags: t.procedure.query(async () => {
    return await h.getTags()
  }),

  createTag: t.procedure.input(
    z.string()
  ).mutation(async ({ input: name }) => {
    return await h.createTag(name)
  }),

  getCategories: t.procedure.query(async () => {
    return await h.getCategories()
  }),

  createCategory: t.procedure.input(
    z.string()
  ).mutation(async ({ input: name }) => {
    return await h.createCategory(name)
  }),

})
