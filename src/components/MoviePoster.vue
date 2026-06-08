<template>
  <img 
    v-if="currentSrc" 
    :src="currentSrc" 
    :alt="title || 'Movie Poster'" 
    @error="handleImageError"
    :class="customClass"
    loading="lazy"
  />
  <div v-else :class="['fallback-poster', customClass]">
    <span v-if="loading">Loading...</span>
    <span v-else>No Image</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { getMoviePoster } from '../services/tmdb';

const props = defineProps<{
  src?: string | null;
  title: string;
  year?: number;
  customClass?: string;
}>();

const currentSrc = ref<string | null>(props.src || null);
const loading = ref(false);
const hasAttemptedFallback = ref(false);

const loadFallback = async () => {
  if (hasAttemptedFallback.value) return;
  hasAttemptedFallback.value = true;
  loading.value = true;
  
  try {
    const tmdbUrl = await getMoviePoster(props.title, props.year);
    if (tmdbUrl) {
      currentSrc.value = tmdbUrl;
    } else {
      currentSrc.value = null; // Show "No Image" fallback
    }
  } catch (error) {
    console.error('Error loading fallback poster:', error);
    currentSrc.value = null;
  } finally {
    loading.value = false;
  }
};

const handleImageError = () => {
  if (!hasAttemptedFallback.value) {
    loadFallback();
  } else {
    currentSrc.value = null; // Even the fallback failed
  }
};

// React to prop changes (e.g., when editing a review and the title changes)
watch(() => props.src, (newSrc) => {
  currentSrc.value = newSrc || null;
  hasAttemptedFallback.value = false; // Reset fallback state for new src
});

onMounted(() => {
    // If initially empty, try TMDB right away
    if(!currentSrc.value) {
        loadFallback();
    }
});
</script>

<style scoped>
.fallback-poster {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0; /* Or use a subtle pattern/gradient */
  color: #666;
  font-size: 0.9em;
  text-align: center;
  width: 100%;
  height: 100%;
  min-height: 200px; /* Adjust based on your typical poster size */
  object-fit: cover;
  border-radius: inherit; /* Inherit border-radius from parent or customClass */
}
</style>
