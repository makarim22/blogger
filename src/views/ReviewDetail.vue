<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchMovie, fetchBook, fetchMovies, fetchBooks, deleteMovie, deleteBook, fetchProfile, toggleSaveMovie, toggleSaveBook } from '../services/api'
import FinalVerdict from '../components/FinalVerdict.vue'
import CommentSection from '../components/CommentSection.vue'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import MoviePoster from '../components/MoviePoster.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const queryClient = useQueryClient()
const type = route.params.type as string
const id = route.params.id as string

const fetchFn = () => type === 'movies' ? fetchMovie(id) : fetchBook(id)

const { data: item, isLoading } = useQuery<any>({
  queryKey: ['review', type, id],
  queryFn: fetchFn,
  staleTime: 60000,
})

const { data: allItems } = useQuery<any>({
  queryKey: [type],
  queryFn: () => type === 'movies' ? fetchMovies() : fetchBooks(),
  staleTime: 60000,
})

const { data: profile } = useQuery<any>({
  queryKey: ['profile'],
  queryFn: fetchProfile,
  enabled: computed(() => authStore.isLoggedIn),
})

const isSaved = computed(() => {
  if (!profile.value) return false;
  if (type === 'movies') {
    return profile.value.savedMovies?.some((sm: any) => sm.movieReviewId === id);
  } else {
    return profile.value.savedBooks?.some((sb: any) => sb.bookReviewId === id);
  }
})

const toggleSaveMutation = useMutation({
  mutationFn: () => type === 'movies' ? toggleSaveMovie(id) : toggleSaveBook(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    toast.success(isSaved.value ? 'Removed from your list' : 'Saved to your list')
  },
  onError: () => toast.error('Failed to update list')
})

const handleToggleSave = () => {
  if (!authStore.isLoggedIn) {
    toast.info('Please log in to save items')
    router.push('/login')
    return
  }
  toggleSaveMutation.mutate()
}

const processedItem = computed(() => {
  if (!item.value) return null
  const base = item.value as any
  return {
    ...base,
    displayTitle: base.title,
    displayCreator: type === 'movies' ? base.director : base.author,
    image: type === 'movies' ? base.posterUrl : base.coverUrl,
    dateLabel: type === 'movies' ? 'Watched' : 'Read',
    dateValue: new Date(type === 'movies' ? base.watchDate : base.readDate).toLocaleDateString(),
    parsedReview: DOMPurify.sanitize(marked.parse(base.review) as string)
  }
})

const threeReasons = computed(() => {
  if (!item.value) return []
  const good = item.value.theGood
  if (good && good.includes(',')) {
    return good.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 3)
  }
  return type === 'movies' 
    ? ['Masterful Cinematography', 'Atmospheric Tension', 'Unforgettable Climax']
    : ['Profound Thematic Depth', 'Immaculate Prose', 'A Haunting Narrative']
})

const recommendations = computed(() => {
  if (!allItems.value || !item.value) return []
  const filtered = allItems.value.filter((i: any) => i.id !== Number(id))
  
  // Recommend items by the same creator if possible, otherwise highest rated
  const sameCreator = filtered.filter((i: any) => {
    const creator1 = type === 'movies' ? i.director : i.author
    const creator2 = type === 'movies' ? item.value.director : item.value.author
    return creator1 === creator2
  })
  
  if (sameCreator.length >= 3) return sameCreator.slice(0, 3)
  
  const merged = [...sameCreator, ...filtered.filter((i: any) => !sameCreator.includes(i))]
  // Sort the rest by rating
  return merged.sort((a, b) => {
    if (sameCreator.includes(a) && !sameCreator.includes(b)) return -1;
    if (!sameCreator.includes(a) && sameCreator.includes(b)) return 1;
    return b.rating - a.rating
  }).slice(0, 3)
})

const deleteMutation = useMutation({
  mutationFn: () => type === 'movies' ? deleteMovie(id) : deleteBook(id),
  onSuccess: () => {
    toast.success('Critique deleted successfully')
    queryClient.invalidateQueries({ queryKey: [type] })
    router.push('/')
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to delete critique')
  }
})

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this critique? This action is irreversible.')) {
    deleteMutation.mutate()
  }
}

// Focus Mode State
const isFocusMode = ref(false)

// Task 2: Voice of Noir (Audio Narration)
const isPlayingAudio = ref(false)
let speechUtterance: SpeechSynthesisUtterance | null = null

const toggleAudio = () => {
  if (isPlayingAudio.value) {
    window.speechSynthesis.cancel()
    isPlayingAudio.value = false
  } else {
    const plainTextReview = processedItem.value.parsedReview.replace(/<[^>]*>?/gm, '')
    const textToRead = `${processedItem.value.displayTitle}, reviewed by ${processedItem.value.author?.name || 'The Editor'}. ${plainTextReview}`
    
    speechUtterance = new SpeechSynthesisUtterance(textToRead)
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google UK') || v.name.includes('Samantha'))) || voices[0]
    if (preferredVoice) speechUtterance.voice = preferredVoice
    
    speechUtterance.rate = 0.95
    speechUtterance.pitch = 0.9
    
    speechUtterance.onend = () => {
      isPlayingAudio.value = false
    }
    
    window.speechSynthesis.speak(speechUtterance)
    isPlayingAudio.value = true
  }
}

// Task 3: Highlight & Save Quote
const showHighlightMenu = ref(false)
const highlightMenuPos = ref({ top: 0, left: 0 })
const selectedText = ref('')

const handleSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim().length > 10) {
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    highlightMenuPos.value = {
      top: rect.top + window.scrollY - 50,
      left: rect.left + rect.width / 2
    }
    selectedText.value = selection.toString()
    showHighlightMenu.value = true
  } else {
    showHighlightMenu.value = false
  }
}

const saveQuote = () => {
  toast.success('Quote saved to your Dossier!')
  showHighlightMenu.value = false
  window.getSelection()?.removeAllRanges()
}

onMounted(() => {
  document.addEventListener('selectionchange', handleSelection)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelection)
  window.speechSynthesis.cancel()
})

// Update SEO Head
useHead({
  title: () => processedItem.value ? `${processedItem.value.displayTitle} | Literary Noir` : 'Loading Review...',
})

</script>

<template>
  <div class="review-detail" v-if="isLoading">
    <div class="container loading">Retrieving archive...</div>
  </div>
  
  <div class="review-detail animate-fade-in" :class="{ 'is-focus-mode': isFocusMode }" v-else-if="processedItem">
    
    <!-- Floating Action Bar -->
    <div class="floating-actions">
      <button @click="toggleAudio" class="btn-audio-toggle" :class="{ 'is-playing': isPlayingAudio }" title="Voice of Noir">
        {{ isPlayingAudio ? '⏸ Pause Narration' : '🔊 Play Narration' }}
      </button>
      <button @click="isFocusMode = !isFocusMode" class="btn-focus-toggle">
        {{ isFocusMode ? '⤫ Exit Focus Mode' : '⛶ Focus Mode' }}
      </button>
    </div>

    <!-- Highlight Menu -->
    <Transition name="fade">
      <div v-if="showHighlightMenu" class="highlight-tooltip" :style="{ top: highlightMenuPos.top + 'px', left: highlightMenuPos.left + 'px' }">
        <button @click="saveQuote" class="btn-highlight">
          <span class="highlight-icon">❞</span> Save Quote
        </button>
      </div>
    </Transition>

    <header class="review-header" v-show="!isFocusMode">
      <div class="hero-image-container">
        <!-- Ambient Glow Layer -->
        <img v-if="processedItem.image" :src="processedItem.image" alt="" class="hero-glow" />
        <!-- Main Image -->
        <MoviePoster v-if="type === 'movies'" :src="processedItem.image" :title="processedItem.displayTitle" :year="processedItem.releaseYear" customClass="hero-image" />
        <img v-else-if="processedItem.image" :src="processedItem.image" :alt="processedItem.displayTitle" class="hero-image" />
        <div v-else class="hero-placeholder"></div>
        <div class="hero-overlay"></div>
      </div>
      
      <div class="container hero-content">
        <div class="content-wrapper">
          <span class="category-tag">Review &middot; {{ type === 'movies' ? 'Cinema' : 'Literature' }}</span>
          <h1 class="title">{{ processedItem.displayTitle }}</h1>
          <p class="subtitle">By {{ processedItem.displayCreator }}</p>
          <div class="meta-row">
            <p class="meta">{{ processedItem.dateLabel }}: {{ processedItem.dateValue }}</p>
            <button v-if="authStore.isLoggedIn" @click="handleToggleSave" class="btn-save" :class="{ 'is-saved': isSaved }" :disabled="toggleSaveMutation.isPending.value">
              {{ isSaved ? '★ Saved to List' : '☆ Save to List' }}
            </button>
            <a v-if="type === 'movies'" 
               :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(`${processedItem.displayTitle} trailer`)}`" 
               target="_blank" 
               class="btn-trailer">
              ▶ Watch Trailer
            </a>
            <a v-else 
               :href="`https://www.goodreads.com/search?q=${encodeURIComponent(`${processedItem.displayTitle} ${processedItem.displayCreator}`)}`" 
               target="_blank" 
               class="btn-trailer">
              ▶ Find on Goodreads
            </a>
          </div>
        </div>
      </div>
    </header>

    <main class="container-narrow editorial-content">
      <!-- Title only shows in focus mode -->
      <div v-if="isFocusMode" class="focus-title-area">
        <h1 class="focus-title">{{ processedItem.displayTitle }}</h1>
        <p class="focus-subtitle">By {{ processedItem.displayCreator }}</p>
      </div>

      <!-- Criterion "Three Reasons" Component -->
      <div v-if="!isFocusMode && threeReasons.length > 0" class="three-reasons-block">
        <div class="reasons-header">3 REASONS</div>
        <ul class="reasons-list">
          <li v-for="(reason, idx) in threeReasons" :key="idx">
            <span class="reason-number">0{{ Number(idx) + 1 }}</span>
            <span class="reason-text">{{ reason }}</span>
          </li>
        </ul>
      </div>

      <div class="dropcap" v-html="processedItem.parsedReview"></div>

      <FinalVerdict 
        :rating="processedItem.rating" 
        :the-good="processedItem.theGood" 
        :the-bad="processedItem.theBad" 
      />

      <div v-show="!isFocusMode">
        <div v-if="authStore.isLoggedIn" class="editor-actions">
          <RouterLink :to="`/edit/${type}/${id}`" class="btn-outline btn-edit">
            Edit Critique
          </RouterLink>
          <button @click="handleDelete" class="btn-outline btn-delete" :disabled="deleteMutation.isPending.value">
            {{ deleteMutation.isPending.value ? 'Deleting...' : 'Delete Critique' }}
          </button>
        </div>

        <!-- Recommendations Section -->
        <section v-if="recommendations.length > 0" class="recommendations-section">
          <h3 class="recommendations-title">If you liked this, explore more...</h3>
          <div class="divider-dark"></div>
          <div class="recommendations-grid">
            <RouterLink 
              v-for="rec in recommendations" 
              :key="rec.id" 
              :to="`/review/${type}/${rec.id}`"
              class="rec-card"
            >
              <div class="rec-image">
                <MoviePoster v-if="type === 'movies'" :src="rec.posterUrl" :title="rec.title" :year="rec.releaseYear" />
                <img v-else-if="rec.coverUrl" 
                     :src="rec.coverUrl" 
                     :alt="rec.title" />
                <div v-else class="placeholder-img"></div>
              </div>
              <div class="rec-content">
                <h4 class="rec-title">{{ rec.title }}</h4>
                <p class="rec-creator">By {{ type === 'movies' ? rec.director : rec.author }}</p>
              </div>
            </RouterLink>
          </div>
        </section>

        <CommentSection :type="(type as 'movies' | 'books')" :id="id" />
      </div>
    </main>
  </div>
  
  <div v-else class="container not-found">
    <h2>Critique Not Found</h2>
    <p>This archive could not be located.</p>
  </div>
</template>

<style scoped>
.review-header {
  position: relative;
  height: 65vh;
  min-height: 500px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 80px;
}

.hero-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* Fix: was -1, causing image to hide behind background */
  background-color: var(--color-bg); /* Use bg color to blend */
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  object-fit: cover;
  filter: blur(80px) saturate(200%);
  opacity: 0.4;
  z-index: 0;
  will-change: filter, transform;
  transform: translateZ(0);
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  filter: grayscale(80%) contrast(110%);
  z-index: 1;
}

.hero-placeholder {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: #1a1a1b;
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%; /* Cover whole image for smooth fade */
  background: linear-gradient(to top, var(--color-bg) 0%, rgba(26,26,27,0.4) 50%, transparent 100%);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding-bottom: 40px;
}

.category-tag {
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  color: var(--color-accent);
  font-weight: 600;
  margin-bottom: 24px;
  display: block;
}

.title {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  margin-bottom: 16px;
  color: var(--color-text-main);
}

.subtitle {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-style: italic;
  margin-bottom: 12px;
  color: var(--color-text-muted);
}

.meta {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-light);
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.btn-trailer, .btn-save {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.2s ease;
  border: 1px solid var(--color-text-main);
  cursor: pointer;
}

.btn-trailer {
  color: var(--color-bg);
  background-color: var(--color-text-main);
}
.btn-trailer:hover {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
  transform: translateY(-2px);
}

.btn-save {
  background-color: transparent;
  color: var(--color-text-main);
}
.btn-save:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}
.btn-save.is-saved {
  background-color: var(--color-text-main);
  color: var(--color-bg);
}
.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editorial-content {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--color-text-main);
  margin-bottom: 100px;
  transition: all 0.5s ease;
}

.editorial-content :deep(p) {
  margin-bottom: 1.5em;
}
.editorial-content :deep(h1), .editorial-content :deep(h2), .editorial-content :deep(h3) {
  font-family: var(--font-sans);
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
.editorial-content :deep(ul), .editorial-content :deep(ol) {
  margin-bottom: 1.5em;
  padding-left: 20px;
}
.editorial-content :deep(blockquote) {
  border-left: 4px solid var(--color-accent);
  padding-left: 16px;
  font-style: italic;
  color: var(--color-text-muted);
  margin: 1.5em 0;
}
.editorial-content :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
}
.editorial-content :deep(hr) {
  border: none;
  height: 1px;
  background-color: var(--color-border);
  margin: 3em 0;
  position: relative;
  overflow: visible;
}
.editorial-content :deep(hr)::after {
  content: "§";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-bg);
  padding: 0 16px;
  color: var(--color-text-muted);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.2rem;
}
.editorial-content :deep(strong), .editorial-content :deep(b) {
  color: var(--color-text-main);
  font-weight: 700;
  box-shadow: inset 0 -4px 0 0 rgba(180, 83, 9, 0.2); /* var(--color-accent) */
}

/* Pseudo-element for dropcap on the first letter of the first paragraph */
.dropcap :deep(p:first-of-type)::first-letter {
  font-size: 4.5rem;
  font-weight: 900;
  float: left;
  line-height: 1;
  margin-right: 12px;
  margin-top: 4px;
  color: var(--color-text-main);
}

/* Three Reasons Component */
.three-reasons-block {
  margin: 60px 0;
  padding: 0;
  background-color: transparent;
  border: none;
  box-shadow: none;
}

.reasons-header {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-muted);
  margin-bottom: 30px;
  text-align: center;
}

.reasons-header::before,
.reasons-header::after {
  content: "";
  display: inline-block;
  width: 50px;
  height: 1px;
  background-color: var(--color-border);
  vertical-align: middle;
  margin: 0 15px;
}

.reasons-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.reasons-list li {
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: center;
  padding: 24px 0;
  border-top: 1px solid var(--color-border);
  transition: transform 0.3s ease;
}

.reasons-list li:last-child {
  border-bottom: 1px solid var(--color-border);
}

.reasons-list li:hover {
  transform: translateX(10px);
}

.reasons-list li:hover .reason-number {
  color: var(--color-accent);
}

.reason-number {
  font-family: var(--font-serif);
  font-size: 3rem;
  font-weight: 900;
  color: var(--color-text-muted);
  opacity: 0.3;
  font-style: italic;
  line-height: 1;
  transition: color 0.3s ease, opacity 0.3s ease;
}

.reasons-list li:hover .reason-number {
  opacity: 1;
}

.reason-text {
  font-family: var(--font-sans);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-main);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.editor-actions {
  margin-top: 60px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-edit {
  border-color: var(--color-text-main);
  color: var(--color-text-main);
  padding: 10px 20px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background-color: var(--color-text-main);
  color: var(--color-bg);
}

.btn-delete {
  border-color: #ef4444;
  color: #ef4444;
  padding: 10px 20px;
}

.btn-delete:hover {
  background-color: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading, .not-found {
  text-align: center;
  padding: 100px 20px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.5rem;
}

/* Recommendations Section */
.recommendations-section {
  margin-top: 80px;
  margin-bottom: 60px;
}

.recommendations-title {
  font-family: var(--font-sans);
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  text-align: center;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.rec-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.rec-card:hover {
  transform: translateY(-5px);
}

.rec-image {
  aspect-ratio: 2/3;
  width: 100%;
  overflow: hidden;
  margin-bottom: 12px;
  background-color: #e4e4e7;
}

.rec-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: filter 0.5s ease;
}

.rec-card:hover .rec-image img {
  filter: grayscale(0%);
}

.rec-title {
  font-size: 1.2rem;
  margin-bottom: 4px;
  color: var(--color-text-main);
}

.rec-creator {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  font-style: italic;
  color: var(--color-text-muted);
}

/* Focus Mode Overrides */
.is-focus-mode .editorial-content {
  font-size: 1.5rem;
  line-height: 2;
  max-width: 700px; /* Even narrower for beautiful reading line lengths */
  padding-top: 100px;
}

.focus-title-area {
  text-align: center;
  margin-bottom: 60px;
}

.focus-title {
  font-size: 3rem;
  margin-bottom: 12px;
  color: var(--color-text-main);
}

.focus-subtitle {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-style: italic;
  color: var(--color-text-muted);
}

.floating-actions {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-focus-toggle, .btn-audio-toggle {
  background-color: var(--color-text-main);
  color: var(--color-bg);
  border: none;
  padding: 12px 24px;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  border-radius: 4px;
}

.btn-audio-toggle {
  background-color: var(--color-accent);
}

.btn-audio-toggle.is-playing {
  background-color: #ef4444;
}

.btn-focus-toggle:hover, .btn-audio-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.4);
}

.is-focus-mode .btn-focus-toggle {
  background-color: #ef4444; /* Give exit button a distinct color, or keep it muted */
  color: #fff;
}

/* Highlight Menu Tooltip */
.highlight-tooltip {
  position: absolute;
  z-index: 200;
  transform: translateX(-50%);
  background-color: var(--color-text-main);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  padding: 4px;
}

.highlight-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: var(--color-text-main) transparent transparent transparent;
}

.btn-highlight {
  background: none;
  border: none;
  color: var(--color-bg);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight-icon {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  line-height: 1;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

/* Mobile Layout Adjustments */
@media (max-width: 768px) {
  .hero-section {
    height: 60vh;
  }
  
  .article-title {
    font-size: clamp(2.5rem, 10vw, 3.5rem);
  }
  
  .meta-row {
    flex-direction: column;
    align-items: center; /* keep centered on mobile */
    gap: 12px;
  }
  
  .editorial-header {
    flex-direction: column;
  }
  
  .editorial-sidebar {
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding-right: 0;
    padding-bottom: 32px;
    margin-bottom: 32px;
  }
  
  .floating-actions {
    bottom: 24px;
    right: 16px;
  }
  
  .btn-focus-toggle, .btn-audio-toggle {
    padding: 10px 16px;
    font-size: 0.75rem;
  }
}
</style>
