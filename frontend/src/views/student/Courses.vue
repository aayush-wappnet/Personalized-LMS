<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 primary--text mb-6">
          <v-icon large left>mdi-book-open</v-icon>
          Available Courses
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
        <v-alert type="info" outlined>No courses available.</v-alert>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col v-for="course in courses" :key="course.id" cols="12" sm="6" md="4">
        <v-card
          class="course-card elevation-4"
          :class="{ 'scale-up': true }"
          @click="$router.push({ name: 'CourseInfo', params: { id: course.id } })"
        >
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
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :color="isEnrolled(course.id) ? 'grey' : 'primary'"
              text
              @click.stop="isEnrolled(course.id) ? null : confirmEnroll(course.id)"
              :disabled="isEnrolled(course.id) || enrolling[course.id]"
              class="transition-btn"
              :class="{ 'hover-btn': !isEnrolled(course.id) && hovered[course.id] }"
              @mouseover="hovered[course.id] = true"
              @mouseleave="hovered[course.id] = false"
            >
              {{ enrolling[course.id] ? 'Enrolling...' : isEnrolled(course.id) ? 'Already Enrolled' : 'Enroll Now' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Enrollment</v-card-title>
        <v-card-text>
          Are you sure you want to enroll in this course?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="enroll(selectedCourseId!)">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getCourses, enrollCourse, getEnrolledCourses } from '../../api/course.api';
import type { Course } from '../../types/course';

const authStore = useAuthStore();
const { showToast } = useToast();

const courses = ref<Course[]>([]);
const enrolledCourses = ref<Course[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const enrolling = ref<{ [key: number]: boolean }>({});
const hovered = ref<{ [key: number]: boolean }>({});
const dialog = ref(false);
const selectedCourseId = ref<number | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    const [availableCourses, enrolled] = await Promise.all([getCourses(), getEnrolledCourses()]);
    courses.value = availableCourses;
    enrolledCourses.value = enrolled;
  } catch (err) {
    error.value = (err as Error).message;
    showToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
});

const isEnrolled = computed(() => {
  const enrolledIds = new Set(enrolledCourses.value.map(c => c.id));
  return (courseId: number) => enrolledIds.has(courseId);
});

const confirmEnroll = (courseId: number) => {
  selectedCourseId.value = courseId;
  dialog.value = true;
};

const enroll = async (courseId: number) => {
  if (authStore.user?.role !== 'student') {
    showToast('Access denied. Only students can enroll in courses.', 'error');
    dialog.value = false;
    return;
  }

  enrolling.value[courseId] = true;
  try {
    await enrollCourse(courseId);
    showToast('Successfully enrolled in the course!', 'success');
    const updatedEnrolled = await getEnrolledCourses();
    enrolledCourses.value = updatedEnrolled;
  } catch (err) {
    showToast((err as Error).message, 'error');
  } finally {
    enrolling.value[courseId] = false;
    dialog.value = false;
    selectedCourseId.value = null;
  }
};
</script>

<style scoped>
.course-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.scale-up:hover {
  transform: scale(1.03);
  color: null;
  transition: all 0.9s ease;
}

.transition-btn {
  transition: all 0.9s ease;
}

.hover-btn {
  transform: translateY(-2px);
}

.v-card-title {
  word-break: break-word;
  line-height: 1.2;
}
</style>