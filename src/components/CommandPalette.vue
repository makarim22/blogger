<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { globalSearch } from '../services/api'

const router = useRouter()
const isVisible = ref(false)
const searchQuery = ref('')
const results = ref<any[]>([])
const selectedIndex = ref(0)
const isLoading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
let debounceTimeout: any = null

const togglePalette = () => {
  isVisible.value = !isVisible.value
  if (isVisible.value) {
    searchQuery.value = ''
    results.value = []
    selectedIndex.value = 0
    setTimeout(() => {
      inputRef.value?.focus()
    }, 50)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // Toggle with Cmd+K or Ctrl+K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    togglePalette()
  }
  
  if (!isVisible.value) return

  if (e.key === 'Escape') {
    isVisible.value = false
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (selectedIndex.value < results.value.length - 1) {
      selectedIndex.value++
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (results.value.length > 0 && selectedIndex.value >= 0) {
      const selected = results.value[selectedIndex.value]
      isVisible.value = false
      router.push(`/review/${selected.type}/${selected.id}`)
    }
  }
}

watch(searchQuery, (newVal) => {
  if (!newVal.trim()) {
    results.value = []
    return
  }
  
  if (debounceTimeout) clearTimeout(debounceTimeout)
  isLoading.value = true
  
  debounceTimeout = setTimeout(async () => {
    try {
      const data = await globalSearch(newVal)
      results.value = data
      selectedIndex.value = 0
    } catch (err) {
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }, 300)
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="palette-overlay" @click.self="isVisible = false">
        <div class="palette-modal animate-slide-down">
          <div class="palette-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              ref="inputRef"
              v-model="searchQuery" 
              type="text" 
              class="palette-input" 
              placeholder="Search movies, books, creators..." 
            />
            <span class="palette-esc">ESC</span>
          </div>
          
          <div class="palette-results">
            <div v-if="isLoading" class="palette-empty">Searching archives...</div>
            <div v-else-if="searchQuery && results.length === 0" class="palette-empty">
              No archives found for "{{ searchQuery }}".
            </div>
            <div v-else-if="!searchQuery" class="palette-empty">
              Type something to search the Noir Archives.
            </div>
            
            <ul v-else class="results-list">
              <li 
                v-for="(item, idx) in results" 
                :key="`${item.type}-${item.id}`"
                class="result-item"
                :class="{ 'is-selected': idx === selectedIndex }"
                @mouseenter="selectedIndex = idx"
                @click="handleKeydown({ key: 'Enter', preventDefault: () => {} } as any)"
              >
                <img v-if="item.image" :src="item.image" :alt="item.title" class="result-image" />
                <div v-else class="result-image-placeholder"></div>
                <div class="result-info">
                  <div class="result-title">{{ item.title }}</div>
                  <div class="result-meta">{{ item.creator }} &middot; {{ item.type === 'movies' ? 'Cinema' : 'Literature' }}</div>
                </div>
                <div class="result-jump">↵</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 15vh;
}

.palette-modal {
  width: 100%;
  max-width: 650px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
}

.palette-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  color: var(--color-text-muted);
  margin-right: 16px;
}

.palette-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-main);
  font-family: var(--font-sans);
  font-size: 1.5rem;
  outline: none;
}
.palette-input::placeholder {
  color: #52525b;
}

.palette-esc {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  padding: 4px 8px;
  border-radius: 4px;
}

.palette-results {
  max-height: 50vh;
  overflow-y: auto;
}

.palette-empty {
  padding: 40px 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.1rem;
}

.results-list {
  list-style: none;
  margin: 0;
  padding: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.result-item.is-selected {
  background: #27272a;
}

.result-image {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
  filter: grayscale(100%);
}

.result-item.is-selected .result-image {
  filter: grayscale(0%);
}

.result-image-placeholder {
  width: 40px;
  height: 60px;
  background: #3f3f46;
  border-radius: 4px;
  margin-right: 16px;
}

.result-info {
  flex: 1;
}

.result-title {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text-main);
  margin-bottom: 4px;
}

.result-meta {
  font-family: var(--font-serif);
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.result-jump {
  opacity: 0;
  color: var(--color-accent);
  font-size: 1.5rem;
  font-weight: bold;
}

.result-item.is-selected .result-jump {
  opacity: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-slide-down {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(-20px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
