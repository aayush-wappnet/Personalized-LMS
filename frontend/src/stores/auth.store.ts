import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { register, login, getProfile } from '../api/auth.api';
import type { AuthRegister, AuthLogin, AuthProfile } from '../types/auth';
import axios from '../utils/axios';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<AuthProfile | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isInstructor = computed(() => user.value?.role === 'instructor');
  const isStudent = computed(() => user.value?.role === 'student');

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const registerUser = async (data: AuthRegister) => {
    const response = await register(data);
    return response;
  };

  const loginUser = async (data: AuthLogin) => {
    const response = await login(data);
    setToken(response.token);
    const profile = await getProfile();
    user.value = profile;
  };

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      user.value = profile;
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const logout = async () => {
    clearAuth();
  };

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchProfile();
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isInstructor,
    isStudent,
    registerUser,
    loginUser,
    fetchProfile,
    logout,
    initializeAuth,
  };
});