import { getHotkeyHandler, useDebouncedState } from '@mantine/hooks'
import { Link, RichTextEditor } from '@mantine/tiptap'
import Highlight from '@tiptap/extension-highlight'
import SubScript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'


import { htmlToMarkdown } from 'frontend/apis/parsers'
import { useSaveEditorState } from 'frontend/apis/queries'
import { useMarkdownStore } from 'frontend/apis/stores'


export default function Editor({ markdown }: {markdown: string}) {

  const [content, setContent] = useState(markdown)
  const [value, setValue] = useDebouncedState<string>(content, 400)
  const { setMarkdown, stopEdit } = useMarkdownStore((state) => state.actions)
  const saveEditorState = useSaveEditorState()

  const editor = useEditor({
    content,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setValue(html)
    },
  })

  // run this only on 'startup'
  useEffect(() => {
    console.log(`setting the contents: ${markdown}`)
    setContent(markdown)
  }, [])

  useEffect(() => {
    htmlToMarkdown(value).then((md) => setMarkdown(md))
  }, [value])

  const handleEscape = () => {
    console.log('Trigger edit escape.')
    saveEditorState().then(() => stopEdit())
  }

  return (
    <RichTextEditor
      editor={editor}
      onKeyDown={getHotkeyHandler([
        ['Escape', handleEscape],
      ])}
      style={{ marginTop: 24 }}>
      <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  )
}