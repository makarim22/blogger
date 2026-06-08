<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Web Audio API Typewriter Click
let audioCtx: AudioContext | null = null

const playTypewriterSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    
    const time = audioCtx.currentTime
    
    const osc = audioCtx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(100 + Math.random() * 50, time)
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.03)
    
    const oscGain = audioCtx.createGain()
    oscGain.gain.setValueAtTime(0.3, time)
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03)
    
    osc.connect(oscGain)
    oscGain.connect(audioCtx.destination)
    
    const bufferSize = audioCtx.sampleRate * 0.03 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    
    const noise = audioCtx.createBufferSource()
    noise.buffer = buffer
    
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 1500
    
    const noiseGain = audioCtx.createGain()
    noiseGain.gain.setValueAtTime(0.4, time)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03)
    
    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(audioCtx.destination)
    
    osc.start(time)
    osc.stop(time + 0.03)
    noise.start(time)
  } catch (e) {
    // Ignore audio errors silently
  }
}

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Write your full editorial critique... The first letter will be displayed as a large drop cap...',
    })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    handleKeyDown: () => {
      playTypewriterSound()
      return false
    }
  }
})

watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value
  // We check if value is empty or not matching because initially it might be empty
  if (editor.value && !isSame && value) {
    editor.value.commands.setContent(value, { emitUpdate: false })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="rich-text-editor" v-if="editor">
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        <b>B</b>
      </button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        <i>I</i>
      </button>
      <div class="toolbar-divider"></div>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        H2
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
        H3
      </button>
      <div class="toolbar-divider"></div>
      <button type="button" @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
        ❞
      </button>
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
        • List
      </button>
    </div>

    <!-- Content Area -->
    <editor-content :editor="editor" class="editor-content prose" />
  </div>
</template>

<style scoped>
.rich-text-editor {
  border: 1px solid var(--color-border);
  background-color: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.editor-toolbar button {
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-main);
  padding: 6px 12px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.editor-toolbar button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.editor-toolbar button.is-active {
  background-color: var(--color-text-main);
  color: var(--color-bg);
  border-color: var(--color-text-main);
}

.toolbar-divider {
  width: 1px;
  background-color: var(--color-border);
  margin: 0 4px;
}

.editor-content {
  padding: 24px;
  min-height: 400px;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--color-text-main);
}

/* Tiptap removes outline, we let it be clean */
.editor-content :deep(.tiptap) {
  outline: none;
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-text-muted);
  pointer-events: none;
  height: 0;
  font-style: italic;
}

/* Prose styles for inside the editor */
.editor-content :deep(p) {
  margin-bottom: 1.5em;
}

.editor-content :deep(p:first-of-type)::first-letter {
  font-size: 4rem;
  float: left;
  line-height: 1;
  padding-right: 12px;
  padding-top: 4px;
  font-weight: 700;
  color: var(--color-accent);
}

.editor-content :deep(h2) {
  font-family: var(--font-sans);
  font-size: 1.6rem;
  margin-top: 2em;
  margin-bottom: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.3em;
}

.editor-content :deep(h3) {
  font-size: 1.4rem;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-style: italic;
}

.editor-content :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  padding: 0.8em 0 0.8em 1.5em;
  margin: 1.5em 0;
  font-style: italic;
  color: var(--color-text-muted);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
}

.editor-content :deep(ul) {
  margin-bottom: 1.5em;
  padding-left: 1.5em;
  list-style-type: square;
}

.editor-content :deep(li) {
  margin-bottom: 0.5em;
}
</style>
