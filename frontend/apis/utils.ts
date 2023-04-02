import { fromMarkdown } from 'mdast-util-from-markdown'

export const SERVER_URL = `https://localhost:${import.meta.env.VITE_SERVER_PORT}`
export const ORIGIN_URL = `https://localhost:${import.meta.env.VITE_PORT}`

export const getImageUrl = (src: string | null) => src && `${SERVER_URL}/images/${src}`

export const getCaptureUrl = (capture: string) => capture.endsWith('.mp4') ?
  `${SERVER_URL}/capture/${capture}`.replace('.mp4', '.gif') : `${SERVER_URL}/capture/${capture}`

export const treeParser = (contents: string[]) => {
  const fullText = contents.join('\n')

  const headings = fromMarkdown(fullText).children
    .filter((v) => v.type == 'heading' && v.depth <= 3)
    .map((v) => 'type' in v && v.type == 'heading' && v.children[0]?.type == 'text'
    && { depth: v.depth, text: v.children[0].value })
    .filter((v) => v) as { depth: number, text: string}[]
}