<script setup lang="ts">
defineProps<{
  rating: number; // 0 to 10
  theGood?: string;
  theBad?: string;
}>()
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
        <h4 class="section-title bad">The Bad</h4>
        <p class="section-text">{{ theBad }}</p>
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
  color: var(--color-text-muted);
}

.section-text {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-main);
  font-style: italic;
}
</style>
