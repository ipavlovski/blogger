import { createStyles, Flex, Stack, Text } from '@mantine/core'
import { IconCalendar } from '@tabler/icons-react'


export default function PostDate({ createdAt, updatedAt }: {createdAt: Date, updatedAt: Date}) {
  const isoCreated = createdAt.toISOString()
  const isoUpdated = updatedAt.toISOString()

  return (
    <Flex align={'center'} gap={8}>
      <IconCalendar size={20} stroke={2} />
      <Text size={14}>
        {isoCreated.substring(0, 10)} | {isoUpdated.substring(0, 10)}
      </Text>
    </Flex>
  )
}
