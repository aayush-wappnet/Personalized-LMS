<template>
  <div>
    <v-list>
      <v-list-item
        v-for="module in modules"
        :key="module.id"
        @click="toggleModule(module)"
      >
        <v-list-item-title>
          <v-icon
            left
            :class="{ 'rotate-icon': expandedModules[module.id] }"
            @click.stop="fetchModuleData(module.id)"
          >
            mdi-chevron-right
          </v-icon>
          <v-checkbox
            v-model="moduleProgress[module.id]"
            :disabled="true"
            :color="moduleProgress[module.id] ? 'success' : 'grey'"
            hide-details
          ></v-checkbox>
          {{ module.title }} ({{ moduleDuration(module) }})
        </v-list-item-title>
        <v-list-item-subtitle v-if="module.description">{{ module.description }}</v-list-item-subtitle>
        <v-expansion-panel v-model="expandedModules[module.id]">
          <v-expansion-panel-content>
            <ContentList
              :module-id="module.id"
              :content-ids="moduleContents[module.id]?.map(c => c.id) || []"
              @contentCompleted="onContentCompleted"
            />
            <v-card class="mt-4" v-if="quizzes[module.id]?.length">
              <v-card-title>Quizzes</v-card-title>
              <v-list>
                <v-list-item
                  v-for="quiz in quizzes[module.id]"
                  :key="quiz.id"
                  @click.stop="openQuiz(quiz)"
                >
                  <v-list-item-title>
                    <v-icon left :color="quizProgress[quiz.id] ? 'success' : 'grey'">
                      {{ quizProgress[quiz.id] ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                    </v-icon>
                    {{ quiz.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>{{ quiz.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
            <v-alert v-else type="info" outlined>No quizzes available.</v-alert>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-list-item>
    </v-list>

    <!-- Add Module Button (Instructor) -->
    <v-row v-if="isInstructor" class="mt-4">
      <v-col>
        <v-btn color="primary" block @click="openAddModuleDialog">
          <v-icon left>mdi-plus</v-icon>
          Add Module
        </v-btn>
      </v-col>
    </v-row>

    <!-- Add/Edit Module Dialog -->
    <v-dialog v-model="moduleDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Module' : 'Add Module' }}</v-card-title>
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
          <v-text-field
            v-model="moduleForm.duration"
            label="Duration (e.g., 6/6hr1min)"
            outlined
            dense
            class="mb-4"
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
          <v-btn color="primary" :disabled="!moduleForm.title" @click="saveModule">{{ editMode ? 'Update' : 'Add' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Module Dialog -->
    <v-dialog v-model="editModuleDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Module</v-card-title>
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
          <v-text-field
            v-model="moduleForm.duration"
            label="Duration (e.g., 6/6hr1min)"
            outlined
            dense
            class="mb-4"
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
          <v-btn color="grey" text @click="editModuleDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!moduleForm.title" @click="saveModule">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteModuleDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this module? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteModuleDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteSelectedModule">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useToast } from '../composables/useToast';
import { createModule, getModules, updateModule, deleteModule } from '../api/module.api';
import { getContents } from '../api/content';
import { getQuizzes } from '../api/quiz.api';
import ContentList from './ContentList.vue';
import type { Module, Content } from '../types/module';
import type { Quiz } from '../types/quiz';
import { useRouter } from 'vue-router';

const props = defineProps<{
  courseId: number;
}>();

const emit = defineEmits<{
  (e: 'selectModule', module: Module | null): void;
  (e: 'contentCompleted', contentId: number): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const modules = ref<Module[]>([]);
const selectedModule = ref<Module | null>(null);
const moduleDialog = ref(false);
const editModuleDialog = ref(false);
const deleteModuleDialog = ref(false);
const editMode = ref(false);
const moduleForm = ref({
  title: '',
  duration: '',
  description: '',
});
const moduleContents = ref<{ [key: number]: Content[] }>({});
const expandedModules = ref<{ [key: number]: boolean }>({});
const quizzes = ref<{ [key: number]: Quiz[] }>({});
const moduleProgress = ref<{ [key: number]: boolean }>({}); // Track module completion
const quizProgress = ref<{ [key: number]: boolean }>({});  // Track quiz completion

const isInstructor = computed(() => authStore.user?.role === 'instructor');

const fetchModules = async () => {
  if (!props.courseId) {
    showToast('Cannot fetch modules: Course ID is invalid.', 'error');
    return;
  }
  try {
    modules.value = await getModules(props.courseId);
    if (modules.value.length > 0 && !selectedModule.value) {
      selectedModule.value = modules.value[0];
      emit('selectModule', selectedModule.value);
    }
    // Fetch quizzes and contents for all modules
    for (const module of modules.value) {
      await fetchModuleData(module.id);
    }
    updateProgress();
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

const fetchModuleData = async (moduleId: number) => {
  try {
    const [contents, quizData] = await Promise.all([getContents(moduleId), getQuizzes(moduleId)]);
    moduleContents.value[moduleId] = contents;
    quizzes.value[moduleId] = quizData;
    expandedModules.value[moduleId] = true;
    updateProgress();
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

const toggleModule = (module: Module) => {
  selectedModule.value = module;
  emit('selectModule', module);
  if (!moduleContents.value[module.id] || !quizzes.value[module.id]) {
    fetchModuleData(module.id);
  } else {
    expandedModules.value[module.id] = !expandedModules.value[module.id];
  }
};

const onContentCompleted = (contentId: number) => {
  showToast(`Content ${contentId} completed!`, 'success');
  progress.value[contentId] = true;
  updateProgress();
};

const openQuiz = (quiz: Quiz) => {
  if (authStore.user?.role === 'student') {
    router.push(`/student/quiz/${quiz.moduleId}?quizId=${quiz.id}`);
  }
};

const updateProgress = () => {
  modules.value.forEach(module => {
    const contentIds = moduleContents.value[module.id]?.map(c => c.id) || [];
    const quizIds = quizzes.value[module.id]?.map(q => q.id) || [];
    const allContentCompleted = contentIds.every(id => progress.value[id]);
    const allQuizzesCompleted = quizIds.every(id => quizProgress.value[id]);
    moduleProgress.value[module.id] = allContentCompleted && allQuizzesCompleted;

    quizIds.forEach(quizId => {
      // Check if quiz is completed (e.g., submitted with score >= 80%)
      // This requires fetching quiz attempts, which we'll assume for now
      quizProgress.value[quizId] = false; // Placeholder until quiz attempt data is integrated
    });
  });
};

const openAddModuleDialog = () => {
  editMode.value = false;
  moduleForm.value = { title: '', duration: '', description: '' };
  moduleDialog.value = true;
};

const saveModule = async () => {
  try {
    if (editMode.value && selectedModule.value) {
      await updateModule(selectedModule.value.id, {
        title: moduleForm.value.title,
        description: moduleForm.value.description,
      });
      showToast('Module updated successfully!', 'success');
    } else {
      const newModule = await createModule({
        title: moduleForm.value.title,
        description: moduleForm.value.description,
        courseId: props.courseId,
      });
      showToast('Module added successfully!', 'success');
      modules.value.push(newModule);
    }
    await fetchModules();
    moduleDialog.value = false;
    editModuleDialog.value = false;
  } catch (err) {
    showToast((err as Error).message || 'An error occurred.', 'error');
  }
};

const openEditModuleDialog = () => {
  if (selectedModule.value) {
    editMode.value = true;
    moduleForm.value = {
      title: selectedModule.value.title,
      duration: moduleDuration(selectedModule.value),
      description: selectedModule.value.description || '',
    };
    editModuleDialog.value = true;
  }
};

const confirmDeleteModule = () => {
  if (selectedModule.value) {
    deleteModuleDialog.value = true;
  }
};

const deleteSelectedModule = async () => {
  if (selectedModule.value) {
    try {
      await deleteModule(selectedModule.value.id);
      showToast('Module deleted successfully!', 'success');
      selectedModule.value = null;
      emit('selectModule', null);
      await fetchModules();
    } catch (err) {
      showToast((err as Error).message || 'An error occurred.', 'error');
    } finally {
      deleteModuleDialog.value = false;
    }
  }
};

const moduleDuration = (module: Module) => {
  return module.description?.match(/\d+\/\d+hr\d+min/)?.[0] || 'N/A';
};

const progress = ref<{ [key: number]: boolean }>({});

watch(
  () => props.courseId,
  (newCourseId) => {
    if (newCourseId) {
      fetchModules();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.rotate-icon {
  transform: rotate(90deg);
  transition: transform 0.3s;
}

.selected-module {
  background-color: #e0f7fa;
  border-left: 4px solid #1976d2;
}
</style>