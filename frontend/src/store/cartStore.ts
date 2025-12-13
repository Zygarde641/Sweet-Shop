import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sweet } from '../api/sweets';

export interface CartItem extends Sweet {
  cartQuantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (sweet: Sweet, quantity?: number) => void;
  removeFromCart: (sweetId: string) => void;
  updateQuantity: (sweetId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (sweet, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === sweet.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === sweet.id
                  ? { ...item, cartQuantity: item.cartQuantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...sweet, cartQuantity: quantity }],
          };
        });
      },
      removeFromCart: (sweetId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== sweetId),
        }));
      },
      updateQuantity: (sweetId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(sweetId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === sweetId ? { ...item, cartQuantity: quantity } : item
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cartQuantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.cartQuantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
