// lib/useCategories.ts
import axios from 'axios';
import { Category } from '@/types/categories';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.winksia.com/';
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${TOKEN}` }
});

// Lecture publique
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await axios.get<Category[]>(`${API_BASE_URL}/categories`);
  return response.data;
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await axios.get<Category>(`${API_BASE_URL}/categories/${id}`);
  return response.data;
};

// Opérations protégées
export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await axios.post<Category>(
    `${API_BASE_URL}/categories`,
    data,
    getAuthHeader()
  );
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  const response = await axios.put<Category>(
    `${API_BASE_URL}/categories/${id}`,
    data,
    getAuthHeader()
  );
  return response.data;
};

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_BASE_URL}/categories/${id}`,
    getAuthHeader()
  );
  return response.data;
};
