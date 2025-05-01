export interface Quiz {
  id: number;
  title: string;
  description?: string;
  moduleId: number;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  options: Option[];
  correctOptionId?: number; // Add this to track the correct option index
  createdAt: string;
  updatedAt: string;
}

export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}