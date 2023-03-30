import { Container, Grid } from '@mantine/core'
import { useActiveBlogpost } from 'frontend/apis/queries'
import MonacoEditor from './editor'
import Entries from './entries'
import Metadata from './metadata'

export default function Blogpost() {
  const blogpost = useActiveBlogpost()
  if (! blogpost) return <h3>Blogpost {blogpost} doesnt exist.</h3>

  return (
    <div >
      <Container pt={16} size={'sm'}>
        <Metadata blogpost={blogpost}/>
        <MonacoEditor height={'13vh'} blogpostId={blogpost.id}/>
      </Container>

      <Grid m={0} p={0}>
        <Grid.Col span={4}>
        </Grid.Col>
        <Grid.Col span={8}>
          <Entries entries={blogpost.entries} />
        </Grid.Col>
      </Grid>
    </div>
  )
}
