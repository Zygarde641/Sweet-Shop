import { query } from '../config/database';

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSweetInput {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateSweetInput {
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

export const createSweet = async (input: CreateSweetInput): Promise<Sweet> => {
  const result = await query(
    `INSERT INTO sweets (name, category, price, quantity, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id, name, category, price, quantity, created_at as "createdAt", updated_at as "updatedAt"`,
    [input.name, input.category, input.price, input.quantity]
  );
  return result.rows[0];
};

export const findAllSweets = async (): Promise<Sweet[]> => {
  const result = await query(
    `SELECT id, name, category, price, quantity, created_at as "createdAt", updated_at as "updatedAt"
     FROM sweets ORDER BY created_at DESC`
  );
  return result.rows;
};

export const findSweetById = async (id: string): Promise<Sweet | null> => {
  const result = await query(
    `SELECT id, name, category, price, quantity, created_at as "createdAt", updated_at as "updatedAt"
     FROM sweets WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const searchSweets = async (filters: SearchFilters): Promise<Sweet[]> => {
  let sql = `SELECT id, name, category, price, quantity, created_at as "createdAt", updated_at as "updatedAt"
             FROM sweets WHERE 1=1`;
  const params: unknown[] = [];
  let paramCount = 1;

  if (filters.name) {
    sql += ` AND LOWER(name) LIKE LOWER($${paramCount})`;
    params.push(`%${filters.name}%`);
    paramCount++;
  }

  if (filters.category) {
    sql += ` AND LOWER(category) = LOWER($${paramCount})`;
    params.push(filters.category);
    paramCount++;
  }

  if (filters.minPrice !== undefined) {
    sql += ` AND price >= $${paramCount}`;
    params.push(filters.minPrice);
    paramCount++;
  }

  if (filters.maxPrice !== undefined) {
    sql += ` AND price <= $${paramCount}`;
    params.push(filters.maxPrice);
    paramCount++;
  }

  sql += ` ORDER BY created_at DESC`;

  const result = await query(sql, params);
  return result.rows;
};

export const updateSweet = async (id: string, input: UpdateSweetInput): Promise<Sweet | null> => {
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramCount = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramCount}`);
    params.push(input.name);
    paramCount++;
  }

  if (input.category !== undefined) {
    updates.push(`category = $${paramCount}`);
    params.push(input.category);
    paramCount++;
  }

  if (input.price !== undefined) {
    updates.push(`price = $${paramCount}`);
    params.push(input.price);
    paramCount++;
  }

  if (input.quantity !== undefined) {
    updates.push(`quantity = $${paramCount}`);
    params.push(input.quantity);
    paramCount++;
  }

  if (updates.length === 0) {
    return findSweetById(id);
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const result = await query(
    `UPDATE sweets SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, name, category, price, quantity, created_at as "createdAt", updated_at as "updatedAt"`,
    params
  );

  return result.rows[0] || null;
};

export const deleteSweet = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM sweets WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
};

export const purchaseSweet = async (id: string, quantity: number): Promise<Sweet | null> => {
  const result = await query(
    `UPDATE sweets SET quantity = quantity - $1, updated_at = NOW()
     WHERE id = $2 AND quantity >= $1
     RETURNING id, name, category, price, quantity, created_at as "createdAt", updated_at as "updatedAt"`,
    [quantity, id]
  );
  return result.rows[0] || null;
};

export const restockSweet = async (id: string, quantity: number): Promise<Sweet | null> => {
  const result = await query(
    `UPDATE sweets SET quantity = quantity + $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, category, price, quantity, created_at as "createdAt", updated_at as "updatedAt"`,
    [quantity, id]
  );
  return result.rows[0] || null;
};

export const releaseSweet = async (id: string, quantity: number): Promise<Sweet | null> => {
  const result = await query(
    `UPDATE sweets SET quantity = quantity + $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, category, price, quantity, created_at as "createdAt", updated_at as "updatedAt"`,
    [quantity, id]
  );
  return result.rows[0] || null;
};
