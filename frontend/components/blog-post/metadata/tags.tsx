import { Anchor, Flex, MultiSelect, createStyles } from '@mantine/core'
import { getHotkeyHandler } from '@mantine/hooks'
import { Tag } from '@prisma/client'
import { useState } from 'react'

import HoverEdit, { useHoverDisclosure } from 'components/blog-post/metadata/hover'
import { useTags, useTrpcContext, useUpdateBlogpost } from 'frontend/apis/queries'


const useStyles = createStyles((theme) => ({
  multiselect: {
    flexGrow: 1
  },
  input: {
    color: '#2BBC8A',
    backgroundColor: 'transparent',
    fontSize: 21,
    flexGrow: 1
  },
  root: {
    marginBottom: 14,
    flexGrow: 1

  },
}))


function TagSelector({ stopEdit, blogpostId, tags: blogpostTags }:
{ stopEdit: () => void, blogpostId: number, tags: Tag[]}) {

  const { classes: { multiselect, input, root } } = useStyles()
  const [tags, setTags] = useState(blogpostTags.map((v) => v.name))
  // const allTags = useGetTags()
  // const createTag = useCreateTag()
  const [allTags, createTag] = useTags()
  const updateBlogpost = useUpdateBlogpost()
  const trpcContext = useTrpcContext()

  const handleSubmit = async () => {
    stopEdit()
    await updateBlogpost.mutateAsync({ blogpostId, tags })
    trpcContext.getActiveBlogpost.invalidate()
  }

  const handleCreate = (query: string) => {
    createTag.mutate(query, { onSuccess: () => trpcContext.getTags.invalidate() })
    setTags((current) => [...current, query])
    return query
  }

  return (
    <MultiSelect
      data={allTags.map(({ name }) => ({ value: name, label: `#${name}` }))}
      placeholder="Select tags"
      width={800} maxDropdownHeight={400}
      transitionProps={{ transition: 'pop-top-left', duration: 150, timingFunction: 'ease' }}
      className={multiselect}
      classNames={{ input, root }}
      value={tags} onChange={setTags}
      searchable creatable autoFocus
      getCreateLabel={(query) => `+ Create tag #${query}`}
      onCreate={handleCreate}
      onKeyDown={getHotkeyHandler([['Escape', handleSubmit]])}
    />
  )
}


function TagView({ tags }: {tags: Tag[]}) {

  return (
    <Flex gap={12} >
      {tags.length == 0 ?
        <Anchor component="button" td='underline'>#untagged</Anchor> :
        tags.map((v) => <Anchor component="button" td='underline' key={v.id}>#{v.name}</Anchor>)}
    </Flex>
  )
}


export default function TagList({ tags, blogpostId }: {tags: Tag[], blogpostId: number }) {
  const disclosure= useHoverDisclosure()
  const [isEditing, { close: stopEdit }] = disclosure

  return (
    <HoverEdit disclosure={disclosure} style={{ flex: '1 1 auto' }}>
      {! isEditing ?
        <TagView tags={tags}/> :
        <TagSelector stopEdit={stopEdit} blogpostId={blogpostId} tags={tags}/>}
    </HoverEdit>
  )

}