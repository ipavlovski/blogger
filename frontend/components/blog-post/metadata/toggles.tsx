import { ActionIcon, Flex } from '@mantine/core'
import { IconSquareToggleHorizontal, IconWritingSign } from '@tabler/icons-react'
import { useUiStore } from 'frontend/apis/stores'


export default function Toggles() {

  const showPreview = useUiStore((store) => store.showPreview)
  const showEditor = useUiStore((store) => store.showEditor)
  const { toggleEditor, togglePreview } = useUiStore((store) => store.actions)


  return (
    <Flex gap={8}>
      <ActionIcon onClick={togglePreview}>
        <IconSquareToggleHorizontal style={{ color: showPreview ? 'teal' : 'gray' }}/>
      </ActionIcon>
      <ActionIcon onClick={toggleEditor}>
        <IconWritingSign style={{ color: showEditor ? 'teal' : 'gray' }}/>
      </ActionIcon>
    </Flex>
  )
}