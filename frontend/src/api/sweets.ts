import apiClient from './client';

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSweetData {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateSweetData {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface SearchFilters {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const getSweets = async (): Promise<Sweet[]> => {
  try {
    const response = await apiClient.get<{ sweets: Sweet[] }>('/sweets');
    return response.data.sweets || [];
  } catch (error) {
    console.error('Get sweets error:', error);
    throw error;
  }
};

export const searchSweets = async (filters: SearchFilters): Promise<Sweet[]> => {
  const params = new URLSearchParams();
  if (filters.name) params.append('name', filters.name);
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

  const response = await apiClient.get<{ sweets: Sweet[] }>(`/sweets/search?${params.toString()}`);
  return response.data.sweets;
};

export const createSweet = async (data: CreateSweetData): Promise<Sweet> => {
  try {
    const response = await apiClient.post<{ sweet: Sweet; message?: string }>('/sweets', data);
    // Handle both response formats: { sweet } or { message, sweet }
    const sweet = response.data.sweet;
    if (!sweet) {
      throw new Error('Invalid response from server');
    }
    // Ensure dates are strings
    return {
      ...sweet,
      createdAt: typeof sweet.createdAt === 'string' ? sweet.createdAt : new Date(sweet.createdAt).toISOString(),
      updatedAt: typeof sweet.updatedAt === 'string' ? sweet.updatedAt : new Date(sweet.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error('Create sweet error:', error);
    throw error;
  }
};

export const updateSweet = async (id: string, data: UpdateSweetData): Promise<Sweet> => {
  const response = await apiClient.put<{ sweet: Sweet }>(`/sweets/${id}`, data);
  return response.data.sweet;
};

export const deleteSweet = async (id: string): Promise<void> => {
  await apiClient.delete(`/sweets/${id}`);
};

export const purchaseSweet = async (id: string, quantity: number): Promise<Sweet> => {
  const response = await apiClient.post<{ sweet: Sweet }>(`/sweets/${id}/purchase`, { quantity });
  return response.data.sweet;
};

export const restockSweet = async (id: string, quantity: number): Promise<Sweet> => {
  const response = await apiClient.post<{ sweet: Sweet }>(`/sweets/${id}/restock`, { quantity });
  return response.data.sweet;
};
