import type { QuizAttempt } from '../types/quizAttempt';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const submitQuizAttempt = async (quizId: number, answers: { questionId: number; selectedOptionId: number }[]): Promise<QuizAttempt> => {
  const response = await fetch(`${API_BASE_URL}/quiz-attempts`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quizId, answers }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit quiz attempt');
  }

  return response.json();
};

export const getQuizAttempts = async (quizId: number): Promise<QuizAttempt[]> => {
  const response = await fetch(`${API_BASE_URL}/quiz-attempts/${quizId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch quiz attempts');
  }

  return response.json();
};