<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'Editorial Guidelines | Literary Noir'
})
</script>

<template>
  <div class="page-layout animate-fade-in">
    <div class="container-narrow">
      <div class="page-header">
        <h1 class="page-title">Editorial Guidelines</h1>
        <div class="divider-dark"></div>
      </div>
      
      <div class="editorial-content">
        <p class="dropcap">To write for Literary Noir is to embrace a distinct aesthetic. Our critiques are not mere summaries; they are autopsies of the narrative form. If you wish to join our ranks of Editors, you must adhere to these tenets.</p>
        
        <h2>1. Tone and Atmosphere</h2>
        <p>Maintain a tone of intellectual detachment mixed with noir sensibility. Avoid hyperbole ("best movie ever"). Embrace stark adjectives, profound observations, and literary comparisons. Write as if you are recounting a case file in a dimly lit office.</p>
        
        <h2>2. Structure of a Critique</h2>
        <ul>
          <li><strong>The Hook:</strong> Start with an observation about the core theme, not a plot summary.</li>
          <li><strong>The Examination:</strong> Dissect the cinematography, prose, pacing, or character architecture.</li>
          <li><strong>The Final Verdict:</strong> Deliver an unyielding conclusion.</li>
        </ul>
        
        <h2>3. The Good, The Bad, and The Spoilers</h2>
        <p>You must distill your argument into "The Good" and "The Bad" for the Final Verdict component. Any severe spoilers must be relegated to "The Bad" section, which will automatically be redacted via our Cutting Room Floor protocol to protect the uninitiated reader.</p>
        
        <h2>4. Visuals and Media</h2>
        <p>Only select high-contrast, atmospheric imagery for covers and posters. No bright, garish promotional materials. If it doesn't look good in grayscale or neon, it doesn't belong in the archive.</p>
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

.editorial-content ul {
  margin-bottom: 24px;
  padding-left: 20px;
}

.editorial-content li {
  margin-bottom: 12px;
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
