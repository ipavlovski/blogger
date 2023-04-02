import { create } from 'zustand'

interface FilterStore {
  title: string | null
  category: string | null
  tags: string[]
  actions: {
    setTitle: (title: string | null) => void
    setTags: (tags: string[]) => void,
    setCategory: (category: string | null) => void
  }
}

export const useFilterStore = create<FilterStore>((set) => ({
  title: null,
  category: null,
  tags: [],
  actions: {
    setTitle: (title) => set(() => ({ title })),
    setTags: (tags) => set(() => ({ tags })),
    setCategory: (category) => set(() => ({ category })),
  }
}))


interface UiStore {
  showPreview: boolean
  showEditor: boolean
  actions: {
    togglePreview: () => void
    toggleEditor: () => void
  }
}

export const useUiStore = create<UiStore>((set) => ({
  showPreview: false,
  showEditor: false,
  actions: {
    togglePreview: () => set((state) => ({ showPreview: ! state.showPreview })),
    toggleEditor: () => set((state) => ({ showEditor: ! state.showEditor }))
  }
}))


// const nodes: TreeNode[]
export const nodes = [
  {
    item: { name: 'test', id: 1, path: [] },
    leafs: [],
    children: [
      {
        item: { name: 'test2', id: 2, path: [1] },
        leafs: [{ id: 1, title: 'lol' }, { id: 2, title: 'lol2' }],
        children: [],
        depth: 2,
      },
    ],
    depth: 1
  }
]


interface MarkdownStore {
  markdown: string,
  setMarkdown: (markdown: string) => void
}

export const useMarkdownStore = create<MarkdownStore>((set) => ({
  markdown: '',
  setMarkdown: (markdown) => set(() => ({ markdown }))
}))
