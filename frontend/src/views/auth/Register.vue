<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6 register-card" elevation="6">
          <v-card-title class="text-h5 text-center primary--text">Register</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="userName"
                label="Username"
                :rules="rules.userName"
                prepend-icon="mdi-account"
                required
                dense
                outlined
                class="mb-3"
              ></v-text-field>
              <v-text-field
                v-model="email"
                label="Email"
                :rules="rules.email"
                prepend-icon="mdi-email"
                type="email"
                required
                dense
                outlined
                class="mb-3"
              ></v-text-field>
              <v-text-field
                v-model="password"
                :label="'Password'"
                :rules="rules.password"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                dense
                outlined
                class="mb-3"
              ></v-text-field>
              <v-radio-group v-model="role" label="Role" row class="no-hover">
                <v-radio label="Student" value="student"></v-radio>
                <v-radio label="Instructor" value="instructor"></v-radio>
              </v-radio-group>
              <v-btn
                color="primary"
                type="submit"
                block
                :loading="loading"
                class="mt-4"
              >
                Register
              </v-btn>
            </v-form>
            <v-row class="mt-4">
              <v-col class="text-center">
                <router-link to="/login" class="text-decoration-none secondary--text">
                  Already have an account? Login
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import * as yup from 'yup';
import { useForm, useField } from 'vee-validate';
import type { AuthRegister } from '../../types/auth';

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();
const loading = ref(false);
const showPassword = ref(false);

// Form validation schema
const schema = yup.object({
  userName: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  role: yup.string().required('Role is required').oneOf(['student', 'instructor'], 'Invalid role'),
});

// Initialize vee-validate form with explicit type
const { handleSubmit } = useForm<AuthRegister>({
  validationSchema: schema,
});

const { value: userName } = useField<string>('userName');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: role } = useField<string>('role');

// Rules for Vuetify form
const rules = {
  userName: [(v: string) => !!v || 'Username is required', (v: string) => v.length >= 3 || 'Minimum 3 characters'],
  email: [(v: string) => !!v || 'Email is required', (v: string) => /.+@.+\..+/.test(v) || 'Invalid email'],
  password: [(v: string) => !!v || 'Password is required', (v: string) => v.length >= 6 || 'Minimum 6 characters'],
};

// Handle form submission
const onSubmit = handleSubmit(async (values: AuthRegister) => {
  loading.value = true;
  try {
    await authStore.registerUser(values);
    showToast('Registration successful! Please log in.', 'success');
    router.push('/login');
  } catch (error) {
    showToast('Registration failed. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.register-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.v-text-field--outlined fieldset {
  border-color: #bdbdbd;
}

.v-text-field--outlined:hover fieldset {
  border-color: #1976d2;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
}

.no-hover .v-radio:hover {
  background: none !important;
}
</style>