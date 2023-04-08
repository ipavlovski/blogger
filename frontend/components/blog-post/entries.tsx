import { ActionIcon, Box, Flex, HoverCard, Stack, createStyles } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { Entry } from '@prisma/client'
import { IconEdit, IconNewSection, IconPencil } from '@tabler/icons-react'
import Editor from 'components/blog-post/editor2'

import Remark from 'components/remark'
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
  }


}))


function HoverControls({ hovered, initEdit }: {hovered: boolean, initEdit: () => void}) {
  const { classes: { barRegular, barHover }, cx } = useStyles()

  return (
    <Stack align='center' spacing={2}>
      <ActionIcon>
        <IconEdit />
      </ActionIcon>
      <Box onClick={initEdit} className={barHover}/>
      <ActionIcon>
        <IconNewSection />
      </ActionIcon>
    </Stack>
  )
}


function EntryRenderer({ entry }: { entry: Entry }) {
  const { id, markdown } = entry
  const { hovered, ref } = useHover()
  const { startEdit } = useMarkdownStore((state) => state.actions)

  const initEdit = () => {
    console.log(`starting the edit for entryId:${id}`)
    startEdit(id, markdown)
  }

  return (
    <Flex ref={ref} gap={14}>
      <Box style={{ flexGrow: 1 }}>
        <Remark key={id} markdown={markdown}/>
      </Box>
      <HoverControls hovered={hovered} initEdit={initEdit} />
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
  // const showPreview = useUiStore((store) => store.showPreview)
  const entryId = useMarkdownStore((state) => state.entryId)
  // const markdown = useMarkdownStore((state) => state.markdown)
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


// export default function Entries({ entries }: {entries: Entry[]}) {
//   const showPreview = useUiStore((store) => store.showPreview)
//   return (
//     <>
//       {showPreview ?
//         <PreviewRender /> :
//         entries.map((entry) => (<EntryRenderer key={entry.id} entry={entry}/>))}
//     </>
//   )
// }
