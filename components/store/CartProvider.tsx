"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  serviceId: string;
  serviceName: string;
  category: string;
  duration: number; // days
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (serviceId: string, duration: number) => void;
  updateQuantity: (serviceId: string, duration: number, qty: number) => void;
  clearCart: () => void;
  hasItem: (serviceId: string, duration: number) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("subtrack_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("subtrack_cart", JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.serviceId === newItem.serviceId && i.duration === newItem.duration
      );
      if (existing) {
        return prev.map((i) =>
          i.serviceId === newItem.serviceId && i.duration === newItem.duration
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((serviceId: string, duration: number) => {
    setItems((prev) =>
      prev.filter((i) => !(i.serviceId === serviceId && i.duration === duration))
    );
  }, []);

  const updateQuantity = useCallback((serviceId: string, duration: number, qty: number) => {
    if (qty <= 0) {
      setItems((prev) =>
        prev.filter((i) => !(i.serviceId === serviceId && i.duration === duration))
      );
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.serviceId === serviceId && i.duration === duration ? { ...i, quantity: qty } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("subtrack_cart");
  }, []);

  const hasItem = useCallback(
    (serviceId: string, duration: number) =>
      items.some((i) => i.serviceId === serviceId && i.duration === duration),
    [items]
  );

  const count = items.reduce((a, i) => a + i.quantity, 0);
  const total = items.reduce((a, i) => a + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart, hasItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
