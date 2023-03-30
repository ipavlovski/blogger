import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

////////////// FIRST POST

const md1_1 = `
A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

|a|b|
|-|-|
|asdf|dfdd|


## GitHub flavored markdown (GFM)

For GFM, you can *also* use a plugin:
[lol](https://github.com/remarkjs/react-markdown#use).
It adds support for GitHub-specific extensions to the language:
tables, strikethrough, tasklists, and literal URLs.

These features **do not work by default**.
👆 Use the toggle above to add the plugin.

| Feature    | Support              |
| --------- | -------------------: |
| CommonMark | 100%                 |
| GFM        | 100% w/ remark-gfm |

~~strikethrough~~

* [ ] task list
* [x] checked item

https://example.com
`

await prisma.blogpost.create({
  data: {
    title: 'First post',
    entries: {
      create: {
        markdown: md1_1
      }
    }
  }
})


////////////// SECOND POST

const md2_1 = `
Here is some typescript-react code:

~~~tsx
console.log('It works!')

return <h1>lol</h1>
~~~
`

const md2_2 = `
### blockquote:

> CITE: 'asdfa'
> another line
> ano yet anoter..
> 
> and another
>
> - ::ref link
> - ::icon IconFire
`


await prisma.blogpost.create({
  data: {
    title: 'Second post',
    entries: {
      create: [{ markdown: md2_1 }, { markdown: md2_2 }]
    }
  }
})


////////////// THIRD POST


const md3_1 = `
What is up with this post?

Testing 1 2 3
`

const md3_2 = `
# one two three

`

await prisma.blogpost.create({
  data: {
    title: 'Yet Another Post',
    entries: {
      create: [{ markdown: md3_1 }, { markdown: md3_2 }]
    }
  }
})


////////////// FOURTH POST

const md4_1 = `
## Nothing code (just the block)

~~~
console.log('It works!')

return <h1>lol</h1>
~~~

### Plain text (plain, no directivess)

~~~plain
console.log('It works!')

return <h1>lol</h1>
~~~

### Basic tsx (no directives)

~~~tsx 
console.log('It works!')

return <h1>lol</h1>
~~~

### Advanced ts (with directives: {3-4, 8}) 

~~~ts red="3-4, 8" green="9, 11-13"
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
~~~

### Basic bash (no directives)

~~~bash
$pwd

/usr/home/chris/bin

$ls -la

total 2
drwxr-xr-x   2 chris  chris     11 Jan 10 16:48 .
drwxr--r-x  45 chris  chris     92 Feb 14 11:10 ..
-rwxr-xr-x   1 chris  chris    444 Aug 25  2013 backup
-rwxr-xr-x   1 chris  chris    642 Jan 17 14:42 deploy
~~~

### Advanced bash (with directives: prompt="[ip@localhost] $" cont=">")

~~~bash prompt="[ip@localhost] $" regex="$"
$ pwd

/usr/home/chris/bin

$ ls -la

total 2
drwxr-xr-x   2 chris  chris     11 Jan 10 16:48 .
drwxr--r-x  45 chris  chris     92 Feb 14 11:10 ..
-rwxr-xr-x   1 chris  chris    444 Aug 25  2013 backup
-rwxr-xr-x   1 chris  chris    642 Jan 17 14:42 deploy
~~~
`


const md4_2 = `
args:
- command-line
- data-user
- data-host
- data-output="2, 4-8"
- data-filter-output="(out)"
- data-continuation-str="\\" >

\`\`\`
export MY_VAR=123
echo "hello"
(out)hello
echo one \
two \
three
(out)one two three
(out)
echo "goodbye"
(out)goodbye<
\`\`\`
`

const md4_3 = `
\`\`\`sql prompt="sql>" regex="$"
$ set @my_var = 'foo';
$ set @my_other_var = 'bar';

$ CREATE TABLE people (
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL
);

Query OK, 0 rows affected (0.09 sec)

$insert into people
$values ('John', 'Doe');

Query OK, 1 row affected (0.02 sec)

$ select *
from people
order by last_name;

+------------+-----------+
| first_name | last_name |
+------------+-----------+
| John       | Doe       |
+------------+-----------+
1 row in set (0.00 sec)
\`\`\`
`


await prisma.blogpost.create({
  data: {
    title: 'This is a brand new post',
    entries: {
      create: [{ markdown: md4_1 }, { markdown: md4_2 }, { markdown: md4_3 }]
    }
  }
})


////////////// FIFTH POST


const md5_1 = `
# Header example 1

Some content of header-1

## Header exmaple 2

Some other content of heade-2

### Header example 3

Yet more content of header-3

#### Header example 4

Should be pretty regular

##### Header example 5

Again, should be pretty regular


# Block components

## Lists

\`\`\`markdown
    A single number refers to the line with that number
    Ranges are denoted by two numbers, separated with a hyphen (-)
    Multiple line numbers or ranges are separated by commas.
    Whitespace is allowed anywhere and will be stripped off.

    Block text
    Block text
    Block text

\`\`\`

Should render as:
- one
- two
- three
`

const md5_2 = `
# TOC

- [ ] scroll-to-position -> press scrolls to the item
- [ ] linkify -> set url via both page+toc
- [ ] intersection observer -> connect scroll to highlight
- [ ] styling -> style elements to look nice, with fonts/tree/truncation
- [ ] layout -> pin position, respond to media query
`

const md5_3 = `
# Styling

- [ ] styling list items (ul/ol, checked/unchecked)
- [ ] blockquote cite, link and icon
- [ ] kbd -> inline shortcut view
- [ ] emphasis/italics
- [ ] timeline
- [ ] hr/horizontal-rule (with annotation)
`


await prisma.blogpost.create({
  data: {
    title: 'All markdown components',
    entries: {
      create: [{ markdown: md5_1 }, { markdown: md5_2 }, { markdown: md5_3 }]
    }
  }
})
