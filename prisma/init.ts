import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const tags = ['bash', 'shell', 'code', 'youtube', 'typescript', 'javascript', 'react', 'linux']
for (const tag of tags) await prisma.tag.create({ data: { name: tag } })

const md1 = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |

## GitHub flavored markdown (GFM)

For GFM, you can *also* use a plugin:
[lol](https://github.com/remarkjs/react-markdown#use).
It adds support for GitHub-specific extensions to the language:
tables, strikethrough, tasklists, and literal URLs.

These features **do not work by default**.
👆 Use the toggle above to add the plugin.

| Feature    | Support              |
| ---------: | :------------------- |
| CommonMark | 100%                 |
| GFM        | 100% w/ remark-gfm |

~~strikethrough~~

* [ ] task list
* [x] checked item

https://example.com
`

await prisma.post.create({
  data: {
    id: 10001,
    title: 'First post',
    url: 'first-post',
    contents: {
      create: {
        index: 1,
        markdown: md1
      }
    },
    tags: { connect: [{ name: 'shell' }, { name: 'code' }] }
  },
})

const md2 = `Here is some typescript-react code:

~~~tsx
console.log('It works!')

return <h1>lol</h1>
~~~
`
await prisma.post.create({
  data: {
    title: 'Second Post',
    url: 'second-post',
    contents: {
      create: {
        index: 1,
        markdown: md2
      }
    },
    tags: { connect: [{ name: 'react' }, { name: 'typescript' }, { name: 'code' }] }
  },
})

await prisma.post.create({
  data: {
    title: 'Yet Another Post',
    url: 'yet-another-post',
    contents: {
      create: {
        index: 1,
        markdown: 'Testing 1 2 3'
      }
    },
  },
})
