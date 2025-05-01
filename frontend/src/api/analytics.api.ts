const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export type AdminDashboardStats = {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  totalCompletedCourses: number;
  totalInstructors: number;
  totalStudents: number;
  activeUsers: number;
  coursesPendingApproval: number;
  coursesApproved: number;
  coursesRejected: number;
};

export type InstructorDashboardStats = {
  totalCourses: number;
  totalEnrollments: number;
  totalCompletedCourses: number;
  totalStudents: number;
  coursesPendingApproval: number;
  coursesApproved: number;
  coursesRejected: number;
  averageQuizScore: number;
};

export type DashboardStats = AdminDashboardStats | InstructorDashboardStats;

export type TopInstructor = {
  id: number;
  userName: string;
  totalEnrollments: number;
  completedEnrollments: number;
};

export type TopStudent = {
  id: number;
  userName: string;
  completedCourses: number;
  points: number;
  badges: string[];
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch dashboard stats');
  }

  return response.json();
};

export const getTopInstructor = async (): Promise<TopInstructor> => {
  const response = await fetch(`${API_BASE_URL}/analytics/top-instructor`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch top instructor');
  }

  return response.json();
};

export const getTopStudent = async (): Promise<TopStudent> => {
  const response = await fetch(`${API_BASE_URL}/analytics/top-student`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch top student');
  }

  return response.json();
};