<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMovies, fetchBooks } from '../services/api'
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'

const { data: movies, isLoading: loadingMovies } = useQuery({ queryKey: ['movies'], queryFn: fetchMovies })
const { data: books, isLoading: loadingBooks } = useQuery({ queryKey: ['books'], queryFn: fetchBooks })

const timelineItems = computed(() => {
  const all = [
    ...(movies.value || []).map(m => ({ 
      ...m, 
      type: 'movies', 
      year: m.releaseYear, 
      displayTitle: m.title, 
      displayCreator: m.director, 
      image: m.posterUrl 
    })),
    ...(books.value || []).map(b => ({ 
      ...b, 
      type: 'books', 
      year: b.publishYear, 
      displayTitle: b.title, 
      displayCreator: b.author, 
      image: b.coverUrl 
    }))
  ]
  // Sort strictly by historical year
  return all.sort((a, b) => a.year - b.year)
})

useHead({
  title: 'History Timeline | Literary Noir',
})

</script>

<template>
  <div class="timeline-page animate-fade-in">
    <div class="category-header">
      <div class="container">
        <h1 class="page-title">The Archives Timeline</h1>
        <p class="subtitle">A historical journey through cinema and literature.</p>
        <div class="divider-dark"></div>
      </div>
    </div>

    <div v-if="loadingMovies || loadingBooks" class="loading">Mapping history...</div>
    
    <div v-else class="timeline-container">
      <div class="timeline-line"></div>
      
      <div class="timeline-items">
        <div 
          v-for="(item, index) in timelineItems" 
          :key="item.type + item.id"
          class="timeline-node"
          :class="{ 'node-left': index % 2 === 0, 'node-right': index % 2 !== 0 }"
        >
          <div class="node-marker"></div>
          <div class="node-content">
            <span class="node-year">{{ item.year }}</span>
            <RouterLink :to="`/review/${item.type}/${item.id}`" class="node-card">
              <div class="card-image">
                <img v-if="item.image" :src="item.image" :alt="item.displayTitle" />
                <div v-else class="placeholder-img"></div>
              </div>
              <div class="card-text">
                <span class="category-tag">{{ item.type === 'movies' ? 'Cinema' : 'Literature' }}</span>
                <h3 class="card-title">{{ item.displayTitle }}</h3>
                <p class="card-creator">By {{ item.displayCreator }}</p>
                <div class="star-rating">
                  {{ '★'.repeat(Math.round(item.rating / 2)) }}{{ '☆'.repeat(5 - Math.round(item.rating / 2)) }}
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
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
  margin-bottom: 8px;
}

.subtitle {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.timeline-container {
  position: relative;
  max-width: 1000px;
  margin: 0 auto 100px;
  padding: 40px 20px;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background-color: var(--color-border-dark);
  transform: translateX(-50%);
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.timeline-node {
  position: relative;
  width: 50%;
  display: flex;
  align-items: center;
}

.node-left {
  left: 0;
  justify-content: flex-end;
  padding-right: 60px;
}

.node-right {
  left: 50%;
  justify-content: flex-start;
  padding-left: 60px;
}

.node-marker {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-accent);
  top: 50%;
  transform: translateY(-50%);
}

.node-left .node-marker {
  right: -8px;
}

.node-right .node-marker {
  left: -8px;
}

.node-content {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.node-year {
  position: absolute;
  top: -40px;
  font-size: 3rem;
  font-weight: 900;
  color: rgba(255,255,255,0.05); /* very subtle watermark */
  z-index: 0;
  letter-spacing: -0.05em;
}

.node-left .node-year { right: 0; }
.node-right .node-year { left: 0; }

.node-card {
  display: flex;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1;
  position: relative;
}

.node-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.card-image {
  flex: 0 0 100px;
  background-color: #e4e4e7;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: filter 0.5s ease;
}

.node-card:hover .card-image img {
  filter: grayscale(0%);
}

.card-text {
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  margin-bottom: 4px;
}

.card-title {
  font-size: 1.2rem;
  color: var(--color-text-main);
  margin-bottom: 4px;
}

.card-creator {
  font-family: var(--font-serif);
  font-size: 0.9rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.star-rating {
  color: var(--color-accent);
  font-size: 0.8rem;
  letter-spacing: 2px;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .timeline-line {
    left: 20px;
  }
  
  .timeline-node {
    width: 100%;
    left: 0 !important;
    justify-content: flex-start !important;
    padding-left: 60px !important;
    padding-right: 0 !important;
  }
  
  .node-marker {
    left: 12px !important;
    right: auto !important;
  }
  
  .node-year {
    left: 0 !important;
    right: auto !important;
  }
}
</style>
