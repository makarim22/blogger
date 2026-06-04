<template>
  <div class="dossier-view">
    <div class="dossier-header">
      <h1>Classified Dossier: Pending Submissions</h1>
      <p class="subtitle">Review and authorize civilian intelligence reports.</p>
    </div>

    <div class="case-files" v-if="pendingMovies.length || pendingBooks.length">
      <!-- Pending Movies -->
      <section v-if="pendingMovies.length" class="dossier-section">
        <h2>Operation: Silver Screen</h2>
        <div class="dossier-grid">
          <div v-for="review in pendingMovies" :key="review.id" class="dossier-card">
            <div class="card-header">
              <span class="stamp pending">PENDING</span>
              <h3>{{ review.title }} ({{ review.releaseYear }})</h3>
              <span class="author">Agent: {{ review.author?.name || 'Unknown' }}</span>
            </div>
            <div class="card-body">
              <p><strong>The Good:</strong> {{ review.theGood || 'N/A' }}</p>
              <p><strong>The Bad:</strong> {{ review.theBad || 'N/A' }}</p>
            </div>
            <div class="card-actions">
              <button @click="approveReview('movies', review.id)" class="btn-approve">Authorize</button>
              <button @click="rejectReview('movies', review.id)" class="btn-reject">Redact</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Pending Books -->
      <section v-if="pendingBooks.length" class="dossier-section">
        <h2>Operation: Bound Pages</h2>
        <div class="dossier-grid">
          <div v-for="review in pendingBooks" :key="review.id" class="dossier-card">
            <div class="card-header">
              <span class="stamp pending">PENDING</span>
              <h3>{{ review.title }} ({{ review.publishYear }})</h3>
              <span class="author">Agent: {{ review.userAuthor?.name || 'Unknown' }}</span>
            </div>
            <div class="card-body">
              <p><strong>The Good:</strong> {{ review.theGood || 'N/A' }}</p>
              <p><strong>The Bad:</strong> {{ review.theBad || 'N/A' }}</p>
            </div>
            <div class="card-actions">
              <button @click="approveReview('books', review.id)" class="btn-approve">Authorize</button>
              <button @click="rejectReview('books', review.id)" class="btn-reject">Redact</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="empty-state">
      <div class="stamp approved">NO PENDING INTEL</div>
      <p>All civilian intelligence reports have been processed.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const pendingMovies = ref<any[]>([])
const pendingBooks = ref<any[]>([])

const fetchPending = async () => {
  try {
    const [moviesRes, booksRes] = await Promise.all([
      api.get('/movies/pending'),
      api.get('/books/pending')
    ])
    pendingMovies.value = moviesRes.data || []
    pendingBooks.value = booksRes.data || []
  } catch (error) {
    console.error('Failed to fetch pending reviews', error)
  }
}

const approveReview = async (type: 'movies' | 'books', id: string) => {
  try {
    await api.patch(`/${type}/${id}/status`, { status: 'APPROVED' })
    await fetchPending()
  } catch (error) {
    console.error('Failed to approve review', error)
  }
}

const rejectReview = async (type: 'movies' | 'books', id: string) => {
  if (!confirm('Are you sure you want to reject this review?')) return;
  try {
    await api.patch(`/${type}/${id}/status`, { status: 'REJECTED' })
    await fetchPending()
  } catch (error) {
    console.error('Failed to reject review', error)
  }
}

onMounted(() => {
  if (authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'EDITOR') {
    router.push('/')
    return
  }
  fetchPending()
})
</script>

<style scoped>
.dossier-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: var(--font-primary);
  color: var(--text-color);
}

.dossier-header {
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

.dossier-header h1 {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.subtitle {
  color: var(--text-muted);
  font-style: italic;
  font-size: 1.1rem;
}

.dossier-section {
  margin-bottom: 3rem;
}

.dossier-section h2 {
  font-family: var(--font-serif);
  border-left: 4px solid var(--accent-red);
  padding-left: 1rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, rgba(229, 9, 20, 0.1) 0%, transparent 100%);
}

.dossier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.dossier-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  position: relative;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.dossier-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-red);
}

.card-header {
  margin-bottom: 1rem;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 1rem;
}

.card-header h3 {
  margin: 0.5rem 0;
  font-size: 1.2rem;
}

.author {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-family: monospace;
}

.stamp {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-family: monospace;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border: 2px solid;
  border-radius: 4px;
  transform: rotate(15deg);
  opacity: 0.8;
}

.stamp.pending {
  color: #f39c12;
  border-color: #f39c12;
}

.stamp.approved {
  color: #2ecc71;
  border-color: #2ecc71;
  font-size: 2rem;
  position: static;
  display: inline-block;
  margin-bottom: 1rem;
}

.card-body p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.card-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  cursor: pointer;
  font-family: var(--font-primary);
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.2s;
}

.btn-approve {
  background-color: transparent;
  color: #2ecc71;
  border: 1px solid #2ecc71;
}

.btn-approve:hover {
  background-color: rgba(46, 204, 113, 0.1);
}

.btn-reject {
  background-color: transparent;
  color: var(--accent-red);
  border: 1px solid var(--accent-red);
}

.btn-reject:hover {
  background-color: rgba(229, 9, 20, 0.1);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
}
</style>
