<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMovies, fetchBooks } from '../services/api'
import { useHead } from '@unhead/vue'

const { data: movies, isLoading: loadingMovies } = useQuery({ queryKey: ['movies'], queryFn: fetchMovies })
const { data: books, isLoading: loadingBooks } = useQuery({ queryKey: ['books'], queryFn: fetchBooks })

const selectedMovieId = ref<string>('')
const selectedBookId = ref<string>('')

const selectedMovie = computed(() => {
  if (!movies.value) return null
  return movies.value.find((m: any) => m.id === selectedMovieId.value) || null
})

const selectedBook = computed(() => {
  if (!books.value) return null
  return books.value.find((b: any) => b.id === selectedBookId.value) || null
})

const hasBothSelected = computed(() => selectedMovie.value && selectedBook.value)

const ultimateVerdict = computed(() => {
  if (!hasBothSelected.value) return null
  
  const diff = selectedMovie.value.rating - selectedBook.value.rating
  
  if (diff > 0) {
    return {
      winner: 'Cinema',
      title: selectedMovie.value.title,
      text: `The visceral visual language of cinema triumphs. ${selectedMovie.value.title} elevates the source material into a masterclass of moving images.`,
      color: '#3b82f6'
    }
  } else if (diff < 0) {
    return {
      winner: 'Literature',
      title: selectedBook.value.title,
      text: `The written word remains undefeated. The depth and prose of ${selectedBook.value.title} exposes the limitations of the silver screen.`,
      color: '#d97706'
    }
  } else {
    return {
      winner: 'Draw',
      title: 'A Perfect Mirror',
      text: `A rare equilibrium. Both the film and the novel stand as absolute equals in the annals of art.`,
      color: 'var(--color-text-main)'
    }
  }
})

useHead({ title: 'Split-Screen Adaptations | Literary Noir' })
</script>

<template>
  <div class="vs-page animate-fade-in">
    <div class="category-header">
      <div class="container">
        <h1 class="page-title">The Eternal Debate</h1>
        <p class="subtitle">Select a film and a book to analyze the adaptation side-by-side.</p>
        
        <div class="selector-controls">
          <div class="select-group">
            <label>Cinema Archive</label>
            <select v-model="selectedMovieId" class="noir-select">
              <option value="" disabled>Select a Film...</option>
              <option v-for="movie in movies" :key="movie.id" :value="movie.id">{{ movie.title }} ({{ movie.releaseYear }})</option>
            </select>
          </div>
          
          <div class="vs-badge-small">VS</div>
          
          <div class="select-group">
            <label>Literature Archive</label>
            <select v-model="selectedBookId" class="noir-select">
              <option value="" disabled>Select a Book...</option>
              <option v-for="book in books" :key="book.id" :value="book.id">{{ book.title }} ({{ book.publishYear }})</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loadingMovies || loadingBooks" class="loading">Consulting the archives...</div>
    
    <div v-else-if="hasBothSelected" class="split-screen-container animate-slide-up">
      <!-- Left Side: Cinema -->
      <div class="split-side cinema-side">
        <div class="side-header">Cinema</div>
        <div class="cover-wrapper">
          <img v-if="selectedMovie.posterUrl" :src="selectedMovie.posterUrl" :alt="selectedMovie.title" />
          <div v-else class="placeholder-img"></div>
        </div>
        <h2 class="item-title">{{ selectedMovie.title }}</h2>
        <p class="item-meta">Directed by {{ selectedMovie.director }} &bull; {{ selectedMovie.releaseYear }}</p>
        <div class="item-score">{{ selectedMovie.rating }}/10</div>
        
        <div class="verdict-points">
          <div class="point-box good-box">
            <h4>The Good</h4>
            <p>{{ selectedMovie.theGood || 'No commendations recorded.' }}</p>
          </div>
          <div class="point-box bad-box">
            <h4>The Bad</h4>
            <p>{{ selectedMovie.theBad || 'No flaws recorded.' }}</p>
          </div>
        </div>
      </div>

      <!-- Center VS -->
      <div class="vs-divider">
        <div class="vs-circle">VS</div>
      </div>

      <!-- Right Side: Literature -->
      <div class="split-side literature-side">
        <div class="side-header">Literature</div>
        <div class="cover-wrapper">
          <img v-if="selectedBook.coverUrl" :src="selectedBook.coverUrl" :alt="selectedBook.title" />
          <div v-else class="placeholder-img"></div>
        </div>
        <h2 class="item-title">{{ selectedBook.title }}</h2>
        <p class="item-meta">Written by {{ selectedBook.author }} &bull; {{ selectedBook.publishYear }}</p>
        <div class="item-score">{{ selectedBook.rating }}/10</div>
        
        <div class="verdict-points">
          <div class="point-box good-box">
            <h4>The Good</h4>
            <p>{{ selectedBook.theGood || 'No commendations recorded.' }}</p>
          </div>
          <div class="point-box bad-box">
            <h4>The Bad</h4>
            <p>{{ selectedBook.theBad || 'No flaws recorded.' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Ultimate Verdict -->
    <div v-if="hasBothSelected && ultimateVerdict" class="ultimate-verdict-container animate-fade-in">
      <div class="container">
        <div class="verdict-box" :style="{ borderColor: ultimateVerdict.color }">
          <h3 class="verdict-label" :style="{ color: ultimateVerdict.color }">Ultimate Verdict</h3>
          <h2 class="verdict-winner">{{ ultimateVerdict.title }} Wins</h2>
          <p class="verdict-text">{{ ultimateVerdict.text }}</p>
        </div>
      </div>
    </div>
    
    <div v-else-if="!loadingMovies && !loadingBooks" class="empty-state">
      <p>Select both a film and a book to begin the comparative analysis.</p>
    </div>
  </div>
</template>

<style scoped>
.category-header {
  margin-top: 60px;
  margin-bottom: 20px;
  text-align: center;
}

.page-title {
  font-size: 3.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.subtitle {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 40px;
}

/* Selectors */
.selector-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin: 0 auto 40px;
  max-width: 800px;
  padding: 30px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.select-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.select-group label {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.noir-select {
  width: 100%;
  background-color: transparent;
  color: var(--color-text-main);
  border: none;
  border-bottom: 2px solid var(--color-text-main);
  padding: 10px 0;
  font-family: var(--font-serif);
  font-size: 1.2rem;
  outline: none;
  cursor: pointer;
  appearance: none;
}

.noir-select option {
  background-color: var(--color-bg);
  color: var(--color-text-main);
}

.vs-badge-small {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--color-accent);
}

/* Split Screen */
.split-screen-container {
  display: flex;
  position: relative;
  min-height: 70vh;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}

.split-side {
  flex: 1;
  padding: 60px 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: background-color 0.3s ease;
}

.cinema-side {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent);
}

.literature-side {
  background: linear-gradient(to left, rgba(217, 119, 6, 0.05), transparent);
}

.side-header {
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.85rem;
  margin-bottom: 40px;
  color: var(--color-text-muted);
}

.cinema-side .side-header { color: #3b82f6; }
.literature-side .side-header { color: #d97706; }

.cover-wrapper {
  width: 240px;
  aspect-ratio: 2/3;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: filter 0.5s;
}

.split-side:hover .cover-wrapper img {
  filter: grayscale(0%);
}

.item-title {
  font-size: 2.5rem;
  line-height: 1.1;
  margin-bottom: 8px;
}

.item-meta {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.item-score {
  font-family: var(--font-serif);
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 40px;
}

.cinema-side .item-score { color: #3b82f6; }
.literature-side .item-score { color: #d97706; }

.verdict-points {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.point-box h4 {
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
  margin-bottom: 8px;
}

.good-box h4 { color: #16a34a; }
.bad-box h4 { color: #dc2626; }

.point-box p {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-text-main);
}

/* VS Divider */
.vs-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--color-border);
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-circle {
  width: 80px;
  height: 80px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 900;
  font-style: italic;
  color: var(--color-accent);
}

/* Ultimate Verdict */
.ultimate-verdict-container {
  padding: 80px 0;
}

.verdict-box {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px;
  border: 4px solid var(--color-text-main);
  text-align: center;
  background-color: var(--color-surface);
  position: relative;
}

.verdict-label {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-surface);
  padding: 0 20px;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.85rem;
  font-weight: 700;
}

.verdict-winner {
  font-size: 4rem;
  line-height: 1.1;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.verdict-text {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-style: italic;
  line-height: 1.6;
  color: var(--color-text-muted);
}

.loading, .empty-state {
  text-align: center;
  padding: 60px 20px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .selector-controls {
    flex-direction: column;
    padding: 20px;
  }
  
  .split-screen-container {
    flex-direction: column;
  }
  
  .vs-divider {
    top: 50%;
    bottom: auto;
    left: 0;
    right: 0;
    width: 100%;
    height: 1px;
    transform: translateY(-50%);
  }
  
  .verdict-box {
    padding: 40px 20px;
  }
  
  .verdict-winner {
    font-size: 2.5rem;
  }
}
</style>
