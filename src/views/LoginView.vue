<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    if (!res.ok) throw new Error('Invalid credentials')
    
    const data = await res.json()
    authStore.setToken(data.access_token)
    toast.success('Successfully logged in!')
    router.push('/')
  } catch (error: any) {
    errorMsg.value = error.message || 'Failed to login'
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page container animate-fade-in">
    <div class="login-card glass-panel">
      <h2>Admin Login</h2>
      <p class="subtitle">Access your media journal</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required placeholder="admin@example.com" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" required placeholder="••••••••" />
        </div>
        
        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Authenticating...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
}

.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 30px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

input {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-family: inherit;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.error {
  color: #ef4444;
  font-size: 0.9rem;
  text-align: center;
}

.btn-primary {
  margin-top: 10px;
  width: 100%;
}
</style>
