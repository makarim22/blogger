<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'About Us | Literary Noir'
})
</script>

<template>
  <div class="page-layout animate-fade-in">
    <div class="container-narrow">
      <div class="page-header">
        <h1 class="page-title">About Us</h1>
        <div class="divider-dark"></div>
      </div>
      
      <div class="editorial-content">
        <p class="dropcap">We are Literary Noir. Founded on the belief that cinema and literature deserve more than mere star ratings, we are a digital collective dedicated to atmospheric critique and profound analysis.</p>
        
        <h2>Our Philosophy</h2>
        <p>In an era of fleeting attention spans and algorithmically generated summaries, we champion the long form. We believe in the power of a well-crafted sentence, the weight of a considered argument, and the beauty of stark contrasts.</p>
        
        <p>Whether it's the neon-drenched streets of a cyberpunk classic or the ink-stained pages of a gothic novel, our editors dissect the art that matters. We strip away the noise to find the narrative truth underneath.</p>
        
        <blockquote>
          "Art should comfort the disturbed and disturb the comfortable." 
        </blockquote>
        
        <h2>The Archives</h2>
        <p>Our database is a growing repository of curated thoughts, organized into two distinct pillars: Cinema and Literature. Every review is treated as an editorial piece, complete with our signature 'Final Verdict' and 'The Cutting Room Floor'.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-layout {
  padding: 60px 0 100px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 3rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.editorial-content {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  line-height: 1.8;
  color: var(--color-text-main);
}

.editorial-content h2 {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 40px 0 20px;
}

.editorial-content p {
  margin-bottom: 24px;
}

.editorial-content blockquote {
  font-style: italic;
  font-size: 1.5rem;
  border-left: 4px solid var(--color-accent);
  padding-left: 24px;
  margin: 40px 0;
  color: var(--color-text-muted);
}

.dropcap::first-letter {
  font-family: var(--font-serif);
  font-size: 4.5rem;
  font-weight: 900;
  float: left;
  line-height: 0.8;
  margin-right: 12px;
  margin-top: 4px;
  color: var(--color-text-main);
}
</style>
