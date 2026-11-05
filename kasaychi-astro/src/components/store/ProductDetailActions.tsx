import { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import type { Product } from '../../types/store';
import { useCart } from '../../lib/cartStore';

interface ProductDetailActionsProps {
  product: Product;
}

export default function ProductDetailActions({
  product,
}: ProductDetailActionsProps) {
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? ''
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    const nextVariant = product.variants.find((v) => v.id === variantId);
    if (nextVariant && quantity > nextVariant.stock) {
      setQuantity(Math.max(1, nextVariant.stock));
    }
  };

  const handleAddToCart = () => {
    addItem(product, activeVariant, quantity, true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, activeVariant, quantity, false);
    window.location.href = '/checkout/';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Columna Izquierda: Galería de Imágenes */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative bg-white border border-slate-200 overflow-hidden aspect-[4/3] shadow-lg">
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="px-3 py-1 bg-institutional-blue text-white text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Miniaturas si existen múltiples fotos */}
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((imgUrl, idx) => {
              const isCurrent = imgUrl === selectedImage;
              return (
                <button
                  key={imgUrl + idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`aspect-[4/3] overflow-hidden border-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-ancestral-gold shadow-md'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} vista ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Columna Derecha: Selección de Variante, Precio y Compra */}
      <div className="lg:col-span-6 bg-white border border-slate-200 p-8 md:p-10 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-ancestral-gold">
            {product.subtitle}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            SKU: {activeVariant.sku}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-institutional-blue mb-4 leading-tight">
          {product.name}
        </h1>

        <p className="text-slate-600 font-serif text-base leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Bloque de Precio Dinámico */}
        <div className="bg-paper border border-slate-200 p-5 mb-6 flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Precio por Unidad ({activeVariant.label})
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-institutional-blue">
                ${activeVariant.price.toFixed(2)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                USD
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Disponible ({activeVariant.stock} uds.)
            </span>
          </div>
        </div>

        {/* Selector de Presentación / Variante */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-institutional-blue mb-3">
            1. Elige la Presentación / Peso:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.variants.map((variant) => {
              const isSelected = variant.id === activeVariant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => handleVariantChange(variant.id)}
                  className={`p-3.5 border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-institutional-blue bg-institutional-blue text-white shadow-sm'
                      : 'border-slate-200 bg-paper text-slate-800 hover:border-ancestral-gold'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-bold">
                      {variant.label}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isSelected ? 'text-ancestral-gold' : 'text-slate-500'
                      }`}
                    >
                      Stock: {variant.stock} uds.
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    ${variant.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector de Cantidad y Subtotal */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-widest text-institutional-blue mb-3">
            2. Cantidad:
          </label>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="inline-flex items-center border border-slate-300 bg-paper">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Disminuir cantidad"
                className="w-11 h-11 flex items-center justify-center text-institutional-blue hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-14 text-center text-base font-bold text-institutional-blue">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(activeVariant.stock, q + 1))
                }
                disabled={quantity >= activeVariant.stock}
                aria-label="Aumentar cantidad"
                className="w-11 h-11 flex items-center justify-center text-institutional-blue hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Subtotal Selección
              </span>
              <span className="text-xl font-bold text-ancestral-gold">
                ${(activeVariant.price * quantity).toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`py-4 px-6 font-bold uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-ancestral-gold text-white hover:bg-institutional-blue'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                Agregado al Carrito
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Agregar al Carrito
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="py-4 px-6 bg-institutional-blue text-white font-bold uppercase text-xs tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Comprar Ahora
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Garantías de Compra Comunitaria */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-ancestral-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-institutional-blue uppercase tracking-wider text-[11px]">
                Cadena de Frío Garantizada
              </strong>
              <span className="font-serif">
                Envíos desde Guaranda o retiro directo en Kasaychi.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-ancestral-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-institutional-blue uppercase tracking-wider text-[11px]">
                Pago por Transferencia
              </strong>
              <span className="font-serif">
                Sube tu comprobante bancario directo en el Checkout.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

