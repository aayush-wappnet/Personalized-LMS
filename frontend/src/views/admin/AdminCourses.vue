<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 primary--text mb-6">
          <v-icon large left>mdi-book-open</v-icon>
          All Courses
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
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="courses"
          class="elevation-1"
          :items-per-page="10"
        >
          <template v-slot:item.title="{ item }">
            <span
              class="primary--text text-decoration-underline cursor-pointer"
              @click="openDetailsDialog(item)"
            >
              {{ item.title }}
            </span>
          </template>
          <template v-slot:item.createdAt="{ item }">
            {{ new Date(item.createdAt).toLocaleDateString() }}
          </template>
          <template v-slot:item.approvalStatus="{ item }">
            <v-chip
              :color="getChipColor(item.approvalStatus)"
              small
              class="rounded-lg"
            >
              {{ item.approvalStatus || 'Pending' }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <div v-if="item.approvalStatus?.toLowerCase() === 'pending'" class="d-flex justify-center">
              <v-btn
                class="approve-btn ma-1"
                @click="confirmApprove(item.id)"
              >
                <v-icon small color="white">mdi-check</v-icon>
              </v-btn>
              <v-btn
                class="reject-btn ma-1"
                @click="confirmReject(item.id)"
              >
                <v-icon small color="white">mdi-close</v-icon>
              </v-btn>
            </div>
            <div v-else class="text-center">-</div>
          </template>
          <template v-slot:item.delete="{ item }">
            <div class="d-flex justify-center">
              <v-btn
                class="delete-btn ma-1"
                @click="confirmDelete(item.id)"
              >
                <v-icon small color="white">mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card class="pa-6">
        <v-row class="ml-2">
          <v-col cols="12">
            <h2 class="text-h5 primary--text mb-4">
              <v-icon left>mdi-book-open</v-icon>
              Course Details
            </h2>
          </v-col>
        </v-row>
        <v-row class="ml-2" v-if="selectedCourse">
          <v-col cols="12">
            <v-img
              :src="selectedCourse.thumbnailUrl"
              max-height="200px"
              class="mb-4 rounded-lg mx-auto"
              style="max-width: 100%;"
            ></v-img>
            <p><strong>ID:</strong> {{ selectedCourse.id }}</p>
            <p><strong>Title:</strong> {{ selectedCourse.title }}</p>
            <p><strong>Description:</strong> {{ selectedCourse.description }}</p>
            <p><strong>Status:</strong> {{ selectedCourse.approvalStatus || 'Pending' }}</p>
            <p><strong>Created At:</strong> {{ new Date(selectedCourse.createdAt).toLocaleString() }}</p>
            <p><strong>Instructor ID:</strong> {{ selectedCourse.instructorId }}</p>
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col>
            <v-btn color="grey" text @click="detailsDialog = false" class="transition-btn">
              Close
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <v-dialog v-model="approveDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Approval</v-card-title>
        <v-card-text>
          Are you sure you want to approve this course?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="approveDialog = false">Cancel</v-btn>
          <v-btn color="success" text @click="approveCourse(selectedCourseId!)">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="rejectDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Rejection</v-card-title>
        <v-card-text>
          Are you sure you want to reject this course?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="rejectDialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="rejectCourse(selectedCourseId!)">Confirm</v-btn>
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
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getCourses, approveCourse as approveCourseApi, deleteCourse } from '../../api/course.api';
import type { Course } from '../../types/course';
import type { DataTableHeader } from 'vuetify';

const authStore = useAuthStore();
const { showToast } = useToast();

const courses = ref<Course[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const approveDialog = ref(false);
const rejectDialog = ref(false);
const deleteDialog = ref(false);
const detailsDialog = ref(false);
const selectedCourseId = ref<number | null>(null);
const selectedCourse = ref<Course | null>(null);

const headers: DataTableHeader[] = [
  { title: 'Course ID', key: 'id', align: 'start' as const },
  { title: 'Title', key: 'title', align: 'start' as const },
  { title: 'Created At', key: 'createdAt', align: 'start' as const },
  { title: 'Status', key: 'approvalStatus', align: 'start' as const },
  { title: 'Actions', key: 'actions', align: 'center' as const, sortable: false },
  { title: 'Delete', key: 'delete', align: 'center' as const, sortable: false },
];

onMounted(async () => {
  if (authStore.user?.role !== 'admin') {
    showToast('Access denied. Only admins can manage courses.', 'error');
    return;
  }

  await fetchCourses();
});

const fetchCourses = async () => {
  loading.value = true;
  try {
    const allCourses = await getCourses();
    courses.value = allCourses;
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

const openDetailsDialog = (course: Course) => {
  selectedCourse.value = course;
  detailsDialog.value = true;
};

const confirmApprove = (courseId: number) => {
  selectedCourseId.value = courseId;
  approveDialog.value = true;
};

const approveCourse = async (courseId: number) => {
  try {
    await approveCourseApi(courseId, { approvalStatus: 'approved' });
    showToast('Course approved successfully!', 'success');
    await fetchCourses();
  } catch (err) {
    showToast((err as Error).message, 'error');
  } finally {
    approveDialog.value = false;
    selectedCourseId.value = null;
  }
};

const confirmReject = (courseId: number) => {
  selectedCourseId.value = courseId;
  rejectDialog.value = true;
};

const rejectCourse = async (courseId: number) => {
  try {
    await approveCourseApi(courseId, { approvalStatus: 'rejected' });
    showToast('Course rejected successfully!', 'success');
    await fetchCourses();
  } catch (err) {
    showToast((err as Error).message, 'error');
  } finally {
    rejectDialog.value = false;
    selectedCourseId.value = null;
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
.cursor-pointer {
  cursor: pointer;
}

.rounded-lg {
  border-radius: 16px !important;
}

/* Remove scrollbars for the items-per-page dropdown */
:deep(.v-data-table-footer__items-per-page .v-select__content) {
  max-height: 200px !important; /* Adjust height to fit all options */
  overflow-y: hidden !important; /* Remove vertical scrollbar */
  overflow-x: hidden !important; /* Remove horizontal scrollbar */
}

:deep(.v-data-table-footer__items-per-page .v-select__menu) {
  max-height: 200px !important; /* Ensure menu fits all options */
  overflow-y: hidden !important; /* Remove vertical scrollbar */
  overflow-x: hidden !important; /* Remove horizontal scrollbar */
}

/* Custom button styles */
.approve-btn {
  background-color: #81C784 !important; /* Lighter shade of green */
  border-radius: 4px !important;
  min-width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
}

.reject-btn {
  background-color: #F44336 !important; /* Normal red */
  border-radius: 4px !important;
  min-width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
}

.delete-btn {
  background-color: #EF5350 !important; /* Lighter shade of red */
  border-radius: 4px !important;
  min-width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
}

/* Hover effects */
.approve-btn:hover {
  background-color: #4CAF50 !important; /* Darker green on hover */
}

.reject-btn:hover {
  background-color: #D32F2F !important; /* Darker red on hover */
}

.delete-btn:hover {
  background-color: #F44336 !important; /* Normal red on hover */
}
</style>