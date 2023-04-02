import { ActionIcon, Anchor, Box, Flex, HoverCard, Select, createStyles } from '@mantine/core'
import { getHotkeyHandler, useDisclosure } from '@mantine/hooks'
import { Category } from '@prisma/client'
import { IconAsterisk, IconEdit } from '@tabler/icons-react'
import { useState } from 'react'

import { useCategories, useTrpcContext, useUpdateBlogpost } from 'frontend/apis/queries'


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
      size={32} radius="xl" variant="transparent" color='cactus.1'>
      <IconAsterisk size={26} stroke={1.5}/>
    </ActionIcon>
  )
}


function CategorySelector({ stopEdit, blogpostId, category: blogpostCategory }:
{ stopEdit: () => void, blogpostId: number, category: Category | null}) {

  const { classes: { multiselect, input, root } } = useStyles()
  const [category, setCategory] = useState(blogpostCategory?.name || null)
  const [allCategories, createCategory] = useCategories()
  const updateBlogpost = useUpdateBlogpost()
  const trpcContext = useTrpcContext()

  const handleSubmit = async () => {
    stopEdit()
    await updateBlogpost.mutateAsync({ blogpostId, category: category || undefined })
    trpcContext.getActiveBlogpost.invalidate()
  }

  const handleCreate = (query: string) => {
    createCategory.mutate(query, { onSuccess: () => trpcContext.getCategories.invalidate() })
    setCategory(query)
    return query
  }

  return (
    <Select
      data={allCategories.map(({ name }) => ({ value: name }))}
      placeholder="Select tags"
      width={800} maxDropdownHeight={400}
      transitionProps={{ transition: 'pop-top-left', duration: 150, timingFunction: 'ease' }}
      className={multiselect}
      classNames={{ input, root }}
      value={category} onChange={setCategory}
      searchable creatable autoFocus
      getCreateLabel={(query) => `+ Create category %${query}`}
      onCreate={handleCreate}
      onKeyDown={getHotkeyHandler([['Escape', handleSubmit]])}
    />
  )
}


function CategoryView({ category }: {category: Category | null}) {
  return (
    <Flex gap={12}>
      {category == null ?
        <Anchor component="button" td='underline'>%category:null</Anchor> :
        <Anchor component="button" td='underline'>%{category.name}</Anchor>}
    </Flex>
  )
}


export default function CategoryList({ category, blogpostId }:
{ category: Category | null, blogpostId: number }) {

  const [isEditing, { open: startEdit, close: stopEdit }] = useDisclosure(false)
  const { classes: { dropdown } } = useStyles()

  return (
    <HoverCard disabled={isEditing} classNames={{ dropdown }}
      shadow="sm" position='left' offset={-20} openDelay={100}>

      <HoverCard.Target>
        <Box>
          {isEditing ?
            <CategorySelector stopEdit={stopEdit} blogpostId={blogpostId} category={category}/> :
            <CategoryView category={category}/>}
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
