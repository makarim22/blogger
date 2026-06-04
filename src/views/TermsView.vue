<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'Terms of Service | Literary Noir'
})
</script>

<template>
  <div class="page-layout animate-fade-in">
    <div class="container-narrow">
      <div class="page-header">
        <h1 class="page-title">Terms of Service</h1>
        <div class="divider-dark"></div>
      </div>
      
      <div class="editorial-content">
        <p class="dropcap">By accessing Literary Noir, you agree to enter our digital archive and abide by its rules. We are a sanctuary for deep thought, not a playground for chaos.</p>
        
        <h2>Intellectual Property</h2>
        <p>All critiques, essays, and editorial designs published on this platform are the intellectual property of Literary Noir and its respective editors. Plagiarism will result in immediate redaction and banishment from the archives.</p>
        
        <h2>User Conduct</h2>
        <p>In the Letters to the Editor section, we encourage fierce debate but prohibit ad hominem attacks, hate speech, or senseless spam. Critique the art, debate the argument, but respect the individual.</p>
        
        <h2>Disclaimer of Warranties</h2>
        <p>Our verdicts are entirely subjective. We make no guarantees that you will agree with our assessment of a film's cinematography or a book's prose. Art is subjective; our opinions are resolute.</p>
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
