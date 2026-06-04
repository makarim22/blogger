<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'Privacy Policy | Literary Noir'
})
</script>

<template>
  <div class="page-layout animate-fade-in">
    <div class="container-narrow">
      <div class="page-header">
        <h1 class="page-title">Privacy Policy</h1>
        <div class="divider-dark"></div>
      </div>
      
      <div class="editorial-content">
        <p class="dropcap">At Literary Noir, we value your privacy as much as we value a plot without holes. This document outlines the minimal data we collect and how we protect it.</p>
        
        <h2>Information Collection</h2>
        <p>We do not track your reading habits outside of our platform. If you register as an Editor, we securely store your email address and encrypted password. Your dossier of saved films and books remains private unless you choose to share it.</p>
        
        <h2>Cookies & Local Storage</h2>
        <p>We use local storage exclusively to remember your aesthetic preferences—specifically, whether you prefer the Cinematic or Literature theme, and your Focus Mode state. We do not employ third-party tracking cookies.</p>
        
        <h2>Letters to the Editor</h2>
        <p>When you publish a letter (comment) in our debate sections, your chosen moniker is displayed publicly. We reserve the right to moderate and redact letters that violate our editorial standards.</p>
        
        <p>For any inquiries regarding your data, please contact the Chief Editor.</p>
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
