import type { Content } from '../types/module';

const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getContents = async (moduleId: number): Promise<Content[]> => {
  const response = await fetch(`${API_BASE_URL}/contents/${moduleId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch contents');
  }

  return response.json();
};

export const createContent = async (formData: FormData): Promise<Content> => {
  const response = await fetch(`${API_BASE_URL}/contents`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create content');
  }

  return response.json();
};

export const updateContent = async (id: number, formData: FormData): Promise<Content> => {
  const response = await fetch(`${API_BASE_URL}/contents/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update content');
  }

  return response.json();
};

export const deleteContent = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/contents/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete content');
  }
};