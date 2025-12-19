import axios from 'axios';
import { Subcategory } from '@/types/categories';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api-dev.winksia.com/';

const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imphc29ubWFtcG91eWEucHJvQGdtYWlsLmNvbSIsInJvbGUiOiJBVVRIIiwiaWF0IjoxNzU0MDM5Mjk2LCJleHAiOjE3NTQwNjkyOTZ9.JZ4iJdGeblRPLkAoU5qXwyH0yNCO9PqTW-VYMYddCIo';

const authHeader = {
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
};

// Obtenir toutes les sous-catégories
export const getAllSubcategories = async (): Promise<Subcategory[]> => {
  const response = await axios.get<Subcategory[]>(`${API_BASE_URL}/subcategories`, authHeader);
  return response.data;
};

// Obtenir une sous-catégorie par ID
export const getSubcategoryById = async (id: string): Promise<Subcategory> => {
  const response = await axios.get<Subcategory>(`${API_BASE_URL}/subcategories/${id}`, authHeader);
  return response.data;
};

// Créer une nouvelle sous-catégorie
export const createSubcategory = async (data: Partial<Subcategory>): Promise<Subcategory> => {
  const response = await axios.post<Subcategory>(`${API_BASE_URL}/subcategories`, data, authHeader);
  return response.data;
};

// Mettre à jour une sous-catégorie
export const updateSubcategory = async (
  id: string,
  data: Partial<Subcategory>
): Promise<Subcategory> => {
  const response = await axios.patch<Subcategory>(`${API_BASE_URL}/subcategories/${id}`, data, authHeader);
  return response.data;
};

// Supprimer une sous-catégorie
export const deleteSubcategory = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`${API_BASE_URL}/subcategories/${id}`, authHeader);
  return response.data;
};
