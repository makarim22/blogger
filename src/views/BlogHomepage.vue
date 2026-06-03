<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMovies, fetchBooks } from '../services/api'
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'
import NewsletterBlock from '../components/NewsletterBlock.vue'

useHead({
  title: 'Literary Noir | Cinematic Ink',
  meta: [
    { name: 'description', content: 'Premium editorial platform for cinematic and literary analysis.' }
  ]
})

const { data: movies, isLoading: loadingMovies } = useQuery({ queryKey: ['movies'], queryFn: fetchMovies })
const { data: books, isLoading: loadingBooks } = useQuery({ queryKey: ['books'], queryFn: fetchBooks })

const latestReviews = computed(() => {
  const all = [
    ...(movies.value || []).map(m => ({ ...m, type: 'movies', date: m.watchDate, displayTitle: m.title, displayCreator: m.director, image: m.posterUrl })),
    ...(books.value || []).map(b => ({ ...b, type: 'books', date: b.readDate, displayTitle: b.title, displayCreator: b.author, image: b.coverUrl }))
  ]
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const heroPick = computed(() => latestReviews.value.length > 0 ? latestReviews.value[0] : null)
const innerCircle = computed(() => latestReviews.value.slice(1, 3)) // Next 2 for Editor's Picks
const gridReviews = computed(() => latestReviews.value.slice(3, 9)) // Next 6 for Latest

const renderStars = (score: number) => {
  // Score is 0-10, we want 1-5 stars
  const stars = Math.round(score / 2);
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

</script>

<template>
  <div class="homepage animate-fade-in">
    <div v-if="loadingMovies || loadingBooks" class="loading">Loading archives...</div>
    
    <template v-else-if="heroPick">
      <!-- Hero Section (Nocturnal Odyssey) -->
      <section class="hero-section">
        <div class="hero-image-container">
          <img v-if="heroPick.image" :src="heroPick.image" alt="Hero Image" class="hero-image" />
          <div v-else class="hero-placeholder"></div>
          <div class="hero-overlay"></div>
        </div>
        
        <div class="container hero-content">
          <span class="category-tag">Cover Story &middot; {{ heroPick.type === 'movies' ? 'Cinema' : 'Literature' }}</span>
          <h1 class="hero-title">{{ heroPick.displayTitle }}</h1>
          <p class="hero-meta">Directed/Authored by {{ heroPick.displayCreator }}</p>
          <RouterLink :to="`/review/${heroPick.type}/${heroPick.id}`" class="btn-outline hero-btn">Read the Critique</RouterLink>
        </div>
      </section>

      <!-- Editor's Picks (The Inner Circle) -->
      <section class="inner-circle-section" v-if="innerCircle.length > 0">
        <div class="container">
          <h2 class="section-title light-text">The Inner Circle</h2>
          <div class="divider-light"></div>
          
          <div class="inner-circle-grid">
            <RouterLink 
              v-for="item in innerCircle" 
              :key="item.id" 
              :to="`/review/${item.type}/${item.id}`"
              class="inner-card"
            >
              <div class="inner-card-content">
                <span class="category-tag">{{ item.type === 'movies' ? 'Cinema' : 'Literature' }}</span>
                <h3 class="inner-title">{{ item.displayTitle }}</h3>
                <blockquote class="inner-quote">
                  "{{ item.theGood || item.review.substring(0, 80) }}..."
                </blockquote>
                <div class="star-rating">{{ renderStars(item.rating) }}</div>
              </div>
              <div class="inner-card-image">
                <img v-if="item.image" :src="item.image" :alt="item.displayTitle" />
                <div v-else class="placeholder-img-dark"></div>
              </div>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Latest Grid (Feed Review) -->
      <section class="container recent-section">
        <h2 class="section-title">Latest Reviews</h2>
        <div class="divider-dark"></div>
        
        <div class="article-grid">
          <RouterLink 
            v-for="item in gridReviews" 
            :key="item.id" 
            :to="`/review/${item.type}/${item.id}`"
            class="article-card"
          >
            <div class="card-image">
              <img v-if="item.image" :src="item.image" :alt="item.displayTitle" />
              <div v-else class="placeholder-img"></div>
            </div>
            <div class="card-content">
              <div class="card-header">
                <span class="card-category">{{ item.type === 'movies' ? 'Cinema' : 'Literature' }}</span>
                <span class="star-rating">{{ renderStars(item.rating) }}</span>
              </div>
              <h3 class="card-title">{{ item.displayTitle }}</h3>
              <p class="card-excerpt">{{ item.review.substring(0, 100) }}...</p>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="container">
        <NewsletterBlock />
      </section>
    </template>
    
    <div v-else class="container empty-state">
      <p>The archives are empty.</p>
    </div>
  </div>
</template>

<style scoped>
/* Hero Section */
.hero-section {
  position: relative;
  height: 85vh;
  min-height: 600px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 0; /* Connected to inner circle */
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
  opacity: 0.7;
  filter: grayscale(60%) contrast(120%);
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #27272a 0%, #000 100%);
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80%;
  background: linear-gradient(to top, #1a1a1b 0%, transparent 100%);
}

.hero-content {
  padding-bottom: 80px;
  position: relative;
  z-index: 2;
  width: 100%;
  text-shadow: 0 4px 20px rgba(0,0,0,0.8);
}

.category-tag {
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  color: var(--color-accent);
  font-weight: 700;
  margin-bottom: 16px;
  display: block;
}

.hero-title {
  font-size: clamp(3.5rem, 7vw, 6rem);
  margin-bottom: 16px;
  max-width: 900px;
  color: #f9f9f7;
  line-height: 1.1;
}

.hero-meta {
  font-family: var(--font-sans);
  font-size: 1.1rem;
  margin-bottom: 40px;
  color: #e4e4e7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-btn {
  border-color: #f9f9f7;
  color: #f9f9f7;
}
.hero-btn:hover {
  background-color: #f9f9f7;
  color: #1a1a1b;
}

/* Inner Circle Section */
.inner-circle-section {
  background-color: #1a1a1b; /* Deep Charcoal */
  color: #f9f9f7;
  padding: 80px 0 100px;
}

.light-text {
  color: #f9f9f7;
}

.divider-light {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  width: 100%;
  margin: 30px 0 50px;
}

.inner-circle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}

@media (min-width: 900px) {
  .inner-circle-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.inner-card {
  display: flex;
  flex-direction: column-reverse;
  background-color: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  transition: transform 0.3s ease;
}
.inner-card:hover {
  transform: translateY(-5px);
}

@media (min-width: 600px) {
  .inner-card {
    flex-direction: row;
    height: 250px;
  }
}

.inner-card-content {
  padding: 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.inner-title {
  font-size: 1.8rem;
  margin-bottom: 16px;
  color: #f9f9f7;
}

.inner-quote {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.1rem;
  color: #a1a1aa;
  margin-bottom: 16px;
  border-left: 2px solid var(--color-accent);
  padding-left: 16px;
}

.inner-card-image {
  flex: 0 0 200px;
}

.inner-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(80%);
}

.placeholder-img-dark {
  width: 100%;
  height: 100%;
  background: #27272a;
}

/* Common star rating */
.star-rating {
  color: var(--color-accent);
  letter-spacing: 0.1em;
  font-size: 1.1rem;
}

/* Recent Section */
.recent-section {
  padding-top: 80px;
}

.section-title {
  font-size: 2.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 50px 40px;
  margin-bottom: 80px;
}

.article-card {
  display: flex;
  flex-direction: column;
}

.card-image {
  aspect-ratio: 16/10;
  width: 100%;
  overflow: hidden;
  margin-bottom: 24px;
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
  transform: scale(1.03);
}

.placeholder-img {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f4f4f5, #e4e4e7);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-category {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  font-weight: 700;
}

.card-title {
  font-size: 1.6rem;
  margin-bottom: 12px;
}

.card-excerpt {
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1.6;
}

.loading, .empty-state {
  text-align: center;
  padding: 100px 20px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.5rem;
}
</style>
