<script setup lang="ts">
import type { Post } from '../services/api'

defineProps<{
  post: Post
}>()

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>

<template>
  <router-link :to="`/post/${post.id}`" class="post-card glass-panel">
    <div class="card-content">
      <div class="meta">
        <span class="status" :class="post.status.toLowerCase()">{{ post.status }}</span>
        <span class="date" v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
      </div>
      <h3 class="title">{{ post.title }}</h3>
      <p class="excerpt">{{ post.content.substring(0, 100) }}...</p>
      
      <div class="read-more">
        Read Article <span class="arrow">→</span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.post-card {
  display: block;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.post-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--glow-shadow);
  border-color: rgba(236, 72, 153, 0.3);
}

.card-content {
  padding: 32px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status {
  padding: 4px 12px;
  border-radius: 999px;
  text-transform: capitalize;
}

.status.published {
  background: rgba(6, 182, 212, 0.2);
  color: var(--color-accent);
}

.status.draft {
  background: rgba(148, 163, 184, 0.2);
  color: var(--color-text-muted);
}

.date {
  color: var(--color-text-muted);
}

.title {
  font-size: 1.5rem;
  margin-bottom: 16px;
  transition: color 0.2s ease;
}

.post-card:hover .title {
  color: var(--color-primary);
}

.excerpt {
  color: var(--color-text-muted);
  margin-bottom: 24px;
  flex-grow: 1;
}

.read-more {
  display: flex;
  align-items: center;
  color: var(--color-secondary);
  font-weight: 600;
  font-size: 0.95rem;
}

.arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.post-card:hover .arrow {
  transform: translateX(4px);
}
</style>
