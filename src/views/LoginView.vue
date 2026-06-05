<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'

import { login, API_URL } from '../services/api'

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
    const data = await login({ email: email.value, password: password.value })
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

const handleGoogleLogin = () => {
  window.location.href = `${API_URL}/auth/google/login`
}
</script>

<template>
  <div class="login-page container animate-fade-in">
    <div class="login-card glass-panel">
      <h2>Access Intelligence</h2>
      <p class="subtitle">Authenticate to access the dossier</p>
      
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
          {{ loading ? 'Authenticating...' : 'Sign In with Email' }}
        </button>
      </form>
      
      <div class="divider">
        <span>OR</span>
      </div>
      
      <button class="btn-google" @click="handleGoogleLogin">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
        Sign In with Google
      </button>
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

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: var(--color-text-muted);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.divider span {
  padding: 0 10px;
  font-size: 0.9rem;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background-color: white;
  color: #333;
  border: none;
  border-radius: 8px;
  font-family: var(--font-primary);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-google:hover {
  background-color: #f1f1f1;
}
</style>
