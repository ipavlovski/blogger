import { showNotification } from '@mantine/notifications'
import Editor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useRef } from 'react'
import { Observable, timer } from 'rxjs'
import { debounce } from 'rxjs/operators'

import ClipboardHandler from 'frontend/apis/clipboard'
import { SERVER_URL } from 'frontend/apis/utils'
import {
  useBlogpostContext, useCaptureMedia, useCreateEntry, useEditorValue, useTrpcContext, useUpdateEntry
} from 'frontend/apis/queries'

import { useLocalStorage } from '@mantine/hooks'


export default function MonacoEditor({ height }: {height: number | string}) {

  const { entryId, markdown, blogpostId, setEntry, clearEntry } = useEditorValue()

  const editorRef = useRef<null | editor.IStandaloneCodeEditor>(null)
  const createEntry = useCreateEntry()
  const updateEntry = useUpdateEntry()
  const captureMedia = useCaptureMedia()
  const trpcContext = useTrpcContext()


  const handleMonacoPaste = async (e: globalThis.ClipboardEvent) => {

    try {
      const clipboard = await ClipboardHandler.create()
      const base64 = await clipboard.getImage() || await clipboard.getVideo()

      if (base64) {
        e.stopPropagation()
        e.preventDefault()

        const filename = await captureMedia.mutateAsync({ blogpostId, src: base64 })
        if (! filename) throw new Error('Failed to get proper filename back')

        const extension = filename.split('.').pop()
        let text = ''
        switch (extension) {
          case 'mp4':
            text = `::video{filename="capture/${filename}"}`
            break
          case 'png':
          case 'jpeg':
            text = `![](${SERVER_URL}/capture/${filename})`
            break
          default:
            throw new Error(`Unknown extension: ${extension}`)
        }

        filename && editorRef.current?.trigger('keyboard', 'type', { text })
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      showNotification({ title: 'ctrl+v', message: msg, color: 'red', autoClose: 1600 })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handleEditorChange(value: string | undefined, event: editor.IModelContentChangedEvent) {}

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor
    editor.getContainerDomNode().addEventListener('paste', handleMonacoPaste, true)

    new Observable((observer) => {
      editor.getModel()?.onDidChangeContent((event) => {
        observer.next(event)
      })
    }).pipe(debounce(() => timer(300)))
      .subscribe(() => {
        setEntry({ entryId, markdown: editor.getValue() })
      })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM, () => {
      console.log('ctrl+m')
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyM, () => {
      console.log('ctrl+shift+m')

      const markdown = editor.getValue()
      if (markdown.length <= 3) {
        console.log('Too small to send POST request')
        return
      }

      entryId != null ?
        updateEntry.mutate({ entryId, markdown }, { onSuccess: () => {
          clearEntry()
          editor.setValue('')
          trpcContext.getActiveBlogpost.invalidate()
        } }) :
        createEntry.mutate({ blogpostId, markdown }, { onSuccess: () => {
          clearEntry()
          editor.setValue('')
          trpcContext.getActiveBlogpost.invalidate()
        } })
    })

    editor.addCommand(monaco.KeyCode.Escape, () => {
      console.log('escape')
    })
  }

  return (
    <Editor
      height={height}
      defaultLanguage="markdown"
      defaultValue={markdown}
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        quickSuggestions: false,
        minimap: { enabled: false },
        fontSize: 16,
        language: 'markdown'
      }}
    />
  )
}
