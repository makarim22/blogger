<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Network } from 'vis-network/standalone'
import { fetchMovies, fetchBooks } from '../services/api'
import { useHead } from '@unhead/vue'

const container = ref<HTMLElement | null>(null)
let network: any = null
const isLoading = ref(true)

useHead({ title: 'The Red String Board | Literary Noir' })

onMounted(async () => {
  try {
    const [movies, books] = await Promise.all([fetchMovies(), fetchBooks()])

    const nodes: any[] = []
    const edges: any[] = []
    
    // Track creators to avoid duplicates
    const creatorMap = new Map()

    const addCreator = (name: string, _type: string) => {
      if (!creatorMap.has(name)) {
        const id = `creator_${name}`
        creatorMap.set(name, id)
        nodes.push({
          id: id,
          label: name,
          shape: 'box',
          color: { 
            background: 'var(--color-surface)', 
            border: 'var(--color-text-main)'
          },
          font: { color: 'var(--color-text-main)', face: 'Inter', size: 16, bold: true },
          borderWidth: 2,
          shadow: { color: 'rgba(0,0,0,0.5)', size: 10, x: 5, y: 5 }
        })
      }
      return creatorMap.get(name)
    }

    // Process movies
    movies.forEach((m: any) => {
      const creatorId = addCreator(m.director, 'director')
      const movieId = `movie_${m.id}`
      
      nodes.push({
        id: movieId,
        label: m.title,
        shape: m.posterUrl ? 'circularImage' : 'dot',
        image: m.posterUrl || undefined,
        size: 35,
        color: { border: '#3b82f6', background: 'var(--color-surface)' }, // Cinematic blue
        font: { color: 'var(--color-text-muted)', size: 12, face: 'Playfair Display' },
        borderWidth: 3,
        shadow: true
      })
      
      edges.push({
        from: creatorId,
        to: movieId,
        color: { color: '#ef4444', hover: '#ff0000' }, // Red string
        width: 3,
        dashes: [10, 5], // Looks like a stitched string
        smooth: { type: 'curvedCW', roundness: 0.2 }
      })
    })

    // Process books
    books.forEach((b: any) => {
      const creatorId = addCreator(b.author, 'author')
      const bookId = `book_${b.id}`
      
      nodes.push({
        id: bookId,
        label: b.title,
        shape: b.coverUrl ? 'circularImage' : 'dot',
        image: b.coverUrl || undefined,
        size: 35,
        color: { border: '#d97706', background: 'var(--color-surface)' }, // Literature amber
        font: { color: 'var(--color-text-muted)', size: 12, face: 'Playfair Display' },
        borderWidth: 3,
        shadow: true
      })
      
      edges.push({
        from: creatorId,
        to: bookId,
        color: { color: '#ef4444', hover: '#ff0000' }, // Red string
        width: 3,
        dashes: [10, 5],
        smooth: { type: 'curvedCCW', roundness: 0.2 }
      })
    })

    const data = { nodes, edges }
    const options = {
      physics: {
        barnesHut: { 
          gravitationalConstant: -3000, 
          centralGravity: 0.2, 
          springLength: 200,
          springConstant: 0.04
        },
        stabilization: { iterations: 150 }
      },
      interaction: { 
        hover: true,
        tooltipDelay: 200,
        zoomView: true
      }
    }

    if (container.value) {
      network = new Network(container.value, data, options)
      
      network.on("click", (params: any) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0]
          if (nodeId.startsWith('movie_')) {
            window.open(`/review/movies/${nodeId.replace('movie_', '')}`, '_blank')
          } else if (nodeId.startsWith('book_')) {
            window.open(`/review/books/${nodeId.replace('book_', '')}`, '_blank')
          }
        }
      })
    }
  } catch (error) {
    console.error("Failed to map connections:", error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (network) {
    network.destroy()
  }
})
</script>

<template>
  <div class="board-page animate-fade-in">
    <div class="board-header container">
      <h1 class="page-title">The Red String Board</h1>
      <p class="subtitle">Drag nodes and explore the interconnected web of creators, cinema, and literature. Click an item to view its dossier.</p>
      <div class="divider-dark"></div>
    </div>
    
    <div v-if="isLoading" class="loading">Pinning the strings...</div>
    
    <div class="board-wrapper">
      <!-- Corkboard texture background -->
      <div class="corkboard-bg"></div>
      <div class="board-container" ref="container" v-show="!isLoading"></div>
    </div>
  </div>
</template>

<style scoped>
.board-page {
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px); /* Fill screen minus header */
}

.board-header {
  padding-top: 40px;
  flex-shrink: 0;
}

.page-title {
  font-size: 3rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.subtitle {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 100px 20px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.5rem;
  flex-grow: 1;
}

.board-wrapper {
  flex-grow: 1;
  position: relative;
  width: 100%;
  border-top: 2px solid var(--color-border-dark);
  border-bottom: 2px solid var(--color-border-dark);
  overflow: hidden;
}

/* Corkboard texture for absolute Noir detective vibes */
.corkboard-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-bg);
  background-image: 
    radial-gradient(var(--color-border) 1px, transparent 1px),
    radial-gradient(var(--color-border) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  opacity: 0.3;
  z-index: 0;
}

.board-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.board-container :deep(.vis-network) {
  outline: none;
}
</style>
