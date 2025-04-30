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
  options: { id: number; text: string; isCorrect: boolean }[];
  createdAt: string;
  updatedAt: string;
}