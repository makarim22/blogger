<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPost, type Post } from '../services/api'

const route = useRoute()
const router = useRouter()
const post = ref<Post | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  post.value = await fetchPost(id)
  loading.value = false
})

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>

<template>
  <div class="post-page container animate-fade-in">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="!post" class="error-state glass-panel">
      <h2>Post not found</h2>
      <button @click="router.push('/')" class="btn-primary mt-4">Return Home</button>
    </div>

    <article v-else class="article-content">
      <header class="article-header">
        <div class="meta">
          <span class="status" :class="post.status.toLowerCase()">{{ post.status }}</span>
          <span class="date" v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
        </div>
        <h1 class="title">{{ post.title }}</h1>
      </header>
      
      <div class="article-body glass-panel" v-html="post.content"></div>
    </article>
  </div>
</template>

<style scoped>
.post-page {
  max-width: 800px;
  margin: 0 auto;
}

.article-header {
  margin-bottom: 40px;
  text-align: center;
}

.meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  font-weight: 500;
}

.status {
  padding: 4px 12px;
  border-radius: 999px;
  text-transform: capitalize;
  font-size: 0.9rem;
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
  font-size: 3.5rem;
  line-height: 1.1;
  background: linear-gradient(to right, #fff, var(--color-text-muted));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.article-body {
  padding: 60px;
  font-size: 1.125rem;
  line-height: 1.8;
}

.article-body :deep(p) {
  margin-bottom: 1.5em;
}

.article-body :deep(h2), .article-body :deep(h3) {
  margin-top: 2em;
  margin-bottom: 1em;
  color: #fff;
}

/* Utilities */
.mt-4 { margin-top: 24px; }

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(139, 92, 246, 0.2);
  border-top-color: var(--color-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .title {
    font-size: 2.2rem;
  }
  .article-body {
    padding: 30px;
  }
}
</style>
