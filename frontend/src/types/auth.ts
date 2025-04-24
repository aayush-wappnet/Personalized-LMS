export interface AuthRegister {
    userName: string;
    email: string;
    password: string;
    role: 'student' | 'instructor';
  }
  
  export interface AuthLogin {
    email: string;
    password: string;
  }
  
  export interface AuthProfile {
    id: number;
    userName: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
  }