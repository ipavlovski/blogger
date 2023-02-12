import { Title } from '@mantine/core'
import { IconHash } from '@tabler/icons-react'
import CustomCodeComponent from 'components/code'
import ReactMarkdown from 'react-markdown'
import { HeadingProps } from 'react-markdown/lib/ast-to-react'
import remarkGfm from 'remark-gfm'


function header1({ node,children, className }: HeadingProps) {

  return (
    <div style={{ position: 'relative' }}>
      <IconHash color={'#2BBC8A'} style={{ position: 'absolute', left: -40, top: 3 }} size={28}/>
      <Title order={1} transform='capitalize' size={28} mt={30} mb={4} >{children}</Title>
    </div>
  )

}

function header2({ node,children, className }: HeadingProps) {

  return (
    <div style={{ position: 'relative' }}>
      <Title underline order={2} transform='capitalize' size={24} mt={22} mb={4}>{children}</Title>
    </div>
  )

}
function header3({ node, children, className }: HeadingProps) {
  return <Title order={3} transform='uppercase' size={18} mt={20} mb={4}
    style={{ fontFamily: 'Inter' }} weight={800}>{children}</Title>


}

function headerGeneric({ node,children, className }: HeadingProps) {
  return <Title order={4} size={18} weight={600} style={{ fontFamily: 'Inter' }}>{children}</Title>
}


export default function Remark({ markdown }: { markdown: string }) {

  const md = markdown == '' ? 'Empty element' : markdown
  return (
    <ReactMarkdown
      children={md}
      remarkPlugins={[remarkGfm]}
      components={{
        code: CustomCodeComponent,
        h1: header1,
        h2: header2,
        h3: header3,
        h4: headerGeneric,
        h5: headerGeneric,
        h6: headerGeneric,

      }}
    />
  )
}