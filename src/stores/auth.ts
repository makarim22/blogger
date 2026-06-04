import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const TOKEN_KEY = 'auth_token';
  const isLoggedIn = ref(!!localStorage.getItem(TOKEN_KEY));
  const user = ref<any>(null);

  const initUser = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        user.value = payload;
      } catch (e) {
        user.value = null;
      }
    } else {
      user.value = null;
    }
  };

  initUser();

  function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    isLoggedIn.value = true;
    initUser();
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    isLoggedIn.value = false;
    user.value = null;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  return { isLoggedIn, setToken, logout, getToken, user };
});
