import { showNotification } from '@mantine/notifications'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { ClipboardEvent, useRef } from 'react'
import { Observable, timer } from 'rxjs'
import { debounce } from 'rxjs/operators'

import { SERVER_URL } from 'components/app'
import { useContentStore, useUpdateContentText, useUploadImage } from 'frontend/api'


async function getClipboardItem() {
  const result = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName })

  if (result.state == 'granted' || result.state == 'prompt') {
    const [data] = await navigator.clipboard.read()
    return data
  } else {
    throw new Error('Failed to get clipboard permissions')
  }
}


export default function Monaco({ contentId, markdown }: { contentId: number, markdown: string}) {
  const editorRef = useRef<null | editor.IStandaloneCodeEditor>(null)

  const { stopEdit } = useContentStore((state) => state.actions)

  const uploadImage = useUploadImage(contentId)
  const updateContents = useUpdateContentText(contentId)

  const handleMonacoPaste = async (e: ClipboardEvent<HTMLInputElement>) => {
    try {
      const data = await getClipboardItem()

      if (data.types.includes('image/png')) {
        const blob = await data.getType('image/png')
        const formData = new FormData()
        formData.append('image', blob, 'tmp-filename')
        const { path } = await uploadImage.mutateAsync(formData)
        path && editorRef.current!.trigger('keyboard', 'type', {
          text: `![](${SERVER_URL}/${path})`
        })
        e.stopPropagation()
        e.preventDefault()
      }


    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      showNotification({ title: 'ctrl+v', message: msg, color: 'red', autoClose: 1600 })
    }
  }

  // this function has to be  here
  function handleEditorChange(value: string | undefined, event: editor.IModelContentChangedEvent) {}

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: any) {
    // here is the editor instance, you can store it in `useRef` for further usage
    editorRef.current = editor
    // @ts-ignore
    editor.getDomNode()!.addEventListener('paste', handleMonacoPaste)

    new Observable((observer) => {
      editor.getModel()!.onDidChangeContent((event) => {
        observer.next(event)
      })
    })
      .pipe(debounce(() => timer(300)))
      .subscribe(() => {
        const content = editor.getValue()
        if (content) updateContents.mutate({ markdown: content })
      })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM, () => {
      console.log('ctrl+m')
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyM, () => {
      console.log('ctrl+shift+m')
    })

    editor.addCommand(monaco.KeyCode.Escape, () => {
      console.log('escape')

      const content = editor.getValue()
      if (content) updateContents.mutate({ markdown: content })
      stopEdit(contentId)
    })
  }

  return (
    <Editor
      height="30vh"
      defaultLanguage="markdown"
      defaultValue={markdown}
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{ quickSuggestions: false, minimap: { enabled: false }, fontSize: 16 }}
    />
  )
}
