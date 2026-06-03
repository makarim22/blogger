<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchMovies, fetchBooks, deleteMovie, deleteBook } from '../services/api'
import { useAuthStore } from '../stores/auth'
import ReviewModal from '../components/ReviewModal.vue'
import { toast } from 'vue3-toastify'
import { useHead } from '@unhead/vue'

const queryClient = useQueryClient()
const authStore = useAuthStore()
const activeTab = ref<'movies' | 'books'>('movies')
const showModal = ref(false)

// Controls State
const searchQuery = ref('')
const sortBy = ref<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
const filterRating = ref<'all' | '5' | '4' | '3' | '2' | '1'>('all')

useHead({
  title: () => `My Media Log | ${activeTab.value === 'movies' ? 'Movies' : 'Books'}`,
  meta: [
    { name: 'description', content: 'A beautifully designed personal media log for movies and books.' },
  ],
})

// Queries
const { data: movies, isLoading: loadingMovies } = useQuery({
  queryKey: ['movies'],
  queryFn: fetchMovies,
  staleTime: 60000,
})

const { data: books, isLoading: loadingBooks } = useQuery({
  queryKey: ['books'],
  queryFn: fetchBooks,
  staleTime: 60000,
})

// Mutations
const deleteMovieMutation = useMutation({
  mutationFn: deleteMovie,
  onSuccess: () => {
    toast.success('Movie deleted successfully')
    queryClient.invalidateQueries({ queryKey: ['movies'] })
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to delete movie')
  }
})

const deleteBookMutation = useMutation({
  mutationFn: deleteBook,
  onSuccess: () => {
    toast.success('Book deleted successfully')
    queryClient.invalidateQueries({ queryKey: ['books'] })
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to delete book')
  }
})

const handleTabChange = (tab: 'movies' | 'books') => {
  activeTab.value = tab
  // Reset filters when switching tabs
  searchQuery.value = ''
  sortBy.value = 'newest'
  filterRating.value = 'all'
}

const handleDelete = (id: string, type: 'movies' | 'books') => {
  if (!confirm('Are you sure you want to delete this log?')) return
  if (type === 'movies') {
    deleteMovieMutation.mutate(id)
  } else {
    deleteBookMutation.mutate(id)
  }
}

const renderStars = (rating: number) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

// Helper to process lists
const processList = (list: any[], type: 'movies' | 'books') => {
  let result = [...list]
  
  if (filterRating.value !== 'all') {
    const ratingValue = parseInt(filterRating.value)
    result = result.filter((item) => item.rating === ratingValue)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((item) => {
      if (type === 'movies') {
        return item.title.toLowerCase().includes(query) || item.director.toLowerCase().includes(query)
      } else {
        return item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query)
      }
    })
  }

  result.sort((a, b) => {
    if (sortBy.value === 'newest' || sortBy.value === 'oldest') {
      const dateA = type === 'movies' ? new Date(a.watchDate) : new Date(a.readDate)
      const dateB = type === 'movies' ? new Date(b.watchDate) : new Date(b.readDate)
      return sortBy.value === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    } else if (sortBy.value === 'highest') {
      return b.rating - a.rating
    } else {
      return a.rating - b.rating
    }
  })

  return result
}

const processedMovies = computed(() => {
  if (activeTab.value !== 'movies') return []
  return processList(movies.value || [], 'movies')
})

const processedBooks = computed(() => {
  if (activeTab.value !== 'books') return []
  return processList(books.value || [], 'books')
})

const isEmpty = computed(() => {
  if (activeTab.value === 'movies') return processedMovies.value.length === 0
  return processedBooks.value.length === 0
})
</script>

<template>
  <div class="home-page container animate-fade-in">
    <div class="hero">
      <h1 class="hero-title">My <span class="text-gradient">Media</span> Log</h1>
      <p class="hero-subtitle">Books I've read and movies I've watched.</p>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'movies' }" @click="handleTabChange('movies')">Movies</button>
      <button :class="{ active: activeTab === 'books' }" @click="handleTabChange('books')">Books</button>
    </div>

    <!-- Controls Toolbar -->
    <div class="toolbar glass-panel">
      <div class="search-box">
        <span class="icon">🔍</span>
        <input type="text" v-model="searchQuery" placeholder="Search title or creator..." />
      </div>
      
      <div class="filters">
        <select v-model="filterRating">
          <option value="all">All Ratings</option>
          <option value="5">5 Stars Only</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        
        <select v-model="sortBy">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="(activeTab === 'movies' && loadingMovies) || (activeTab === 'books' && loadingBooks)" class="loading-state">
      <div class="spinner"></div>
      <p>Loading {{ activeTab }}...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="isEmpty" class="empty-state glass-panel">
      <h2>No {{ activeTab }} Found</h2>
      <p>Try adjusting your filters or add a new log.</p>
    </div>

    <!-- Grid State -->
    <div v-else class="media-grid-container">
      <TransitionGroup name="list" tag="div" class="media-grid">
        <template v-if="activeTab === 'movies'">
          <div class="media-card glass-panel" v-for="movie in processedMovies" :key="movie.id">
            <img v-if="movie.posterUrl" :src="movie.posterUrl" class="media-cover" alt="Movie Poster" />
            <div class="media-content">
              <h3>{{ movie.title }} ({{ movie.releaseYear }})</h3>
              <p class="meta">Dir: {{ movie.director }}</p>
              <p class="stars">{{ renderStars(movie.rating) }}</p>
              <p class="date">Watched: {{ new Date(movie.watchDate).toLocaleDateString() }}</p>
              <p class="review-text">{{ movie.review }}</p>
              
              <div class="admin-actions" v-if="authStore.isLoggedIn">
                <button @click="handleDelete(movie.id, 'movies')" class="btn-danger" :disabled="deleteMovieMutation.isPending.value">Delete</button>
              </div>
            </div>
          </div>
        </template>
        
        <template v-else>
          <div class="media-card glass-panel" v-for="book in processedBooks" :key="book.id">
            <img v-if="book.coverUrl" :src="book.coverUrl" class="media-cover" alt="Book Cover" />
            <div class="media-content">
              <h3>{{ book.title }} ({{ book.publishYear }})</h3>
              <p class="meta">By: {{ book.author }}</p>
              <p class="stars">{{ renderStars(book.rating) }}</p>
              <p class="date">Read: {{ new Date(book.readDate).toLocaleDateString() }}</p>
              <p class="review-text">{{ book.review }}</p>
              
              <div class="admin-actions" v-if="authStore.isLoggedIn">
                <button @click="handleDelete(book.id, 'books')" class="btn-danger" :disabled="deleteBookMutation.isPending.value">Delete</button>
              </div>
            </div>
          </div>
        </template>
      </TransitionGroup>
    </div>

    <!-- Floating Action Button -->
    <button v-if="authStore.isLoggedIn" class="fab" @click="showModal = true">+</button>
    
    <!-- Modal -->
    <ReviewModal v-if="showModal" @close="showModal = false" :type="activeTab" />
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  margin: 60px 0 40px;
}
.hero-title {
  font-size: 3.5rem;
  margin-bottom: 16px;
}
.hero-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}
.tabs button {
  padding: 10px 24px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--color-text-main);
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}
.tabs button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  font-weight: bold;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 40px;
}
.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 250px;
  background: var(--card-bg-fallback);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 8px 12px;
}
.search-box .icon {
  margin-right: 8px;
  opacity: 0.7;
}
.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-main);
  font-family: inherit;
  font-size: 1rem;
}
.search-box input:focus {
  outline: none;
}
.filters {
  display: flex;
  gap: 12px;
}
.filters select {
  background: var(--card-bg-fallback);
  border: 1px solid var(--glass-border);
  color: var(--color-text-main);
  padding: 8px 12px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
}
.filters select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.media-grid-container {
  padding-bottom: 80px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* Transition Group Animations */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(30px);
}
.list-leave-active {
  position: absolute;
}

.media-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  background: var(--card-bg-fallback);
}
.media-cover {
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-bottom: 1px solid var(--glass-border);
}
.media-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.media-content h3 {
  margin: 0 0 8px;
  font-size: 1.25rem;
}
.meta {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 4px;
}
.stars {
  color: #fbbf24;
  margin: 8px 0;
  letter-spacing: 2px;
}
.date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}
.review-text {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
}

.admin-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}
.btn-danger {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}
.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fab {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.2s;
}
.fab:hover {
  transform: scale(1.1);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(236, 72, 153, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
