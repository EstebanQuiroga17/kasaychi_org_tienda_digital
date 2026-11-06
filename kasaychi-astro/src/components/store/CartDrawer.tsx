import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useCart } from '../../lib/cartStore';

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    isHydrated,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const freeShippingThreshold = 25;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <>
      {/* Botón disparador en el Header */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label={`Abrir carrito de compras (${itemCount} productos)`}
        className="relative inline-flex items-center gap-2.5 px-3.5 py-2 border border-slate-200 bg-paper hover:border-ancestral-gold text-institutional-blue transition-all cursor-pointer group"
      >
        <ShoppingBag className="w-4 h-4 text-institutional-blue group-hover:text-ancestral-gold transition-colors" />
        <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-widest">
          Carrito
        </span>
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-ancestral-gold text-white">
          {isHydrated ? itemCount : 0}
        </span>
      </button>

      {/* Slide-over Drawer montado en document.body vía Portal */}
      {isHydrated &&
        isDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-institutional-blue/60 backdrop-blur-xs transition-opacity"
              onClick={closeDrawer}
            />

            {/* Panel lateral */}
            <div className="relative z-10 w-full max-w-lg sm:max-w-xl bg-paper h-full shadow-2xl flex flex-col border-l border-slate-200">
              {/* Borde superior Wiphala */}
              <div className="wiphala-border w-full flex-shrink-0" />

              {/* Cabecera del Carrito */}
              <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-institutional-blue text-white flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-5 h-5 text-ancestral-gold" />
                  </div>
                  <div>
                    <h2
                      id="cart-drawer-title"
                      className="text-sm font-bold uppercase tracking-widest text-institutional-blue"
                    >
                      Tu Canasta Comunitaria
                    </h2>
                    <p className="text-xs text-slate-500 font-serif">
                      {itemCount}{' '}
                      {itemCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Cerrar carrito"
                  className="p-2 text-slate-400 hover:text-institutional-blue transition-colors cursor-pointer rounded-xs hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Barra de progreso hacia envío gratuito */}
              {items.length > 0 && (
                <div className="px-6 py-3 bg-institutional-blue/5 border-b border-slate-200">
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-xs text-slate-700 font-serif">
                      Agrega{' '}
                      <strong className="text-institutional-blue font-sans">
                        ${remainingForFreeShipping.toFixed(2)}
                      </strong>{' '}
                      más para obtener <strong>envío gratuito</strong> (o retira sin costo en la comunidad).
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ¡Tu pedido aplica para envío a domicilio gratuito!
                    </p>
                  )}
                </div>
              )}

              {/* Lista de Productos estilo Visual Marketplace */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 border border-ancestral-gold/40 bg-white flex items-center justify-center mb-6">
                      <Store className="w-8 h-8 text-ancestral-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-institutional-blue mb-2">
                      Tu carrito está vacío
                    </h3>
                    <p className="text-sm text-slate-600 font-serif max-w-xs mb-8">
                      Explora nuestros quesos artesanales Inti Churi, derivados lácteos y cosechas andinas.
                    </p>
                    <a
                      href="/tienda/"
                      onClick={closeDrawer}
                      className="bg-institutional-blue text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-ancestral-gold transition-colors inline-flex items-center gap-2"
                    >
                      Explorar Tienda
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="bg-white border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 hover:border-ancestral-gold/70 transition-all rounded-xs shadow-xs group"
                    >
                      {/* Imagen visual protagonista estilo Marketplace (120px+ en desktop, aspect-square) */}
                      <a
                        href={`/tienda/${item.slug}/`}
                        onClick={closeDrawer}
                        className="w-full sm:w-28 sm:h-28 md:w-32 md:h-32 aspect-square bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden block relative rounded-xs"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </a>

                      {/* Información y acciones */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <a
                              href={`/tienda/${item.slug}/`}
                              onClick={closeDrawer}
                              className="text-sm sm:text-base font-bold text-institutional-blue hover:text-ancestral-gold transition-colors leading-snug line-clamp-2 block"
                            >
                              {item.name}
                            </a>
                            <button
                              type="button"
                              onClick={() => removeItem(item.cartItemId)}
                              aria-label={`Eliminar ${item.name}`}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1.5 cursor-pointer rounded-xs hover:bg-red-50 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <span className="inline-block text-[11px] font-semibold text-ancestral-gold bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 mt-1.5">
                            {item.variantLabel}
                          </span>
                        </div>

                        {/* Fila de Controles y Precio destacado */}
                        <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100">
                          {/* Selector de Cantidad táctil y accesible */}
                          <div className="inline-flex items-center border border-slate-300 bg-paper">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.cartItemId, item.quantity - 1)
                              }
                              aria-label="Disminuir cantidad"
                              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center text-sm font-bold text-institutional-blue">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.cartItemId, item.quantity + 1)
                              }
                              aria-label="Aumentar cantidad"
                              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Subtotal de línea y unitario */}
                          <div className="text-right">
                            <p className="text-base sm:text-lg font-black text-institutional-blue tracking-tight">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              ${item.unitPrice.toFixed(2)} c/u
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pie del Carrito */}
              {items.length > 0 && (
                <div className="p-6 bg-white border-t border-slate-200 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 uppercase tracking-wider">
                      <span>Subtotal ({itemCount} ítems)</span>
                      <span className="font-bold text-slate-800">
                        ${subtotal.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-institutional-blue pt-2 border-t border-slate-100">
                      <span>Total Estimado</span>
                      <span className="text-ancestral-gold text-xl">
                        ${subtotal.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-serif">
                    Pago directo mediante transferencia bancaria y subida de comprobante en el Checkout.
                  </p>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href="/checkout/"
                      onClick={closeDrawer}
                      className="w-full bg-ancestral-gold text-white py-4 px-6 font-bold uppercase text-xs tracking-[0.2em] hover:bg-institutional-blue transition-colors flex items-center justify-center gap-2"
                    >
                      Proceder al Checkout
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="/tienda/"
                        onClick={closeDrawer}
                        className="text-[11px] font-bold uppercase tracking-widest text-institutional-blue hover:text-ancestral-gold transition-colors"
                      >
                        Seguir Comprando
                      </a>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Vaciar Carrito
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

