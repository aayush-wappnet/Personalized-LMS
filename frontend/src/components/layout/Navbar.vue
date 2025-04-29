<template>
  <v-app-bar app color="primary" dark>
    <v-img
      src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png" 
      max-height="40"
      max-width="40"
      class="mr-4 ml-4"
      alt="LMS Logo"
    ></v-img>
    <v-toolbar-title>
      <span class="smart-text">Smart</span>
      <span class="learn-text"> Learn</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn  to="/" text class="mr-4">
      <v-icon left>mdi-home</v-icon>
      Home
    </v-btn>
    <!-- <v-btn v-if="!isAuthenticated" to="/courses" text class="mr-4">
      <v-icon left>mdi-book-open</v-icon>
      Courses
    </v-btn> -->
    <v-btn v-if="!isAuthenticated" to="/login" text class="mr-4">
      <v-icon left>mdi-login</v-icon>
      Login
    </v-btn>
    <v-btn v-if="!isAuthenticated" to="/register" text>
      <v-icon left>mdi-account-plus</v-icon>
      Register
    </v-btn>

    <!-- Student Menu -->
    <template v-if="isAuthenticated && user?.role === 'student'">
      <!-- <v-btn to="/dashboard" text class="mr-4">
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn> -->
      <v-btn to="/courses" text class="mr-4">
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
      <v-btn to="/dashboard" text class="mr-4">
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn to="/instructor/add-course" text class="mr-4">
        <v-icon left>mdi-plus-box</v-icon>
        Add Course
      </v-btn>
      <!-- <v-btn to="/instructor/add-module" text class="mr-4">
        <v-icon left>mdi-plus-box</v-icon>
        Add Module
      </v-btn> -->
      <v-btn to="/instructor/courses" text>
        <v-icon left>mdi-book-open</v-icon>
        My Courses
      </v-btn>
    </template>

    <!-- Admin Menu -->
    <template v-if="isAuthenticated && user?.role === 'admin'">
      <v-btn to="/dashboard" text class="mr-4">
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn to="/admin/courses" text>
        <v-icon left>mdi-book-open</v-icon>
        Courses
      </v-btn>
    </template>

    <!-- User Actions -->
    <v-menu v-if="isAuthenticated" offset-y left nudge-left="50" >
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list dense style="max-height: 200px; overflow-y: hidden; min-width: 150px;">
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
  margin-inline: 10px;
}

.logout-item {
  transition: all 0.3s ease;
}

.logout-item:hover {
  background-color: #e3f2fd;
  color: #1976d2;
}

.logout-item:hover .v-list-item-title {
  color: #1976d2;
}

.smart-text {
  color: #152230; /* Blue for "Smart" */
  font-weight: 800;
  font-size: xx-large;
}

.learn-text {
  color: #d1cedc; /* Green for "Learn" */
  font-weight: 800;
  font-size: xx-large;
}
</style>