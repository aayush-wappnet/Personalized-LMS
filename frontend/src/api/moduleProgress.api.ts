
import type { ModuleProgress } from '../types/moduleProgress';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getModuleProgress = async (moduleId: number): Promise<ModuleProgress> => {
  const response = await fetch(`${API_BASE_URL}/module-progress/${moduleId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch module progress');
  }

  return response.json();
};

export const updateModuleProgress = async (moduleId: number, data: { progressPercentage?: number; isCompleted?: boolean }): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/module-progress/${moduleId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update module progress');
  }
};