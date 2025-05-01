import type { Quiz, Question } from '../types/quiz';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const createQuiz = async (moduleId: number, title: string, description?: string): Promise<Quiz> => {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ moduleId, title, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create quiz');
  }

  return response.json();
};

export const getQuizzes = async (moduleId: number): Promise<Quiz[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${moduleId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch quizzes');
  }

  return response.json();
};

export const updateQuiz = async (id: number, title: string, description?: string): Promise<Quiz> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update quiz');
  }

  return response.json();
};

export const deleteQuiz = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete quiz');
  }
};

export const addQuestion = async (quizId: number, text: string, options: { text: string; isCorrect: boolean }[], correctAnswer: string): Promise<Question> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questionText: text, options, correctAnswer }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add question');
  }

  return response.json();
};