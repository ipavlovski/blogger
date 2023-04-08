import { Anchor, Flex, Select, createStyles } from '@mantine/core'
import { getHotkeyHandler } from '@mantine/hooks'
import { Category } from '@prisma/client'
import { useState } from 'react'

import HoverEdit, { useHoverDisclosure } from './hover'
import { useCategories, useTrpcContext, useUpdateBlogpost } from 'frontend/apis/queries'


const useStyles = createStyles((theme) => ({
  multiselect: {
    flexGrow: 1,
  },
  input: {
    color: '#2BBC8A',
    backgroundColor: 'transparent',
    fontSize: 21,
    flexGrow: 1,
  },
  root: {
    marginBottom: 14,
    flexGrow: 1,
  },
}))


function CategorySelector({ stopEdit, blogpostId, category: blogpostCategory }:
{ stopEdit: () => void, blogpostId: number, category: Category | null}) {

  const { classes: { multiselect, input, root } } = useStyles()
  const [category, setCategory] = useState(blogpostCategory?.name || null)
  const [allCategories, createCategory] = useCategories()

  const updateBlogpost = useUpdateBlogpost()
  const trpcContext = useTrpcContext()

  console.log(`all categories: ${allCategories.map((v) => v.name)}`)

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
      data={allCategories?.map(({ name }) => ({ value: name, label: `${name}` })) || []}
      placeholder="Choose category..."
      width={800} maxDropdownHeight={400}
      transitionProps={{ transition: 'pop-top-left', duration: 150, timingFunction: 'ease' }}
      className={multiselect}
      classNames={{ input, root }}
      value={category ?? ''} onChange={setCategory}
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
        <Anchor component="button" td='underline'>%none</Anchor> :
        <Anchor component="button" td='underline'>%{category.name}</Anchor>}
    </Flex>
  )
}


export default function CategoryList({ category, blogpostId }:
{ category: Category | null, blogpostId: number }) {

  const disclosure= useHoverDisclosure()
  const [isEditing, { close: stopEdit }] = disclosure

  return (
    <HoverEdit disclosure={disclosure}>
      {! isEditing ?
        <CategoryView category={category}/> :
        <CategorySelector stopEdit={stopEdit} blogpostId={blogpostId} category={category}/>}
    </HoverEdit>
  )

}