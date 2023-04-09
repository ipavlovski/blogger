import { Grid } from '@mantine/core'
import { useEffect } from 'react'

import { useActiveBlogpost, useSaveEditorState } from 'frontend/apis/queries'
import { nodes, useMarkdownStore } from 'frontend/apis/stores'
import Entries from './entries'
import Metadata from './metadata'
import TreeView from './tree-view'


export default function Blogpost() {
  const blogpost = useActiveBlogpost()
  const storedBlogpostId = useMarkdownStore((state) => state.blogpostId)
  const { setBlogpost } = useMarkdownStore((state) => state.actions)
  const saveEditorState = useSaveEditorState()

  useEffect(() => {
    if (! blogpost) return

    // if the current and stored blogpost-ids match, this is most likely a refresh
    // dont do anything
    if (blogpost.id == storedBlogpostId) {
      console.log('refreshing blogpost - no changes')
      return
    }

    // if the blogpost is different (but not null), this is likely a direct link
    // save the previous state
    if (storedBlogpostId != null && blogpost.id != storedBlogpostId) {
      console.log('switching TO a blogpost')
      saveEditorState().then(() => setBlogpost(blogpost.id))
      return
    }

    // (default option): most likely storedBlogpostId == null, coming from blogpost-list
    // set the blogpost id, without setting the state
    setBlogpost(blogpost.id)
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
          <Entries entries={blogpost.entries.sort((a, b) => a.index - b.index)} />
        </Grid.Col>
      </Grid>
    </>

  )
}
