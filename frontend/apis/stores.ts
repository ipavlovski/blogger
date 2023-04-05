import { TreeNode } from 'components/blog-post/tree-view'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
export const nodes: TreeNode[] = [
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
  blogpostId: number | null,
  entryId: number | null,
  markdown: string,

  actions: {
    clearState: () => void
    setMarkdown: (markdown: string) => void
    stopEdit: () => void
    startEdit: (entryId: number, markdown: string) => void
    setBlogpost: (blogpostId: number) => void
  }

}

export const useMarkdownStore = create<MarkdownStore>()(
  persist(
    (set) => ({
      blogpostId: null,
      entryId: null,
      markdown: '',
      actions: {
        clearState: () => set(() => ({ blogpostId: null, entryId: null, markdown: '' })),
        setMarkdown: (markdown) => set(() => ({ markdown })),
        stopEdit: () => set(() => ({ entryId: null, markdown: '' })),
        startEdit: (entryId, markdown) => set(() => ({ entryId, markdown })),
        setBlogpost: (blogpostId) => set(() => ({ blogpostId, entryId: null, markdown: '' }))
      }
    }),
    {
      name: 'blogger-store',
      partialize: ({ blogpostId, entryId, markdown }) => ({ blogpostId, entryId, markdown })
    }
  )
)
