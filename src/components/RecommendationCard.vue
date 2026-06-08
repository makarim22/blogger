<script setup lang="ts">
import type { RecommendationItem } from '../services/recommendation.service'
import MoviePoster from './MoviePoster.vue'

defineProps<{
  item: RecommendationItem
}>()

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>

<template>
  <router-link 
    :to="item.type === 'post' ? `/post/${item.id}` : item.type === 'movie' ? `/review/movies/${item.id}` : `/review/books/${item.id}`" 
    class="recommendation-card glass-panel"
  >
    <div v-if="item.type === 'movie' || item.type === 'book'" class="media-container">
      <MoviePoster 
        v-if="item.type === 'movie'"
        :src="item.posterUrl" 
        :title="item.title" 
        customClass="media-image" 
      />
      <img v-else-if="item.type === 'book' && item.coverUrl" :src="item.coverUrl" class="media-image" />
      <div v-else class="media-image fallback">No Cover</div>
      <div class="rating-badge" v-if="item.rating">★ {{ item.rating }}/10</div>
    </div>

    <div class="card-content">
      <div class="meta">
        <span class="type-badge" :class="item.type">{{ item.type }}</span>
        <span class="date">{{ formatDate(item.createdAt) }}</span>
      </div>
      <h3 class="title">{{ item.title }}</h3>
      
      <p class="excerpt" v-if="item.type === 'post'">
        {{ item.content?.substring(0, 80) }}...
      </p>
      <p class="excerpt" v-else-if="item.type === 'movie'">
        Director: {{ item.director }}
      </p>
      <p class="excerpt" v-else-if="item.type === 'book'">
        Author: {{ item.bookAuthor || item.author?.name || 'Unknown' }}
      </p>

      <div class="tags" v-if="item.tags && item.tags.length">
        <span class="tag" v-for="tag in item.tags.slice(0, 3)" :key="tag.name">
          #{{ tag.name }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.recommendation-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.recommendation-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--glow-shadow);
  border-color: rgba(236, 72, 153, 0.3);
}

.media-container {
  position: relative;
  height: 200px;
  width: 100%;
  overflow: hidden;
  background: #1e293b;
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.rating-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: #fbbf24;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
}

.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.7rem;
}

.type-badge.post { background: rgba(6, 182, 212, 0.2); color: #06b6d4; }
.type-badge.movie { background: rgba(236, 72, 153, 0.2); color: #ec4899; }
.type-badge.book { background: rgba(16, 185, 129, 0.2); color: #10b981; }

.date {
  color: var(--color-text-muted);
}

.title {
  font-size: 1.25rem;
  margin-bottom: 12px;
  transition: color 0.2s ease;
  line-height: 1.4;
}

.recommendation-card:hover .title {
  color: var(--color-primary);
}

.excerpt {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 16px;
  flex-grow: 1;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.tag {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-muted);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}
</style>
