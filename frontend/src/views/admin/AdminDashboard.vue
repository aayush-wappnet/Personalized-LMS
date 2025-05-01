```vue
<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 primary--text mb-6">
          <v-icon large left>mdi-view-dashboard</v-icon>
          Admin Dashboard
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
      <!-- Total Courses -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-book-open</v-icon>
            Total Courses
          </v-card-title>
          <v-card-text class="text-h3 primary--text text-center">
            {{ stats.totalCourses }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Total Users -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-account-group</v-icon>
            Total Users
          </v-card-title>
          <v-card-text class="text-h3 primary--text text-center">
            {{ stats.totalUsers }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Total Enrollments -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-account-plus</v-icon>
            Total Enrollments
          </v-card-title>
          <v-card-text class="text-h3 primary--text text-center">
            {{ stats.totalEnrollments }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Total Completed Courses -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-check-circle</v-icon>
            Completed Courses
          </v-card-title>
          <v-card-text class="text-h3 primary--text text-center">
            {{ stats.totalCompletedCourses }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Total Instructors -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-school</v-icon>
            Total Instructors
          </v-card-title>
          <v-card-text class="text-h3 primary--text text-center">
            {{ stats.totalInstructors }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Total Students -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-account-group</v-icon>
            Total Students
          </v-card-title>
          <v-card-text class="text-h3 primary--text text-center">
            {{ stats.totalStudents }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Active Users -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-account-check</v-icon>
            Active Users
          </v-card-title>
          <v-card-text class="text-h3 primary--text text-center">
            {{ stats.activeUsers }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Courses Pending Approval -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="warning">mdi-clock-outline</v-icon>
            Pending Approval
          </v-card-title>
          <v-card-text class="text-h3 warning--text text-center">
            {{ stats.coursesPendingApproval }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Courses Approved -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="success">mdi-check</v-icon>
            Courses Approved
          </v-card-title>
          <v-card-text class="text-h3 success--text text-center">
            {{ stats.coursesApproved }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Courses Rejected -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 elevation-4">
          <v-card-title class="text-h6">
            <v-icon left color="error">mdi-close</v-icon>
            Courses Rejected
          </v-card-title>
          <v-card-text class="text-h3 error--text text-center">
            {{ stats.coursesRejected }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { getDashboardStats } from '../../api/analytics.api';
import type { AdminDashboardStats } from '../../api/analytics.api';

const router = useRouter();
const authStore = useAuthStore();
const { showToast } = useToast();

const loading = ref(false);
const error = ref<string | null>(null);
const stats = ref<AdminDashboardStats>({
  totalCourses: 0,
  totalUsers: 0,
  totalEnrollments: 0,
  totalCompletedCourses: 0,
  totalInstructors: 0,
  totalStudents: 0,
  activeUsers: 0,
  coursesPendingApproval: 0,
  coursesApproved: 0,
  coursesRejected: 0,
});

const fetchDashboardStats = async () => {
  if (authStore.user?.role !== 'admin') {
    showToast('Access denied. Only admins can view the dashboard.', 'error');
    router.push('/');
    return;
  }

  loading.value = true;
  try {
    const data = await getDashboardStats();
    if ('totalUsers' in data) {
      // Ensure the response matches AdminDashboardStats
      stats.value = data as AdminDashboardStats;
    } else {
      throw new Error('Invalid dashboard data for admin');
    }
  } catch (err) {
    error.value = (err as Error).message;
    showToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardStats();
});
</script>