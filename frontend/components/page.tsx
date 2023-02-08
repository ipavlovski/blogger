import {
  ActionIcon, Anchor, Container, createStyles,
  Flex, HoverCard, Stack, Text, TextInput
} from '@mantine/core'
import { getHotkeyHandler, useDisclosure } from '@mantine/hooks'
import { IconEdit } from '@tabler/icons-react'
import { useFetchPost, useUpdatePostMutation } from 'frontend/api'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import { useParams } from 'react-router-dom'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

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
  }
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


function CustomRenderer({ markdown }: { markdown: string }) {

  return (
    <ReactMarkdown
      children={markdown}
      remarkPlugins={[remarkGfm]}
      components={{
        code: CustomCodeComponent
      }}
    />
  )
}


function PostTitle({ title: initTitle }: { title: string }) {
  const { classes } = useStyles()

  const { postId } = useParams()
  const [title, setTitle] = useState(initTitle)
  const [isEditing, { open: startEdit, close: stopEdit }] = useDisclosure(false)
  const postMutation = useUpdatePostMutation(postId!)

  const handleSubmit = async () => {
    stopEdit()
    postMutation.mutate([{ postId: postId!, title }])
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

export default function Page() {
  const { classes } = useStyles()
  const { postId } = useParams()
  const { data: post } = useFetchPost(postId!)

  if (! post) return null

  const createdAt = post.createdAt as unknown as string
  const updatedAt = post.updatedAt as unknown as string

  return (
    <Container size={700} pt={30} >
      <PostTitle title={post.title}/>
      <Flex gap={24} mb={48}>

        <Stack spacing={0} className={classes.dates}>
          <Text size={13}>Created: {createdAt.substring(0, 16).replace('T', ' ')}</Text>
          <Text size={13}>Updated: {updatedAt.substring(0, 16).replace('T', ' ')}</Text>
        </Stack>

        <Flex gap={12}>
          {post?.tags.map((v) => (
            <Anchor component="button" type="button" td='underline' key={v.id}>#{v.name}</Anchor>
          ))}
        </Flex>

      </Flex>

      {post.contents.map(({ id, markdown: md }) =>
        (<CustomRenderer markdown={md} key={id}/>)) || ''}

    </Container>
  )
}
