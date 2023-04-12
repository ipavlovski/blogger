import { getHotkeyHandler, useDebouncedState } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import { Link, RichTextEditor } from '@mantine/tiptap'
import Highlight from '@tiptap/extension-highlight'
import SubScript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'

import ClipboardHandler from 'frontend/apis/clipboard'
import { htmlToMarkdown, markdownToHtml } from 'frontend/apis/parsers'
import { useCaptureMedia, useSaveEditorState, useTrpcContext } from 'frontend/apis/queries'
import { useMarkdownStore } from 'frontend/apis/stores'
import { SERVER_URL } from 'frontend/apis/utils'

import { Mark, markPasteRule, mergeAttributes } from '@tiptap/core'

const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))/g
const CustomMark = Mark.create({
  name: 'customMark',
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { rel: this.options.rel }), 0]
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,

      }),
    ]
  }
})


export default function Editor({ markdown }: {markdown: string}) {

  const [content,] = useState('')
  const [value, setValue] = useDebouncedState<string>(content, 300)
  const { setMarkdown, stopEdit } = useMarkdownStore((state) => state.actions)
  const saveEditorState = useSaveEditorState()
  const tprcContext = useTrpcContext()
  const captureMedia = useCaptureMedia()

  const editor = useEditor({
    content,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      CustomMark,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setValue(html)
    },
    editorProps: {
      handlePaste: function(view, event) {

        if (event.clipboardData?.types?.[0] == 'Files') {
          handlePaste().then((v) => view.pasteText(v || ''))
          return true
        }

        const text = event.clipboardData?.getData('text')
        if (text && /^data:.*:base64/.test(text)) {
          handlePaste().then((v) => view.pasteText(v || ''))
          return true
        }

        return false
      }
    },
  })

  // run this only on 'startup'
  useEffect(() => {
    if (editor == null) return

    markdownToHtml(markdown).then((html) => {
      editor.commands.setContent(html)
      setValue(html)
    })
  }, [editor])

  // run this every time value changes
  useEffect(() => {
    htmlToMarkdown(value).then((md) => setMarkdown(md))
  }, [value])

  const handleEscape = async () => {
    await htmlToMarkdown(value).then((md) => setMarkdown(md))
    await saveEditorState()
    stopEdit()
    tprcContext.getActiveBlogpost.invalidate()
  }


  const handlePaste = async () => {

    try {
      const clipboard = await ClipboardHandler.create()
      const base64 = await clipboard.getImage() || await clipboard.getVideo()

      if (base64) {
        // console.log(`before filename: ${base64.length}`)

        const filename = await captureMedia(base64)
        if (! filename) throw new Error('Failed to get proper filename back')

        const extension = filename.split('.').pop()
        let text = ''
        switch (extension) {
          case 'mp4':
            text = `::video{filename="${filename}"}`
            break
          case 'png':
          case 'jpeg':
            text = `![](${SERVER_URL}/${filename})`
            break
          default:
            throw new Error(`Unknown extension: ${extension}`)
        }

        return text
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      showNotification({ title: 'ctrl+v', message: msg, color: 'red', autoClose: 1600 })
      return undefined
    }
  }

  return (
    <RichTextEditor
      editor={editor}
      onKeyDown={getHotkeyHandler([
        ['Escape', handleEscape],
      ])}
      // onPasteCapture={handlePaste}
      // onPaste={handlePaste}

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