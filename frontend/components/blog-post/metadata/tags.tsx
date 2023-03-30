import { ActionIcon, Anchor, Box, Flex, HoverCard, MultiSelect, createStyles } from '@mantine/core'
import { getHotkeyHandler, useDisclosure } from '@mantine/hooks'
import { IconEdit } from '@tabler/icons-react'
import { useState } from 'react'
import { Tag } from '@prisma/client'

import { useBlogpostContext, useCreateTag, useGetTags, useTagsContext, useUpdateBlogpost } from 'frontend/apis/queries'


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
  dropdown: {
    background: 'none',
    border: 'none'
  }
}))


function EditButton({ startEdit }: {startEdit: () => void}) {
  return (
    <ActionIcon onClick={startEdit}
      size={32} radius="xl" variant="transparent" color='cactus.0'>
      <IconEdit size={26} stroke={1.5}/>
    </ActionIcon>
  )
}


function TagSelector({ stopEdit, blogpostId, tags: blogpostTags }:
{ stopEdit: () => void, blogpostId: number, tags: Tag[]}) {

  const { classes: { multiselect, input, root } } = useStyles()
  const [tags, setTags] = useState(blogpostTags.map((v) => v.name))
  const allTags = useGetTags()
  const updateBlogpost = useUpdateBlogpost()
  const createTag = useCreateTag()
  const blogpostContext = useBlogpostContext()
  const tagsContext = useTagsContext()

  const handleSubmit = async () => {
    stopEdit()
    await updateBlogpost.mutateAsync({ blogpostId, tags })
    blogpostContext.invalidate()
  }

  const handleCreate = (query: string) => {
    createTag.mutate(query, { onSuccess: () => tagsContext.invalidate() })
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
    <Flex gap={12}>
      {tags.length == 0 ?
        <Anchor component="button" td='underline'>#untagged</Anchor> :
        tags.map((v) => <Anchor component="button" td='underline' key={v.id}>#{v.name}</Anchor>)}
    </Flex>
  )
}


export default function TagList({ tags, blogpostId }: {tags: Tag[], blogpostId: number }) {
  const [isEditing, { open: startEdit, close: stopEdit }] = useDisclosure(false)
  const { classes: { dropdown } } = useStyles()

  return (
    <HoverCard
      classNames={{ dropdown }}
      disabled={isEditing} shadow="sm" position='right'
      openDelay={50} closeDelay={300}
    >
      <HoverCard.Target>
        <Box>
          {isEditing ?
            <TagSelector stopEdit={stopEdit} blogpostId={blogpostId} tags={tags}/> :
            <TagView tags={tags}/>}
        </Box>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Box>
          <EditButton startEdit={startEdit}/>
        </Box>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
