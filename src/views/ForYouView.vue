<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchRecommendations, type RecommendationItem } from '../services/recommendation.service'
import RecommendationCard from '../components/RecommendationCard.vue'
import SkeletonCard from '../components/SkeletonCard.vue'

const items = ref<RecommendationItem[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    items.value = await fetchRecommendations()
  } catch (err: any) {
    error.value = err.message || 'Failed to load recommendations'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="for-you-container page-transition">
    <header class="page-header">
      <h1 class="gradient-text">For You</h1>
      <p class="subtitle">Personalized recommendations based on what you love.</p>
    </header>

    <div v-if="loading" class="feed-grid">
      <SkeletonCard v-for="n in 6" :key="n" type="mixed" />
    </div>
    
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else-if="items.length === 0" class="empty-state">
      No recommendations available right now. Explore the site to build your profile!
    </div>

    <TransitionGroup v-else name="stagger" tag="div" class="feed-grid">
      <RecommendationCard 
        v-for="item in items" 
        :key="item.type + '-' + item.id" 
        :item="item" 
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.for-you-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.gradient-text {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-muted);
  font-size: 1.2rem;
}

.stagger-enter-active,
.stagger-leave-active {
  transition: all 0.5s ease;
}
.stagger-enter-from,
.stagger-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.stagger-leave-active {
  position: absolute;
}

@media (max-width: 768px) {
  .gradient-text {
    font-size: 2.5rem;
  }
}
</style>
