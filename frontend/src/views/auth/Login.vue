<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 login-card elevation-6" :class="{ 'scale-up': showCard }">
          <v-card-title class="text-h4 text-center primary--text mb-4">
            <v-icon large left>mdi-login</v-icon>
            Login
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="email"
                label="Email"
                :rules="rules.email"
                prepend-icon="mdi-email"
                type="email"
                required
                dense
                outlined
                class="mb-4 transition-input"
                @focus="onFocus"
                @blur="onBlur"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                :rules="rules.password"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                dense
                outlined
                class="mb-4 transition-input"
                @focus="onFocus"
                @blur="onBlur"
              ></v-text-field>
              <v-btn
                color="primary"
                type="submit"
                block
                :loading="loading"
                class="mt-6 transition-btn"
                :class="{ 'hover-btn': isHovered }"
                @mouseover="isHovered = true"
                @mouseleave="isHovered = false"
              >
                Login
              </v-btn>
            </v-form>
            <v-row class="mt-4">
              <v-col class="text-center">
                <router-link to="/register" class="text-decoration-none secondary--text transition-link">
                  Don't have an account? Register
                </router-link>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import * as yup from 'yup';
import { useForm, useField } from 'vee-validate';
import type { AuthLogin } from '../../types/auth';

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();
const loading = ref(false);
const showPassword = ref(false);
const isHovered = ref(false);
const showCard = ref(false);

onMounted(() => {
  setTimeout(() => (showCard.value = true), 100);
});

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const { handleSubmit } = useForm<AuthLogin>({
  validationSchema: schema,
});

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const rules = {
  email: [(v: string) => !!v || 'Email is required', (v: string) => /.+@.+\..+/.test(v) || 'Invalid email'],
  password: [(v: string) => !!v || 'Password is required', (v: string) => v.length >= 6 || 'Minimum 6 characters'],
};

const onSubmit = handleSubmit(async (values: AuthLogin) => {
  loading.value = true;
  try {
    await authStore.loginUser(values);
    showToast('Login successful!', 'success');
    if (authStore.user?.role === 'student') {
      router.push('/');
    } else {
      router.push('/dashboard');
    }
  } catch (error) {
    showToast('Login failed. Please check your credentials.', 'error');
  } finally {
    loading.value = false;
  }
});

const onFocus = () => {};
const onBlur = () => {};
</script>

<style scoped>
.login-card {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: transform 0.3s ease;
}

.scale-up {
  transform: scale(1.02);
}

.transition-input {
  transition: all 0.3s ease;
}

.transition-input:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transition-btn {
  transition: all 0.3s ease;
}

.hover-btn {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.transition-link {
  transition: color 0.3s ease;
}

.transition-link:hover {
  color: #1976d2 !important;
}
</style>