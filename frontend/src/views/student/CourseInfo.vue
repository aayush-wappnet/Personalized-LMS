<template>
  <v-container fluid class="mt-6">
    <!-- Course Information Section -->
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
            <v-col cols="12" md="4" lg="3">
              <v-img :src="course.thumbnailUrl" height="200px" class="rounded-lg"></v-img>
            </v-col>
            <v-col cols="12" md="8" lg="9">
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

    <!-- Recommended Courses Section -->
    <v-row class="mt-8" v-if="!loading && course">
      <v-col cols="12">
        <h2 class="text-h5 primary--text mb-4">
          <v-icon left>mdi-lightbulb-on</v-icon>
          Recommended Courses
        </h2>
      </v-col>
      <v-col cols="12" v-if="recommendationLoading">
        <v-progress-circular indeterminate color="primary" class="d-block mx-auto"></v-progress-circular>
      </v-col>
      <v-col cols="12" v-else-if="recommendationError">
        <v-alert type="warning" outlined>{{ recommendationError }}</v-alert>
      </v-col>
      <v-col cols="12" v-else-if="recommendedCourses.length === 0">
        <v-alert type="info" outlined>No recommended courses available.</v-alert>
      </v-col>
      <v-col v-else cols="12" sm="4" v-for="recommendedCourse in recommendedCourses" :key="recommendedCourse.id">
        <v-card class="recommendation-card elevation-3 ma-2" @click="navigateToCourse(recommendedCourse.id)">
          <v-img :src="recommendedCourse.thumbnailUrl" height="150px" class="rounded-t-lg"></v-img>
          <v-card-title class="text-subtitle-1 font-weight-medium">{{ recommendedCourse.title }}</v-card-title>
          <v-card-text>
            <p class="text-body-2 text-truncate">{{ recommendedCourse.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getCourseById, getUserById } from '../../api/course.api';
import { getRecommendedCourses } from '../../api/recommendation.api';
import type { Course, User } from '../../types/course';
import type { RecommendedCourse } from '../../types/recommendations';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const course = ref<Course | null>(null);
const instructorName = ref<string | null>(null);
const instructorEmail = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Recommendation-related state
const recommendedCourses = ref<RecommendedCourse[]>([]);
const recommendationLoading = ref(false);
const recommendationError = ref<string | null>(null);

// Function to load course data
const loadCourseData = async (courseId: number) => {
  loading.value = true;
  error.value = null;
  course.value = null;
  instructorName.value = null;
  instructorEmail.value = null;

  try {
    const courseData = await getCourseById(courseId);
    course.value = courseData;

    if (courseData.instructorId) {
      const instructor = await getUserById(courseData.instructorId);
      instructorName.value = instructor.userName;
      instructorEmail.value = instructor.email;
    }

    // Load recommendations asynchronously
    loadRecommendations(courseId);
  } catch (err) {
    error.value = (err as Error).message;
    showToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
};

// Function to load recommendations
const loadRecommendations = async (courseId: number) => {
  recommendationLoading.value = true;
  recommendationError.value = null;
  recommendedCourses.value = [];

  try {
    recommendedCourses.value = await getRecommendedCourses(courseId);
  } catch (err) {
    recommendationError.value = (err as Error).message;
    showToast(recommendationError.value, 'error');
  } finally {
    recommendationLoading.value = false;
  }
};

// Initial load on component mount
onMounted(() => {
  if (authStore.user?.role !== 'student') {
    showToast('Access denied. Only students can view course details.', 'error');
    return;
  }

  const courseId = Number(route.params.id);
  loadCourseData(courseId);
});

// Watch for route changes to reload course data
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      const courseId = Number(newId);
      loadCourseData(courseId);
    }
  }
);

// Navigate to a recommended course
const navigateToCourse = (courseId: number) => {
  router.push(`/courses/${courseId}`);
};
</script>

<style scoped>
.recommendation-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.recommendation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>