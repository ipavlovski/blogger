import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'

import * as h from 'backend/handlers'

const routes = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage, preservePath: true })

/**
 * Get a list of all the blogposts
 */

const PostsQueryParams = z.object({
  tags: z.string().transform((v) => v && decodeURIComponent(v).split(','))
    .pipe(z.string().array()).optional()
})


routes.get('/posts', async (req, res) => {
  try {
    const queryParams = PostsQueryParams.parse(req.query)
    const posts = queryParams.tags && queryParams.tags.length > 0 ?
      await h.getFilteredPosts(queryParams.tags) :
      await h.getAllPosts()

    return res.json(posts)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})


/**
 * Batch update of tags on multiple posts.
 * Tags must already exist, or handler will throw an error.
 * Can send add/remove ops simultaneously.
 */
const PostsPutBody = z.object({
  posts: z.number().array(),
  tags: z.object({ add: z.string().array(), remove: z.string().array() })
})

routes.put('/posts', async (req, res) => {
  try {
    const batchUpdateDef = PostsPutBody.parse(req.body)
    await h.updateTagsOnMultiplePosts(batchUpdateDef)

    return res.sendStatus(200)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Create a new post
 */
routes.post('/post', async (req, res) => {
  try {
    const postId = await h.createNewPost()

    return res.json({ postId })
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Send the full data for the post
 */
routes.get('/post/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id)
    const post = await h.getPost(postId)

    return res.json(post)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Update post's metadata: title/tags
 */

const PostsMetadataBody = z.object({
  title: z.string().min(3).max(80).optional(),
  tags: z.object({ add: z.string().array(), remove: z.string().array() }).optional()
})

routes.put('/post/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id)
    const metadata = PostsMetadataBody.parse(req.body)
    await h.updatePostMetadata(postId, metadata)

    return res.sendStatus(200)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Delete a post (and all associated content entries)
 * Also delete all the files.
 */
routes.delete('/post/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id)
    await h.deletePost(postId)

    return res.sendStatus(200)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Create new content entry (may include index)
 * If index is provided, will need to re-index the other content entries
 */
const NewContentBody = z.object({
  index: z.number().optional()
})

routes.post('/post/:id/content', async (req, res) => {
  try {
    const postId = parseInt(req.params.id)
    const index = NewContentBody.parse(req.body)
    const { id } = await h.createContentEntry(postId, index)

    return res.json({ contentId: id })
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Update content entry or re-index
 * Either provide markdown for updating
 * OR provide index for re-indexing
 */
const UpdateContentBody = z.object({
  index: z.number().optional(),
  markdown: z.string().optional()
})

routes.put('/content/:id', async (req, res) => {
  try {
    const contentId = parseInt(req.params.id)
    const { index, markdown } = UpdateContentBody.parse(req.body)
    if (index == null && markdown == null) throw new Error('No arguments provided')
    if (index != null) await h.updateContentIndex(contentId, index)
    if (markdown != null) await h.updateContentMarkdown(contentId, markdown)

    return res.sendStatus(200)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})


/**
 * Delete a content entry
 */
routes.delete('/content/:id', async (req, res) => {
  try {
    const contentId = parseInt(req.params.id)
    await h.deleteContentEntry(contentId)

    return res.sendStatus(200)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Get a list of all the tags
 * Useful for documentation/autocomplete
 */
routes.get('/tags', async (req, res) => {
  try {
    const tags = await h.getAllTags()
    return res.json(tags)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Create a new tag
 */
const NewTagBody = z.object({
  name: z.string().min(2)
})

routes.post('/tag', async (req, res) => {
  try {
    const { name } = NewTagBody.parse(req.body)
    await h.createNewTag(name)
    return res.sendStatus(200)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Update an existing tag name
 */

const UpdateTagBody = z.object({
  oldName: z.string(),
  newName: z.string().min(2)
})

routes.put('/tag', async (req, res) => {
  try {
    const body = UpdateTagBody.parse(req.body)
    await h.updateTagName(body)

    return res.sendStatus(200)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Delete a tag
 */

const DeleteTagBody = z.object({
  name: z.string(),
})

routes.delete('/tag', async (req, res) => {
  try {
    const { name } = DeleteTagBody.parse(req.body)
    await h.deleteTag(name)

    return res.sendStatus(200)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})

/**
 * Upload a new file: image, code, pdf
 * - image: get dimensions, verify format
 * - code: one or multiple files, ensure one file, need to check if 'runnnable'
 * - pdf: verify that it is a pdf file
 */

const FileUploadType = z.enum(['image', 'code', 'pdf'])

routes.post('/upload/:id/:type', upload.single('image'), async (req, res) => {
  try {
    const type = FileUploadType.parse(req.params.type)
    const postId = parseInt(req.params.id)

    if (type != 'image') throw new Error('Handlers not implemented.')
    if (req.file == null) throw new Error('Attached file is missing')

    const path = await h.uploadImage(postId, req.file)

    return res.json({ path })
  } catch (err) {
    console.error(err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'unknown error' })
  }
})


export default routes