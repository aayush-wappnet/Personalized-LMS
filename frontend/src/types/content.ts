export interface Content {
    id: number;
    moduleId: number;
    title: string;
    type: 'video' | 'pdf' | 'quiz';
    url?: string; // For video or PDF
    quizQuestions?: { question: string; options: string[]; correctAnswer: string }[]; // For quiz
    createdAt: string;
    updatedAt: string;
  }