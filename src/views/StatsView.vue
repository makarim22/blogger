<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMovies, fetchBooks } from '../services/api'
import { useHead } from '@unhead/vue'

useHead({
  title: 'My Media Log | Statistics',
  meta: [
    { name: 'description', content: 'Statistics and insights of my media log.' },
  ],
})

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

const isLoading = computed(() => loadingMovies.value || loadingBooks.value)

// Total counts
const totalMovies = computed(() => movies.value?.length || 0)
const totalBooks = computed(() => books.value?.length || 0)

// Average Ratings
const avgMovieRating = computed(() => {
  if (totalMovies.value === 0) return 0
  const sum = movies.value!.reduce((acc: number, m: any) => acc + m.rating, 0)
  return (sum / totalMovies.value).toFixed(1)
})

const avgBookRating = computed(() => {
  if (totalBooks.value === 0) return 0
  const sum = books.value!.reduce((acc: number, b: any) => acc + b.rating, 0)
  return (sum / totalBooks.value).toFixed(1)
})

// Rating Distribution (Combined)
const ratingDistribution = computed(() => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const allMedia = [...(movies.value || []), ...(books.value || [])]
  
  allMedia.forEach((item: any) => {
    if (dist[item.rating as keyof typeof dist] !== undefined) {
      dist[item.rating as keyof typeof dist]++
    }
  })
  
  return dist
})

const maxRatingCount = computed(() => {
  return Math.max(...Object.values(ratingDistribution.value), 1)
})

</script>

<template>
  <div class="stats-page container animate-fade-in">
    <div class="header-section">
      <h1 class="page-title"><span class="text-gradient">Statistics</span></h1>
      <p class="subtitle">Insights from your reading and watching habits.</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Crunching numbers...</p>
    </div>

    <div v-else class="stats-content">
      <!-- Top Metrics -->
      <div class="metrics-grid">
        <div class="metric-card glass-panel">
          <div class="metric-icon">🎥</div>
          <div class="metric-value">{{ totalMovies }}</div>
          <div class="metric-label">Movies Watched</div>
          <div class="metric-sub">Avg Rating: <strong>{{ avgMovieRating }} ⭐️</strong></div>
        </div>

        <div class="metric-card glass-panel">
          <div class="metric-icon">📚</div>
          <div class="metric-value">{{ totalBooks }}</div>
          <div class="metric-label">Books Read</div>
          <div class="metric-sub">Avg Rating: <strong>{{ avgBookRating }} ⭐️</strong></div>
        </div>
      </div>

      <!-- Rating Distribution Chart -->
      <div class="chart-section glass-panel">
        <h2>Rating Distribution</h2>
        <div class="bar-chart">
          <div class="bar-row" v-for="star in [5,4,3,2,1]" :key="star">
            <div class="bar-label">{{ star }} Stars</div>
            <div class="bar-track">
              <div 
                class="bar-fill" 
                :style="{ width: `${(ratingDistribution[star as keyof typeof ratingDistribution] / maxRatingCount) * 100}%` }"
              ></div>
            </div>
            <div class="bar-value">{{ ratingDistribution[star as keyof typeof ratingDistribution] }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-section {
  text-align: center;
  margin: 60px 0 40px;
}
.page-title {
  font-size: 3.5rem;
  margin-bottom: 16px;
}
.subtitle {
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}
.metric-card {
  padding: 30px;
  text-align: center;
  border-radius: 16px;
  background: var(--card-bg-fallback);
}
.metric-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}
.metric-value {
  font-size: 4rem;
  font-weight: 800;
  font-family: var(--font-heading);
  line-height: 1;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}
.metric-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 12px;
}
.metric-sub {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.chart-section {
  padding: 40px;
  background: var(--card-bg-fallback);
  border-radius: 16px;
}
.chart-section h2 {
  margin-bottom: 30px;
  text-align: center;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bar-label {
  width: 70px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: right;
}
.bar-track {
  flex: 1;
  height: 24px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-secondary), var(--color-primary));
  border-radius: 12px;
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
}
.bar-value {
  width: 30px;
  font-weight: bold;
}

.loading-state {
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
