"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Book, CartLine } from "@/types";

interface AppContextType {
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  wishlist: (string | number)[];
  setWishlist: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  addToCart: (book: Book, qty: number) => void;
  changeQty: (id: string | number, delta: number) => void;
  toggleChecked: (id: string | number) => void;
  toggleWishlist: (id: string | number) => void;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<(string | number)[]>([]);

  // Load from localStorage on mount (optional but good practice)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) setCart(JSON.parse(storedCart));
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch (e) {
      console.error('Failed to parse local storage', e);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((book: Book, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === book.id);
      if (existing) {
        return prev.map((c) =>
          c.id === book.id ? { ...c, qty: c.qty + qty, checked: true } : c
        );
      }
      return [...prev, { id: book.id, qty, checked: true, book }];
    });
  }, []);

  const changeQty = useCallback((id: string | number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const toggleChecked = useCallback((id: string | number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  }, []);

  const toggleWishlist = useCallback((id: string | number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);

  const value = {
    cart,
    setCart,
    wishlist,
    setWishlist,
    addToCart,
    changeQty,
    toggleChecked,
    toggleWishlist,
    cartCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
