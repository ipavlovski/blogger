import { createStyles, Text } from '@mantine/core'
import { IconCactus } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

const useStyles = createStyles(() => ({
  mainHeadline: {
    color: 'hsl(220, 3%, 79%)',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 12
  },
  cactus: {
    textDecoration: 'none',
    position: 'absolute',
    left: 20,
    top: 24,
  }
}))


export default function Header() {
  const { classes: { mainHeadline, cactus } } = useStyles()

  return (
    <Link to={'/'} className={cactus}>
      <IconCactus size={48} stroke={1.5} color='#2BBC8A'/>
    </Link>
  )

}