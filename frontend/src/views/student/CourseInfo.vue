<template>
    <v-container class="mt-6">
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 primary--text mb-6">
            <v-icon large left>mdi-book-open</v-icon>
            Course Information
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
      <v-row v-else-if="!course">
        <v-col cols="12">
          <v-alert type="info" outlined>Course not found.</v-alert>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12">
          <v-card class="pa-6 elevation-4">
            <v-row>
              <v-col cols="12" md="4">
                <v-img
                  :src="course.thumbnailUrl"
                  height="200px"
                  class="rounded-lg"
                ></v-img>
              </v-col>
              <v-col cols="12" md="8">
                <v-card-title class="text-h5">{{ course.title }}</v-card-title>
                <v-card-text>
                  <p class="text-body-1">{{ course.description }}</p>
                  <p class="text-caption grey--text">
                    Created on: {{ new Date(course.createdAt).toLocaleDateString() }}
                  </p>
                  <p class="text-caption grey--text">
                    Last updated: {{ new Date(course.updatedAt).toLocaleDateString() }}
                  </p>
                  <p class="text-caption grey--text">
                    Instructor: {{ instructorName || 'Loading...' }}
                  </p>
                  <p class="text-caption grey--text">
                    Instructor Email: {{ instructorEmail || 'Loading...' }}
                  </p>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" text @click="$router.go(-1)">
                    Back to Courses
                  </v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAuthStore } from '../../stores/auth.store';
  import { useToast } from '../../composables/useToast';
  import { getCourseById, getUserById } from '../../api/course.api';
  import type { Course, User } from '../../types/course';
  
  const route = useRoute();
  const authStore = useAuthStore();
  const { showToast } = useToast();
  
  const course = ref<Course | null>(null);
  const instructorName = ref<string | null>(null);
  const instructorEmail = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  onMounted(async () => {
    if (authStore.user?.role !== 'student') {
      showToast('Access denied. Only students can view course details.', 'error');
      return;
    }
  
    loading.value = true;
    try {
      const courseId = Number(route.params.id);
      const courseData = await getCourseById(courseId);
      course.value = courseData;
  
      if (courseData.instructorId) {
        const instructor = await getUserById(courseData.instructorId);
        instructorName.value = instructor.userName;
        instructorEmail.value = instructor.email;
      }
    } catch (err) {
      error.value = (err as Error).message;
      showToast(error.value, 'error');
    } finally {
      loading.value = false;
    }
  });
  </script>