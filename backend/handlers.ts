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
    include: { contents: { include: { files: true } }, tags: true }
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


export async function createContentEntry(postId: number) {
  const { index } = await prisma.content.findFirst({ orderBy: { index: 'desc' } }) || { index: 1 }
  return await prisma.content.create({ data: { index, markdown: '', postId } })
}


export async function updateContentIndex(contentId: number, index: number) {
  const { postId } = await prisma.content.findFirstOrThrow({ where: { id: contentId } })

  // get all the current contents of the post, need only id + index for the function
  const postContents = await prisma.content.findMany({
    where: { postId }, select: { id: true, index: true }
  })

  // filter and sort in reverse, since inds in DB have to be unique
  const sortedContents = postContents.filter(({ index: ind }) => ind >= index)
    .sort((a, b) => b.index - a.index)

  // run the query
  for (const content of sortedContents) await prisma.content.update({
    where: { id: content.id }, data: { index: content.index + 1 }
  })

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

export async function uploadImage(contentId: number, file: Express.Multer.File) {
  // const path = `${postId}/${uuidv4()}`
  const { postId } = await prisma.content.findFirstOrThrow({ where: { id: contentId } })

  await mkdir(`${STORAGE_DIRECTORY}/${postId}`, { recursive: true })
  const now = new Date().toISOString().replace(/[-:Z]/g, '').replace(/[T.]/g, '-')
  const path = `${postId}/${now}.png`
  await writeFile(`${STORAGE_DIRECTORY}/${path}`, file.buffer)

  const image = sharp(file.buffer)
  const metadata = await image.metadata()
  if (metadata.width == null || metadata.height == null) throw new Error('Issue getting dimensions')

  await prisma.file.create({
    data: {
      path: path,
      metadata: JSON.stringify({ width: metadata.width!, height: metadata.height! }),
      contentId
    },
  })

  return path

}

export async function uploadFiles(postId: number, files: Express.Multer.File[]) {

  await mkdir(`${STORAGE_DIRECTORY}/${postId}`, { recursive: true })

  const paths = <string[]>[]
  for (const file of files) {
    const path = `${postId}/${file.originalname}`
    await writeFile(`${STORAGE_DIRECTORY}/${path}`, file.buffer)
    paths.push(path)
  }

  await writeFile(`${__dirname}/../trigger.txt`, `${Math.random()}`, { encoding: 'utf-8' })
  const markdown = ['UPLOADED CODE:\n', ...paths].join('\n')
  const { index } = await prisma.content.findFirst({ orderBy: { index: 'desc' } }) || { index: 1 }

  return await prisma.content.create({ data:
    { index, markdown, postId, files: { create: paths.map((path) => ({ path })) } }
  })

}
