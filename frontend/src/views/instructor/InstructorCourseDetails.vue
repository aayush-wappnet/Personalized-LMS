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
        <v-col cols="12">
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
                    Created on: {{ new Date(course.createdAt).toLocaleDateString() }}
                  </p>
                  <p class="text-caption grey--text">
                    Last updated: {{ new Date(course.updatedAt).toLocaleDateString() }}
                  </p>
                  <v-chip
                    :color="getChipColor(course.approvalStatus)"
                    small
                    class="ma-2 rounded-lg"
                  >
                    {{ course.approvalStatus || 'Pending' }}
                  </v-chip>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" text @click="$router.go(-1)">Back to My Courses</v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Modules Section -->
      <v-row v-if="!loading && course">
        <v-col cols="12">
          <h2 class="text-h5 primary--text mb-4">Modules</h2>
          <v-expansion-panels v-model="expandedModuleIndex">
            <v-expansion-panel
              v-for="(module, index) in modules"
              :key="module.id"
              @click="fetchContents(module.id)"
            >
              <v-expansion-panel-header>
                <div>
                  <v-icon left>mdi-book</v-icon>
                  {{ module.title }}
                  <span v-if="module.description" class="text-body-2 grey--text">
                    - {{ module.description }}
                  </span>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <ContentList :module-id="module.id" :content-ids="moduleContents[module.id]?.map(c => c.id) || []" @contentCompleted="onContentCompleted" />
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
  
          <!-- Fallback Message if No Modules -->
          <v-alert v-if="modules.length === 0" type="info" outlined class="mt-4">
            No modules available. Add a new module to get started!
          </v-alert>
  
          <!-- Add Module Button -->
          <v-row class="mt-8">
            <v-col>
              <v-btn color="primary" block @click="openAddModuleDialog">
                <v-icon left>mdi-plus</v-icon>
                Add Module
              </v-btn>
            </v-col>
          </v-row>
  
          <!-- Add Module Dialog -->
          <v-dialog v-model="moduleDialog" max-width="500">
            <v-card>
              <v-card-title>Add Module</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="moduleForm.title"
                  label="Module Title"
                  outlined
                  dense
                  class="mb-4"
                  :rules="[v => !!v || 'Title is required']"
                  required
                ></v-text-field>
                <v-textarea
                  v-model="moduleForm.description"
                  label="Description"
                  outlined
                  dense
                ></v-textarea>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" text @click="moduleDialog = false">Cancel</v-btn>
                <v-btn color="primary" :disabled="!moduleForm.title" @click="saveModule">Add</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth.store';
  import { useToast } from '../../composables/useToast';
  import { getCourseById } from '../../api/course.api';
  import { createModule, getModules } from '../../api/module.api';
  import { getContents } from '../../api/content';
  import ContentList from '../../components/ContentList.vue';
  import type { Course } from '../../types/course';
  import type { Module, Content } from '../../types/module';
  
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const { showToast } = useToast();
  
  const course = ref<Course | null>(null);
  const modules = ref<Module[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const moduleDialog = ref(false);
  const moduleForm = ref({
    title: '',
    description: '',
  });
  const moduleContents = ref<{ [key: number]: Content[] }>({});
  const expandedModuleIndex = ref<number | undefined>(undefined);
  
  const courseId = computed(() => {
    const id = Number(route.params.id);
    if (isNaN(id)) {
      console.error('Course ID is invalid or undefined:', route.params.id);
      return 0;
    }
    return id;
  });
  
  const fetchCourseDetails = async () => {
    if (authStore.user?.role !== 'instructor') {
      showToast('Access denied. Only instructors can view course details.', 'error');
      router.push('/instructor/courses');
      return;
    }
  
    if (!courseId.value) {
      showToast('Invalid course ID.', 'error');
      return;
    }
  
    loading.value = true;
    try {
      const courseData = await getCourseById(courseId.value);
      console.log('Course Data:', courseData);
      course.value = courseData;
      await fetchModules();
    } catch (err) {
      error.value = (err as Error).message;
      showToast(error.value, 'error');
    } finally {
      loading.value = false;
    }
  };
  
  const fetchModules = async () => {
    if (!courseId.value) {
      showToast('Cannot fetch modules: Course ID is invalid.', 'error');
      return;
    }
    try {
      const moduleData = await getModules(courseId.value);
      console.log('Modules Data:', moduleData);
      modules.value = moduleData;
      // Fetch contents for all modules on initial load
      for (const module of moduleData) {
        await fetchContents(module.id);
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };
  
  const fetchContents = async (moduleId: number) => {
    if (moduleContents.value[moduleId]) return; // Avoid refetching
    try {
      const contents = await getContents(moduleId);
      console.log('Contents for module', moduleId, ':', contents);
      moduleContents.value[moduleId] = contents;
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };
  
  const onContentCompleted = (contentId: number) => {
    showToast(`Content ${contentId} completed!`, 'success');
  };
  
  const openAddModuleDialog = () => {
    moduleForm.value = { title: '', description: '' };
    moduleDialog.value = true;
  };
  
  const saveModule = async () => {
    try {
      const newModule = await createModule({
        title: moduleForm.value.title,
        description: moduleForm.value.description,
        courseId: courseId.value,
      });
      showToast('Module added successfully!', 'success');
      modules.value.push(newModule);
      moduleDialog.value = false;
      // Fetch contents for the new module
      await fetchContents(newModule.id);
    } catch (err) {
      showToast((err as Error).message || 'An error occurred.', 'error');
    }
  };
  
  const getChipColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
      default:
        return 'warning';
    }
  };
  
  onMounted(() => {
    fetchCourseDetails();
  });
  </script>
  
  <style scoped>
  .rounded-lg {
    border-radius: 16px !important;
  }
  </style>