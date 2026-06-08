<script setup lang="ts">
// Reusable Skeleton loader card matching RecommendationCard & PostCard
defineProps({
  type: {
    type: String,
    default: 'mixed', // 'post', 'movie', 'book', 'mixed'
  }
})
</script>

<template>
  <div class="skeleton-card glass-panel">
    <!-- Image/Media skeleton for movies/books/mixed -->
    <div v-if="type !== 'post'" class="skeleton-media skeleton"></div>
    
    <!-- Content skeleton -->
    <div class="skeleton-content">
      <div class="skeleton-meta skeleton"></div>
      <div class="skeleton-title skeleton"></div>
      <div class="skeleton-subtitle skeleton"></div>
      <div class="skeleton-tags">
        <div class="skeleton-tag skeleton"></div>
        <div class="skeleton-tag skeleton"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 250px;
  overflow: hidden;
  border-radius: 8px; /* matching RecommendationCard */
}

.skeleton-media {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.skeleton-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}

.skeleton-meta {
  width: 40%;
  height: 14px;
  border-radius: 4px;
}

.skeleton-title {
  width: 80%;
  height: 24px;
  border-radius: 4px;
  margin-top: 4px;
}

.skeleton-subtitle {
  width: 60%;
  height: 16px;
  border-radius: 4px;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
}

.skeleton-tag {
  width: 60px;
  height: 24px;
  border-radius: 12px;
}
</style>
