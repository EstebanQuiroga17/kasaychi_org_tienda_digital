/**
 * ============================================================================
 * ORDER SERVICE - CAPA DE PERSISTENCIA DE PEDIDOS (MOCK TEMPORAL -> SUPABASE)
 * ============================================================================
 * Este servicio gestiona la creación de órdenes en el Checkout, la subida del
 * comprobante de transferencia bancaria y las operaciones futuras del Panel de
 * Administración (confirmar/rechazar pedidos después del login del Admin).
 *
 * ESTADO ACTUAL (MOCK TEMPORAL):
 * - Almacena los pedidos en `localStorage` bajo la clave `kasaychi_orders_mock_v1`.
 * - Convierte el archivo de comprobante a Data URL para previsualización local.
 *
 * MIGRACIÓN A SUPABASE (PRÓXIMA FASE):
 * 1. `uploadTransferReceipt(file, orderId)`:
 *    Subirá el archivo a `supabase.storage.from('payment-receipts').upload(...)`
 * 2. `createOrder(payload)`:
 *    Insertará la cabecera en `supabase.from('orders').insert(...)` y el detalle
 *    en `supabase.from('order_items').insert(...)` con `status = 'pending_verification'`.
 * 3. `getOrdersForAdmin()` y `updateOrderStatus(...)`:
 *    Serán consumidos por el módulo `/admin` autenticado con `supabase.auth`.
 * ============================================================================
 */

import type {
  CartItem,
  CustomerInfo,
  Order,
  OrderItem,
  OrderStatus,
} from '../types/store';

const MOCK_ORDERS_STORAGE_KEY = 'kasaychi_orders_mock_v1';

export interface CreateOrderInput {
  customer: CustomerInfo;
  items: CartItem[];
  bankAccountSelected: string;
  referenceNumber: string;
  transferDate: string;
  receiptFile: File;
}

/**
 * Convierte un archivo (imagen o PDF) a Base64 Data URL en el Mock Temporal.
 * En Supabase esta función subirá el archivo al Bucket `payment-receipts`.
 */
export async function uploadTransferReceiptMock(
  file: File,
  _orderId: string
): Promise<string> {
  // TODO (Supabase Storage):
  // const ext = file.name.split('.').pop();
  // const filePath = `receipts/${orderId}-${Date.now()}.${ext}`;
  // const { data, error } = await supabase.storage
  //   .from('payment-receipts')
  //   .upload(filePath, file);
  // if (error) throw error;
  // return data.path;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error('No se pudo procesar el archivo del comprobante.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Calcula costos de envío según el método de entrega y el subtotal.
 * - Retiro en la Comunidad Kasaychi / Guaranda: $0.00
 * - Envío a domicilio gratis en pedidos desde $25.00, caso contrario $3.50
 */
export function calculateOrderTotals(
  items: CartItem[],
  deliveryMethod: CustomerInfo['deliveryMethod']
) {
  const subtotal = Number(
    items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0).toFixed(2)
  );
  const shipping =
    deliveryMethod === 'pickup_community' ? 0 : subtotal >= 25 ? 0 : 3.5;
  const total = Number((subtotal + shipping).toFixed(2));

  return { subtotal, shipping, total };
}

/**
 * Genera un código único legible para el cliente y el administrador.
 * Ejemplo: KAS-2026-4819
 */
function generateOrderCode(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `KAS-${year}-${randomDigits}`;
}

/**
 * Crea un nuevo pedido con estado inicial `pending_verification` para que
 * posteriormente el Administrador pueda revisarlo y confirmarlo.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Simulación de latencia de red para feedback realista en la UI
  await new Promise((resolve) => setTimeout(resolve, 700));

  const orderId = generateOrderCode();
  const receiptUrl = await uploadTransferReceiptMock(input.receiptFile, orderId);
  const totals = calculateOrderTotals(input.items, input.customer.deliveryMethod);

  const orderItems: OrderItem[] = input.items.map((item) => ({
    productId: item.productId,
    slug: item.slug,
    productName: item.name,
    variantId: item.variantId,
    variantLabel: item.variantLabel,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    subtotal: Number((item.unitPrice * item.quantity).toFixed(2)),
    image: item.image,
  }));

  const nowIso = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    createdAt: nowIso,
    updatedAt: nowIso,
    status: 'pending_verification',
    customer: input.customer,
    items: orderItems,
    totals,
    payment: {
      method: 'bank_transfer',
      bankAccountSelected: input.bankAccountSelected,
      referenceNumber: input.referenceNumber.trim(),
      transferDate: input.transferDate,
      receiptFileName: input.receiptFile.name,
      receiptMimeType: input.receiptFile.type || 'application/octet-stream',
      receiptSizeBytes: input.receiptFile.size,
      receiptUrl,
    },
  };

  // Persistencia en Mock Temporal (localStorage)
  if (typeof window !== 'undefined') {
    try {
      const existingRaw = window.localStorage.getItem(MOCK_ORDERS_STORAGE_KEY);
      const existingOrders: Order[] = existingRaw ? JSON.parse(existingRaw) : [];
      existingOrders.unshift(newOrder);
      window.localStorage.setItem(
        MOCK_ORDERS_STORAGE_KEY,
        JSON.stringify(existingOrders.slice(0, 30))
      );
    } catch {
      // Si el comprobante en base64 excede la cuota de localStorage, guardamos el pedido con referencia ligera
      const lightOrder: Order = {
        ...newOrder,
        payment: {
          ...newOrder.payment,
          receiptUrl: `[mock-storage://payment-receipts/${orderId}/${input.receiptFile.name}]`,
        },
      };
      try {
        const existingRaw = window.localStorage.getItem(MOCK_ORDERS_STORAGE_KEY);
        const existingOrders: Order[] = existingRaw ? JSON.parse(existingRaw) : [];
        existingOrders.unshift(lightOrder);
        window.localStorage.setItem(
          MOCK_ORDERS_STORAGE_KEY,
          JSON.stringify(existingOrders.slice(0, 30))
        );
      } catch {
        // Ignorar cuota en modo mock
      }
    }
  }

  return newOrder;
}

/**
 * ============================================================================
 * MÉTODOS PREPARADOS PARA EL FUTURO MÓDULO DE ADMINISTRACIÓN (/admin)
 * ============================================================================
 */

export async function getOrdersForAdmin(): Promise<Order[]> {
  // TODO (Supabase Admin):
  // const { data } = await supabase
  //   .from('orders')
  //   .select('*, items:order_items(*)')
  //   .order('created_at', { ascending: false });
  // return data ?? [];
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MOCK_ORDERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export async function updateOrderStatusForAdmin(
  orderId: string,
  newStatus: OrderStatus,
  adminNotes?: string
): Promise<Order | null> {
  // TODO (Supabase Admin):
  // const { data } = await supabase
  //   .from('orders')
  //   .update({ status: newStatus, admin_notes: adminNotes, updated_at: new Date().toISOString() })
  //   .eq('id', orderId)
  //   .select()
  //   .single();
  // return data;
  if (typeof window === 'undefined') return null;
  const orders = await getOrdersForAdmin();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;

  orders[idx] = {
    ...orders[idx],
    status: newStatus,
    updatedAt: new Date().toISOString(),
    adminReview: {
      reviewedBy: 'admin@kasaychi.org',
      reviewedAt: new Date().toISOString(),
      adminNotes,
    },
  };

  window.localStorage.setItem(MOCK_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return orders[idx];
}

