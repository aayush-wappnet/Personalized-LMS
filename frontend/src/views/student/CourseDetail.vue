<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 primary--text mb-6">
          <v-icon large left>mdi-book-open</v-icon>
          Course Details
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
      <v-col cols="12" md="8">
        <v-card class="pa-6 elevation-4 mb-6">
          <v-row>
            <v-col cols="12" md="12">
              <v-img :src="course.thumbnailUrl" height="200px" class="rounded-lg"></v-img>
            </v-col>
            <v-col cols="12" md="12">
              <v-card-title class="text-h5">{{ course.title }}</v-card-title>
              <v-card-text>
                <p class="text-body-1">{{ course.description }}</p>
                <p class="text-caption grey--text">
                  Enrolled on: {{ new Date(course.createdAt).toLocaleDateString() }}
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
                <v-btn color="primary" text @click="$router.go(-1)">Back to Enrolled Courses</v-btn>
              </v-card-actions>
            </v-col>
          </v-row>
        </v-card>

        <!-- Content Section with Checkbox Dropdown -->
        <v-row v-if="selectedModule">
          <v-col cols="12">
            <h2 class="text-h5 primary--text mb-4">Module Contents</h2>
            <v-select
              v-model="selectedContentIds"
              :items="selectedModuleContents"
              item-title="title"
              item-value="id"
              label="Select Contents"
              multiple
              outlined
              dense
              chips
              small-chips
              @change="onContentSelect"
            >
              <template v-slot:selection="{ item, index }">
                <v-chip v-if="index < 2">
                  <span>{{ item.title }}</span>
                </v-chip>
                <span v-if="index === 2" class="grey--text text-caption ml-2">
                  (+{{ selectedContentIds.length - 2 }} more)
                </span>
              </template>
            </v-select>
            <ContentList :module-id="selectedModule.id" :content-ids="selectedContentIds" @contentCompleted="onContentCompleted" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="4">
        <!-- Module List on the Right -->
        <v-card class="pa-4 elevation-4" height="100%">
          <h2 class="text-h6 primary--text mb-4">Modules</h2>
          <ModuleList v-if="courseId" :course-id="courseId" @selectModule="onModuleSelect" />
          <v-alert v-else type="error" outlined>Course ID is not available.</v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getEnrolledCourseById, getUserById } from '../../api/course.api';
import ModuleList from '../../components/ModuleList.vue';
import ContentList from '../../components/ContentList.vue';
import { getModules } from '../../api/module.api'; // Added getContents import
import { getContents } from '../../api/content'; // Added getContents import
import type { EnrolledCourse } from '../../types/course';
import type { Content, Module } from '../../types/module';

const route = useRoute();
const authStore = useAuthStore();
const { showToast } = useToast();

const course = ref<EnrolledCourse | null>(null);
const instructorName = ref<string | null>(null);
const instructorEmail = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedModule = ref<Module | null>(null);
const selectedContentIds = ref<number[]>([]);
const completedContents = ref<number[]>([]);

const courseId = computed(() => {
  const id = Number(route.params.id);
  if (isNaN(id)) {
    console.error('Course ID is invalid or undefined:', route.params.id);
    return 0; // Fallback to 0 or handle appropriately
  }
  return id;
});

const fetchCourseDetails = async () => {
  if (authStore.user?.role !== 'student') {
    showToast('Access denied. Only students can view enrolled course details.', 'error');
    return;
  }

  if (!courseId.value) {
    showToast('Invalid course ID.', 'error');
    return;
  }

  loading.value = true;
  try {
    const courseData = await getEnrolledCourseById(courseId.value);
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
};

const onModuleSelect = (module: Module | null) => {
  selectedModule.value = module;
  selectedContentIds.value = [];
  completedContents.value = []; // Reset completed contents for new module
};

const selectedModuleContents = computed(() => {
  if (!selectedModule.value) return [];
  return contents.value
    .filter((c) => c.module.id === selectedModule.value!.id)
    .map((c) => ({
      id: c.id,
      title: c.title,
    }));
});

const onContentSelect = (contentIds: number[]) => {
  selectedContentIds.value = contentIds;
};

const onContentCompleted = async (contentId: number) => {
  completedContents.value.push(contentId);
  // Check if all selected contents in the module are completed
  if (selectedModule.value) {
    const allContents = contents.value.filter((c) => c.module.id === selectedModule.value!.id);
    const allCompleted = selectedContentIds.value.every((id) =>
      completedContents.value.includes(id)
    );
    if (allCompleted && allContents.length === selectedContentIds.value.length) {
      showToast('Module completed successfully!', 'success');
    }
  }
};

// Fetch contents for all modules (optional, can be removed if handled by ModuleList)
const contents = ref<Content[]>([]);
const fetchAllContents = async () => {
  if (!courseId.value) {
    showToast('Cannot fetch contents: Invalid course ID.', 'error');
    return;
  }
  try {
    const allModules = await getModules(courseId.value);
    const contentPromises = allModules.map((module) => getContents(module.id));
    const allContents = (await Promise.all(contentPromises)).flat();
    contents.value = allContents;
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

onMounted(() => {
  fetchCourseDetails();
  fetchAllContents();
});
</script>