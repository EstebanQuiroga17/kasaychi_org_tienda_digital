import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  Check,
  Eye,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import type { Product, ProductCategory } from '../../types/store';
import { PRODUCT_CATEGORIES } from '../../data/products';
import { useCart } from '../../lib/cartStore';

interface ProductCatalogProps {
  initialProducts: Product[];
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc';
type PriceFilter = 'all' | 'under-5' | '5-to-10' | 'over-10';

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const { addItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  // Guarda qué variante está seleccionada en cada tarjeta del catálogo
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  // Feedback temporal al agregar un producto
  const [justAddedMap, setJustAddedMap] = useState<Record<string, boolean>>({});
  // Modal para que el cliente elija la variante al momento de agregar
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialProducts.length };
    for (const prod of initialProducts) {
      counts[prod.category] = (counts[prod.category] || 0) + 1;
    }
    return counts;
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = initialProducts.filter((product) => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      if (query) {
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.shortDescription.toLowerCase().includes(query);
        const matchesIngredients = product.specs.ingredients.some((ing) =>
          ing.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDesc && !matchesIngredients) {
          return false;
        }
      }

      const activeVariantId = selectedVariants[product.id];
      const activeVariant =
        product.variants.find((v) => v.id === activeVariantId) ?? product.variants[0];
      const currentPrice = activeVariant?.price ?? product.price;

      if (priceFilter === 'under-5' && currentPrice > 5) return false;
      if (priceFilter === '5-to-10' && (currentPrice < 5 || currentPrice > 10))
        return false;
      if (priceFilter === 'over-10' && currentPrice <= 10) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'featured') {
        return Number(b.featured) - Number(a.featured);
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'rating-desc') {
        return b.rating - a.rating;
      }
      return 0;
    });
  }, [
    initialProducts,
    selectedCategory,
    searchQuery,
    priceFilter,
    sortBy,
    selectedVariants,
  ]);

  const handleSelectVariant = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleAddToCart = (product: Product) => {
    if (product.variants.length > 1) {
      setVariantModalProduct(product);
    } else {
      const variant = product.variants[0];
      addItem(product, variant, 1, true);
      setJustAddedMap((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setJustAddedMap((prev) => ({ ...prev, [product.id]: false }));
      }, 1800);
    }
  };

  const handleSelectVariantAndAdd = (
    product: Product,
    variant: Product['variants'][0]
  ) => {
    addItem(product, variant, 1, true);
    setVariantModalProduct(null);
    setJustAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setJustAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceFilter('all');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    priceFilter !== 'all' ||
    sortBy !== 'featured';

  return (
    <div>
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 mb-12 shadow-xs">
        {/* Pestañas de Categoría */}
        <div className="flex flex-wrap gap-2 pb-6 mb-6 border-b border-slate-200">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer border ${
                  isActive
                    ? 'bg-institutional-blue text-white border-institutional-blue shadow-sm'
                    : 'bg-paper text-slate-700 border-slate-200 hover:border-ancestral-gold hover:text-institutional-blue'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? 'bg-ancestral-gold text-white'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {categoryCounts[cat.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controles secundarios: Búsqueda, Precio y Ordenamiento */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Buscador */}
          <div className="md:col-span-5 relative">
            <label htmlFor="catalog-search" className="sr-only">
              Buscar productos
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar queso, mozzarella, yogurt, papa..."
              className="w-full pl-11 pr-4 py-3 bg-paper border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-ancestral-gold transition-colors"
            />
          </div>

          {/* Rango de Precio */}
          <div className="md:col-span-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-ancestral-gold flex-shrink-0 hidden sm:block" />
            <select
              aria-label="Filtrar por rango de precio"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              className="w-full py-3 px-4 bg-paper border border-slate-200 text-xs font-bold uppercase tracking-wider text-institutional-blue focus:outline-none focus:border-ancestral-gold cursor-pointer"
            >
              <option value="all">Precio: Todos</option>
              <option value="under-5">Hasta $5.00 USD</option>
              <option value="5-to-10">$5.00 a $10.00 USD</option>
              <option value="over-10">Más de $10.00 USD</option>
            </select>
          </div>

          {/* Ordenar por */}
          <div className="md:col-span-4 flex items-center gap-2">
            <select
              aria-label="Ordenar productos"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full py-3 px-4 bg-paper border border-slate-200 text-xs font-bold uppercase tracking-wider text-institutional-blue focus:outline-none focus:border-ancestral-gold cursor-pointer"
            >
              <option value="featured">Ordenar: Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="rating-desc">Mejor Valorados</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                title="Limpiar filtros"
                className="p-3 border border-slate-200 bg-paper text-slate-600 hover:text-institutional-blue hover:border-ancestral-gold transition-colors cursor-pointer flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Estado de resultados */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Mostrando{' '}
            <strong className="text-institutional-blue">
              {filteredProducts.length}
            </strong>{' '}
            de {initialProducts.length} productos comunitarios
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-ancestral-gold font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Elaborados 100% en la Comunidad Kasaychi
          </span>
        </div>
      </div>

      {/* Grilla de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center">
          <p className="text-xl font-bold text-institutional-blue mb-2">
            No encontramos productos con esos filtros
          </p>
          <p className="text-slate-600 font-serif mb-6">
            Intenta buscar con otro término o restablece los filtros activos.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="bg-ancestral-gold text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-institutional-blue transition-colors cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const isJustAdded = Boolean(justAddedMap[product.id]);
            const basePrice = product.variants[0]?.price ?? product.price;

            return (
              <article
                key={product.id}
                className="bg-white border border-slate-200 hover:border-ancestral-gold/70 transition-all duration-300 flex flex-col group shadow-xs hover:shadow-xl rounded-xs overflow-hidden"
              >
                {/* Fotografía Protagonista del Producto (Estilo Marketplace) */}
                <a
                  href={`/tienda/${product.slug}/`}
                  className="relative aspect-square sm:aspect-[4/3] bg-slate-50 overflow-hidden block"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </a>

                {/* Contenido Limpio: Simplemente Título y Precio */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <a
                      href={`/tienda/${product.slug}/`}
                      className="block group-hover:text-ancestral-gold transition-colors"
                    >
                      <h3 className="text-base sm:text-lg font-bold text-institutional-blue leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                    </a>

                    <div className="mt-2.5 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-institutional-blue">
                        ${basePrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        USD {product.variants.length > 1 ? '(desde)' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <a
                      href={`/tienda/${product.slug}/`}
                      title="Ver ficha completa del producto"
                      className="p-3 border border-slate-200 text-institutional-blue hover:border-ancestral-gold hover:text-ancestral-gold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-ancestral-gold text-white hover:bg-institutional-blue'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          Agregado
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          {product.variants.length > 1 ? 'Elegir y Agregar' : 'Agregar'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal: El cliente escoge la variante a la hora de agregar */}
      {variantModalProduct && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-institutional-blue/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setVariantModalProduct(null)}
        >
          <div
            className="bg-white border border-slate-200 shadow-2xl max-w-md w-full p-6 relative rounded-xs animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={variantModalProduct.images[0]}
                  alt={variantModalProduct.name}
                  className="w-14 h-14 object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-institutional-blue leading-snug line-clamp-1">
                    {variantModalProduct.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-serif">
                    Elige la presentación a agregar:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVariantModalProduct(null)}
                aria-label="Cerrar modal"
                className="text-slate-400 hover:text-institutional-blue p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2.5">
              {variantModalProduct.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() =>
                    handleSelectVariantAndAdd(variantModalProduct, v)
                  }
                  className="w-full p-3.5 border border-slate-200 hover:border-ancestral-gold hover:bg-amber-50/50 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="font-bold text-sm text-institutional-blue group-hover:text-ancestral-gold">
                    {v.label}
                  </span>
                  <div className="text-right">
                    <span className="text-base font-black text-institutional-blue">
                      ${v.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">USD</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <a
                href={`/tienda/${variantModalProduct.slug}/`}
                className="text-xs font-bold uppercase tracking-widest text-ancestral-gold hover:text-institutional-blue transition-colors"
              >
                Ver ficha completa del producto →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

