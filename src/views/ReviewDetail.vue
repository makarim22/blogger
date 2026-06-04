<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchMovie, fetchBook, deleteMovie, deleteBook } from '../services/api'
import FinalVerdict from '../components/FinalVerdict.vue'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const queryClient = useQueryClient()
const type = route.params.type as string
const id = route.params.id as string

const fetchFn = () => type === 'movies' ? fetchMovie(id) : fetchBook(id)

const { data: item, isLoading } = useQuery<any>({
  queryKey: ['review', type, id],
  queryFn: fetchFn,
  staleTime: 60000,
})

const processedItem = computed(() => {
  if (!item.value) return null
  const base = item.value as any
  return {
    ...base,
    displayTitle: base.title,
    displayCreator: type === 'movies' ? base.director : base.author,
    image: type === 'movies' ? base.posterUrl : base.coverUrl,
    dateLabel: type === 'movies' ? 'Watched' : 'Read',
    dateValue: new Date(type === 'movies' ? base.watchDate : base.readDate).toLocaleDateString()
  }
})

const deleteMutation = useMutation({
  mutationFn: () => type === 'movies' ? deleteMovie(id) : deleteBook(id),
  onSuccess: () => {
    toast.success('Critique deleted successfully')
    queryClient.invalidateQueries({ queryKey: [type] })
    router.push('/')
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to delete critique')
  }
})

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this critique? This action is irreversible.')) {
    deleteMutation.mutate()
  }
}

// Update SEO Head
useHead({
  title: () => processedItem.value ? `${processedItem.value.displayTitle} | Literary Noir` : 'Loading Review...',
})

</script>

<template>
  <div class="review-detail" v-if="isLoading">
    <div class="container loading">Retrieving archive...</div>
  </div>
  
  <div class="review-detail animate-fade-in" v-else-if="processedItem">
    <header class="review-header">
      <div class="hero-image-container">
        <img v-if="processedItem.image" :src="processedItem.image" :alt="processedItem.displayTitle" class="hero-image" />
        <div v-else class="hero-placeholder"></div>
        <div class="hero-overlay"></div>
      </div>
      
      <div class="container hero-content">
        <div class="content-wrapper">
          <span class="category-tag">Review &middot; {{ type === 'movies' ? 'Cinema' : 'Literature' }}</span>
          <h1 class="title">{{ processedItem.displayTitle }}</h1>
          <p class="subtitle">By {{ processedItem.displayCreator }}</p>
          <p class="meta">{{ processedItem.dateLabel }}: {{ processedItem.dateValue }}</p>
        </div>
      </div>
    </header>

    <main class="container-narrow editorial-content">
      <p class="dropcap">
        {{ processedItem.review }}
      </p>

      <FinalVerdict 
        :rating="processedItem.rating" 
        :the-good="processedItem.theGood" 
        :the-bad="processedItem.theBad" 
      />

      <div v-if="authStore.isLoggedIn" class="editor-actions">
        <RouterLink :to="`/edit/${type}/${id}`" class="btn-outline btn-edit">
          Edit Critique
        </RouterLink>
        <button @click="handleDelete" class="btn-outline btn-delete" :disabled="deleteMutation.isPending.value">
          {{ deleteMutation.isPending.value ? 'Deleting...' : 'Delete Critique' }}
        </button>
      </div>
    </main>
  </div>
  
  <div v-else class="container not-found">
    <h2>Critique Not Found</h2>
    <p>This archive could not be located.</p>
  </div>
</template>

<style scoped>
.review-header {
  position: relative;
  height: 65vh;
  min-height: 500px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 80px;
}

.hero-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-color: var(--color-text-main);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  filter: grayscale(100%);
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  background: #1a1a1b;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80%;
  background: linear-gradient(to top, var(--color-bg) 0%, transparent 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding-bottom: 40px;
}

.category-tag {
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  color: var(--color-accent);
  font-weight: 600;
  margin-bottom: 24px;
  display: block;
}

.title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  margin-bottom: 16px;
  color: var(--color-text-main);
}

.subtitle {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-style: italic;
  margin-bottom: 12px;
  color: var(--color-text-muted);
}

.meta {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-light);
}

.editorial-content {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--color-text-main);
  margin-bottom: 100px;
}

.dropcap {
  white-space: pre-wrap; /* to preserve newlines from textarea */
}

/* Pseudo-element for dropcap on the first letter */
.dropcap::first-letter {
  font-size: 4.5rem;
  font-weight: 900;
  float: left;
  line-height: 1;
  margin-right: 12px;
  margin-top: 4px;
  color: var(--color-text-main);
}

.editor-actions {
  margin-top: 60px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-edit {
  border-color: var(--color-text-main);
  color: var(--color-text-main);
  padding: 10px 20px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background-color: var(--color-text-main);
  color: var(--color-bg);
}

.btn-delete {
  border-color: #ef4444;
  color: #ef4444;
  padding: 10px 20px;
}

.btn-delete:hover {
  background-color: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading, .not-found {
  text-align: center;
  padding: 100px 20px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.5rem;
}
</style>
