<script setup lang="ts">
import { computed } from 'vue'
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
    // Sort by whichever property represents the 'saved' date, or just rating
    return b.rating - a.rating;
  })
})

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
            <span class="stat-number">{{ savedMovies.length }}</span>
            <span class="stat-label">Saved Cinema</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ savedBooks.length }}</span>
            <span class="stat-label">Saved Literature</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ allSavedItems.length }}</span>
            <span class="stat-label">Total Archives</span>
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
            <RouterLink 
              v-for="item in allSavedItems" 
              :key="item.id" 
              :to="`/review/${item.type}/${item.id}`"
              class="article-card"
            >
              <div class="card-image">
                <img v-if="item.image" :src="item.image" :alt="item.displayTitle" />
                <div v-else class="placeholder-img"></div>
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ item.displayTitle }}</h3>
                <p class="card-creator">By {{ item.displayCreator }}</p>
                <p class="card-score">Score: {{ item.rating }}/10</p>
              </div>
            </RouterLink>
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
</style>
