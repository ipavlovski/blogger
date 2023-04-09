import { ActionIcon, Box, Flex, HoverCard, Stack, createStyles } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { Entry } from '@prisma/client'
import { IconEdit, IconNewSection, IconPencil } from '@tabler/icons-react'
import Editor from 'components/blog-post/editor2'

import Remark from 'components/remark'
import { useCreateNewEntry } from 'frontend/apis/queries'
import { useMarkdownStore } from 'frontend/apis/stores'


const useStyles = createStyles((theme) => ({
  leftBorder: {
    paddingLeft: 18,
    borderLeft: `4px solid ${theme.colors.dark[7]}`,
    marginRight: 24,
    '&:hover': {
      borderLeft: `4px solid ${theme.colors.cactus[1]}`,
    },
  },
  dropdown: {
    transform: 'translate(-30px, 48px)',
    padding: 6,
    backgroundColor: `${theme.colors.cactus[1]}`,
    borderRadius: '0',
    border: 'none',
    '&:hover': {
      color: 'white',
      cursor: 'pointers'
    },
  },
  barRegular: {
    width: 4,
    backgroundColor: theme.colors.dark[7],
    cursor: 'pointer',
    marginRight: 20,
    marginTop: 5,
    borderRadius: '20px 20px 20px 20px'
  },
  barHover: {
    backgroundColor: theme.colors.cactus[2],
    width: 6,
    borderRadius: '20px 20px 20px 20px',
    height: 'auto',
    flexGrow: 1
  },
  invisible: {
    transition: 'opacity 0.2s ease-out',
    opacity: 0,
  },
  visible: {
    opacity: 1,
  }
}))


function HoverControls({ hovered, initEdit, newEdit }:
{hovered: boolean, initEdit: () => void, newEdit: () => void}) {

  const { classes: { barHover, invisible, visible }, cx } = useStyles()

  return (
    <Stack align='center' spacing={2} className={cx(invisible, hovered && visible)}>
      <ActionIcon onClick={initEdit}>
        <IconEdit />
      </ActionIcon>
      <Box className={barHover}/>
      <ActionIcon onClick={newEdit}>
        <IconNewSection />
      </ActionIcon>
    </Stack>
  )
}


function EntryRenderer({ entry }: { entry: Entry }) {
  const { id, markdown, index } = entry
  const { hovered, ref } = useHover()
  const { startEdit } = useMarkdownStore((state) => state.actions)
  const createNewEntry = useCreateNewEntry()

  const initEdit = () => {
    console.log(`starting the edit for entryId:${id}`)
    startEdit(id, markdown)
  }

  const newEdit = async () => {
    console.log(`starting new edit for id:${id}`)
    await createNewEntry(index+1)
  }

  return (
    <Flex ref={ref} gap={14}>
      <Box style={{ flexGrow: 1 }}>
        <Remark key={id} markdown={markdown}/>
      </Box>
      <HoverControls hovered={hovered} initEdit={initEdit} newEdit={newEdit} />
    </Flex>
  )
}


function PreviewRender() {
  const markdown = useMarkdownStore((store) => store.markdown)
  return (
    <Remark markdown={markdown}/>
  )
}


export default function Entries({ entries }: {entries: Entry[]}) {
  const entryId = useMarkdownStore((state) => state.entryId)
  if (entries.length == 0) return <Editor markdown={''}/>

  console.log('Reloading all entries...')

  return (
    <>
      {entries.map((entry) => (
        entry.id != entryId ?
          <EntryRenderer key={entry.id} entry={entry}/> :
          <Editor key={entry.id} markdown={entry.markdown}/>)
      )}
    </>
  )
}
