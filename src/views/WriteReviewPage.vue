<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { createMovie, createBook, fetchMovie, fetchBook, updateMovie, updateBook, uploadImage } from '../services/api'
import { useHead } from '@unhead/vue'
import { toast } from 'vue3-toastify'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const type = computed(() => route.params.type as 'movies' | 'books')
const isMovie = computed(() => type.value === 'movies')
const isEdit = computed(() => route.name === 'edit')
const id = computed(() => route.params.id as string)

// Fetch existing review for editing
const { data: existingReview, isLoading: isLoadingExisting } = useQuery<any>({
  queryKey: computed(() => ['review', type.value, id.value]),
  queryFn: () => type.value === 'movies' ? fetchMovie(id.value) : fetchBook(id.value),
  enabled: computed(() => isEdit.value && !!id.value),
  staleTime: 0,
})

// Form state
const title = ref('')
const creator = ref('')
const year = ref<number>(new Date().getFullYear())
const rating = ref<number>(8)
const theGood = ref('')
const theBad = ref('')
const review = ref('')
const selectedFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const isSubmitting = ref(false)

const activeTab = ref<'write' | 'preview'>('write')
const parsedReviewPreview = computed(() => {
  if (!review.value) return ''
  return DOMPurify.sanitize(marked.parse(review.value) as string)
})

// Populate form state in edit mode
watch(existingReview, (newVal) => {
  if (newVal) {
    title.value = newVal.title
    creator.value = isMovie.value ? newVal.director : newVal.author
    year.value = isMovie.value ? newVal.releaseYear : newVal.publishYear
    rating.value = newVal.rating
    theGood.value = newVal.theGood || ''
    theBad.value = newVal.theBad || ''
    review.value = newVal.review
    imagePreviewUrl.value = isMovie.value ? newVal.posterUrl || null : newVal.coverUrl || null
  }
}, { immediate: true })

useHead({
  title: () => {
    if (isEdit.value) {
      return isMovie.value ? 'Edit Cinema Critique | Literary Noir' : 'Edit Literature Critique | Literary Noir'
    }
    return isMovie.value ? 'Write Cinema Critique | Literary Noir' : 'Write Literature Critique | Literary Noir'
  }
})

// Star rating display (convert 10-scale to 5-star)
const starDisplay = computed(() => {
  const stars = Math.round(rating.value / 2)
  return { filled: stars, empty: 5 - stars }
})

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    imagePreviewUrl.value = URL.createObjectURL(target.files[0])
  }
}

const movieMutation = useMutation({
  mutationFn: createMovie,
  onSuccess: (data) => {
    toast.success('Cinema critique published!')
    queryClient.invalidateQueries({ queryKey: ['movies'] })
    router.push(`/review/movies/${data.id}`)
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to publish critique')
    isSubmitting.value = false
  }
})

const bookMutation = useMutation({
  mutationFn: createBook,
  onSuccess: (data) => {
    toast.success('Literature critique published!')
    queryClient.invalidateQueries({ queryKey: ['books'] })
    router.push(`/review/books/${data.id}`)
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to publish critique')
    isSubmitting.value = false
  }
})

const updateMovieMutation = useMutation({
  mutationFn: (data: any) => updateMovie(id.value, data),
  onSuccess: () => {
    toast.success('Cinema critique updated!')
    queryClient.invalidateQueries({ queryKey: ['movies'] })
    queryClient.invalidateQueries({ queryKey: ['review', 'movies', id.value] })
    router.push(`/review/movies/${id.value}`)
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to update critique')
    isSubmitting.value = false
  }
})

const updateBookMutation = useMutation({
  mutationFn: (data: any) => updateBook(id.value, data),
  onSuccess: () => {
    toast.success('Literature critique updated!')
    queryClient.invalidateQueries({ queryKey: ['books'] })
    queryClient.invalidateQueries({ queryKey: ['review', 'books', id.value] })
    router.push(`/review/books/${id.value}`)
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to update critique')
    isSubmitting.value = false
  }
})

const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    let imageUrl = ''
    if (selectedFile.value) {
      toast.info('Uploading cover image...')
      imageUrl = await uploadImage(selectedFile.value)
    } else if (isEdit.value) {
      imageUrl = imagePreviewUrl.value || ''
    }

    const parsedYear = Number(year.value)
    const parsedRating = Number(rating.value)

    if (isEdit.value) {
      if (isMovie.value) {
        updateMovieMutation.mutate({
          title: title.value,
          director: creator.value,
          releaseYear: parsedYear,
          rating: parsedRating,
          theGood: theGood.value,
          theBad: theBad.value,
          review: review.value,
          posterUrl: imageUrl
        })
      } else {
        updateBookMutation.mutate({
          title: title.value,
          author: creator.value,
          publishYear: parsedYear,
          rating: parsedRating,
          theGood: theGood.value,
          theBad: theBad.value,
          review: review.value,
          coverUrl: imageUrl
        })
      }
    } else {
      if (isMovie.value) {
        movieMutation.mutate({
          title: title.value,
          director: creator.value,
          releaseYear: parsedYear,
          rating: parsedRating,
          theGood: theGood.value,
          theBad: theBad.value,
          review: review.value,
          watchDate: new Date().toISOString(),
          posterUrl: imageUrl
        })
      } else {
        bookMutation.mutate({
          title: title.value,
          author: creator.value,
          publishYear: parsedYear,
          rating: parsedRating,
          theGood: theGood.value,
          theBad: theBad.value,
          review: review.value,
          readDate: new Date().toISOString(),
          coverUrl: imageUrl
        })
      }
    }
  } catch (error: any) {
    toast.error(error.message || 'Error processing request')
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="write-page animate-fade-in">
    <!-- Page header -->
    <div class="write-header">
      <div class="container-narrow">
        <div class="breadcrumb">
          <RouterLink to="/" class="breadcrumb-link">Literary Noir</RouterLink>
          <span class="breadcrumb-sep">/</span>
          <RouterLink :to="isMovie ? '/movies' : '/books'" class="breadcrumb-link">
            {{ isMovie ? 'Cinema' : 'Literature' }}
          </RouterLink>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ isEdit ? 'Edit Critique' : 'New Critique' }}</span>
        </div>

        <div class="type-badge">
          <span class="type-icon">{{ isMovie ? '🎬' : '📖' }}</span>
          <span class="type-label">{{ isMovie ? 'Cinema' : 'Literature' }} Critique</span>
        </div>
      </div>
    </div>

    <div v-if="isEdit && isLoadingExisting" class="container-narrow loading">
      Retrieving archive for edit...
    </div>
    <form v-else @submit.prevent="handleSubmit" class="write-form container-narrow">

      <!-- Cover Image Upload -->
      <div class="cover-upload-area" :class="{ 'has-preview': imagePreviewUrl }">
        <img v-if="imagePreviewUrl" :src="imagePreviewUrl" class="cover-preview" alt="Cover preview" />
        <div class="cover-upload-overlay">
          <label for="cover-upload" class="cover-upload-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>{{ imagePreviewUrl ? 'Change Cover' : 'Upload Cover Image' }}</span>
          </label>
          <input id="cover-upload" type="file" accept="image/*" @change="handleFileChange" />
        </div>
      </div>

      <!-- Title (large editorial style) -->
      <div class="field-group">
        <textarea
          id="write-title"
          v-model="title"
          class="title-input"
          :placeholder="isMovie ? 'Film Title...' : 'Book Title...'"
          required
          rows="2"
        ></textarea>
      </div>

      <!-- Creator & Year row -->
      <div class="meta-row">
        <div class="field-group">
          <label class="field-label">{{ isMovie ? 'Director' : 'Author' }}</label>
          <input
            type="text"
            v-model="creator"
            class="field-input"
            :placeholder="isMovie ? 'e.g. Stanley Kubrick' : 'e.g. Cormac McCarthy'"
            required
          />
        </div>
        <div class="field-group field-group--narrow">
          <label class="field-label">{{ isMovie ? 'Release Year' : 'Publish Year' }}</label>
          <input
            type="number"
            v-model="year"
            class="field-input"
            :min="1888"
            :max="new Date().getFullYear() + 2"
            required
          />
        </div>
      </div>

      <!-- Rating -->
      <div class="field-group">
        <label class="field-label">Score (0 – 10)</label>
        <div class="rating-control">
          <input
            type="range"
            v-model="rating"
            min="0"
            max="10"
            step="1"
            class="rating-slider"
          />
          <div class="rating-display">
            <span class="rating-number">{{ rating }}</span>
            <span class="rating-stars">
              <span v-for="i in starDisplay.filled" :key="'f' + i" class="star filled">★</span>
              <span v-for="i in starDisplay.empty" :key="'e' + i" class="star empty">☆</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="section-divider">
        <span class="divider-text">Verdict Fields</span>
      </div>

      <!-- The Good / The Bad -->
      <div class="verdict-row">
        <div class="field-group">
          <label class="field-label verdict-good">The Good</label>
          <input
            type="text"
            v-model="theGood"
            class="field-input"
            placeholder="What worked brilliantly..."
          />
        </div>
        <div class="field-group">
          <label class="field-label verdict-bad">The Bad</label>
          <input
            type="text"
            v-model="theBad"
            class="field-input"
            placeholder="What fell short..."
          />
        </div>
      </div>

      <!-- Divider -->
      <div class="section-divider">
        <span class="divider-text">The Critique</span>
      </div>

      <!-- Editor Tabs -->
      <div class="editor-tabs">
        <button type="button" class="tab-btn" :class="{'active': activeTab === 'write'}" @click="activeTab = 'write'">Write</button>
        <button type="button" class="tab-btn" :class="{'active': activeTab === 'preview'}" @click="activeTab = 'preview'">Preview</button>
      </div>

      <!-- Review body -->
      <div class="field-group">
        <div v-show="activeTab === 'write'">
          <textarea
            v-model="review"
            class="review-textarea"
            placeholder="Write your full editorial critique using Markdown. The first letter will be displayed as a large drop cap..."
            rows="14"
            required
          ></textarea>
          <p class="review-hint">Markdown supported. {{ review.length }} characters</p>
        </div>
        
        <div v-show="activeTab === 'preview'" class="preview-area editorial-content">
          <div v-if="!review" class="preview-empty">Nothing to preview.</div>
          <div v-else v-html="parsedReviewPreview"></div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-bar">
        <RouterLink :to="isEdit ? `/review/${type}/${id}` : (isMovie ? '/movies' : '/books')" class="btn-outline">
          Discard
        </RouterLink>
        <button
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? (isEdit ? 'Saving...' : 'Publishing...') : (isEdit ? 'Save Changes' : 'Publish Critique') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.write-page {
  min-height: 80vh;
  padding-bottom: 100px;
}

/* Header / Breadcrumb */
.write-header {
  padding: 40px 0 30px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 50px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 20px;
}

.breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--color-text-main);
}

.breadcrumb-sep {
  color: var(--color-text-light);
}

.breadcrumb-current {
  color: var(--color-text-main);
  font-weight: 600;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--color-text-main);
  padding: 8px 16px;
}

.type-icon {
  font-size: 1.2rem;
}

.type-label {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
  color: var(--color-text-main);
}

/* Form Layout */
.write-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Cover Image */
.cover-upload-area {
  position: relative;
  width: 100%;
  height: 320px;
  background-color: var(--color-border);
  border: 2px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.cover-upload-area:hover {
  border-color: var(--color-text-muted);
}

.cover-upload-area.has-preview {
  border-style: solid;
}

.cover-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(60%);
  transition: filter 0.3s;
}

.cover-upload-area:hover .cover-preview {
  filter: grayscale(20%);
}

.cover-upload-overlay {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 20px;
}

.cover-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: var(--color-text-main);
  padding: 16px 24px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-text-main);
  transition: all 0.2s;
}

.cover-upload-label:hover {
  background-color: var(--color-text-main);
  color: var(--color-bg);
}

.cover-upload-area input[type="file"] {
  display: none;
}

/* Title textarea */
.title-input {
  width: 100%;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-text-main);
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--color-border);
  padding: 8px 0;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  overflow: hidden;
}

.title-input::placeholder {
  color: var(--color-text-light);
}

.title-input:focus {
  border-bottom-color: var(--color-text-main);
}

/* Field groups */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.field-group--narrow {
  flex: 0 0 160px;
}

.field-label {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: var(--color-text-muted);
}

.verdict-good {
  color: #16a34a;
}

.verdict-bad {
  color: #dc2626;
}

.field-input {
  width: 100%;
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--color-text-main);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 10px 0;
  outline: none;
  transition: border-color 0.2s;
  border-radius: 0;
}

.field-input:focus {
  border-bottom-color: var(--color-text-main);
}

.meta-row,
.verdict-row {
  display: flex;
  gap: 32px;
}

@media (max-width: 600px) {
  .meta-row,
  .verdict-row {
    flex-direction: column;
    gap: 24px;
  }

  .field-group--narrow {
    flex: 1;
  }
}

/* Rating */
.rating-control {
  display: flex;
  align-items: center;
  gap: 24px;
}

.rating-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 2px;
  background: var(--color-border);
  outline: none;
  border: none;
  padding: 0;
  border-radius: 0;
  cursor: pointer;
}

.rating-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: var(--color-text-main);
  border-radius: 0;
  cursor: pointer;
  transition: background 0.2s;
}

.rating-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--color-text-main);
  border: none;
  border-radius: 0;
  cursor: pointer;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.rating-number {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-text-main);
  width: 2rem;
  text-align: center;
}

.rating-stars {
  font-size: 1.2rem;
  letter-spacing: 0.05em;
}

.star.filled {
  color: var(--color-accent);
}

.star.empty {
  color: var(--color-border);
}

/* Section divider */
.section-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 8px 0;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-border);
}

.divider-text {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 700;
  color: var(--color-text-light);
  white-space: nowrap;
}

/* Review textarea */
.review-textarea {
  width: 100%;
  font-family: var(--font-serif);
  font-size: 1.2rem;
  line-height: 1.9;
  color: var(--color-text-main);
  background: transparent;
  border: none;
  border-top: 1px solid var(--color-border);
  padding: 20px 0;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  border-radius: 0;
}

.review-textarea:focus {
  border-top-color: var(--color-text-main);
}

.review-textarea::placeholder {
  color: var(--color-text-light);
  font-style: italic;
}

.editor-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: -16px;
  z-index: 10;
}

.tab-btn {
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--color-text-main);
}

.tab-btn.active {
  color: var(--color-text-main);
  border-bottom-color: var(--color-text-main);
}

.preview-area {
  width: 100%;
  font-family: var(--font-serif);
  font-size: 1.2rem;
  line-height: 1.9;
  color: var(--color-text-main);
  background: transparent;
  border-top: 1px solid var(--color-border);
  padding: 20px 0;
  min-height: 400px;
}

.preview-empty {
  color: var(--color-text-light);
  font-style: italic;
  font-family: var(--font-sans);
  font-size: 1rem;
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

.review-hint {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--color-text-light);
  text-align: right;
}

/* Actions */
.actions-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.5rem;
  color: var(--color-text-muted);
}
</style>
