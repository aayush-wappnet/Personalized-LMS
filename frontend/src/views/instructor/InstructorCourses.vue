<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 primary--text mb-6">
          <v-icon large left>mdi-book-open</v-icon>
          My Courses
        </h1>
      </v-col>
    </v-row>
    <v-row justify="end" class="mb-4">
      <v-col cols="auto">
        <v-btn color="primary" :to="{ name: 'AddCourse' }">
          <v-icon left>mdi-plus</v-icon>
          Add New Course
        </v-btn>
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
        <v-alert type="info" outlined>No courses created yet. Start by adding a new course!</v-alert>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col v-for="course in courses" :key="course.id" cols="12" sm="6" md="4" lg="4">
        <v-card class="course-card elevation-4" @click="navigateToCourseDetails(course.id)">
          <v-img
            :src="course.thumbnailUrl"
            height="200px"
            class="white--text align-end"
            :hover="false"
            :style="{ backgroundColor: 'white', cursor: 'pointer' }"
          ></v-img>
          <v-card-title class="text-subtitle-1 pt-2">{{ course.title }}</v-card-title>
          <v-card-text>
            <div class="text-body-2">{{ course.description }}</div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              text
              @click.stop="openEditDialog(course)"
              class="transition-btn"
              :class="{ 'hover-btn': hoveredEdit[course.id] }"
              @mouseover="hoveredEdit[course.id] = true"
              @mouseleave="hoveredEdit[course.id] = false"
            >
              <v-icon left>mdi-pencil</v-icon>
              Edit
            </v-btn>
            <v-btn
              color="error"
              text
              @click.stop="confirmDelete(course.id)"
              class="transition-btn"
              :class="{ 'hover-btn': hoveredDelete[course.id] }"
              @mouseover="hoveredDelete[course.id] = true"
              @mouseleave="hoveredDelete[course.id] = false"
            >
              <v-icon left>mdi-delete</v-icon>
              Delete
            </v-btn>
            <v-spacer></v-spacer>
            <v-chip
              :color="getChipColor(course.approvalStatus)"
              small
              class="ma-2"
              :class="{ 'rounded-lg': true }"
            >
              {{ course.approvalStatus || 'Pending' }}
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="editDialog" max-width="600">
      <v-card class="pa-6">
        <v-row>
          <v-col cols="12">
            <h2 class="text-h5 primary--text mb-4">
              <v-icon left>mdi-pencil</v-icon>
              Edit Course
            </h2>
          </v-col>
        </v-row>
        <v-form @submit.prevent="onSubmitEdit">
          <v-text-field
            v-model="editForm.title"
            label="Course Title"
            :rules="rules.title"
            prepend-icon="mdi-book-open"
            outlined
            dense
            class="mb-4 transition-input custom-input-height"
          ></v-text-field>
          <v-textarea
            v-model="editForm.description"
            label="Course Description"
            :rules="rules.description"
            prepend-icon="mdi-text"
            outlined
            dense
            class="mb-4 transition-input custom-input-height"
            rows="3"
          ></v-textarea>
          <v-file-input
            v-model="editForm.thumbnail"
            label="Thumbnail Image (Optional)"
            :rules="rules.thumbnail"
            prepend-icon="mdi-image"
            accept="image/*"
            outlined
            dense
            class="mb-4 transition-input custom-input-height"
            @change="onFileChange"
          ></v-file-input>
          <v-img
            v-if="thumbnailPreview"
            :src="thumbnailPreview"
            max-height="150px"
            class="mb-4 rounded-lg mx-auto"
            style="max-width: 100%;"
          ></v-img>
          <v-row>
            <v-col>
              <v-btn
                color="grey"
                text
                @click="editDialog = false"
                class="mr-2 transition-btn"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                :loading="loadingEdit"
                class="transition-btn"
                :class="{ 'hover-btn': isHoveredEdit }"
                @mouseover="isHoveredEdit = true"
                @mouseleave="isHoveredEdit = false"
              >
                Save Changes
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmEditDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Changes</v-card-title>
        <v-card-text>
          Are you sure you want to save the changes to this course?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="confirmEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="saveEditedCourse">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete this course? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="deleteSelectedCourse(selectedCourseId!)">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getCourses, updateCourse, deleteCourse } from '../../api/course.api';
import type { Course } from '../../types/course';
import * as yup from 'yup';

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const courses = ref<Course[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const editDialog = ref(false);
const confirmEditDialog = ref(false);
const deleteDialog = ref(false);
const selectedCourseId = ref<number | null>(null);
const hoveredEdit = ref<{ [key: number]: boolean }>({});
const hoveredDelete = ref<{ [key: number]: boolean }>({});
const isHoveredEdit = ref(false);
const loadingEdit = ref(false);
const thumbnailPreview = ref<string | null>(null);

interface EditCourseForm {
  id: number;
  title: string;
  description: string;
  thumbnail: File | null;
}

const editForm = ref<EditCourseForm>({
  id: 0,
  title: '',
  description: '',
  thumbnail: null,
});

const schema = yup.object({
  title: yup.string().required('Course title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  thumbnail: yup
    .mixed()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value: any) => {
      if (!value) return true; // Allow null (optional)
      const file = value as File;
      return file && ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    })
    .test('fileSize', 'File size must be less than 5MB', (value: any) => {
      if (!value) return true; // Allow null (optional)
      const file = value as File;
      return file && file.size <= 5 * 1024 * 1024;
    }),
});

const rules = {
  title: [(v: string) => !!v || 'Course title is required', (v: string) => v.length >= 3 || 'Minimum 3 characters'],
  description: [(v: string) => !!v || 'Description is required', (v: string) => v.length >= 10 || 'Minimum 10 characters'],
  thumbnail: [], // Simplified since yup handles validation
};

onMounted(async () => {
  if (authStore.user?.role !== 'instructor') {
    showToast('Access denied. Only instructors can view their courses.', 'error');
    router.push('/');
    return;
  }

  await fetchCourses();
});

const fetchCourses = async () => {
  loading.value = true;
  try {
    const instructorCourses = await getCourses();
    courses.value = instructorCourses;
  } catch (err) {
    error.value = (err as Error).message;
    showToast(error.value, 'error');
  } finally {
    loading.value = false;
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

const navigateToCourseDetails = (courseId: number) => {
  router.push(`/instructor/courses/${courseId}`);
};

const openEditDialog = (course: Course) => {
  editForm.value = {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: null,
  };
  thumbnailPreview.value = course.thumbnailUrl;
  editDialog.value = true;
};

const onFileChange = (file: File | null) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnailPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    thumbnailPreview.value = courses.value.find(c => c.id === editForm.value.id)?.thumbnailUrl || null;
  }
};

const onSubmitEdit = async () => {
  try {
    await schema.validate(editForm.value, { abortEarly: false });
    confirmEditDialog.value = true;
  } catch (err) {
    showToast('Please fill out the form correctly.', 'error');
  }
};

const saveEditedCourse = async () => {
  loadingEdit.value = true;
  try {
    await updateCourse(editForm.value.id, {
      title: editForm.value.title,
      description: editForm.value.description,
      thumbnail: editForm.value.thumbnail,
    });
    showToast('Course updated successfully!', 'success');
    await fetchCourses();
    editDialog.value = false;
  } catch (err) {
    showToast((err as Error).message, 'error');
  } finally {
    loadingEdit.value = false;
    confirmEditDialog.value = false;
  }
};

const confirmDelete = (courseId: number) => {
  selectedCourseId.value = courseId;
  deleteDialog.value = true;
};

const deleteSelectedCourse = async (courseId: number) => {
  try {
    await deleteCourse(courseId);
    showToast('Course deleted successfully!', 'success');
    await fetchCourses();
  } catch (err) {
    showToast((err as Error).message, 'error');
  } finally {
    deleteDialog.value = false;
    selectedCourseId.value = null;
  }
};
</script>

<style scoped>
.course-card {
  transition: transform 0.3s ease;
  cursor: pointer; /* Indicate clickable area */
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.v-card-title {
  word-break: break-word;
  line-height: 1.2;
}

.transition-btn {
  transition: all 0.3s ease;
}

.hover-btn {
  transform: translateY(-2px);
}

.transition-input {
  transition: all 0.3s ease;
}

.transition-input:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-input-height .v-input__control {
  height: 40px;
}

.custom-input-height .v-textarea .v-input__control {
  height: auto;
  min-height: 80px;
}

/* Ensure proper spacing on mobile */
@media (max-width: 600px) {
  .course-card {
    margin-bottom: 16px;
  }
}

/* Custom styles for chip */
.rounded-lg {
  border-radius: 16px !important;
}
</style>