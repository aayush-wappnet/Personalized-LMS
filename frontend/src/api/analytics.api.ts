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