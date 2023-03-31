import { Box, HoverCard, createStyles } from '@mantine/core'
import { Entry } from '@prisma/client'
import { IconPencil } from '@tabler/icons-react'

import Remark from 'components/remark'
import { useEditorValue } from 'frontend/apis/queries'
import { useUiStore } from 'frontend/apis/stores'


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
      color: 'white'
    },
  }

}))


function EntryRender({ entry }: { entry: Entry }) {
  const { classes: { leftBorder, dropdown } } = useStyles()

  const initiateEdit = () => {
    console.log('clicked!')
  }

  return (
    <HoverCard
      classNames={{ dropdown }}
      openDelay={0} closeDelay={0}
      transitionProps={{ duration: 0 }}
      position='top-start'
    >
      <HoverCard.Target>
        <Box className={leftBorder}>
          <Remark key={entry.id} markdown={entry.markdown}/>
        </Box>
      </HoverCard.Target>
      <HoverCard.Dropdown >
        <Box onClick={initiateEdit}>
          <IconPencil size={20} stroke={1.5}/>
        </Box>
      </HoverCard.Dropdown>
    </HoverCard>
  )

}

function PreviewRender() {
  const { markdown } = useEditorValue()

  return (
    <Remark markdown={markdown}/>
  )
}

export default function Entries({ entries }: {entries: Entry[]}) {
  const showPreview = useUiStore((store) => store.showPreview)

  return (
    <>
      {showPreview ?
        <PreviewRender /> :
        entries.map((entry) => (<EntryRender key={entry.id} entry={entry}/>))}
    </>
  )
}
