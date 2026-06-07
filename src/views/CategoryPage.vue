<script setup lang="ts">
import { ref, computed, toRef, onMounted, onUnmounted, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMovies, fetchBooks } from '../services/api'
import { useHead } from '@unhead/vue'
import MoviePoster from '../components/MoviePoster.vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{ type: 'movies' | 'books' }>()

const type = toRef(props, 'type')

const { data, isLoading } = useQuery<any>({
  queryKey: computed(() => [type.value]),
  queryFn: () => type.value === 'movies' ? fetchMovies() : fetchBooks(),
  staleTime: 60000,
})

useHead({
  title: () => `Literary Noir | ${props.type === 'movies' ? 'Cinema' : 'Literature'}`,
})

// Controls State
const searchQuery = ref('')
const sortBy = ref<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

const processedItems = computed(() => {
  let list = data.value || []
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter((item: any) => {
      const creator = props.type === 'movies' ? item.director : item.author
      return item.title.toLowerCase().includes(query) || creator.toLowerCase().includes(query)
    })
  }

  list = [...list].sort((a: any, b: any) => {
    if (sortBy.value === 'newest' || sortBy.value === 'oldest') {
      const dateA = new Date(props.type === 'movies' ? a.watchDate : a.readDate)
      const dateB = new Date(props.type === 'movies' ? b.watchDate : b.readDate)
      return sortBy.value === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    } else if (sortBy.value === 'highest') {
      return b.rating - a.rating
    } else {
      return a.rating - b.rating
    }
  })

  return list
})

const visibleLimit = ref(8)
const paginatedItems = computed(() => processedItems.value.slice(0, visibleLimit.value))

watch([searchQuery, sortBy, type], () => {
  visibleLimit.value = 8
})

const observerTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (visibleLimit.value < processedItems.value.length) {
        // Simulating a slight delay for smoother UX
        setTimeout(() => {
          visibleLimit.value += 8
        }, 300)
      }
    }
  }, { rootMargin: '200px' })
  
  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="category-page animate-fade-in">
    <div class="category-header">
      <div class="container">
        <h1 class="page-title">{{ props.type === 'movies' ? 'Cinema' : 'Literature' }}</h1>
        <div class="divider-dark"></div>
      </div>
    </div>

    <div class="container layout-grid">
      <!-- Sidebar Filters -->
      <aside class="sidebar">
        <div class="filter-group">
          <label>Search Archives</label>
          <input type="text" v-model="searchQuery" placeholder="Title or creator..." />
        </div>
        
        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="sortBy">
            <option value="newest">Latest Dispatches</option>
            <option value="oldest">From the Vault</option>
            <option value="highest">Highest Rated (0-10)</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </aside>

      <!-- Main Content Grid -->
      <main class="main-content">
        <div v-if="isLoading" class="loading">Retrieving archives...</div>
        
        <div v-else-if="processedItems.length === 0" class="empty-state">
          <p>No records found matching your criteria.</p>
        </div>
        
        <div v-else>
          <div class="article-grid">
            <RouterLink 
              v-for="item in paginatedItems" 
              :key="item.id" 
              :to="`/review/${props.type}/${item.id}`"
              class="article-card"
            >
              <div class="card-image">
                <MoviePoster 
                     v-if="props.type === 'movies'" 
                     :src="(item as any).posterUrl" 
                     :title="(item as any).title" 
                     :year="(item as any).releaseYear" />
                <img v-else-if="(item as any).coverUrl" 
                     :src="(item as any).coverUrl" 
                     :alt="(item as any).title" />
                <div v-else class="placeholder-img"></div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ (item as any).title }}</h3>
                <p class="card-creator">By {{ props.type === 'movies' ? (item as any).director : (item as any).author }}</p>
                <p class="card-score">Score: {{ (item as any).rating }}/10</p>
              </div>
            </RouterLink>
          </div>
        </div>
        
        <!-- Infinite Scroll Observer Target -->
        <div ref="observerTarget" class="scroll-trigger" v-show="!isLoading && processedItems.length > 0 && visibleLimit < processedItems.length">
          <div class="spinner"></div>
          Loading more archives...
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.category-header {
  margin-top: 60px;
  margin-bottom: 40px;
}

.page-title {
  font-size: 3.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-bottom: 80px;
}

@media (min-width: 900px) {
  .layout-grid {
    grid-template-columns: 250px 1fr;
    gap: 60px;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-group label {
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-main);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
}

.filter-group input, .filter-group select {
  width: 100%;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 40px;
}

.article-card {
  display: flex;
  flex-direction: column;
}

.card-image {
  aspect-ratio: 2/3;
  width: 100%;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: #e4e4e7;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: all 0.5s ease;
}

.article-card:hover .card-image img {
  filter: grayscale(0%);
  transform: scale(1.05);
}

.placeholder-img {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f4f4f5, #e4e4e7);
}

.card-title {
  font-size: 1.4rem;
  margin-bottom: 4px;
}

.card-creator {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.card-score {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
}

.loading, .empty-state {
  text-align: center;
  padding: 60px 20px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.25rem;
}

.scroll-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-top-color: var(--color-text-main);
  border-right-color: var(--color-text-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
