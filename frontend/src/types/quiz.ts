export interface Quiz {
    id: number;
    title: string;
    moduleId: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Question {
    id: number;
    quizId: number;
    text: string;
    options: string[];
    correctAnswer: string;
    createdAt: string;
    updatedAt: string;
  }