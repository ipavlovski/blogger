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