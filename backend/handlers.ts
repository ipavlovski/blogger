import { PrismaClient, Category } from '@prisma/client'
import { exec } from 'node:child_process'
import { rename, rm, writeFile, mkdir } from 'node:fs/promises'
import { promisify } from 'node:util'

import { STORAGE_DIRECTORY } from 'backend/config'

const execute = promisify(exec)
const prisma = new PrismaClient()


export async function createEntry( blogpostId: number, markdown: string, index?: number) {
  // 'creating an entry' counts as an 'update to a blogpost'
  await prisma.blogpost.update({ where: { id: blogpostId }, data: { updatedAt: new Date() } })

  if (index != null) {
    await prisma.entry.updateMany({
      where: { blogpostId, AND: { index: { gte: index } } },
      data: { index: { increment: 1 } }
    })
    return prisma.entry.create({ data: { blogpostId, markdown, index } })
  } else {
    const entry = await prisma.entry.findFirst({
      where: { blogpostId }, orderBy: { index: 'desc' }
    })
    const index = entry ? entry.index : 1
    return await prisma.entry.create({ data: { blogpostId, markdown, index } })
  }
}


export async function updateEntry(entryId: number, markdown: string) {
  const updatedAt = new Date()
  return prisma.entry.update({ where: { id: entryId }, data: {
    markdown,
    updatedAt,
    blogpost: { update: { updatedAt } }
  } })
}


export async function captureMedia(blogpostId: number, src: string) {
  const basename = `${Date.now()}`
  let filename: string | null = null
  const dir = `${STORAGE_DIRECTORY}/${blogpostId}`
  await mkdir(dir, { recursive: true })

  try {
    const base64 = src.replace(/^data:(.*,)?/, '')
    const buffer = Buffer.from(base64, 'base64')
    await writeFile(`${dir}/${basename}.unknown`, buffer)

    const { stdout } = await execute(`file -Lib ${dir}/${basename}.unknown`)
    const [mime] = stdout.split(';', 1)
    console.log(stdout)

    switch (mime) {
      case 'image/png':
        filename = `${basename}.png`
        break
      case 'image/jpeg':
        filename = `${basename}.jpeg`
        break
      case 'video/mp4':
        filename = `${basename}.mp4`
        break
      default:
        console.log('No handler available')
        break
    }
    if (! filename) throw new Error('Failed to get matchign mimes.')
    rename(`${dir}/${basename}.unknown`, `${dir}/${filename}`)

    if (filename.endsWith('.mp4'))
      await execute(`ffmpeg -i ${dir}/${filename} ${dir}/${filename.replace('.mp4', '.gif')}`)

  } catch {
    console.log('Error during file-type identification')
    await rm(`${dir}/${basename}.unknown`, { force: true })
  }

  return `${blogpostId}/${filename}`

}


export async function createBlogpost() {
  return prisma.blogpost.create({ data: { title: 'Untitled' } })
}


export async function getFilteredBlogposts({ title, category, tags }:
{title: string | null, category: string | null, tags: string[]}) {

  // FILTER PROPERLY! (with custom null-values, etc.)
  // ADD PROPER SORTING
  return prisma.blogpost.findMany({
    orderBy: { createdAt: 'desc' }
  })
}


export async function getTags() {
  return prisma.tag.findMany()
}


export async function getActiveBlogpost(blogpostId: number) {
  return prisma.blogpost.findFirstOrThrow({
    where: { id: blogpostId },
    include: { category: true, entries: true, tags: true }
  })
}


export async function updateBlogpost(blogpostId: number, opts: { title?: string, tags?: string[]}) {
  const { title, tags } = opts
  return prisma.blogpost.update({ where: { id: blogpostId }, data: {
    title,
    tags: { set: tags?.map((tag) => ({ name: tag })) }
  } })
}


export async function createTag(name: string) {
  return prisma.tag.create({ data: { name } })
}

export function getCategories() {
  return prisma.category.findMany()
}

export function createCategory(name: string) {
  return prisma.category.create({ data: { name } })
}

export function deleteEntry(entryId: number) {
  return prisma.entry.delete({ where: { id: entryId } })
}
