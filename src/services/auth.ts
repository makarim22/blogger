import { ref } from 'vue';

const TOKEN_KEY = 'auth_token';

export const isLoggedIn = ref(!!localStorage.getItem(TOKEN_KEY));

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  isLoggedIn.value = true;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  isLoggedIn.value = false;
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};
