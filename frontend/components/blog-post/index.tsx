import { Container, Grid } from '@mantine/core'
import { useActiveBlogpost } from 'frontend/apis/queries'
import MonacoEditor from './editor'
import Entries from './entries'
import Metadata from './metadata'
import Editor from './editor2'
import TreeView from './tree-view'

import { nodes } from 'frontend/apis/stores'


export default function Blogpost() {
  const blogpost = useActiveBlogpost()
  if (! blogpost) return null

  return (
    <Container size={'md'}>
      <Grid m={0} p={0}>
        <Grid.Col span={3}>
          {nodes.map((treeNode, ind) => <TreeView key={ind} treeNode={treeNode} />)}
        </Grid.Col>
        <Grid.Col span={9}>
          <Metadata blogpost={blogpost}/>
          <Editor content={''}/>
          <Entries entries={blogpost.entries} />
        </Grid.Col>
      </Grid>
    </Container>
  )
}
