import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
  },
  {
    path: '/enrolled-courses',
    name: 'EnrolledCourses',
    component: () => import('../views/student/EnrolledCourses.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/courses/enrolled/:id',
    name: 'CourseDetail',
    component: () => import('../views/student/CourseDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/courses/:id',
    name: 'CourseInfo',
    component: () => import('../views/student/CourseInfo.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/student/Courses.vue'),
    meta: { requiresAuth: true },
  },

  {
    path :'/student/quiz/:moduleId',
    name: 'Quiz',
    component: () => import('../views/student/StudentQuiz.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/instructor/add-course',
    name: 'AddCourse',
    component: () => import('../views/instructor/AddCourse.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/instructor/courses',
    name: 'InstructorCourses',
    component: () => import('../views/instructor/InstructorCourses.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/instructor/courses/:id',
    name: 'InstructorCourseDetail',
    component: () => import('../views/instructor/InstructorCourseDetails.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/instructor/add-quiz',
    name: 'AddQuiz',
    component: () => import('../views/instructor/AddQuiz.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/courses',
    name: 'AdminCourses',
    component: () => import('../views/admin/AdminCourses.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.initializeAuth();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }

  if (authStore.isAuthenticated && ['Login', 'Register'].includes(to.name as string)) {
    return next({ name: 'Home' });
  }

  next();
});

export default router;