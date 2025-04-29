import type { Course, EnrolledCourse } from '../types/course';

const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getEnrolledCourses = async (): Promise<EnrolledCourse[]> => {
  const response = await fetch(`${API_BASE_URL}/courses/enrolled`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch enrolled courses');
  }

  return response.json();
};

export const getEnrolledCourseById = async (id: number): Promise<EnrolledCourse> => {
  const response = await fetch(`${API_BASE_URL}/courses/enrolled/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch course details');
  }

  return response.json();
};

export const getCourses = async (): Promise<Course[]> => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch courses');
  }

  return response.json();
};

export const getCourseById = async (id: number): Promise<Course> => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch course details');
  }

  return response.json();
};

export const enrollCourse = async (courseId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/courses/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ courseId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to enroll in course');
  }
};

export const createCourse = async (courseData: { title: string; description: string; thumbnail: File }): Promise<Course> => {
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('description', courseData.description);
  formData.append('thumbnail', courseData.thumbnail);

  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create course');
  }

  return response.json();
};

export const updateCourse = async (id: number, courseData: { title: string; description: string; thumbnail: File | null }): Promise<Course> => {
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('description', courseData.description);
  if (courseData.thumbnail) {
    formData.append('thumbnail', courseData.thumbnail);
  }

  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update course');
  }

  return response.json();
};

export const deleteCourse = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete course');
  }
};

export const approveCourse = async (id: number, data: { approvalStatus: 'approved' | 'rejected' }): Promise<void> => {
  const status = data.approvalStatus.toUpperCase();
  const response = await fetch(`${API_BASE_URL}/courses/${id}/approve?status=${status}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update course approval status');
  }
};

export const getUserById = async (id: number): Promise<{ userName: string; email: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user details');
  }

  return response.json();
};