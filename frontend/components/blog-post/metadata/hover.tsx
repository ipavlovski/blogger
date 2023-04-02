import { ActionIcon, Box, HoverCard, createStyles } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAsteriskSimple } from '@tabler/icons-react'


const useStyles = createStyles((theme) => ({
  dropdown: {
    background: 'none',
    border: 'none',
    padding: 0
  }
}))

function EditButton({ startEdit }: {startEdit: () => void}) {
  return (
    <ActionIcon onClick={startEdit} size={32} radius="xl" variant="transparent" color='cactus.2'>
      <IconAsteriskSimple size={14} stroke={2}/>
    </ActionIcon>
  )
}

export const useHoverDisclosure = () => {
  return useDisclosure(false)
}

export default function HoverEdit({ children, disclosure, style }: {
  children: JSX.Element,
  disclosure: ReturnType<typeof useHoverDisclosure>,
  style?: React.CSSProperties
}) {
  const { classes: { dropdown } } = useStyles()

  const [isEditing, { open: startEdit }] = disclosure

  return (
    <HoverCard disabled={isEditing} classNames={{ dropdown }}
      shadow="sm" position='left' offset={-7} openDelay={100} >

      <HoverCard.Target>
        <Box style={style}>
          {children}
        </Box>
      </HoverCard.Target>

      <HoverCard.Dropdown>
        <Box>
          <EditButton startEdit={startEdit}/>
        </Box>
      </HoverCard.Dropdown>

    </HoverCard>
  )
}
