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
            @click.stop="fetchContents(module.id)"
          >
            mdi-chevron-right
          </v-icon>
          {{ module.title }} ({{ moduleDuration(module) }})
        </v-list-item-title>
        <v-list-item-subtitle v-if="module.description">{{ module.description }}</v-list-item-subtitle>
        <v-expansion-panel v-model="expandedModules[module.id]">
          <v-expansion-panel-content>
            <ContentList :module-id="module.id" :content-ids="moduleContents[module.id]?.map(c => c.id) || []" @contentCompleted="onContentCompleted" />
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
import ContentList from './ContentList.vue';
import type { Module, Content } from '../types/module';

const props = defineProps<{
  courseId: number;
}>();

const emit = defineEmits<{
  (e: 'selectModule', module: Module | null): void;
}>();

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
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

const fetchContents = async (moduleId: number) => {
  try {
    const contents = await getContents(moduleId);
    moduleContents.value[moduleId] = contents;
    expandedModules.value[moduleId] = true; // Expand the panel
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

const toggleModule = (module: Module) => {
  selectedModule.value = module;
  emit('selectModule', module);
  if (!moduleContents.value[module.id]) {
    fetchContents(module.id);
  } else {
    expandedModules.value[module.id] = !expandedModules.value[module.id];
  }
};

const onContentCompleted = (contentId: number) => {
  showToast(`Content ${contentId} completed!`, 'success');
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