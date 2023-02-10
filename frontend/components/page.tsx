import {
  ActionIcon, Anchor, Button, Container, createStyles,
  FileButton,
  Flex, HoverCard, MultiSelect, Select, Stack, Text, TextInput
} from '@mantine/core'
import { getHotkeyHandler, useDisclosure } from '@mantine/hooks'
import { IconCodeCircle2, IconEdit } from '@tabler/icons-react'
import { useContentStore, useCreateNewContent, useCreateTagMutation, useFetchCurrentPost,
  useTagsQuery, useUpdatePostMutation, useUploadFiles } from 'frontend/api'
import { lazy, Suspense, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import type { TagOp, Post } from 'backend/handlers'
import Monaco from 'components/monaco'

SyntaxHighlighter.registerLanguage('typescript', typescript)

const useStyles = createStyles((theme) => ({
  mainHeadline: {
    color: '#C9CACC',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 12
  },
  subHeadline: {
    color: '#2BBC8A',
    fontSize: 21
  },
  dates: {
    paddingRight: 14, borderRight: `3px solid ${theme.colors.dark[2]}`
  },
  content: {
    padding: 8,
    borderLeft: `2px solid ${theme.colors.dark[7]}`,
    marginRight: 16,
    '&:hover': {
      borderLeft: `2px solid ${theme.colors.cactus[1]}`,
    },
  },
}))


function CustomCodeComponent({ node, inline, className, children, style, ...props }: CodeProps) {
  const match = /language-(\w+)/.exec(className || '')

  return !inline && match ? (
    <SyntaxHighlighter
      children={String(children).replace(/\n$/, '')}
      language={match[1]}
      style={okaidia}
      showLineNumbers={true}
      PreTag="div"
      {...props}
    />
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  )
}


function Remark({ markdown }: { markdown: string }) {

  const md = markdown == '' ? 'Empty element' : markdown
  return (
    <ReactMarkdown
      children={md}
      remarkPlugins={[remarkGfm]}
      components={{
        code: CustomCodeComponent
      }}
    />
  )
}


function CodeRunner({ path: localPath }: {path: string}) {
  try {

    const path = `../../assets/${localPath}`
    const modules: any = import.meta.glob('../../assets/**/*.tsx')
    const Template = lazy(async () => await modules[path]())

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Template />
      </Suspense>
    )
  } catch {
    return <h3>Something failed along the way...</h3>
  }


}

function ContentRenderer({ markdown, contentId, files }:
{markdown: string, contentId: number, files: Post['contents'][0]['files']}) {

  const isEditing = useContentStore((state) => state.editingIds.includes(contentId))
  const { startEdit } = useContentStore((state) => state.actions)
  const { classes } = useStyles()


  return (
    <div>
      {/* MarkdownContent */}
      <HoverCard shadow="sm" position='right' openDelay={300}
      // classNames={{ dropdown: classes.content }}
        styles={{ dropdown: { background: 'none', border: 'none' } }}>
        <HoverCard.Target >
          <div>
            {isEditing ?
              <Monaco contentId={contentId} markdown={markdown} /> :
              <Remark markdown={markdown} />}
          </div>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <ActionIcon onClick={() => startEdit(contentId)}
            size={32} radius="xl" variant="transparent" color='cactus.0'>
            <IconEdit size={26} stroke={1.5}/>
          </ActionIcon>
        </HoverCard.Dropdown>
      </HoverCard>

      {/* CodeContent */}
      {
        files.length > 0 && <CodeRunner path={files[0].path} />
      }

    </div>
  )


}


/**
 * title: initial title used for seeding title state, can be edited
 * postId: needed to perform mutation query to update title on the server
 */
function PostTitle({ title: initTitle, postId }: { title: string, postId: number }) {
  const { classes } = useStyles()

  const [title, setTitle] = useState(initTitle)
  const [isEditing, { open: startEdit, close: stopEdit }] = useDisclosure(false)
  const postMutation = useUpdatePostMutation(postId)

  const handleSubmit = async () => {
    stopEdit()
    postMutation.mutate([{ postId, title }])
  }

  return (
    <HoverCard disabled={isEditing} shadow="sm" position='right' openDelay={300}
      styles={{ dropdown: { background: 'none', border: 'none' } }}>
      <HoverCard.Target>
        {isEditing ?
          <TextInput
            autoFocus
            variant='default'
            classNames={{
              input: classes.subHeadline
            }}
            styles={{
              input: {
                backgroundColor: 'transparent'
              },
              root: {
                display: 'inline-block',
                marginBottom: 14
              }
            }}
            value={title} onChange={(event) => setTitle(event.currentTarget.value)}
            onKeyDown={getHotkeyHandler([['Escape', handleSubmit]])}
          /> :
          <Text
            style={{ display: 'inline-block' }} color='cactus.0' size={27} weight={'bold'} mb={14}>
            {title}
          </Text>}
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <ActionIcon onClick={startEdit}
          size={32} radius="xl" variant="transparent" color='cactus.0'>
          <IconEdit size={26} stroke={1.5}/>
        </ActionIcon>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}

function PostTags({ tags, postId }: {tags: Post['tags'], postId: number }) {

  const { classes } = useStyles()

  const [isEditing, { open: startEdit, close: stopEdit }] = useDisclosure(false)
  const [value, setValue] = useState<string[]>(() => tags.map(({ name }) => name))

  const updatePostMutation = useUpdatePostMutation(postId)
  const addTagsMutation = useCreateTagMutation()
  const { data: allTags } = useTagsQuery()


  if (! allTags) return null

  const handleSubmit = async () => {
    stopEdit()
    const initTags = tags.map(({ name }) => name)
    const setDiff = (arr1: string[], arr2: string[]) => arr1.filter((x) => !arr2.includes(x))
    const removed = setDiff(initTags, value)
    const added = setDiff(value, initTags)
    updatePostMutation.mutate([{ postId, tags: { add: added, remove: removed } }])
  }

  return (
    <HoverCard disabled={isEditing} shadow="sm" position='right' openDelay={300}
      styles={{ dropdown: { background: 'none', border: 'none' } }}>
      <HoverCard.Target>
        {isEditing ?
          <MultiSelect
            autoFocus
            data={allTags.map(({ name }) => ({ value: name, label: `#${name}` }))}
            placeholder="Select tags"
            width={800}
            maxDropdownHeight={400}
            transitionDuration={150}
            transition="pop-top-left"
            transitionTimingFunction="ease"
            // style={{ flexGrow: 1 }}
            classNames={{
              input: classes.subHeadline
            }}
            styles={{
              input: {
                backgroundColor: 'transparent'
              },
              root: {
                // display: 'inline-block',
                marginBottom: 14
              }
            }}
            value={value}
            onChange={setValue}
            searchable
            creatable
            getCreateLabel={(query) => `+ Create tag #${query}`}
            onCreate={(query) => {
              addTagsMutation.mutate(query)
              return null
            }}
            onKeyDown={getHotkeyHandler([['Escape', handleSubmit]])}
          />
          :
          <Flex gap={12}>
            {tags.length == 0 ?
              <Anchor component="button" td='underline'>#untagged</Anchor> :
              tags.map((v) => (
                <Anchor component="button" td='underline' key={v.id}>#{v.name}</Anchor>
              ))}
          </Flex>}
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <ActionIcon onClick={startEdit}
          size={32} radius="xl" variant="transparent" color='cactus.0'>
          <IconEdit size={26} stroke={1.5}/>
        </ActionIcon>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}


function AddContentButton() {
  const createNewContent = useCreateNewContent()
  const uploadFiles = useUploadFiles()
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    if (files.length == 0) return

    const formData = new FormData()
    files.forEach((file) => formData.append('files', file, file.name))
    uploadFiles.mutateAsync(formData).then(() => setFiles([]))

  }, [files])

  const handleClick = () => {
    createNewContent.mutate()
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
      <ActionIcon onClick={handleClick}
        style={{ position: 'relative', right: '-60px', top: '30px' }}
        size={40} radius="xl" variant="gradient" color='cactus.0'>
        <IconEdit size={22} stroke={1.5}/>
      </ActionIcon>

      <FileButton onChange={setFiles} multiple>
        {(props) => <ActionIcon {...props}
          style={{ position: 'relative', right: '-60px', top: '30px' }}
          size={40} radius="xl" variant="gradient" gradient={{ from: 'teal', to: 'blue', deg: 20 }}>
          <IconCodeCircle2 size={32} stroke={1.5}/>
        </ActionIcon>}
      </FileButton>
    </div>
  )

}

function PostDate({ createdAt, updatedAt }: {createdAt: Date, updatedAt: Date}) {
  const { classes } = useStyles()

  const created = createdAt as unknown as string
  const updated = updatedAt as unknown as string

  return (
    <Stack spacing={0} className={classes.dates}>
      <Text size={13}>Created: {created.substring(0, 16).replace('T', ' ')}</Text>
      <Text size={13}>Updated: {updated.substring(0, 16).replace('T', ' ')}</Text>
    </Stack>

  )
}

export default function Page() {
  const { data: post } = useFetchCurrentPost()

  if (! post) return null


  return (
    <Container size={700} pt={30} >
      <PostTitle title={post.title} postId={post.id}/>
      <Flex gap={24} mb={48}>
        <PostDate createdAt={post.createdAt} updatedAt={post.updatedAt}/>
        <PostTags tags={post.tags} postId={post.id}/>

      </Flex>

      {
        post.contents.length == 0 ?
          <p>Empty element, started editing</p> :
          post.contents.map(({ id, markdown: md, files }) =>
            (<ContentRenderer markdown={md} contentId={id} files={files} key={id}/>))
      }


      <AddContentButton />

    </Container>
  )
}
