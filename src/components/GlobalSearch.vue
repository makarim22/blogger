<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { globalSearch } from '../services/api'

const query = ref('')
const results = ref<any[]>([])
const isLoading = ref(false)
const showDropdown = ref(false)
const searchContainer = ref<HTMLElement | null>(null)
const router = useRouter()

let debounceTimeout: number | null = null

const performSearch = async (val: string) => {
  if (!val.trim()) {
    results.value = []
    return
  }
  isLoading.value = true
  try {
    results.value = await globalSearch(val)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

watch(query, (newVal) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  if (newVal.trim().length > 0) {
    showDropdown.value = true
    isLoading.value = true
    debounceTimeout = window.setTimeout(() => {
      performSearch(newVal)
    }, 400)
  } else {
    showDropdown.value = false
    results.value = []
  }
})

const handleClickOutside = (e: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const goToReview = (item: any) => {
  showDropdown.value = false
  query.value = ''
  router.push(`/review/${item.type}/${item.id}`)
}
</script>

<template>
  <div class="global-search" ref="searchContainer">
    <div class="search-input-wrapper">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input 
        type="text" 
        v-model="query" 
        placeholder="Search reviews..." 
        class="search-input"
        @focus="query.trim().length > 0 ? showDropdown = true : null"
      />
      <div v-if="isLoading" class="search-spinner"></div>
    </div>

    <Transition name="dropdown">
      <div v-if="showDropdown && (results.length > 0 || isLoading || query.trim().length > 0)" class="search-dropdown glass-panel">
        
        <div v-if="isLoading" class="dropdown-msg">
          Searching archives...
        </div>
        
        <div v-else-if="results.length === 0" class="dropdown-msg">
          No records found for "{{ query }}"
        </div>
        
        <ul v-else class="results-list">
          <li v-for="item in results" :key="item.id" class="result-item" @click="goToReview(item)">
            <div class="result-img-wrapper">
              <img v-if="item.image" :src="item.image" alt="" class="result-img" />
              <div v-else class="result-img-placeholder"></div>
            </div>
            <div class="result-info">
              <span class="result-type">{{ item.type === 'movies' ? 'Cinema' : 'Literature' }}</span>
              <h4 class="result-title">{{ item.title }}</h4>
              <p class="result-creator">{{ item.creator }}</p>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.global-search {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  padding: 8px 12px 8px 38px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: var(--color-text-main);
  box-shadow: 0 0 0 2px rgba(255,255,255,0.1);
}

.search-spinner {
  position: absolute;
  right: 12px;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: var(--color-text-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--card-bg-fallback);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.dropdown-msg {
  padding: 20px;
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-muted);
}

.results-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.result-item {
  display: flex;
  padding: 12px;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: rgba(255,255,255,0.05);
}

.result-img-wrapper {
  width: 40px;
  height: 60px;
  flex-shrink: 0;
}

.result-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
}

.result-img-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-border);
  border-radius: 2px;
}

.result-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.result-type {
  font-family: var(--font-sans);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  margin-bottom: 4px;
}

.result-title {
  font-family: var(--font-serif);
  font-size: 1rem;
  color: var(--color-text-main);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-creator {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .search-dropdown {
    width: 100vw;
    right: -20px; /* Adjust based on container padding if necessary */
    border-radius: 0;
  }
}
</style>
