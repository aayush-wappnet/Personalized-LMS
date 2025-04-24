<template>
    <v-container class="mt-6">
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 primary--text mb-6">
            <v-icon large left>mdi-school</v-icon>
            My Enrolled Courses
          </h1>
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
          <v-alert type="info" outlined>No enrolled courses found.</v-alert>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col v-for="course in courses" :key="course.id" cols="12" sm="6" md="4">
          <v-card class="course-card elevation-4" :class="{ 'scale-up': true }">
            <v-img
              :src="course.thumbnailUrl"
              height="200px"
              class="white--text align-end"
            ></v-img>
            <v-card-title class="text-subtitle-1 pt-2">{{ course.title }}</v-card-title>
            <v-card-text>
              <div class="text-body-2">{{ course.description }}</div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                text
                :to="{ name: 'CourseDetail', params: { id: course.id } }"
                class="transition-btn"
                :class="{ 'hover-btn': hovered[course.id] }"
                @mouseover="hovered[course.id] = true"
                @mouseleave="hovered[course.id] = false"
              >
                View Course
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useAuthStore } from '../../stores/auth.store';
  import { useToast } from '../../composables/useToast';
  import { getEnrolledCourses } from '../../api/course.api';
  import type { EnrolledCourse } from '../../types/course';
  
  const authStore = useAuthStore();
  const { showToast } = useToast();
  
  const courses = ref<EnrolledCourse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hovered = ref<{ [key: number]: boolean }>({});
  
  onMounted(async () => {
    if (authStore.user?.role !== 'student') {
      showToast('Access denied. Only students can view enrolled courses.', 'error');
      return;
    }
  
    loading.value = true;
    try {
      const enrolledCourses = await getEnrolledCourses();
      courses.value = enrolledCourses;
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
  
  .scale-up:hover {
    transform: scale(1.03);
  }
  
  .transition-btn {
    transition: all 0.3s ease;
  }
  
  .hover-btn {
    transform: translateY(-2px);
  }
  
  .v-card-title {
    word-break: break-word;
    line-height: 1.2;
  }
  </style>