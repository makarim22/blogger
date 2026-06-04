<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchMovieComments, fetchBookComments, postComment } from '../services/api'
import { toast } from 'vue3-toastify'

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
    toast.error('Failed to post your comment.')
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKey.value })
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

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
}
</script>

<template>
  <div class="comment-section">
    <div class="section-divider">
      <span class="divider-text">Reader Thoughts</span>
    </div>

    <!-- Comment Form -->
    <div class="comment-form glass-panel">
      <h3 class="form-title">Leave a Comment</h3>
      <form @submit.prevent="submitComment">
        <div class="field-group">
          <input 
            type="text" 
            v-model="authorName" 
            class="field-input" 
            placeholder="Name (Optional)" 
          />
        </div>
        <div class="field-group">
          <textarea 
            v-model="content" 
            class="field-input review-textarea" 
            placeholder="Share your thoughts..." 
            rows="3" 
            required
          ></textarea>
        </div>
        <div class="actions">
          <button type="submit" class="btn-primary btn-small" :disabled="commentMutation.isPending.value || !content.trim()">
            {{ commentMutation.isPending.value ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Comments List -->
    <div class="comments-list">
      <div v-if="isLoading" class="loading-state">
        Loading thoughts...
      </div>
      <div v-else-if="!comments || comments.length === 0" class="empty-state">
        No comments yet. Be the first to share your thoughts on this critique.
      </div>
      <div v-else class="comment-item" v-for="comment in comments" :key="comment.id">
        <div class="comment-header">
          <span class="comment-author">{{ comment.authorName || 'Anonymous Reader' }}</span>
          <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <div class="comment-content">
          {{ comment.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-section {
  margin-top: 80px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
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
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 700;
  color: var(--color-text-main);
  white-space: nowrap;
}

.comment-form {
  padding: 30px;
  margin-bottom: 40px;
  background: var(--card-bg-fallback);
  border-radius: 8px;
}

.form-title {
  font-family: var(--font-sans);
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: var(--color-text-main);
}

.field-group {
  margin-bottom: 16px;
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

.review-textarea {
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn-small {
  padding: 8px 16px;
  font-size: 0.85rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  padding: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  border-left: 3px solid var(--color-accent);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.comment-author {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text-main);
}

.comment-date {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.comment-content {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-main);
  white-space: pre-wrap;
}

.empty-state, .loading-state {
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-muted);
  padding: 40px;
  border: 1px dashed var(--color-border);
}
</style>
