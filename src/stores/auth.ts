import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const TOKEN_KEY = 'auth_token';
  const isLoggedIn = ref(!!localStorage.getItem(TOKEN_KEY));

  function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    isLoggedIn.value = true;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    isLoggedIn.value = false;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  return { isLoggedIn, setToken, logout, getToken };
});
