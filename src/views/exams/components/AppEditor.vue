<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'

import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'

import { Mathematics, migrateMathStrings } from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'

import { watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const addImage = () => {
  const url = prompt('Enter image URL')

  if (url) {
    editor.chain().focus().setImage({ src: url }).run()
  }
}


const addBlockMath = () => {

  const latex = prompt(
    'Enter Block Formula'
  )

  if (!latex) return

  editor.value
    .chain()
    .focus()
    .insertBlockMath({
      latex
    })
    .run()
}

const editor = useEditor({
  content: props.modelValue,

  extensions: [
    StarterKit,
    Underline,
    Image,
    Mathematics,
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
  ],
  onCreate: ({ editor: currentEditor }) => {
        migrateMathStrings(currentEditor)
      },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

const onInsertInlineMath = () => {

  const latex = prompt(
    'Enter LaTeX Formula'
  )

  if (!latex) return

  editor.value
  .chain()
  .focus()
  .insertInlineMath({
    latex
  })
  .run()
}



watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value || '')
    }
  }
)
</script>

<template>

  <div class="editor-wrapper">

    <!-- TOOLBAR -->
    <div class="toolbar">

      <!-- BOLD -->
      <v-btn
        icon="mdi-format-bold"
        size="small"
        :color="editor?.isActive('bold') ? 'primary' : ''"
        @click="editor.chain().focus().toggleBold().run()"
      />

      <!-- ITALIC -->
      <v-btn
        icon="mdi-format-italic"
        size="small"
        :color="editor?.isActive('italic') ? 'primary' : ''"
        @click="editor.chain().focus().toggleItalic().run()"
      />

      <!-- UNDERLINE -->
      <v-btn
        icon="mdi-format-underline"
        size="small"
        :color="editor?.isActive('underline') ? 'primary' : ''"
        @click="editor.chain().focus().toggleUnderline().run()"
      />

      <!-- HEADING -->
      <v-btn
        icon="mdi-format-header-1"
        size="small"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      />

      <!-- BULLET LIST -->
      <v-btn
        icon="mdi-format-list-bulleted"
        size="small"
        @click="editor.chain().focus().toggleBulletList().run()"
      />

      <!-- ORDERED LIST -->
      <v-btn
        icon="mdi-format-list-numbered"
        size="small"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />

      <!-- ALIGN LEFT -->
      <v-btn
        icon="mdi-format-align-left"
        size="small"
        @click="editor.chain().focus().setTextAlign('left').run()"
      />

      <!-- ALIGN CENTER -->
      <v-btn
        icon="mdi-format-align-center"
        size="small"
        @click="editor.chain().focus().setTextAlign('center').run()"
      />

      <!-- ALIGN RIGHT -->
      <v-btn
        icon="mdi-format-align-right"
        size="small"
        @click="editor.chain().focus().setTextAlign('right').run()"
      />

      <v-btn
        icon="mdi-image"
        size="small"
        @click="addImage"
      />

      <!-- INLINE MATH -->
       <v-btn
        icon="mdi-function-variant"
        size="small"
        @click="onInsertInlineMath"
      />
       <!-- Block MATH -->
      <v-btn
        icon="mdi-calculator-variant"
        size="small"
        @click="addBlockMath"
      />

      
    </div>

    <!-- EDITOR -->
    <EditorContent
      class="editor-content"
      :editor="editor"
    />

  </div>

</template>

<style scoped>

.editor-wrapper {
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.03);
}

.editor-content {
  padding: 16px;
  min-height: 220px;
}

:deep(.ProseMirror) {
  outline: none;
  min-height: 180px;
}

:deep(.ProseMirror p) {
  margin: 8px 0;
}

:deep(.katex) {
  font-size: 1.1rem;
}

:deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 0;
}
</style>
