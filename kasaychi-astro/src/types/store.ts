/**
 * ============================================================================
 * MODELO DE DATOS DE LA TIENDA DIGITAL - COMUNIDAD KASAYCHI
 * ============================================================================
 * NOTA ARQUITECTÓNICA (ESCALABILIDAD SUPABASE):
 * Estas interfaces están diseñadas como el contrato de dominio tanto para el
 * mock temporal actual como para la futura migración a Supabase (PostgreSQL +
 * Supabase Storage + Supabase Auth para el panel de Administración).
 *
 * Mapeo futuro sugerido en Supabase:
 * - Tabla `products`          -> Product
 * - Tabla `product_variants`  -> ProductVariant
 * - Tabla `orders`            -> Order (con RLS para que el admin confirme pedidos)
 * - Tabla `order_items`       -> OrderItem
 * - Bucket `payment-receipts` -> Archivo subido en PaymentReceiptInfo
 * ============================================================================
 */

export type ProductCategory = 'quesos' | 'lacteos' | 'agricultura';

export interface ProductVariant {
  id: string;
  label: string;       // Ej: "500 g", "1 Kg", "Rueda Familiar (2.2 Kg)"
  weightGrams: number;
  price: number;       // Precio en USD
  stock: number;
  sku: string;
}

export interface ProductSpecs {
  weight: string;
  origin: string;
  altitude: string;
  conservation: string;
  maturation?: string;
  ingredients: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  price: number;       // Precio base (corresponde a la primera variante)
  variants: ProductVariant[];
  images: string[];
  badges: string[];
  featured: boolean;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  specs: ProductSpecs;
}

export interface CartItem {
  cartItemId: string;  // `${productId}::${variantId}`
  productId: string;
  slug: string;
  name: string;
  category: ProductCategory;
  image: string;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

/**
 * Estados del pedido pensados para el futuro módulo de Administración:
 * - `pending_verification`: El cliente subió el comprobante; pendiente de revisión por el Admin.
 * - `confirmed`: El Admin verificó la transferencia bancaria y aprobó el pedido.
 * - `rejected`: Comprobante inválido o transferencia no recibida.
 * - `shipped`: Pedido despachado desde Kasaychi / Guaranda.
 * - `delivered`: Entregado al cliente.
 */
export type OrderStatus =
  | 'pending_verification'
  | 'confirmed'
  | 'rejected'
  | 'shipped'
  | 'delivered';

export interface CustomerInfo {
  fullName: string;
  identification: string; // Cédula o RUC
  email: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  deliveryMethod: 'shipping' | 'pickup_community';
  notes?: string;
}

export interface PaymentReceiptInfo {
  method: 'bank_transfer';
  bankAccountSelected: string;
  referenceNumber: string;
  transferDate: string;
  receiptFileName: string;
  receiptMimeType: string;
  receiptSizeBytes: number;
  /**
   * MOCK TEMPORAL: En la fase actual guarda un Data URL (Base64) o URL local.
   * FUTURO SUPABASE: Guardará la ruta/URL firmada del bucket `payment-receipts`.
   */
  receiptUrl: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface Order {
  id: string;                 // Código legible ej: "KAS-2026-4821"
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
  status: OrderStatus;
  customer: CustomerInfo;
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  payment: PaymentReceiptInfo;
  adminReview?: {
    reviewedBy?: string;
    reviewedAt?: string;
    adminNotes?: string;
  };
}

export interface BankAccountInfo {
  id: string;
  bankName: string;
  accountType: 'Cuenta de Ahorros' | 'Cuenta Corriente';
  accountNumber: string;
  beneficiaryName: string;
  beneficiaryId: string;
  notificationEmail: string;
}

