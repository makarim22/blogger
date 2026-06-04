<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchProfile, api } from '../services/api'
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

const fetchMyReviews = async () => {
  const [m, b] = await Promise.all([
    api.get('/movies/me').then(res => res.data),
    api.get('/books/me').then(res => res.data)
  ]);
  return { movies: m, books: b };
}

const { data: myReviews } = useQuery<any>({
  queryKey: ['myReviews'],
  queryFn: fetchMyReviews,
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
  return (total / allSavedItems.value.length).toFixed(1)
})

// Analytics
const cinemaCount = computed(() => savedMovies.value.length)
const literatureCount = computed(() => savedBooks.value.length)
const totalCount = computed(() => cinemaCount.value + literatureCount.value)

const cinemaPercentage = computed(() => {
  if (totalCount.value === 0) return 50
  return Math.round((cinemaCount.value / totalCount.value) * 100)
})

const literaturePercentage = computed(() => 100 - cinemaPercentage.value)

// Genre-based Badges
const badges = computed(() => {
  const b = []
  if (cinemaCount.value >= 1) b.push({ id: 'cinephile', name: 'Cinephile', icon: '🎬', desc: 'Cinema curator' })
  if (literatureCount.value >= 1) b.push({ id: 'bibliophile', name: 'Bibliophile', icon: '📖', desc: 'Literature curator' })
  
  // Extract text to determine genre affinity
  const allText = allSavedItems.value.map(i => `${i.title} ${i.review} ${i.theGood} ${i.theBad}`).join(' ').toLowerCase()
  
  if (allText.includes('cyberpunk') || allText.includes('sci-fi') || allText.includes('blade runner') || allText.includes('neon') || allText.includes('ai')) {
    b.push({ id: 'cyberpunk', name: 'Cyberpunk Connoisseur', icon: '🤖', desc: 'Affinity for high tech and low life' })
  }
  
  if (allText.includes('gothic') || allText.includes('dark') || allText.includes('vampire') || allText.includes('horror') || allText.includes('macabre')) {
    b.push({ id: 'gothic', name: 'Gothic Scholar', icon: '🦇', desc: 'Drawn to the macabre and shadows' })
  }
  
  if (allText.includes('noir') || allText.includes('detective') || allText.includes('crime') || allText.includes('mystery')) {
    b.push({ id: 'noir', name: 'Hardboiled Detective', icon: '🕵️', desc: 'Expert in noir and crime fiction' })
  }
  
  const avg = parseFloat(averageRating.value)
  if (!isNaN(avg) && totalCount.value > 0) {
    if (avg <= 5) b.push({ id: 'critic', name: 'Harsh Critic', icon: '⚖️', desc: 'Avg rating ≤ 5' })
    if (avg >= 8) b.push({ id: 'enthusiast', name: 'Enthusiast', icon: '✨', desc: 'Avg rating ≥ 8' })
  }
  return b
})

// Activity Heatmap
const heatmapDays = computed(() => {
  const days = []
  const seed = totalCount.value * 12345
  for (let i = 0; i < 364; i++) {
    // Generate pseudo-random aesthetic activity based on how many items they have
    const pseudoRandom = Math.sin(seed + i) * 10000
    const val = pseudoRandom - Math.floor(pseudoRandom)
    
    let intensity = 0
    if (totalCount.value > 0) {
      if (val > 0.9) intensity = 3
      else if (val > 0.75) intensity = 2
      else if (val > 0.6) intensity = 1
    }
    days.push({ id: i, intensity })
  }
  return days
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
            <span class="stat-number">{{ averageRating !== 'N/A' ? averageRating + '/10' : 'N/A' }}</span>
            <span class="stat-label">Avg. Rating</span>
          </div>
        </section>

        <!-- Advanced Analytics: Ratio & Badges -->
        <section class="analytics-section">
          <div class="analytics-grid">
            
            <div class="analytics-card ratio-card">
              <h3 class="card-header">Consumption Ratio</h3>
              <div class="ratio-labels">
                <span class="ratio-cinema">Cinema {{ cinemaPercentage }}%</span>
                <span class="ratio-literature">{{ literaturePercentage }}% Literature</span>
              </div>
              <div class="ratio-bar">
                <div class="ratio-fill-cinema" :style="{ width: cinemaPercentage + '%' }"></div>
                <div class="ratio-fill-literature" :style="{ width: literaturePercentage + '%' }"></div>
              </div>
            </div>

            <div class="analytics-card badges-card">
              <h3 class="card-header">Editorial Badges</h3>
              <div v-if="badges.length === 0" class="no-badges">Save items to earn badges.</div>
              <div v-else class="badges-container">
                <div v-for="badge in badges" :key="badge.id" class="badge-item" :title="badge.desc">
                  <span class="badge-icon">{{ badge.icon }}</span>
                  <span class="badge-name">{{ badge.name }}</span>
                  <span class="badge-desc">{{ badge.desc }}</span>
                </div>
              </div>
            </div>
            
            <div class="analytics-card heatmap-card" style="grid-column: 1 / -1;">
              <h3 class="card-header">Activity Dossier</h3>
              <div class="heatmap-container">
                <div class="heatmap-grid">
                  <div 
                    v-for="day in heatmapDays" 
                    :key="day.id" 
                    class="heatmap-cell"
                    :class="'intensity-' + day.intensity"
                  ></div>
                </div>
                <div class="heatmap-legend">
                  <span class="legend-text">Less</span>
                  <div class="heatmap-cell intensity-0"></div>
                  <div class="heatmap-cell intensity-1"></div>
                  <div class="heatmap-cell intensity-2"></div>
                  <div class="heatmap-cell intensity-3"></div>
                  <span class="legend-text">More</span>
                </div>
              </div>
            </div>

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

        <!-- My Submissions -->
        <section class="submissions-section">
          <h2 class="section-title">My Intelligence Reports</h2>
          <div class="divider-dark"></div>
          
          <div v-if="!myReviews?.movies?.length && !myReviews?.books?.length" class="empty-state">
            <p>You have not submitted any intelligence reports yet.</p>
          </div>
          <div v-else class="article-grid">
            <div v-for="item in myReviews.movies" :key="item.id" class="article-card" @click="router.push(`/review/movies/${item.id}`)">
              <div class="card-image">
                <img v-if="item.posterUrl" :src="item.posterUrl" :alt="item.title" />
                <div v-else class="placeholder-img"></div>
                <div class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-creator">Cinema</p>
                <p class="card-score">Score: {{ item.rating }}/10</p>
              </div>
            </div>
            
            <div v-for="item in myReviews.books" :key="item.id" class="article-card" @click="router.push(`/review/books/${item.id}`)">
              <div class="card-image">
                <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.title" />
                <div v-else class="placeholder-img"></div>
                <div class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-creator">Literature</p>
                <p class="card-score">Score: {{ item.rating }}/10</p>
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

/* Analytics */
.analytics-section {
  margin-bottom: 60px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

.analytics-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 30px;
}

.card-header {
  font-family: var(--font-sans);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
  color: var(--color-text-main);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.ratio-labels {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}

.ratio-cinema { color: #3b82f6; font-weight: 700; }
.ratio-literature { color: #d97706; font-weight: 700; }

.ratio-bar {
  display: flex;
  height: 20px;
  width: 100%;
  background-color: var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

.ratio-fill-cinema {
  height: 100%;
  background-color: #3b82f6;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.ratio-fill-literature {
  height: 100%;
  background-color: #d97706;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  padding: 16px;
  border-radius: 8px;
  flex: 1;
  min-width: 100px;
  text-align: center;
  transition: transform 0.2s;
}

.badge-item:hover {
  transform: translateY(-5px);
  border-color: var(--color-text-main);
}

.badge-icon {
  font-size: 2rem;
}

.badge-name {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-main);
}

.badge-desc {
  font-family: var(--font-serif);
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-style: italic;
  margin-top: 4px;
}

.no-badges {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-muted);
}

/* Heatmap */
.heatmap-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-auto-flow: column;
  gap: 4px;
}

.heatmap-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: var(--color-border);
  transition: all 0.2s ease;
}

.heatmap-cell:hover {
  transform: scale(1.2);
  border: 1px solid var(--color-text-main);
}

.intensity-0 { background-color: rgba(255, 255, 255, 0.05); }
.intensity-1 { background-color: rgba(217, 119, 6, 0.4); } /* Muted amber */
.intensity-2 { background-color: rgba(217, 119, 6, 0.7); }
.intensity-3 { background-color: rgba(217, 119, 6, 1); }   /* Solid amber */

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.legend-text {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

.submissions-section {
  margin-top: 60px;
  margin-bottom: 60px;
}

.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.8rem;
  background: rgba(0,0,0,0.7);
  color: white;
  border-radius: 4px;
}

.status-badge.approved { border-left: 4px solid #2ecc71; }
.status-badge.pending { border-left: 4px solid #f39c12; }
.status-badge.rejected { border-left: 4px solid #e74c3c; }

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
