export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorId: number;
  createdAt: string;
  updatedAt: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  userName: string;
  email: string;
}