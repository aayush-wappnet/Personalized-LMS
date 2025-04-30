export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: number;
  answers: { questionId: number; selectedOptionId: number; isCorrect: boolean }[];
  score: number;
  createdAt: string;
  student: { id: number; userName: string };
  quiz: { id: number; title: string };
}