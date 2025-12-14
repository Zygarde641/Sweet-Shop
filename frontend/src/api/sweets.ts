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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'sweets.ts:34', message: 'getSweets called', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
  // #endregion
  try {
    const response = await apiClient.get<{ sweets: Sweet[] }>('/sweets');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'sweets.ts:37', message: 'getSweets success', data: { sweetsCount: response.data.sweets?.length || 0, status: response.status }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
    // #endregion
    const sweets = response.data.sweets || [];
    // Ensure price and quantity are numbers
    return sweets.map(sweet => ({
      ...sweet,
      price: typeof sweet.price === 'number' ? sweet.price : parseFloat(String(sweet.price)) || 0,
      quantity: typeof sweet.quantity === 'number' ? sweet.quantity : parseInt(String(sweet.quantity)) || 0,
      createdAt: typeof sweet.createdAt === 'string' ? sweet.createdAt : new Date(sweet.createdAt).toISOString(),
      updatedAt: typeof sweet.updatedAt === 'string' ? sweet.updatedAt : new Date(sweet.updatedAt).toISOString(),
    }));
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'sweets.ts:40', message: 'getSweets error', data: { error: error?.message, status: error?.response?.status, code: error?.code }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion
    console.error('Get sweets error:', error);
    throw error;
  }
};

export const searchSweets = async (filters: SearchFilters): Promise<Sweet[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

    const response = await apiClient.get<{ sweets: Sweet[] }>(`/sweets/search?${params.toString()}`);
    const sweets = response.data.sweets || [];
    // Ensure price and quantity are numbers
    return sweets.map(sweet => ({
      ...sweet,
      price: typeof sweet.price === 'number' ? sweet.price : parseFloat(String(sweet.price)) || 0,
      quantity: typeof sweet.quantity === 'number' ? sweet.quantity : parseInt(String(sweet.quantity)) || 0,
      createdAt: typeof sweet.createdAt === 'string' ? sweet.createdAt : new Date(sweet.createdAt).toISOString(),
      updatedAt: typeof sweet.updatedAt === 'string' ? sweet.updatedAt : new Date(sweet.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error('Search sweets error:', error);
    throw error;
  }
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
  try {
    const response = await apiClient.put<{ sweet: Sweet; message?: string }>(`/sweets/${id}`, data);
    const sweet = response.data.sweet;
    if (!sweet) {
      throw new Error('Invalid response from server');
    }
    return {
      ...sweet,
      createdAt: typeof sweet.createdAt === 'string' ? sweet.createdAt : new Date(sweet.createdAt).toISOString(),
      updatedAt: typeof sweet.updatedAt === 'string' ? sweet.updatedAt : new Date(sweet.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error('Update sweet error:', error);
    throw error;
  }
};

export const deleteSweet = async (id: string): Promise<void> => {
  await apiClient.delete(`/sweets/${id}`);
};

export const purchaseSweet = async (id: string, quantity: number): Promise<Sweet> => {
  try {
    const response = await apiClient.post<{ sweet: Sweet; message?: string }>(`/sweets/${id}/purchase`, { quantity });
    const sweet = response.data.sweet;
    if (!sweet) {
      throw new Error('Invalid response from server');
    }
    return {
      ...sweet,
      createdAt: typeof sweet.createdAt === 'string' ? sweet.createdAt : new Date(sweet.createdAt).toISOString(),
      updatedAt: typeof sweet.updatedAt === 'string' ? sweet.updatedAt : new Date(sweet.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error('Purchase sweet error:', error);
    throw error;
  }
};

export const restockSweet = async (id: string, quantity: number): Promise<Sweet> => {
  try {
    const response = await apiClient.post<{ sweet: Sweet; message?: string }>(`/sweets/${id}/restock`, { quantity });
    const sweet = response.data.sweet;
    if (!sweet) {
      throw new Error('Invalid response from server');
    }
    return {
      ...sweet,
      createdAt: typeof sweet.createdAt === 'string' ? sweet.createdAt : new Date(sweet.createdAt).toISOString(),
      updatedAt: typeof sweet.updatedAt === 'string' ? sweet.updatedAt : new Date(sweet.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error('Restock sweet error:', error);
    throw error;
  }
};

export const releaseSweet = async (id: string, quantity: number): Promise<Sweet> => {
  try {
    const response = await apiClient.post<{ sweet: Sweet; message?: string }>(`/sweets/${id}/release`, { quantity });
    const sweet = response.data.sweet;
    if (!sweet) {
      throw new Error('Invalid response from server');
    }
    return {
      ...sweet,
      createdAt: typeof sweet.createdAt === 'string' ? sweet.createdAt : new Date(sweet.createdAt).toISOString(),
      updatedAt: typeof sweet.updatedAt === 'string' ? sweet.updatedAt : new Date(sweet.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error('Release sweet error:', error);
    throw error;
  }
};
