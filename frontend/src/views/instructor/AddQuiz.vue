```vue
<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 primary--text mb-6">
          <v-icon large left>mdi-plus-circle</v-icon>
          Add Quiz
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
    <v-row v-else>
      <v-col cols="12">
        <v-card class="pa-6 elevation-4">
          <v-form ref="quizForm" v-model="valid" @submit.prevent="submitQuiz">
            <v-text-field
              v-model="quiz.title"
              label="Quiz Title"
              :rules="[v => !!v || 'Quiz title is required']"
              required
              outlined
            ></v-text-field>
            <v-textarea
              v-model="quiz.description"
              label="Quiz Description"
              :rules="[v => !!v || 'Quiz description is required']"
              required
              outlined
            ></v-textarea>

            <!-- Questions -->
            <v-row>
              <v-col cols="12">
                <h3 class="text-h6 mb-4">Questions</h3>
                <v-btn color="primary" @click="addNewQuestion" class="mb-4">
                  <v-icon left>mdi-plus</v-icon>
                  Add Question
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-for="(question, qIndex) in quiz.questions" :key="qIndex">
              <v-col cols="12">
                <v-card outlined class="pa-4">
                  <v-text-field
                    v-model="question.questionText"
                    :label="`Question ${qIndex + 1}`"
                    :rules="[v => !!v || 'Question text is required']"
                    required
                    outlined
                  ></v-text-field>

                  <!-- Options -->
                  <v-row>
                    <v-col cols="12">
                      <h4 class="text-subtitle-1 mb-2">Options</h4>
                      <v-btn color="secondary" small @click="addOption(qIndex)" class="mb-2">
                        <v-icon left small>mdi-plus</v-icon>
                        Add Option
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row v-for="(option, oIndex) in question.options" :key="oIndex">
                    <v-col cols="8">
                      <v-text-field
                        v-model="option.text"
                        :label="`Option ${oIndex + 1}`"
                        :rules="[v => !!v || 'Option text is required']"
                        required
                        outlined
                      ></v-text-field>
                    </v-col>
                    <v-col cols="4">
                      <v-checkbox
                        v-model="question.correctOptionId"
                        :value="oIndex"
                        label="Correct Answer"
                        hide-details
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>

            <v-card-actions>
              <v-btn color="primary" type="submit" :disabled="!valid || submitting">Submit Quiz</v-btn>
              <v-btn color="grey" text @click="goBack">Cancel</v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { createQuiz, addQuestion } from '../../api/quiz.api';
import type { Quiz } from '../../types/quiz';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const valid = ref(false);
const submitting = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const quiz = ref<Quiz>({
  id: 0,
  title: '',
  description: '',
  moduleId: 0,
  createdAt: '',
  updatedAt: '',
  questions: [],
});
const quizForm = ref();

const moduleId = ref<number>(0);

const initializeQuiz = () => {
  const id = Number(route.query.moduleId);
  if (isNaN(id) || id <= 0) {
    showToast('Invalid module ID.', 'error');
    router.push('/instructor/courses');
    return false;
  }
  moduleId.value = id;
  quiz.value.moduleId = id;
  return true;
};

const addNewQuestion = () => {
  quiz.value.questions.push({
    id: 0,
    quizId: 0,
    questionText: '',
    options: [],
    createdAt: '',
    updatedAt: '',
  });
};

const addOption = (questionIndex: number) => {
  const question = quiz.value.questions[questionIndex];
  // Assign a temporary ID based on the current length of options array
  const optionId = question.options.length + 1;
  question.options.push({
    id: optionId,
    text: '',
    isCorrect: false,
  });
};

const submitQuiz = async () => {
  if (!valid.value || !quizForm.value?.validate()) return;

  submitting.value = true;
  try {
    // Step 1: Create the quiz
    const createdQuiz = await createQuiz(moduleId.value, quiz.value.title, quiz.value.description);
    if (!createdQuiz || !createdQuiz.id) {
      throw new Error('Failed to create quiz, no ID returned.');
    }
    quiz.value.id = createdQuiz.id;
    quiz.value.createdAt = createdQuiz.createdAt;
    quiz.value.updatedAt = createdQuiz.updatedAt;

    // Step 2: Add questions and options
    for (const question of quiz.value.questions) {
      if (!question.questionText || question.options.length < 2) {
        throw new Error('Each question must have text and at least 2 options.');
      }
      const correctOption = question.options.find((_, idx) => idx === question.correctOptionId);
      if (!correctOption) {
        throw new Error(`Please select a correct answer for a question.`);
      }
      const optionsWithIds = question.options.map((opt, index) => ({
        id: index + 1, // Ensure each option has an ID
        text: opt.text,
        isCorrect: opt === correctOption,
      }));
      const createdQuestion = await addQuestion(
        createdQuiz.id,
        question.questionText,
        optionsWithIds,
        correctOption.text
      );
      question.id = createdQuestion.id;
      question.quizId = createdQuiz.id;
      question.createdAt = createdQuestion.createdAt;
      question.updatedAt = createdQuestion.updatedAt;
    }

    showToast('Quiz created successfully!', 'success');
    router.push(`/instructor/course/${localStorage.getItem('courseId')}`);
  } catch (err) {
    error.value = (err as Error).message;
    showToast(error.value, 'error');
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push(`/instructor/course/${localStorage.getItem('courseId')}`);
};

onMounted(() => {
  if (authStore.user?.role !== 'instructor') {
    showToast('Access denied. Only instructors can add quizzes.', 'error');
    router.push('/');
    return;
  }
  if (!initializeQuiz()) return;
});
</script>