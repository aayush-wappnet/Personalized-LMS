export interface Module {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    approvalStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Content {
  id: number;
  title: string;
  content: string;
  fileUrl?: string; // Only video URL
  createdAt: string;
  updatedAt: string;
  module: Module;
}