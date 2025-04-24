<template>
  <v-app-bar app color="primary" dark>
    <v-img
      src="../public/logo.png"
      max-height="40"
      max-width="40"
      class="mr-2"
      alt="LMS Logo"
    ></v-img>
    <v-toolbar-title>LMS Platform</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn v-if="!isAuthenticated" to="/" text>
      <v-icon left>mdi-home</v-icon>
      Home
    </v-btn>
    <v-btn v-if="!isAuthenticated" to="/courses" text>
      <v-icon left>mdi-book-open</v-icon>
      Courses
    </v-btn>
    <v-btn v-if="!isAuthenticated" to="/login" text>
      <v-icon left>mdi-login</v-icon>
      Login
    </v-btn>
    <v-btn v-if="!isAuthenticated" to="/register" text>
      <v-icon left>mdi-account-plus</v-icon>
      Register
    </v-btn>

    <!-- Student Menu -->
    <template v-if="isAuthenticated && user?.role === 'student'">
      <v-btn to="/dashboard" text>
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn to="/courses" text>
        <v-icon left>mdi-book-open</v-icon>
        Courses
      </v-btn>
      <v-btn to="/enrolled-courses" text>
        <v-icon left>mdi-school</v-icon>
        Enrolled Courses
      </v-btn>
    </template>

    <!-- Instructor Menu -->
    <template v-if="isAuthenticated && user?.role === 'instructor'">
      <v-btn to="/dashboard" text>
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn to="/instructor/add-course" text>
        <v-icon left>mdi-plus-box</v-icon>
        Add Course
      </v-btn>
      <v-btn to="/instructor/add-module" text>
        <v-icon left>mdi-plus-box</v-icon>
        Add Module
      </v-btn>
      <v-btn to="/instructor/courses" text>
        <v-icon left>mdi-book-open</v-icon>
        My Courses
      </v-btn>
    </template>

    <!-- Admin Menu -->
    <template v-if="isAuthenticated && user?.role === 'admin'">
      <v-btn to="/dashboard" text>
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn to="/admin/courses" text>
        <v-icon left>mdi-book-open</v-icon>
        Courses
      </v-btn>
    </template>

    <!-- User Actions -->
    <v-menu v-if="isAuthenticated" offset-y left nudge-left="10">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list dense style="max-height: 200px; ;">
        <v-list-item>
          <v-list-item-title>{{ user?.userName }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout" class="logout-item">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';

const authStore = useAuthStore();
const router = useRouter();
const { showToast } = useToast();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const logout = async () => {
  try {
    await authStore.logout();
    showToast('Logged out successfully!', 'success');
    router.push('/login');
  } catch (error) {
    showToast('Logout failed. Please try again.', 'error');
  }
};
</script>

<style scoped>
.v-btn {
  text-transform: none;
  font-weight: 500;
}

.logout-item {
  transition: all 0.3s ease;
}

.logout-item:hover {
  background-color: #e3f2fd;
  /* color: #96c1eb; */
}

.logout-item:hover .v-list-item-title {
  color: #000;
 
  
}
</style>