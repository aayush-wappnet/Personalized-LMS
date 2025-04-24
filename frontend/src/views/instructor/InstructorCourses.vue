<template>
    <v-container class="mt-6">
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 primary--text mb-6">
            <v-icon large left>mdi-book-open</v-icon>
            My Courses
          </h1>
        </v-col>
      </v-row>
      <v-row justify="end" class="mb-4">
        <v-col cols="auto">
          <v-btn color="primary" :to="{ name: 'AddCourse' }">
            <v-icon left>mdi-plus</v-icon>
            Add New Course
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-if="loading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-col>
      </v-row>
      <v-row v-else-if="error">
        <v-col cols="12">
          <v-alert type="error" outlined>{{ error }}</v-alert>
        </v-col>
      </v-row>
      <v-row v-else-if="courses.length === 0">
        <v-col cols="12">
          <v-alert type="info" outlined>No courses created yet. Start by adding a new course!</v-alert>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col v-for="course in courses" :key="course.id" cols="12" sm="6" md="4">
          <v-card class="course-card elevation-4">
            <v-img
              :src="course.thumbnailUrl"
              height="200px"
              class="white--text align-end"
              :hover="false"
              :style="{ backgroundColor: 'white' }"
            ></v-img>
            <v-card-title class="text-subtitle-1 pt-2">{{ course.title }}</v-card-title>
            <v-card-text>
              <div class="text-body-2">{{ course.description }}</div>
              <div class="text-caption grey--text mt-2">
                Status: {{ course.status || 'Pending' }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useAuthStore } from '../../stores/auth.store';
  import { useToast } from '../../composables/useToast';
  import { getCourses } from '../../api/course.api';
  import type { Course } from '../../types/course';
  
  const authStore = useAuthStore();
  const { showToast } = useToast();
  
  const courses = ref<Course[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  onMounted(async () => {
    if (authStore.user?.role !== 'instructor') {
      showToast('Access denied. Only instructors can view their courses.', 'error');
      return;
    }
  
    loading.value = true;
    try {
      const instructorCourses = await getCourses();
      courses.value = instructorCourses;
    } catch (err) {
      error.value = (err as Error).message;
      showToast(error.value, 'error');
    } finally {
      loading.value = false;
    }
  });
  </script>
  
  <style scoped>
  .course-card {
    transition: transform 0.3s ease;
  }
  
  .v-card-title {
    word-break: break-word;
    line-height: 1.2;
  }
  </style>