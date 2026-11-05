/**
 * ============================================================================
 * PRODUCT SERVICE - CAPA DE ABSTRACCIÓN DE DATOS (MOCK TEMPORAL -> SUPABASE)
 * ============================================================================
 * Actualmente este servicio consume `MOCK_PRODUCTS` de `src/data/products.ts`.
 *
 * CUANDO SE INTEGRE SUPABASE:
 * Únicamente se debe reemplazar el cuerpo de estas funciones por llamadas al
 * cliente de Supabase (`supabase.from('products')...`) sin necesidad de
 * modificar las páginas `.astro` ni los componentes React de la tienda.
 * ============================================================================
 */

import { MOCK_PRODUCTS, PRODUCT_CATEGORIES, MOCK_BANK_ACCOUNTS } from '../data/products';
import type { Product, ProductCategory, BankAccountInfo } from '../types/store';

export async function getAllProducts(): Promise<Product[]> {
  // TODO (Supabase):
  // const { data, error } = await supabase
  //   .from('products')
  //   .select('*, variants:product_variants(*)')
  //   .order('featured', { ascending: false });
  // return data ?? [];
  return MOCK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  // TODO (Supabase):
  // const { data } = await supabase
  //   .from('products')
  //   .select('*, variants:product_variants(*)')
  //   .eq('slug', slug)
  //   .single();
  // return data ?? undefined;
  return MOCK_PRODUCTS.find((product) => product.slug === slug);
}

export async function getProductsByCategory(
  category: 'all' | ProductCategory
): Promise<Product[]> {
  if (category === 'all') {
    return MOCK_PRODUCTS;
  }
  return MOCK_PRODUCTS.filter((product) => product.category === category);
}

export async function getRelatedProducts(
  currentProductId: string,
  category: ProductCategory,
  limit = 3
): Promise<Product[]> {
  const sameCategory = MOCK_PRODUCTS.filter(
    (p) => p.id !== currentProductId && p.category === category
  );
  const others = MOCK_PRODUCTS.filter(
    (p) => p.id !== currentProductId && p.category !== category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export function getCategories() {
  return PRODUCT_CATEGORIES;
}

export function getBankAccounts(): BankAccountInfo[] {
  return MOCK_BANK_ACCOUNTS;
}

