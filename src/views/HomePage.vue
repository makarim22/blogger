<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchMovies, fetchBooks, deleteMovie, deleteBook, type MovieReview, type BookReview } from '../services/api'
import { isLoggedIn } from '../services/auth'
import ReviewModal from '../components/ReviewModal.vue'

const activeTab = ref<'movies' | 'books'>('movies')
const movies = ref<MovieReview[]>([])
const books = ref<BookReview[]>([])
const loading = ref(true)

const showModal = ref(false)

const loadData = async () => {
  loading.value = true
  if (activeTab.value === 'movies') {
    movies.value = await fetchMovies()
  } else {
    books.value = await fetchBooks()
  }
  loading.value = false
}

onMounted(() => {
  loadData()
})

const handleTabChange = (tab: 'movies' | 'books') => {
  activeTab.value = tab
  loadData()
}

const handleDelete = async (id: string, type: 'movies' | 'books') => {
  if (!confirm('Are you sure you want to delete this log?')) return
  if (type === 'movies') {
    await deleteMovie(id)
  } else {
    await deleteBook(id)
  }
  loadData()
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

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading {{ activeTab }}...</p>
    </div>
    
    <div v-else-if="(activeTab === 'movies' && movies.length === 0) || (activeTab === 'books' && books.length === 0)" class="empty-state glass-panel">
      <h2>No {{ activeTab }} Found</h2>
      <p>Your log is currently empty.</p>
    </div>

    <div v-else class="media-grid">
      <template v-if="activeTab === 'movies'">
        <div class="media-card glass-panel animate-fade-in" v-for="movie in movies" :key="movie.id">
          <img v-if="movie.posterUrl" :src="movie.posterUrl" class="media-cover" alt="Movie Poster" />
          <div class="media-content">
            <h3>{{ movie.title }} ({{ movie.releaseYear }})</h3>
            <p class="meta">Dir: {{ movie.director }}</p>
            <p class="stars">{{ renderStars(movie.rating) }}</p>
            <p class="date">Watched: {{ new Date(movie.watchDate).toLocaleDateString() }}</p>
            <p class="review-text">{{ movie.review }}</p>
            
            <div class="admin-actions" v-if="isLoggedIn">
              <button @click="handleDelete(movie.id, 'movies')" class="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </template>
      
      <template v-else>
        <div class="media-card glass-panel animate-fade-in" v-for="book in books" :key="book.id">
          <img v-if="book.coverUrl" :src="book.coverUrl" class="media-cover" alt="Book Cover" />
          <div class="media-content">
            <h3>{{ book.title }} ({{ book.publishYear }})</h3>
            <p class="meta">By: {{ book.author }}</p>
            <p class="stars">{{ renderStars(book.rating) }}</p>
            <p class="date">Read: {{ new Date(book.readDate).toLocaleDateString() }}</p>
            <p class="review-text">{{ book.review }}</p>
            
            <div class="admin-actions" v-if="isLoggedIn">
              <button @click="handleDelete(book.id, 'books')" class="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Floating Action Button -->
    <button v-if="isLoggedIn" class="fab" @click="showModal = true">+</button>
    
    <!-- Modal -->
    <ReviewModal v-if="showModal" @close="showModal = false" @refresh="loadData" :type="activeTab" />
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

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding-bottom: 80px;
}

.media-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
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
}
.btn-danger:hover {
  background: rgba(239, 68, 68, 0.4);
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
