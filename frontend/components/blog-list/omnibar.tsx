import { MultiSelect, createStyles } from '@mantine/core'

import { useTags } from 'frontend/apis/queries'
import { useFilterStore } from 'frontend/apis/stores'

const useStyles = createStyles((theme) => ({
  input: {
    padding: 2
  },
  label: {
    color: theme.colors.cactus[0],
    fontSize: 14
  },
  omnibar: {
    flexGrow: 1,
    // marginBottom: 24
  },
  searchInput: {
    marginLeft: 16
  }
}))

export default function Omnibar() {
  const { classes: { input, label, omnibar, searchInput } } = useStyles()
  const selectedTags = useFilterStore((store) => store.tags)
  const { setTags } = useFilterStore((store) => store.actions)
  const [allTags] = useTags()

  return (
    <MultiSelect
      classNames={{ input, label, searchInput }} className={omnibar}
      value={selectedTags} onChange={setTags}
      data={allTags.map(({ name }) => ({ value: name, label: `#${name}` }))}
      searchable
      radius={'lg'}
      rightSection={<></>}
    />
  )
}
