import axios from '../utils/axios';
import type { Content } from '../types/module';

export const createContent = async (contentData: Partial<Content> & { moduleId: number }) => {
  const response = await axios.post<Content>('/contents', contentData);
  return response.data;
};

export const getContents = async (moduleId: number) => {
  const response = await axios.get<Content[]>(`/contents/${moduleId}`);
  return response.data;
};

export const updateContent = async (id: number, contentData: Partial<Content>) => {
  const response = await axios.put<Content>(`/contents/${id}`, contentData);
  return response.data;
};

export const deleteContent = async (id: number) => {
  const response = await axios.delete<void>(`/contents/${id}`);
  return response.data;
};