import { Grid } from '@mantine/core'
import { useActiveBlogpost } from 'frontend/apis/queries'
import Editor from './editor2'
import Entries from './entries'
import Metadata from './metadata'
import TreeView from './tree-view'

import { nodes, useMarkdownStore } from 'frontend/apis/stores'
import { useCallback, useEffect } from 'react'


type EditorCache = {blogpostId: number | undefined, entryId: number | null, markdown: string}


const useBeforeUnload = (title: string | undefined) => {
  const beforeUnLoad = (e: BeforeUnloadEvent) => {
    console.log(`Unloading blogpost: ${title}`)
    e.preventDefault()
    e.stopPropagation()
    // e.returnValue = ''
  }

  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnLoad)

    return () => {
      window.removeEventListener('beforeunload', beforeUnLoad)
    }
  }, [])
}

export default function Blogpost() {
  const blogpost = useActiveBlogpost()
  // const markdown = useMarkdownStore((state) => state.markdown)

  useBeforeUnload(blogpost?.title)
  // useBeforeUnload(
  //   useCallback(() => {
  //     console.log('exiting...')
  //   }, [markdown])
  // )


  if (! blogpost) return null

  return (
    <>
      <Metadata blogpost={blogpost}/>
      <Grid m={0} p={0}>
        <Grid.Col span={3}>
          {nodes.map((treeNode, ind) => <TreeView key={ind} treeNode={treeNode} />)}
        </Grid.Col>
        <Grid.Col span={9}>
          {/* <Editor content={''}/> */}
          <Entries entries={blogpost.entries} />
        </Grid.Col>
      </Grid>
    </>

  )
}
