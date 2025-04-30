```vue
<template>
  <v-container class="mt-6">
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
    <v-row v-else>
      <v-col cols="12">
        <h2 class="text-h5 primary--text mb-4">Take Quiz: {{ quiz?.title }}</h2>
        <v-card v-if="quiz && quiz.questions?.length" class="pa-6 elevation-4">
          <v-form ref="quizForm" v-model="valid" @submit.prevent="submitQuiz">
            <v-list>
              <v-list-item v-for="question in quiz.questions" :key="question.id">
                <v-list-item-title>{{ question.questionText }}</v-list-item-title>
                <v-radio-group v-model="answers[question.id]" :rules="[v => !!v || 'Please select an answer']">
                  <v-radio
                    v-for="option in question.options"
                    :key="option.id"
                    :label="option.text"
                    :value="option.id"
                  ></v-radio>
                </v-radio-group>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <v-btn color="primary" type="submit" :disabled="!valid || submitting">Submit</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
        <v-alert v-else type="info" outlined>No quiz or questions available for this module.</v-alert>
      </v-col>
    </v-row>

    <!-- Result Popup -->
    <v-dialog v-model="showResultDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Quiz Result</v-card-title>
        <v-card-text>
          <p>Your score: {{ score }}%</p>
          <p>You can move to the next module.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="redirectToCourseDetails">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getQuizzes } from '../../api/quiz.api';
import { submitQuizAttempt } from '../../api/quizAttempt.api';
import type { Quiz } from '../../types/quiz';
import type { QuizAttempt } from '../../types/quizAttempt';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const loading = ref(false);
const error = ref<string | null>(null);
const quiz = ref<Quiz | null>(null);
const answers = ref<{ [key: number]: number }>({});
const valid = ref(false);
const submitting = ref(false);
const score = ref<number | null>(null);
const showResultDialog = ref(false);

const moduleId = computed(() => {
  const id = Number(route.params.moduleId);
  if (isNaN(id) || id <= 0) {
    console.error('Invalid moduleId:', route.params.moduleId, 'Route params:', route.params);
    showToast('Invalid module ID. Redirecting to course details.', 'error');
    router.push(`/student/course/${courseId.value || 1}`);
    return 0;
  }
  return id;
});

const quizId = computed(() => {
  const id = Number(route.query.quizId);
  if (isNaN(id) || id <= 0) {
    console.error('Invalid quizId:', route.query.quizId, 'Route query:', route.query);
    showToast('Invalid quiz ID.', 'error');
    return 0;
  }
  return id;
});

const courseId = computed(() => {
  const id = Number(localStorage.getItem('courseId'));
  if (isNaN(id) || id <= 0) {
    console.error('Invalid courseId from localStorage:', localStorage.getItem('courseId'));
    return 0;
  }
  return id;
});

const fetchQuiz = async () => {
  if (!moduleId.value || !quizId.value) {
    showToast('Invalid module or quiz ID.', 'error');
    return;
  }

  loading.value = true;
  try {
    const quizzesData = await getQuizzes(moduleId.value);
    quiz.value = quizzesData.find(q => q.id === quizId.value) || null;
    if (!quiz.value) {
      showToast(`Quiz with ID ${quizId.value} not found for module ${moduleId.value}.`, 'error');
      return;
    }
    if (!quiz.value.questions?.length) {
      showToast('No questions available for this quiz.', 'info');
    }
  } catch (err) {
    error.value = (err as Error).message;
    showToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
};

const submitQuiz = async () => {
  if (!quiz.value || !valid.value) return;

  submitting.value = true;
  try {
    const answerArray = Object.entries(answers.value).map(([questionId, selectedOptionId]) => ({
      questionId: Number(questionId),
      selectedOptionId: Number(selectedOptionId),
    }));
    const attempt: QuizAttempt = await submitQuizAttempt(quiz.value.id, answerArray);
    score.value = attempt.score;
    showResultDialog.value = true;
    emit('contentCompleted', quiz.value.id);
  } catch (err) {
    showToast((err as Error).message || 'An error occurred.', 'error');
  } finally {
    submitting.value = false;
  }
};

const redirectToCourseDetails = () => {
  showResultDialog.value = false;
  if (!courseId.value) {
    showToast('Course ID not found. Redirecting to home.', 'error');
    router.push('/');
    return;
  }
  router.push(`/courses/enrolled/${courseId.value}`);
};

const emit = defineEmits<{
  (e: 'contentCompleted', contentId: number): void;
}>();

onMounted(() => {
  if (authStore.user?.role !== 'student') {
    showToast('Access denied. Only students can take quizzes.', 'error');
    router.push('/');
    return;
  }
  fetchQuiz();
});
</script>
```