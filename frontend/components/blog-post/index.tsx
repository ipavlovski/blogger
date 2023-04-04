import { Grid } from '@mantine/core'
import { useActiveBlogpost, useSaveEditorState } from 'frontend/apis/queries'
import Editor from './editor2'
import Entries from './entries'
import Metadata from './metadata'
import TreeView from './tree-view'

import { nodes, useMarkdownStore } from 'frontend/apis/stores'
import { useCallback, useEffect } from 'react'
import { useBeforeUnload } from 'react-router-dom'


type EditorCache = {blogpostId: number | undefined, entryId: number | null, markdown: string}


export default function Blogpost() {
  const blogpost = useActiveBlogpost()
  const storedBlogpostId = useMarkdownStore((state) => state.blogpostId)
  const storedEntryId = useMarkdownStore((state) => state.entryId)
  const setEditorState = useMarkdownStore((state) => state.setState)
  const saveEditorState = useSaveEditorState()

  useEffect(() => {
    if (! blogpost) return

    if (blogpost.id == storedBlogpostId) {
      console.log('refreshing blogpost - no changes')
      return
    }

    if (storedBlogpostId == null) {
      setEditorState(blogpost.id, null, '')
    }

    if (storedBlogpostId != null && blogpost.id != storedBlogpostId) {
      console.log('switching TO a blogpost')
      saveEditorState().then(() => setEditorState(blogpost.id, null, ''))
      return
    }
  }, [])


  if (! blogpost) return null

  return (
    <>
      <Metadata blogpost={blogpost}/>
      <Grid m={0} p={0}>
        <Grid.Col span={3}>
          {nodes.map((treeNode, ind) => <TreeView key={ind} treeNode={treeNode} />)}
        </Grid.Col>
        <Grid.Col span={9}>
          <Entries entries={blogpost.entries} />
        </Grid.Col>
      </Grid>
    </>

  )
}
