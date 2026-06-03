<script setup lang="ts">
import { ref } from 'vue'
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

    <!-- Loading State -->
    <div v-if="(activeTab === 'movies' && loadingMovies) || (activeTab === 'books' && loadingBooks)" class="loading-state">
      <div class="spinner"></div>
      <p>Loading {{ activeTab }}...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="(activeTab === 'movies' && movies?.length === 0) || (activeTab === 'books' && books?.length === 0)" class="empty-state glass-panel">
      <h2>No {{ activeTab }} Found</h2>
      <p>Your log is currently empty.</p>
    </div>

    <!-- Grid State -->
    <div v-else class="media-grid-container">
      <TransitionGroup name="list" tag="div" class="media-grid">
        <template v-if="activeTab === 'movies'">
          <div class="media-card glass-panel" v-for="movie in movies" :key="movie.id">
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
          <div class="media-card glass-panel" v-for="book in books" :key="book.id">
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
  margin-bottom: 40px;
}
.tabs button {
  padding: 10px 24px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}
.tabs button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  font-weight: bold;
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
  background: rgba(255, 255, 255, 0.03);
}
.media-cover {
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-bottom: 1px solid rgba(255,255,255,0.1);
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
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}
.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.4);
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
