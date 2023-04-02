import { ActionIcon, Box, createStyles, HoverCard, Text, TextInput } from '@mantine/core'
import { getHotkeyHandler, useDisclosure } from '@mantine/hooks'
import { IconEdit } from '@tabler/icons-react'
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
    fontSize: 24,
  },
  dropdown: {
    display: 'inline-block',
    background: 'none',
    border: 'none'
  }
}))


export default function BlogpostTitle({ title: initTitle, blogpostId }:
{ title: string, blogpostId: number }) {

  const { classes: { input, root, text, dropdown } } = useStyles()
  const [title, setTitle] = useState(initTitle)
  const [isEditing, { open: startEdit, close: stopEdit }] = useDisclosure(false)
  const updateBlogpost = useUpdateBlogpost()

  const handleSubmit = async () => {
    stopEdit()
    updateBlogpost.mutate({ blogpostId, title })
  }

  return (
    <HoverCard disabled={isEditing} classNames={{ dropdown }}
      shadow="sm" position='left' offset={-20} openDelay={100}>

      <HoverCard.Target>
        {isEditing ?
          <TextInput
            style={{ display: 'inline-block' }}
            autoFocus variant='default' classNames={{ input, root }}
            value={title} onChange={(event) => setTitle(event.currentTarget.value)}
            onKeyDown={getHotkeyHandler([['Escape', handleSubmit]])} /> :
          <Text className={text}>{title}</Text>}
      </HoverCard.Target>

      <HoverCard.Dropdown>
        <ActionIcon onClick={startEdit}
          size={32} radius="xl" variant="transparent" color='cactus.1' >
          <IconEdit size={26} stroke={1.5}/>
        </ActionIcon>
      </HoverCard.Dropdown>

    </HoverCard>
  )
}
