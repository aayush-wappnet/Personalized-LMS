export interface QuizAttempt {
    id: number;
    quizId: number;
    studentId: number;
    answers: { questionId: number; selectedAnswer: string }[];
    score: number;
    submittedAt: string;
  }