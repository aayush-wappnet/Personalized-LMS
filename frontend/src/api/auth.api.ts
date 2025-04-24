import axios from '../utils/axios';
import type { AuthRegister, AuthLogin, AuthProfile } from '../types/auth';

export const register = async (data: AuthRegister): Promise<{ message: string }> => {
  const response = await axios.post('/auth/register', data);
  return response.data;
};

export const login = async (data: AuthLogin): Promise<{ token: string }> => {
  const response = await axios.post('/auth/login', data);
  return response.data;
};

export const getProfile = async (): Promise<AuthProfile> => {
  const response = await axios.get('/auth/profile');
  return response.data;
};