<template>
  <div class="auth-callback">
    <div class="loader">Authenticating...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  const token = route.query.token as string
  if (token) {
    authStore.setToken(token)
    router.push('/')
  } else {
    console.error('No token found in callback URL')
    router.push('/login')
  }
})
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: var(--text-color);
  font-family: var(--font-primary);
}
.loader {
  font-size: 1.2rem;
  letter-spacing: 2px;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
