import { Anchor, Container, createStyles, Flex, Stack, Text } from '@mantine/core'
import { useFetchPost } from 'frontend/api'
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


export default function Page() {
  const { classes } = useStyles()
  const { postId } = useParams()
  const { data: post } = useFetchPost(postId!)

  const createdAt = post?.createdAt as unknown as string
  const updatedAt = post?.updatedAt as unknown as string

  return (
    <Container size={700} pt={30} >
      <Text color='cactus.0' size={27} weight={'bold'} mb={14}>{post?.title}</Text>

      <Flex gap={24} mb={48}>

        <Stack spacing={0} className={classes.dates}>
          <Text size={13}>Created: {post && createdAt.substring(0, 16).replace('T', ' ')}</Text>
          <Text size={13}>Updated: {post && updatedAt.substring(0, 16).replace('T', ' ')}</Text>
        </Stack>

        <Flex gap={12}>
          {post?.tags.map((v) => (
            <Anchor component="button" type="button" td='underline' key={v.id}>#{v.name}</Anchor>
          ))}
        </Flex>

      </Flex>

      <CustomRenderer markdown={post?.contents[0]!.markdown || ''}/>

    </Container>
  )
}
