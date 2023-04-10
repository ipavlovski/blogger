import { createStyles, Text, TextInput } from '@mantine/core'
import { getHotkeyHandler } from '@mantine/hooks'
import HoverEdit, { useHoverDisclosure } from 'components/blog-post/metadata/hover'
import { useUpdateBlogpost } from 'frontend/apis/queries'
import { useState } from 'react'


const useStyles = createStyles((theme) => ({
  input: {
    color: '#2BBC8A',
    backgroundColor: 'transparent',
    fontSize: 21,
  },
  root: {
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    color: theme.colors.cactus[0],
    fontWeight: 'bold',
    fontSize: 23,
  },
  dropdown: {
    display: 'inline-block',
    background: 'none',
    border: 'none'
  }
}))


function TitleEditor({ stopEdit, blogpostId, title: initTitle }:
{ stopEdit: () => void, blogpostId: number, title: string}) {

  const { classes: { input, root } } = useStyles()
  const [title, setTitle] = useState(initTitle)
  const updateBlogpost = useUpdateBlogpost()

  const handleSubmit = async () => {
    stopEdit()
    updateBlogpost.mutate({ blogpostId, title })
  }

  return (
    <TextInput
      style={{ display: 'inline-block' }}
      autoFocus variant='default' classNames={{ input, root }}
      value={title} onChange={(event) => setTitle(event.currentTarget.value)}
      onKeyDown={getHotkeyHandler([['Escape', handleSubmit]])} />
  )
}

function TitleView({ title }: {title: string}) {
  const { classes: { text } } = useStyles()
  return (
    <Text className={text}>{title}</Text>
  )
}

export default function BlogpostTitle({ title, blogpostId }:
{ title: string, blogpostId: number }) {

  const disclosure= useHoverDisclosure()
  const [isEditing, { close: stopEdit }] = disclosure

  return (
    <HoverEdit disclosure={disclosure}>
      {! isEditing ?
        <TitleView title={title}/> :
        <TitleEditor stopEdit={stopEdit} blogpostId={blogpostId} title={title}/>}
    </HoverEdit>
  )
}