<script setup lang="ts">
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createMovie, createBook, uploadImage } from '../services/api'
import { toast } from 'vue3-toastify'

const props = defineProps<{ type: 'movies' | 'books' }>()
const emit = defineEmits(['close'])
const queryClient = useQueryClient()

const title = ref('')
const creator = ref('') // Director or Author
const year = ref<number>(new Date().getFullYear())
const rating = ref(8)
const theGood = ref('')
const theBad = ref('')
const review = ref('')
const selectedFile = ref<File | null>(null)

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const movieMutation = useMutation({
  mutationFn: createMovie,
  onSuccess: () => {
    toast.success('Movie logged successfully!')
    queryClient.invalidateQueries({ queryKey: ['movies'] })
    emit('close')
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to log movie')
  }
})

const bookMutation = useMutation({
  mutationFn: createBook,
  onSuccess: () => {
    toast.success('Book logged successfully!')
    queryClient.invalidateQueries({ queryKey: ['books'] })
    emit('close')
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Failed to log book')
  }
})

const handleSubmit = async () => {
  try {
    let imageUrl = ''
    if (selectedFile.value) {
      toast.info('Uploading image...')
      imageUrl = await uploadImage(selectedFile.value)
    }

    if (props.type === 'movies') {
      movieMutation.mutate({
        title: title.value,
        director: creator.value,
        releaseYear: year.value,
        rating: rating.value,
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
        publishYear: year.value,
        rating: rating.value,
        theGood: theGood.value,
        theBad: theBad.value,
        review: review.value,
        readDate: new Date().toISOString(),
        coverUrl: imageUrl
      })
    }
  } catch (error: any) {
    toast.error(error.message || 'Error processing request')
  }
}

const isPending = movieMutation.isPending.value || bookMutation.isPending.value
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content glass-panel animate-fade-in">
      <h2>Log a {{ props.type === 'movies' ? 'Movie' : 'Book' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label>Title</label>
          <input type="text" v-model="title" required />
        </div>
        
        <div class="form-group">
          <label>{{ props.type === 'movies' ? 'Director' : 'Author' }}</label>
          <input type="text" v-model="creator" required />
        </div>
        
        <div class="form-group row">
          <div class="col">
            <label>Year</label>
            <input type="number" v-model="year" required />
          </div>
          <div class="col">
            <label>Rating (0-10)</label>
            <input type="number" min="0" max="10" v-model="rating" required />
          </div>
        </div>
        
        <div class="form-group row">
          <div class="col">
            <label>The Good</label>
            <input type="text" v-model="theGood" placeholder="Short summary..." />
          </div>
          <div class="col">
            <label>The Bad</label>
            <input type="text" v-model="theBad" placeholder="Short summary..." />
          </div>
        </div>
        
        <div class="form-group">
          <label>Review</label>
          <textarea v-model="review" rows="4" required></textarea>
        </div>
        
        <div class="form-group">
          <label>{{ props.type === 'movies' ? 'Poster' : 'Cover' }} Image</label>
          <input type="file" accept="image/*" @change="handleFileChange" />
        </div>
        
        <div class="actions">
          <button type="button" @click="emit('close')" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isPending">
            {{ isPending ? 'Saving...' : 'Save Log' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 30px;
  border-radius: 16px;
  background: rgba(20, 20, 25, 0.95);
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  max-height: 90vh;
  overflow-y: auto;
  transform-origin: center;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 24px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  flex-direction: row;
  gap: 16px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

input, textarea {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.btn-cancel {
  padding: 10px 20px;
  background: transparent;
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: rgba(255,255,255,0.1);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
