import { createStyles, Stack, Text } from '@mantine/core'

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
  },
  content: {
    padding: 8,
    borderLeft: `2px solid ${theme.colors.dark[7]}`,
    marginRight: 16,
    '&:hover': {
      borderLeft: `2px solid ${theme.colors.cactus[1]}`,
    },
  },
}))

export default function PostDate({ createdAt, updatedAt }: {createdAt: Date, updatedAt: Date}) {
  const { classes: { dates } } = useStyles()

  return (
    <Stack spacing={0} className={dates}>
      <Text size={13}>
        Created: {createdAt.toISOString().substring(0, 16).replace('T', ' ')}
      </Text>
      <Text size={13}>
        Updated: {updatedAt.toISOString().substring(0, 16).replace('T', ' ')}
      </Text>
    </Stack>
  )
}
