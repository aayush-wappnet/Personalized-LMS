<template>
  <div>
    <!-- Content Display -->
    <v-row v-if="filteredContents.length">
      <v-col cols="12">
        <v-list>
          <v-list-item
            v-for="content in filteredContents"
            :key="content.id"
            @click="openVideoDialog(content)"
            class="content-item"
          >
            <v-list-item-title>
              <v-icon left :color="progress[content.id] ? 'success' : 'grey'">
                {{ progress[content.id] ? 'mdi-check-circle' : 'mdi-circle-outline' }}
              </v-icon>
              {{ content.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-alert type="info" outlined>No contents available.</v-alert>
      </v-col>
    </v-row>

    <!-- Video Player Dialog -->
    <v-dialog v-model="videoDialog" max-width="800">
      <v-card>
        <v-card-title>{{ selectedContent?.title }}</v-card-title>
        <v-card-text>
          <VideoPlayer :src="selectedContent?.fileUrl || ''" @contentCompleted="markContentCompleted(selectedContent?.id || 0)" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="videoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Content Button (Instructor) -->
    <v-row v-if="isInstructor">
      <v-col>
        <v-btn color="primary" @click="openAddContentDialog">
          <v-icon left>mdi-plus</v-icon>
          Add Content
        </v-btn>
      </v-col>
    </v-row>

    <!-- Add/Edit Content Dialog -->
    <v-dialog v-model="contentDialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Content' : 'Add Content' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="contentForm.title"
            label="Content Title"
            outlined
            dense
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="contentForm.fileUrl"
            label="Video URL"
            outlined
            dense
            class="mb-4"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="contentDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveContent">{{ editMode ? 'Update' : 'Add' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Content Confirmation Dialog -->
    <v-dialog v-model="deleteContentDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this content? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteContentDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteSelectedContent">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useToast } from '../composables/useToast';
import { createContent, getContents, updateContent, deleteContent } from '../api/content.api';
import type { Content } from '../types/module';
import VideoPlayer from '../components/VideoPlayer.vue';

const props = defineProps<{
  moduleId: number | null;
  contentIds: number[];
}>();

const emit = defineEmits<{
  (e: 'contentCompleted', contentId: number): void;
}>();

const authStore = useAuthStore();
const { showToast } = useToast();

const contents = ref<Content[]>([]);
const contentDialog = ref(false);
const deleteContentDialog = ref(false);
const editMode = ref(false);
const contentForm = ref({
  title: '',
  fileUrl: '',
  moduleId: 0,
});
const selectedContentId = ref<number | null>(null);
const videoDialog = ref(false);
const selectedContent = ref<Content | null>(null);

// Progress tracking
const progress = ref<{ [key: number]: boolean }>({});

const isInstructor = computed(() => authStore.user?.role === 'instructor');

const filteredContents = computed(() => {
  return contents.value.filter((content) => props.contentIds.includes(content.id));
});

const fetchContents = async () => {
  if (!props.moduleId) {
    contents.value = [];
    return;
  }
  try {
    contents.value = await getContents(props.moduleId);
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

const openAddContentDialog = () => {
  editMode.value = false;
  contentForm.value = { title: '', fileUrl: '', moduleId: props.moduleId || 0 };
  contentDialog.value = true;
};

const openEditContentDialog = (content: Content) => {
  editMode.value = true;
  selectedContentId.value = content.id;
  contentForm.value = { title: content.title, fileUrl: content.fileUrl || '', moduleId: content.module.id };
  contentDialog.value = true;
};

const saveContent = async () => {
  try {
    if (editMode.value) {
      await updateContent(selectedContentId.value!, contentForm.value);
      showToast('Content updated successfully!', 'success');
    } else {
      const newContent = await createContent({
        title: contentForm.value.title,
        fileUrl: contentForm.value.fileUrl,
        moduleId: contentForm.value.moduleId,
      });
      showToast('Content added successfully!', 'success');
      contents.value.push(newContent);
    }
    await fetchContents();
    contentDialog.value = false;
  } catch (err) {
    showToast((err as Error).message, 'error');
  }
};

const confirmDeleteContent = (contentId: number) => {
  selectedContentId.value = contentId;
  deleteContentDialog.value = true;
};

const deleteSelectedContent = async () => {
  try {
    await deleteContent(selectedContentId.value!);
    showToast('Content deleted successfully!', 'success');
    await fetchContents();
  } catch (err) {
    showToast((err as Error).message, 'error');
  } finally {
    deleteContentDialog.value = false;
  }
};

const openVideoDialog = (content: Content) => {
  if (content.fileUrl) {
    selectedContent.value = content;
    videoDialog.value = true;
  }
};

const markContentCompleted = (contentId: number) => {
  if (!progress.value[contentId]) {
    progress.value[contentId] = true;
    emit('contentCompleted', contentId);
    showToast('Content completed!', 'success');
  }
};

watch(
  () => props.moduleId,
  () => {
    fetchContents();
  },
  { immediate: true }
);

watch(
  () => props.contentIds,
  () => {
    progress.value = {};
  },
  { immediate: true }
);
</script>

<style scoped>
.content-item:hover {
  background-color: transparent !important;
}
</style>