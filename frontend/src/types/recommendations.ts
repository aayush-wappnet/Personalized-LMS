// frontend/src/types/recommendations.ts
export interface RecommendedCourse {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    instructorId: number | null;
    createdAt: string;
    updatedAt: string;
    similarity: number;
  }