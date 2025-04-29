import axios from '../utils/axios';
import type { Module } from '../types/module';

export const createModule = async (moduleData: Partial<Module> & { courseId: number }) => {
  const response = await axios.post<Module>('/modules', moduleData);
  return response.data;
};

export const getModules = async (courseId: number) => {
  const response = await axios.get<Module[]>(`/modules/${courseId}`);
  return response.data;
};

export const updateModule = async (id: number, moduleData: Partial<Module>) => {
  const response = await axios.put<Module>(`/modules/${id}`, moduleData);
  return response.data;
};

export const deleteModule = async (id: number) => {
  const response = await axios.delete<void>(`/modules/${id}`);
  return response.data;
};