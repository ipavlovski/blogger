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
}))


export default function Header() {
  const { classes } = useStyles()

  return <>
    <Link to={'/'} style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <IconCactus size={48} stroke={1.5} color='#2BBC8A'/>
        <Text className={classes.mainHeadline}>IPs blog</Text>
      </div>
    </Link>
  </>

}