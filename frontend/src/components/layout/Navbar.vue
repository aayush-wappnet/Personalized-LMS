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
      <span class="smart-text">Smart </span>
      <span class="learn-text">Learn</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn to="/" text class="mr-4">
      <v-icon left>mdi-home</v-icon>
      Home
    </v-btn>
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
      <v-btn to="/instructor/dashboard" text class="mr-4">
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn to="/instructor/add-course" text class="mr-4">
        <v-icon left>mdi-plus-box</v-icon>
        Add Course
      </v-btn>
      <v-btn to="/instructor/courses" text>
        <v-icon left>mdi-book-open</v-icon>
        My Courses
      </v-btn>
    </template>

    <!-- Admin Menu -->
    <template v-if="isAuthenticated && user?.role === 'admin'">
      <v-btn to="/admin/dashboard" text class="mr-4">
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn to="/admin/courses" text>
        <v-icon left>mdi-book-open</v-icon>
        Courses
      </v-btn>
    </template>

    <!-- User Actions -->
    <v-menu v-if="isAuthenticated" offset-y left nudge-left="50">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list dense class="profile-menu">
        <v-list-item @click="openProfile">
          <v-list-item-title>{{ user?.userName }}</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="logout">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <ProfilePopup ref="profilePopup" :profile="profile || { id: 0, userName: '', email: '', role: 'student' }" />
  </v-app-bar>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getProfile } from '../../api/auth.api';
import type { AuthProfile } from '../../types/auth';
import ProfilePopup from '../ProfilePopup.vue';

const authStore = useAuthStore();
const router = useRouter();
const { showToast } = useToast();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const profile = ref<AuthProfile | null>(null);
const profilePopup = ref<InstanceType<typeof ProfilePopup> | null>(null);

const fetchProfile = async () => {
  try {
    const data = await getProfile();
    profile.value = data;
  } catch (error) {
    showToast('Failed to fetch profile.', 'error');
    profile.value = { id: 0, userName: '', email: '', role: 'student' }; // Fallback to empty profile
  }
};

const openProfile = () => {
  if (profilePopup.value) {
    profilePopup.value.open();
  }
};

const logout = async () => {
  try {
    await authStore.logout();
    showToast('Logged out successfully!', 'success');
    router.push('/login');
    profile.value = null; // Clear profile on logout
  } catch (error) {
    showToast('Logout failed. Please try again.', 'error');
  }
};

onMounted(() => {
  if (isAuthenticated.value) {
    fetchProfile();
  }
});
</script>

<style scoped>
.v-btn {
  text-transform: none;
  font-weight: 500;
  margin-inline: 10px;
  margin-right: 10px;
}

.smart-text {
  color: #152230;
  font-weight: 800;
  font-size: xx-large;
}

.learn-text {
  color: #d1cedc;
  font-weight: 800;
  font-size: xx-large;
}

/* Profile menu styles */
.profile-menu {
  min-width: 150px;
  overflow: hidden !important; /* Remove scrollbar */
}

.profile-menu .v-list-item {
  min-height: 36px;
  cursor: pointer;
}

.profile-menu .v-list-item-title {
  font-size: 0.875rem;
}

.profile-menu .v-divider {
  margin: 4px 0;
}
</style>