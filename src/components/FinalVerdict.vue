<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  rating: number; // 0 to 10
  theGood?: string;
  theBad?: string;
}>()

const isSpoilerRevealed = ref(false)

const revealSpoiler = () => {
  isSpoilerRevealed.value = true
}
</script>

<template>
  <div class="verdict-container">
    <div class="verdict-header">
      <h3 class="verdict-title">Final Verdict</h3>
      <div class="score-circle">
        <span class="score-number">{{ rating }}</span>
      </div>
    </div>
    
    <div class="verdict-body" v-if="theGood || theBad">
      <div class="verdict-section" v-if="theGood">
        <h4 class="section-title good">The Good</h4>
        <p class="section-text">{{ theGood }}</p>
      </div>
      
      <div class="verdict-divider" v-if="theGood && theBad"></div>
      
      <div class="verdict-section" v-if="theBad">
        <h4 class="section-title bad">The Bad (Spoilers)</h4>
        
        <div class="spoiler-container" :class="{ 'is-revealed': isSpoilerRevealed }">
          <p class="section-text spoiler-text">{{ theBad }}</p>
          
          <div class="spoiler-overlay" v-if="!isSpoilerRevealed" @click="revealSpoiler">
            <span class="spoiler-warning">REDACTED ARCHIVE</span>
            <span class="spoiler-action">Click to reveal</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verdict-container {
  border: 1px solid var(--color-border-dark);
  margin: 40px 0;
  background-color: var(--color-surface);
}

.verdict-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
}

.verdict-title {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 1.2rem;
  font-family: var(--font-sans);
  color: var(--color-text-main);
  font-weight: 700;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--color-text-main);
  color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-number {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.verdict-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 768px) {
  .verdict-body {
    flex-direction: row;
    gap: 0;
  }
  .verdict-section {
    flex: 1;
    padding: 0 24px;
  }
  .verdict-section:first-child {
    padding-left: 0;
  }
  .verdict-section:last-child {
    padding-right: 0;
  }
  .verdict-divider {
    width: 1px;
    background-color: var(--color-border);
    margin: 0 24px;
  }
}

.section-title {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}

.section-title.good {
  color: var(--color-text-main);
}
.section-title.bad {
  color: #ef4444; /* Noir stark red for danger/bad */
}

.section-text {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-main);
  font-style: italic;
  margin: 0;
}

/* Spoiler Implementation */
.spoiler-container {
  position: relative;
  overflow: hidden;
  border-radius: 2px;
}

.spoiler-text {
  transition: filter 0.3s ease, color 0.3s ease;
  filter: blur(8px);
  color: transparent;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  user-select: none;
}

.spoiler-container.is-revealed .spoiler-text {
  filter: blur(0);
  color: var(--color-text-main);
  text-shadow: none;
  user-select: auto;
}

.spoiler-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(20, 20, 20, 0.9),
    rgba(20, 20, 20, 0.9) 10px,
    rgba(40, 40, 40, 0.9) 10px,
    rgba(40, 40, 40, 0.9) 20px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  border: 1px dashed #ef4444;
  transition: opacity 0.3s ease;
}

.spoiler-overlay:hover {
  background: repeating-linear-gradient(
    45deg,
    rgba(30, 30, 30, 0.95),
    rgba(30, 30, 30, 0.95) 10px,
    rgba(50, 50, 50, 0.95) 10px,
    rgba(50, 50, 50, 0.95) 20px
  );
}

.spoiler-warning {
  font-family: var(--font-sans);
  font-weight: 900;
  color: #ef4444;
  letter-spacing: 0.15em;
  font-size: 1rem;
  margin-bottom: 4px;
}

.spoiler-action {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
</style>
