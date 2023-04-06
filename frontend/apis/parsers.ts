import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
import { fromMarkdown } from 'mdast-util-from-markdown'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'


export const markdownToHtml = async (value: string) => {
  return unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(value)
    .then((v) => String(v))
}


export const htmlToMarkdown = async (value: string) => {
  return unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(value)
    .then((v) => String(v))
}

export const treeParser = (contents: string[]) => {
  const fullText = contents.join('\n')

  const headings = fromMarkdown(fullText).children
    .filter((v) => v.type == 'heading' && v.depth <= 3)
    .map((v) => 'type' in v && v.type == 'heading' && v.children[0]?.type == 'text'
    && { depth: v.depth, text: v.children[0].value })
    .filter((v) => v) as { depth: number, text: string}[]
}