import { createStyles, Text } from '@mantine/core'
import { IconCactus } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

const useStyles = createStyles(() => ({
  cactus: {
    textDecoration: 'none',
    position: 'absolute',
    left: 20,
    top: 16,
  }
}))


export default function Header() {
  const { classes: { cactus } } = useStyles()

  return (
    <Link to={'/'} className={cactus}>
      <IconCactus size={48} stroke={1.5} color='#2BBC8A'/>
    </Link>
  )

}