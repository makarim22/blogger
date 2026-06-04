<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchProfile } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useRouter, RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'

const authStore = useAuthStore()
const router = useRouter()

// If not logged in, redirect
if (!authStore.isLoggedIn) {
  router.push('/login')
}

const { data: profile, isLoading } = useQuery<any>({
  queryKey: ['profile'],
  queryFn: fetchProfile,
  enabled: computed(() => authStore.isLoggedIn),
})

const savedMovies = computed(() => {
  return profile.value?.savedMovies?.map((sm: any) => ({
    ...sm.movieReview,
    type: 'movies',
    displayTitle: sm.movieReview.title,
    displayCreator: sm.movieReview.director,
    image: sm.movieReview.posterUrl
  })) || []
})

const savedBooks = computed(() => {
  return profile.value?.savedBooks?.map((sb: any) => ({
    ...sb.bookReview,
    type: 'books',
    displayTitle: sb.bookReview.title,
    displayCreator: sb.bookReview.author,
    image: sb.bookReview.coverUrl
  })) || []
})

const allSavedItems = computed(() => {
  return [...savedMovies.value, ...savedBooks.value].sort((a, b) => {
    return b.rating - a.rating;
  })
})

const topCreator = computed(() => {
  if (allSavedItems.value.length === 0) return 'None'
  const counts: Record<string, number> = {}
  let max = 0
  let top = 'None'
  allSavedItems.value.forEach(item => {
    const creator = item.displayCreator
    counts[creator] = (counts[creator] || 0) + 1
    if (counts[creator] > max) {
      max = counts[creator]
      top = creator
    }
  })
  return top
})

const averageRating = computed(() => {
  if (allSavedItems.value.length === 0) return 'N/A'
  const total = allSavedItems.value.reduce((acc, item) => acc + item.rating, 0)
  return (total / allSavedItems.value.length).toFixed(1) + '/10'
})

// Task 3: Custom Mixtapes
const mixtapes = ref<any[]>(JSON.parse(localStorage.getItem('noir_mixtapes') || '[]'))
const isCreatingMixtape = ref(false)
const newMixtapeName = ref('')
const selectedMixtapeItems = ref<number[]>([])

const toggleMixtapeSelection = (item: any) => {
  const idx = selectedMixtapeItems.value.indexOf(item.id)
  if (idx > -1) {
    selectedMixtapeItems.value.splice(idx, 1)
  } else {
    selectedMixtapeItems.value.push(item.id)
  }
}

const saveMixtape = () => {
  if (!newMixtapeName.value || selectedMixtapeItems.value.length === 0) return
  mixtapes.value.push({
    id: Date.now(),
    name: newMixtapeName.value,
    items: selectedMixtapeItems.value.map(id => allSavedItems.value.find(i => i.id === id)).filter(Boolean)
  })
  localStorage.setItem('noir_mixtapes', JSON.stringify(mixtapes.value))
  newMixtapeName.value = ''
  selectedMixtapeItems.value = []
  isCreatingMixtape.value = false
}

const deleteMixtape = (id: number) => {
  mixtapes.value = mixtapes.value.filter(m => m.id !== id)
  localStorage.setItem('noir_mixtapes', JSON.stringify(mixtapes.value))
}

useHead({
  title: 'Your Profile | Literary Noir'
})

</script>

<template>
  <div class="profile-page animate-fade-in">
    <div class="category-header">
      <div class="container">
        <h1 class="page-title">Dossier</h1>
        <p class="subtitle">Personal Archives & Watchlist</p>
        <div class="divider-dark"></div>
      </div>
    </div>

    <main class="container">
      <div v-if="isLoading" class="loading">Loading dossier...</div>
      <div v-else-if="profile" class="profile-content">
        
        <section class="user-stats">
          <div class="stat-box">
            <span class="stat-number">{{ allSavedItems.length }}</span>
            <span class="stat-label">Total Archives</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ topCreator }}</span>
            <span class="stat-label">Most Saved Creator</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ averageRating }}</span>
            <span class="stat-label">Avg. Rating</span>
          </div>
        </section>

        <!-- Custom Mixtapes -->
        <section class="mixtapes-section">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
            <h2 class="section-title">Your Mixtapes</h2>
            <button class="btn-outline" @click="isCreatingMixtape = !isCreatingMixtape">
              {{ isCreatingMixtape ? 'Cancel' : '+ Create Mixtape' }}
            </button>
          </div>
          <div class="divider-dark"></div>

          <div v-if="isCreatingMixtape" class="mixtape-creator">
            <input v-model="newMixtapeName" type="text" placeholder="Name your mixtape (e.g. Films for Rainy Midnight)" class="mixtape-input" />
            <p class="mixtape-help">Select archives from your watchlist below to add to this mixtape.</p>
            <button class="btn-primary" @click="saveMixtape" :disabled="!newMixtapeName || selectedMixtapeItems.length === 0">Save Mixtape</button>
          </div>

          <div v-if="mixtapes.length === 0 && !isCreatingMixtape" class="empty-state">
            <p>You haven't curated any custom mixtapes yet.</p>
          </div>

          <div v-else class="mixtapes-list">
            <div v-for="mixtape in mixtapes" :key="mixtape.id" class="mixtape-item">
              <div class="mixtape-header">
                <h3>{{ mixtape.name }}</h3>
                <button class="btn-delete" @click="deleteMixtape(mixtape.id)">Delete</button>
              </div>
              <div class="mixtape-covers">
                <div v-for="item in mixtape.items.slice(0, 5)" :key="item.id" class="mixtape-cover">
                  <img :src="item.image" :alt="item.displayTitle" />
                </div>
                <div v-if="mixtape.items.length > 5" class="mixtape-more">+{{ mixtape.items.length - 5 }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="watchlist-section">
          <h2 class="section-title">Your Saved Archives</h2>
          <div class="divider-dark"></div>

          <div v-if="allSavedItems.length === 0" class="empty-state">
            <p>Your watchlist is empty. Explore the archives to save items here.</p>
            <RouterLink to="/" class="btn-outline" style="margin-top: 20px; display: inline-block;">Explore</RouterLink>
          </div>

          <div v-else class="article-grid">
            <div 
              v-for="item in allSavedItems" 
              :key="item.id" 
              class="article-card"
              :class="{ 'is-selectable': isCreatingMixtape, 'is-selected': selectedMixtapeItems.includes(item.id) }"
              @click="isCreatingMixtape ? toggleMixtapeSelection(item) : router.push(`/review/${item.type}/${item.id}`)"
            >
              <div class="card-image">
                <img v-if="item.image" :src="item.image" :alt="item.displayTitle" />
                <div v-else class="placeholder-img"></div>
                <div v-if="isCreatingMixtape" class="select-indicator">
                  {{ selectedMixtapeItems.includes(item.id) ? '✓' : '+' }}
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ item.displayTitle }}</h3>
                <p class="card-creator">By {{ item.displayCreator }}</p>
                <p class="card-score">Score: {{ item.rating }}/10</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
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
  margin-bottom: 8px;
}

.subtitle {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.user-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 60px;
  padding: 40px;
  background-color: #1a1a1b;
  color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.stat-box {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-accent);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  color: #a1a1aa;
}

.section-title {
  font-size: 2.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 40px;
  margin-top: 40px;
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

/* Mixtapes */
.mixtapes-section {
  margin-top: 60px;
  margin-bottom: 60px;
}

.mixtape-creator {
  background: var(--color-surface);
  padding: 30px;
  margin: 20px 0;
  border: 1px solid var(--color-border);
}

.mixtape-input {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--color-text-main);
  color: var(--color-text-main);
  margin-bottom: 10px;
  font-family: var(--font-serif);
}

.mixtape-help {
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  margin-bottom: 20px;
}

.mixtapes-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 30px;
}

.mixtape-item {
  background: var(--color-surface);
  padding: 30px;
  border: 1px solid var(--color-border);
}

.mixtape-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.mixtape-header h3 {
  font-size: 1.8rem;
}

.btn-delete {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  text-decoration: underline;
}

.mixtape-covers {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.mixtape-cover {
  width: 100px;
  aspect-ratio: 2/3;
  flex-shrink: 0;
}

.mixtape-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
}

.mixtape-more {
  width: 100px;
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1b;
  color: #fff;
  font-family: var(--font-sans);
  font-size: 1.5rem;
}

/* Selectable Cards */
.article-card.is-selectable {
  cursor: pointer;
}

.article-card.is-selectable .card-image {
  border: 2px solid transparent;
}

.article-card.is-selected .card-image {
  border-color: var(--color-accent);
}

.article-card.is-selected .card-image img {
  filter: grayscale(0%);
}

.select-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.article-card.is-selected .select-indicator {
  background: var(--color-accent);
}

.btn-primary {
  background-color: var(--color-text-main);
  color: var(--color-bg);
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-family: var(--font-sans);
  text-transform: uppercase;
  font-weight: bold;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-text-main);
  color: var(--color-text-main);
  padding: 10px 20px;
  cursor: pointer;
  font-family: var(--font-sans);
  text-transform: uppercase;
  font-weight: bold;
}
</style>
