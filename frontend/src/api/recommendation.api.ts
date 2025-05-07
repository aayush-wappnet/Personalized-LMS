// frontend/src/api/recommendation.api.ts
import type { RecommendedCourse } from '../types/recommendations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getRecommendedCourses = async (courseId: number): Promise<RecommendedCourse[]> => {
  const response = await fetch(`${API_BASE_URL}/recommend-courses/${courseId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch recommended courses');
  }

  return response.json();
};