<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const subscribed = ref(false)

const subscribe = () => {
  if (email.value) {
    subscribed.value = true
    email.value = ''
  }
}
</script>

<template>
  <div class="newsletter-block">
    <div class="newsletter-content" v-if="!subscribed">
      <h3 class="newsletter-title">Deep Dives, Weekly.</h3>
      <p class="newsletter-text">Join thoughtful readers in receiving our curated Sunday morning dispatch. Cinematic analysis directly to your inbox.</p>
      
      <form @submit.prevent="subscribe" class="newsletter-form">
        <input type="email" v-model="email" placeholder="Your email address" required />
        <button type="submit" class="btn-primary">Subscribe</button>
      </form>
    </div>
    
    <div class="newsletter-success animate-fade-in" v-else>
      <h3 class="newsletter-title">Welcome to the club.</h3>
      <p class="newsletter-text">You'll receive your first deep dive this Sunday.</p>
    </div>
  </div>
</template>

<style scoped>
.newsletter-block {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 48px 32px;
  text-align: center;
  margin: 60px 0;
}

.newsletter-title {
  font-size: 2rem;
  margin-bottom: 16px;
}

.newsletter-text {
  color: var(--color-text-muted);
  max-width: 500px;
  margin: 0 auto 32px;
  font-size: 1.1rem;
}

.newsletter-form {
  display: flex;
  max-width: 450px;
  margin: 0 auto;
}

.newsletter-form input {
  flex: 1;
  border-right: none;
}

.newsletter-success {
  padding: 20px 0;
}
</style>
