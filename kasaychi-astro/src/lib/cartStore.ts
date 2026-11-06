import { useState, useEffect, useCallback } from 'react';
import type { CartItem, Product, ProductVariant } from '../types/store';

const CART_STORAGE_KEY = 'kasaychi_cart_v1';
const CART_UPDATED_EVENT = 'kasaychi:cart-updated';
const CART_DRAWER_EVENT = 'kasaychi:cart-drawer';

export function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: items }));
  } catch (err) {
    console.error('Error guardando el carrito en localStorage:', err);
  }
}

export function openCartDrawer(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CART_DRAWER_EVENT, { detail: { open: true } }));
}

export function closeCartDrawer(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CART_DRAWER_EVENT, { detail: { open: false } }));
}

export function addToCart(
  product: Product,
  variant?: ProductVariant,
  quantity = 1,
  autoOpenDrawer = true
): CartItem[] {
  const selectedVariant = variant ?? product.variants[0];
  const cartItemId = `${product.id}::${selectedVariant.id}`;
  const currentItems = getStoredCart();
  const existingIndex = currentItems.findIndex((item) => item.cartItemId === cartItemId);

  let updatedItems: CartItem[];

  if (existingIndex > -1) {
    updatedItems = currentItems.map((item, idx) => {
      if (idx !== existingIndex) return item;
      const nextQty = item.quantity + quantity;
      return { ...item, quantity: nextQty };
    });
  } else {
    const newItem: CartItem = {
      cartItemId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      image: product.images[0],
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label,
      unitPrice: selectedVariant.price,
      quantity: quantity,
      maxStock: 999,
    };
    updatedItems = [...currentItems, newItem];
  }

  saveStoredCart(updatedItems);
  if (autoOpenDrawer) {
    openCartDrawer();
  }
  return updatedItems;
}

export function updateCartItemQuantity(cartItemId: string, quantity: number): CartItem[] {
  const currentItems = getStoredCart();
  if (quantity <= 0) {
    const filtered = currentItems.filter((item) => item.cartItemId !== cartItemId);
    saveStoredCart(filtered);
    return filtered;
  }

  const updated = currentItems.map((item) => {
    if (item.cartItemId !== cartItemId) return item;
    return {
      ...item,
      quantity: quantity,
    };
  });

  saveStoredCart(updated);
  return updated;
}

export function removeFromCart(cartItemId: string): CartItem[] {
  const currentItems = getStoredCart();
  const updated = currentItems.filter((item) => item.cartItemId !== cartItemId);
  saveStoredCart(updated);
  return updated;
}

export function clearCartStore(): void {
  saveStoredCart([]);
}

/**
 * Hook React para consumir y modificar el estado global del carrito en cualquier Isla de Astro.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(getStoredCart());
    setIsHydrated(true);

    const handleCartUpdated = () => {
      setItems(getStoredCart());
    };

    const handleDrawerEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ open: boolean }>;
      if (typeof customEvent.detail?.open === 'boolean') {
        setIsDrawerOpen(customEvent.detail.open);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        setItems(getStoredCart());
      }
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    window.addEventListener(CART_DRAWER_EVENT, handleDrawerEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
      window.removeEventListener(CART_DRAWER_EVENT, handleDrawerEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)
  );

  const addItem = useCallback(
    (
      product: Product,
      variant?: ProductVariant,
      quantity = 1,
      autoOpenDrawer = true
    ) => {
      addToCart(product, variant, quantity, autoOpenDrawer);
    },
    []
  );

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    updateCartItemQuantity(cartItemId, quantity);
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    removeFromCart(cartItemId);
  }, []);

  const clearCart = useCallback(() => {
    clearCartStore();
  }, []);

  return {
    items,
    itemCount,
    subtotal,
    isHydrated,
    isDrawerOpen,
    openDrawer: openCartDrawer,
    closeDrawer: closeCartDrawer,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}

