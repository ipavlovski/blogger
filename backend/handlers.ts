import { PrismaClient } from '@prisma/client'
import { randomUUID as uuidv4 } from 'node:crypto'
import { writeFile, mkdir } from 'node:fs/promises'
import { STORAGE_DIRECTORY } from 'backend/config'
import sharp from 'sharp'

export type TagOp = { add: string[], remove: string[]}

const prisma = new PrismaClient()

const updatePostTags = async (postId: number, tags: TagOp) => {
  tags.add.length > 0 && await prisma.post.update({
    where: { id: postId }, data: { tags: { connect: tags.add.map((tag) => ({ name: tag })) } }
  })
  tags.remove.length > 0 && await prisma.post.update({
    where: { id: postId }, data: { tags: { disconnect: tags.remove.map((tag) => ({ name: tag })) } }
  })
}

const reindexContents = async (postId: number, newIndex: number) => {
  // get all the current contents of the post, need only id + index for the function
  const postContents = await prisma.content.findMany({
    where: { postId }, select: { id: true, index: true }
  })

  // filter and sort in reverse, since inds in DB have to be unique
  const sortedContents = postContents.filter(({ index: ind }) => ind >= newIndex)
    .sort((a, b) => b.index - a.index)

  // run the query
  for (const content of sortedContents) await prisma.content.update({
    where: { id: content.id }, data: { index: content.index + 1 }
  })
}

export type Posts = Awaited<ReturnType<typeof getAllPosts>>
export async function getAllPosts() {
  return await prisma.post.findMany({
    include: { tags: true }
  })
}

export async function getFilteredPosts(tags: string[]) {
  return await prisma.post.findMany({
    where: { tags: { some: { name: { in: tags } } } },
    include: { tags: true }
  })
}

export async function updateTagsOnMultiplePosts({ posts, tags }: { posts: number[], tags: TagOp }) {
  for (const postId of posts) await updatePostTags(postId, tags)
}

export async function createNewPost() {

  const { id } = await prisma.post.create({
    data: {
      title: 'Untitled',
      url: 'untitled'
    }
  })

  return id
}

export type Post = Awaited<ReturnType<typeof getPost>>
export async function getPost(postId: number) {
  return await prisma.post.findFirstOrThrow({
    where: { id: postId },
    include: { contents: true, tags: true }
  })
}

export async function updatePostMetadata(postId: number, data: { title?: string, tags?: TagOp}) {
  const { title, tags } = data

  if (title != null) {
    const url = title.trim().replace(/\s+/gi, '-').toLowerCase().replace(/[^0-9a-z_-]/gi, '')
    await prisma.post.update({ where: { id: postId }, data: { title, url } })
  }

  if (tags != null) {
    await updatePostTags(postId, tags)
  }
}

export async function deletePost(postId: number) {
  await prisma.post.delete({ where: { id: postId } })
  // TODO: delete the associated files, move them if necessary
}


export async function createContentEntry(postId: number,
  { index }: { index?: number | undefined }) {

  const postContents = await prisma.content.findMany({
    where: { postId }, select: { id: true, index: true }
  })

  let newInd: number
  if (postContents.length == 0) {
    newInd = 1
  } else if (index == null) {
    newInd = Math.max(...postContents.map(({ index }) => index)) + 1
  } else {
    reindexContents(postId, index)
    newInd = index
  }

  return await prisma.content.create({ data: { index: newInd, markdown: '', postId } })
}

export async function updateContentIndex(contentId: number, index: number) {
  const { postId } = await prisma.content.findFirstOrThrow({ where: { id: contentId } })
  await reindexContents(postId, index)
  await prisma.content.update({ where: { id: contentId }, data: { index } })
}

export async function updateContentMarkdown(contentId: number, markdown: string) {
  // TODO: check contexts for any file-refs
  await prisma.content.update({ where: { id: contentId }, data: { markdown } })
}

export async function deleteContentEntry(contentId: number) {
  // TODO: check contexts for any file-refs
  await prisma.content.delete({ where: { id: contentId } })
}
export async function getAllTags() {
  return await prisma.tag.findMany({ select: { name: true } })
}

export async function createNewTag(name: string) {
  await prisma.tag.create({ data: { name } })
}

export async function updateTagName({ newName, oldName }: { oldName: string; newName: string }) {
  await prisma.tag.update({ where: { name: oldName }, data: { name: newName } })
}

export async function deleteTag(name: string) {
  await prisma.tag.delete({ where: { name } })
}

export async function uploadImage(postId: number, file: Express.Multer.File) {

  await mkdir(`${STORAGE_DIRECTORY}/${postId}`, { recursive: true })
  const path = `${postId}/${uuidv4()}`
  await writeFile(`${STORAGE_DIRECTORY}/${path}`, file.buffer)

  const image = sharp(file.buffer)
  const metadata = await image.metadata()
  if (metadata.width == null || metadata.height == null) throw new Error('Issue getting dimensions')

  await prisma.file.create({
    data: {
      path: path,
      type: 'image',
      metadata: JSON.stringify({ width: metadata.width!, height: metadata.height! })
    },
  })

  return path

}
