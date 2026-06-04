<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchMovieComments, fetchBookComments, postComment } from '../services/api'
import { toast } from 'vue3-toastify'
import { formatDistanceToNow } from 'date-fns'

const props = defineProps<{
  type: 'movies' | 'books'
  id: string
}>()

const queryClient = useQueryClient()
const queryKey = computed(() => ['comments', props.type, props.id])

const { data: comments, isLoading } = useQuery<any[]>({
  queryKey,
  queryFn: () => props.type === 'movies' ? fetchMovieComments(props.id) : fetchBookComments(props.id),
  staleTime: 1000 * 60, // 1 minute
})

const authorName = ref('')
const content = ref('')

const commentMutation = useMutation({
  mutationFn: (newComment: { content: string; authorName?: string; movieReviewId?: string; bookReviewId?: string }) => {
    return postComment(newComment)
  },
  onMutate: async (newComment) => {
    await queryClient.cancelQueries({ queryKey: queryKey.value })
    const previousComments = queryClient.getQueryData(queryKey.value)
    
    // Optimistic UI update
    queryClient.setQueryData(queryKey.value, (old: any[] = []) => [
      {
        id: 'temp-' + Date.now(),
        content: newComment.content,
        authorName: newComment.authorName || 'Anonymous Reader',
        createdAt: new Date().toISOString(),
      },
      ...old
    ])
    
    authorName.value = ''
    content.value = ''
    return { previousComments }
  },
  onError: (err, newComment, context) => {
    queryClient.setQueryData(queryKey.value, context?.previousComments)
    toast.error('Failed to publish your letter.')
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKey.value })
  },
  onSuccess: () => {
    toast.success('Your letter has been published.')
  }
})

const submitComment = () => {
  if (!content.value.trim()) return

  const payload: any = { content: content.value }
  if (authorName.value.trim()) payload.authorName = authorName.value.trim()
  if (props.type === 'movies') payload.movieReviewId = props.id
  if (props.type === 'books') payload.bookReviewId = props.id

  commentMutation.mutate(payload)
}

</script>

<template>
  <div class="letters-section">
    <div class="letters-header">
      <h3 class="letters-title">Letters to the Editor</h3>
      <div class="letters-divider"></div>
    </div>
    
    <!-- Submission Form -->
    <div class="letter-form">
      <p class="form-instruction">Share your critique, perspective, or debate.</p>
      
      <form @submit.prevent="submitComment">
        <div class="form-group">
          <input 
            type="text" 
            v-model="authorName" 
            class="noir-input" 
            placeholder="Name (Optional)" 
            maxlength="50"
          />
        </div>
        <div class="form-group">
          <textarea 
            v-model="content" 
            class="noir-textarea" 
            placeholder="Write your letter here..." 
            rows="4"
            required
          ></textarea>
        </div>
        <div class="form-actions">
          <button 
            type="submit"
            class="btn-primary" 
            :disabled="commentMutation.isPending.value || !content.trim()"
          >
            {{ commentMutation.isPending.value ? 'Publishing...' : 'Publish Letter' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Letters List -->
    <div v-if="isLoading" class="letters-loading">Opening the archives...</div>
    
    <div v-else-if="!comments || comments.length === 0" class="letters-empty">
      No letters have been published yet. Be the first to share your perspective.
    </div>
    
    <div v-else class="letters-list">
      <div v-for="comment in comments" :key="comment.id" class="letter-card">
        <div class="letter-meta">
          <span class="letter-author">{{ comment.authorName || 'Anonymous Reader' }}</span>
          <span class="letter-date">{{ formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) }}</span>
        </div>
        <p class="letter-content">{{ comment.content }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.letters-section {
  margin-top: 80px;
  padding: 40px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 10px 10px 0 rgba(0,0,0,0.5); /* brutalist shadow */
}

.letters-header {
  margin-bottom: 40px;
}

.letters-title {
  font-family: var(--font-sans);
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-main);
}

.letters-divider {
  height: 2px;
  background-color: var(--color-border);
  margin-top: 16px;
  width: 100px;
}

/* Form Styles */
.letter-form {
  margin-bottom: 60px;
}

.form-instruction {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 24px;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 20px;
}

.noir-input,
.noir-textarea {
  width: 100%;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  padding: 16px;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  outline: none;
  transition: border-color 0.2s ease;
  border-radius: 0;
}

.noir-textarea {
  resize: vertical;
  min-height: 100px;
}

.noir-input:focus,
.noir-textarea:focus {
  border-color: var(--color-text-main);
  box-shadow: inset 0 0 0 1px var(--color-text-main);
}

.noir-input::placeholder,
.noir-textarea::placeholder {
  color: #52525b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: var(--color-text-main);
  color: var(--color-bg);
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-family: var(--font-sans);
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.05em;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  background-color: #e4e4e7;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Letters List */
.letters-loading,
.letters-empty {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-muted);
  font-size: 1.2rem;
  padding: 40px 0;
  text-align: center;
  border-top: 1px dashed var(--color-border);
}

.letters-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.letter-card {
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
}

.letter-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}

.letter-author {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-main);
}

.letter-date {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.letter-content {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.6;
  color: #d4d4d8;
  margin: 0;
  white-space: pre-wrap;
}
</style>
