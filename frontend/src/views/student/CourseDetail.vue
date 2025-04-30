```vue
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

        <!-- Modules Section -->
        <h2 class="text-h5 primary--text mb-4">Modules</h2>
        <v-expansion-panels v-model="expandedModuleIndex">
          <v-expansion-panel v-for="module in modules" :key="module.id">
            <v-expansion-panel-title>
              <v-icon
                left
                :class="{ 'rotate-icon': expandedModuleIndex === modules.indexOf(module) }"
              >
                mdi-chevron-right
              </v-icon>
              <v-checkbox
                v-model="moduleProgress[module.id]"
                :disabled="true"
                :color="moduleProgress[module.id] ? 'success' : 'grey'"
                hide-details
                class="ma-0 pa-0"
              ></v-checkbox>
              {{ module.title }} ({{ moduleDurations[module.id] || 'Calculating...' }})
            </v-expansion-panel-title>
            <v-expansion-panel-content>
              <!-- Contents -->
              <v-list v-if="moduleContents[module.id]?.length">
                <v-subheader>Contents</v-subheader>
                <v-list-item
                  v-for="content in moduleContents[module.id]"
                  :key="content.id"
                  @click="openVideoDialog(content)"
                >
                  <v-list-item-title>
                    <v-checkbox
                      v-model="progress[content.id]"
                      :disabled="true"
                      :color="progress[content.id] ? 'success' : 'grey'"
                      hide-details
                      class="ma-0 pa-0 d-inline-flex"
                    ></v-checkbox>
                    {{ content.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ content.content }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" outlined>No contents available.</v-alert>

              <!-- Quizzes -->
              <v-list v-if="quizzes[module.id]?.length">
                <v-subheader>Quizzes</v-subheader>
                <v-list-item
                  v-for="quiz in quizzes[module.id]"
                  :key="quiz.id"
                  @click="openQuiz(module.id, quiz)"
                  :disabled="quizProgress[quiz.id]"
                >
                  <v-list-item-title>
                    <v-checkbox
                      v-model="quizProgress[quiz.id]"
                      :disabled="true"
                      :color="quizProgress[quiz.id] ? 'success' : 'grey'"
                      hide-details
                      class="ma-0 pa-0 d-inline-flex"
                    ></v-checkbox>
                    {{ quiz.title }}
                    <span v-if="quizProgress[quiz.id]" class="ml-2 text-caption grey--text">
                      (Completed)
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ quiz.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" outlined>No quizzes available.</v-alert>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Video Player Dialog -->
        <v-dialog v-model="videoDialog" max-width="800">
          <v-card>
            <v-card-title>{{ selectedContent?.title }}</v-card-title>
            <v-card-text>
              <VideoPlayer
                :src="selectedContent?.fileUrl || ''"
                :content-id="selectedContent?.id || 0"
                @contentCompleted="handleVideoCompleted"
                @nextVideo="playNextVideo"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="videoDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getEnrolledCourseById, getUserById } from '../../api/course.api';
import { getModules } from '../../api/module.api';
import { getContents } from '../../api/content';
import { getQuizzes } from '../../api/quiz.api';
import { getQuizAttempts } from '../../api/quizAttempt.api';
import { getModuleProgress, updateModuleProgress } from '../../api/moduleProgress.api.ts';
import type { EnrolledCourse } from '../../types/course';
import type { Module, Content } from '../../types/module';
import type { Quiz } from '../../types/quiz';
import type { QuizAttempt } from '../../types/quizAttempt';
import type { ModuleProgress } from '../../types/moduleProgress';
import VideoPlayer from '../../components/VideoPlayer.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const course = ref<EnrolledCourse | null>(null);
const instructorName = ref<string | null>(null);
const instructorEmail = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const modules = ref<Module[]>([]);
const moduleContents = ref<{ [key: number]: Content[] }>({});
const quizzes = ref<{ [key: number]: Quiz[] }>({});
const expandedModuleIndex = ref<number | undefined>(undefined);
const progress = ref<{ [key: number]: boolean }>({}); // Content completion
const quizProgress = ref<{ [key: number]: boolean }>({}); // Quiz completion
const moduleProgress = ref<{ [key: number]: boolean }>({}); // Module completion
const previouslyCompletedModules = ref(new Set<number>());
const videoDialog = ref(false);
const selectedContent = ref<Content | null>(null);
const currentModuleId = ref<number | null>(null);
const moduleDurations = ref<{ [key: number]: string }>({}); // Store calculated durations

const courseId = computed(() => {
  const id = Number(route.params.id);
  if (isNaN(id) || id <= 0) {
    console.error('Invalid courseId:', route.params.id);
    return 0;
  }
  return id;
});

// Load progress from localStorage
const loadProgressFromLocalStorage = () => {
  const savedProgress = localStorage.getItem(`course_${courseId.value}_progress`);
  if (savedProgress) {
    progress.value = JSON.parse(savedProgress);
  }
};

// Save progress to localStorage
const saveProgressToLocalStorage = () => {
  localStorage.setItem(`course_${courseId.value}_progress`, JSON.stringify(progress.value));
};

const fetchCourseDetails = async () => {
  if (authStore.user?.role !== 'student') {
    showToast('Access denied. Only students can view enrolled course details.', 'error');
    router.push('/');
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

    localStorage.setItem('courseId', courseId.value.toString());
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
    showToast('Cannot fetch modules: Invalid course ID.', 'error');
    return;
  }
  try {
    modules.value = await getModules(courseId.value);
    // Load progress after modules are fetched to ensure content IDs are available
    loadProgressFromLocalStorage();
    for (const module of modules.value) {
      await fetchModuleData(module.id);
      await fetchModuleProgress(module.id);
      await calculateModuleDuration(module.id);
    }
    await syncModuleProgress();
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

const fetchModuleData = async (moduleId: number) => {
  try {
    const [contents, quizData] = await Promise.all([getContents(moduleId), getQuizzes(moduleId)]);
    moduleContents.value[moduleId] = contents;
    quizzes.value[moduleId] = quizData;

    for (const quiz of quizData) {
      try {
        const attempts: QuizAttempt[] = await getQuizAttempts(quiz.id);
        quizProgress.value[quiz.id] = attempts.some(attempt => attempt.score >= 80);
      } catch (err) {
        console.error(`Failed to fetch quiz attempts for quiz ${quiz.id}:`, err);
        quizProgress.value[quiz.id] = false;
      }
    }
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

const fetchModuleProgress = async (moduleId: number) => {
  try {
    const response: ModuleProgress = await getModuleProgress(moduleId);
    moduleProgress.value[moduleId] = response.isCompleted || false;
  } catch (err) {
    console.error(`Failed to fetch module progress for module ${moduleId}:`, err);
    moduleProgress.value[moduleId] = false;
  }
};

const syncModuleProgressWithApi = async (moduleId: number) => {
  try {
    const contentIds = moduleContents.value[moduleId]?.map(c => c.id) || [];
    const quizIds = quizzes.value[moduleId]?.map(q => q.id) || [];
    const totalItems = contentIds.length + quizIds.length;
    const completedContent = contentIds.filter(id => progress.value[id] || false).length;
    const completedQuizzes = quizIds.filter(id => quizProgress.value[id] || false).length;
    const completedItems = completedContent + completedQuizzes;
    const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const isCompleted = progressPercentage === 100;

    await updateModuleProgress(moduleId, {
      progressPercentage,
      isCompleted,
    });

    moduleProgress.value[moduleId] = isCompleted;
    if (isCompleted && !previouslyCompletedModules.value.has(moduleId)) {
      showToast(`Module ${modules.value.find(m => m.id === moduleId)?.title || 'Unknown'} completed!`, 'success');
      previouslyCompletedModules.value.add(moduleId);
    }
  } catch (err) {
    console.error(`Failed to update module progress for module ${moduleId}:`, err);
    showToast('Failed to update module progress.', 'error');
  }
};

const calculateModuleDuration = async (moduleId: number) => {
  const contents = moduleContents.value[moduleId] || [];
  let totalDuration = 0;

  for (const content of contents) {
    if (content.fileUrl) {
      const duration = await getVideoDuration(content.fileUrl);
      totalDuration += duration;
    }
  }

  const minutes = Math.floor(totalDuration / 60);
  const seconds = Math.floor(totalDuration % 60);
  moduleDurations.value[moduleId] = `${minutes}m ${seconds}s`;
};

const getVideoDuration = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = () => {
      resolve(0); // Fallback to 0 if video fails to load
    };
  });
};

const openVideoDialog = (content: Content) => {
  if (content.fileUrl) {
    selectedContent.value = content;
    currentModuleId.value = content.module.id;
    videoDialog.value = true;
  }
};

const handleVideoCompleted = (contentId: number) => {
  if (!progress.value[contentId]) {
    progress.value[contentId] = true;
    showToast(`Content ${contentId} completed!`, 'success');
    saveProgressToLocalStorage(); // Save to localStorage
    if (currentModuleId.value) {
      syncModuleProgressWithApi(currentModuleId.value);
    }
  }
};

const playNextVideo = (currentContentId: number) => {
  if (!currentModuleId.value) return;

  const contents = moduleContents.value[currentModuleId.value] || [];
  const currentIndex = contents.findIndex(content => content.id === currentContentId);
  if (currentIndex === -1 || currentIndex === contents.length - 1) {
    videoDialog.value = false; // No more videos in this module
    return;
  }

  const nextContent = contents[currentIndex + 1];
  if (nextContent.fileUrl) {
    selectedContent.value = nextContent;
  } else {
    videoDialog.value = false;
  }
};

const openQuiz = (moduleId: number, quiz: Quiz) => {
  console.log('Quiz data:', { id: quiz.id, moduleId });
  if (typeof moduleId !== 'number' || !quiz.id) {
    console.error('Invalid quiz data:', { moduleId, quiz });
    showToast('Invalid quiz data. Please try again.', 'error');
    return;
  }
  console.log('Navigating to quiz:', { moduleId, quizId: quiz.id });
  router.push(`/student/quiz/${moduleId}?quizId=${quiz.id}`);
};

const syncModuleProgress = async () => {
  for (const module of modules.value) {
    await syncModuleProgressWithApi(module.id);
  }
};

// Listen for quiz completion messages from StudentQuiz.vue
const handleQuizCompletion = async (event: MessageEvent) => {
  if (event.data.type === 'quizCompleted') {
    const { quizId, score } = event.data;
    quizProgress.value[quizId] = score >= 80;
    // Find the module that contains this quiz
    const moduleId = Object.keys(quizzes.value).find(modId => 
      quizzes.value[Number(modId)].some((q: Quiz) => q.id === quizId)
    );
    if (moduleId) {
      await syncModuleProgressWithApi(Number(moduleId));
    }
  }
};

onMounted(() => {
  fetchCourseDetails();
  window.addEventListener('message', handleQuizCompletion);
});

onUnmounted(() => {
  window.removeEventListener('message', handleQuizCompletion);
});
</script>

<style scoped>
.rounded-lg {
  border-radius: 16px !important;
}

.rotate-icon {
  transform: rotate(90deg);
  transition: transform 0.3s;
}

.d-inline-flex {
  display: inline-flex;
  vertical-align: middle;
  margin-right: 8px;
}
</style>
```