import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Building2,
  ShieldCheck,
  ArrowLeft,
  Clock,
  Printer,
  ShoppingBag,
  Plus,
  Minus,
} from 'lucide-react';
import type { CustomerInfo, Order } from '../../types/store';
import { MOCK_BANK_ACCOUNTS } from '../../data/products';
import { useCart } from '../../lib/cartStore';
import { calculateOrderTotals, createOrder } from '../../services/orderService';

const ECUADOR_PROVINCES = [
  'Bolívar',
  'Pichincha',
  'Tungurahua',
  'Chimborazo',
  'Guayas',
  'Azuay',
  'Cotopaxi',
  'Los Ríos',
  'Imbabura',
  'Loja',
  'Manabí',
  'Santo Domingo de los Tsáchilas',
  'Otra Provincia',
];

export default function CheckoutFlow() {
  const {
    items,
    isHydrated,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    identification: '',
    email: '',
    phone: '',
    province: 'Bolívar',
    city: 'Guaranda',
    address: '',
    deliveryMethod: 'shipping',
    notes: '',
  });

  const [selectedBankId, setSelectedBankId] = useState<string>(
    MOCK_BANK_ACCOUNTS[0]?.id ?? ''
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(
    null
  );
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totals = calculateOrderTotals(items, customer.deliveryMethod);
  const selectedBank =
    MOCK_BANK_ACCOUNTS.find((b) => b.id === selectedBankId) ??
    MOCK_BANK_ACCOUNTS[0];

  const handleCustomerField = (
    field: keyof CustomerInfo,
    value: string
  ) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(accountNumber);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch {
      // Fallback silencioso
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        'Formato no permitido. Por favor sube una imagen (JPG, PNG, WEBP) o un archivo PDF.'
      );
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      setErrorMessage(
        'El archivo supera el tamaño máximo de 5 MB. Por favor sube una captura más ligera.'
      );
      return;
    }

    setReceiptFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setReceiptPreviewUrl(String(reader.result));
      reader.readAsDataURL(file);
    } else {
      setReceiptPreviewUrl(null);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Tu carrito está vacío.');
      return;
    }

    if (
      !customer.fullName.trim() ||
      !customer.identification.trim() ||
      !customer.email.trim() ||
      !customer.phone.trim()
    ) {
      setErrorMessage(
        'Por favor completa todos tus datos personales y de contacto obligatorios.'
      );
      return;
    }

    if (
      customer.deliveryMethod === 'shipping' &&
      (!customer.city.trim() || !customer.address.trim())
    ) {
      setErrorMessage(
        'Por favor ingresa la ciudad y dirección exacta para el envío de tus productos.'
      );
      return;
    }

    if (!referenceNumber.trim()) {
      setErrorMessage(
        'Por favor ingresa el número de comprobante o referencia de la transferencia bancaria.'
      );
      return;
    }

    if (!receiptFile) {
      setErrorMessage(
        'Debes adjuntar la imagen o PDF del comprobante de transferencia bancaria para finalizar el pedido.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const order = await createOrder({
        customer,
        items,
        bankAccountSelected: `${selectedBank.bankName} - ${selectedBank.accountNumber}`,
        referenceNumber,
        transferDate,
        receiptFile,
      });

      setCompletedOrder(order);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al registrar tu pedido. Intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="bg-white border border-slate-200 p-12 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-institutional-blue">
          Cargando información del pedido...
        </p>
      </div>
    );
  }

  // ============================================================================
  // VISTA DE ORDEN COMPLETADA (PENDIENTE DE CONFIRMACIÓN POR EL ADMIN)
  // ============================================================================
  if (completedOrder) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="wiphala-border w-full" />

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 block mb-1">
                  Pedido Registrado Exitosamente
                </span>
                <h2 className="text-3xl font-bold text-institutional-blue">
                  Orden #{completedOrder.id}
                </h2>
                <p className="text-sm text-slate-500 font-serif mt-1">
                  Fecha:{' '}
                  {new Date(completedOrder.createdAt).toLocaleString('es-EC')}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-300 px-4 py-3 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-amber-900">
                  Estado del Pedido
                </span>
                <span className="text-xs font-bold text-amber-800">
                  Pendiente de Verificación Admin
                </span>
              </div>
            </div>
          </div>

          {/* Explicación del flujo de validación */}
          <div className="my-8 bg-paper border-l-4 border-ancestral-gold p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-institutional-blue mb-2">
              ¿Qué sucede ahora con tu pedido?
            </h3>
            <p className="text-sm text-slate-600 font-serif leading-relaxed">
              Hemos recibido tus datos y tu comprobante de transferencia bancaria (
              <strong>Ref. #{completedOrder.payment.referenceNumber}</strong>). El
              administrador de la <strong>Comunidad Kasaychi</strong> verificará la
              transferencia en el sistema y confirmará el despacho a tu correo{' '}
              <strong>{completedOrder.customer.email}</strong> o WhatsApp{' '}
              <strong>{completedOrder.customer.phone}</strong>.
            </p>
          </div>

          {/* Resumen de Datos del Cliente y Pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="border border-slate-200 p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-ancestral-gold mb-4">
                Datos de Entrega
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-slate-400 uppercase">Cliente:</dt>
                  <dd className="font-bold text-institutional-blue">
                    {completedOrder.customer.fullName} (CI/RUC:{' '}
                    {completedOrder.customer.identification})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 uppercase">Contacto:</dt>
                  <dd className="text-slate-700">
                    {completedOrder.customer.phone} ·{' '}
                    {completedOrder.customer.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 uppercase">
                    Modalidad / Dirección:
                  </dt>
                  <dd className="text-slate-700">
                    {completedOrder.customer.deliveryMethod ===
                    'pickup_community'
                      ? 'Retiro directo en Comunidad Kasaychi (Guaranda)'
                      : `${completedOrder.customer.address}, ${completedOrder.customer.city} (${completedOrder.customer.province})`}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border border-slate-200 p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-ancestral-gold mb-4">
                Comprobante de Transferencia Recibido
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-slate-400 uppercase">
                    Cuenta Destino:
                  </dt>
                  <dd className="font-bold text-institutional-blue">
                    {completedOrder.payment.bankAccountSelected}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 uppercase">
                    Nro. de Comprobante / Fecha:
                  </dt>
                  <dd className="text-slate-700">
                    #{completedOrder.payment.referenceNumber} (
                    {completedOrder.payment.transferDate})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 uppercase">
                    Archivo Adjunto:
                  </dt>
                  <dd className="text-emerald-700 font-semibold truncate">
                    {completedOrder.payment.receiptFileName}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Detalle de Productos Comprados */}
          <div className="border border-slate-200 mb-8">
            <div className="bg-paper px-6 py-3 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-widest text-institutional-blue">
                Detalle de Productos
              </h4>
            </div>
            <div className="divide-y divide-slate-200">
              {completedOrder.items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-bold text-institutional-blue text-sm">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Presentación: {item.variantLabel} · Cantidad:{' '}
                      {item.quantity} x ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-bold text-institutional-blue text-sm">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-paper px-6 py-4 border-t border-slate-200 space-y-1 text-right">
              <p className="text-xs text-slate-500">
                Subtotal: ${completedOrder.totals.subtotal.toFixed(2)} USD |
                Envío: ${completedOrder.totals.shipping.toFixed(2)} USD
              </p>
              <p className="text-lg font-bold text-institutional-blue">
                Total Transferido:{' '}
                <span className="text-ancestral-gold">
                  ${completedOrder.totals.total.toFixed(2)} USD
                </span>
              </p>
            </div>
          </div>

          {/* Botones Finales */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a
              href="/tienda/"
              className="bg-institutional-blue text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-ancestral-gold transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la Tienda
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="border border-slate-300 bg-white text-institutional-blue px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:border-ancestral-gold transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Comprobante de Orden
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SI EL CARRITO ESTÁ VACÍO
  // ============================================================================
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-paper border border-ancestral-gold/40 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-ancestral-gold" />
        </div>
        <h2 className="text-2xl font-bold text-institutional-blue mb-3">
          No tienes productos en tu carrito
        </h2>
        <p className="text-slate-600 font-serif mb-8">
          Agrega quesos artesanales Inti Churi o productos de nuestra comunidad antes de pasar por caja.
        </p>
        <a
          href="/tienda/"
          className="bg-ancestral-gold text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-institutional-blue transition-colors inline-flex items-center gap-2"
        >
          Ir al Catálogo de Productos
        </a>
      </div>
    );
  }

  // ============================================================================
  // FORMULARIO PRINCIPAL DE CHECKOUT
  // ============================================================================
  return (
    <form
      onSubmit={handleSubmitOrder}
      className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
    >
      {/* Columna Izquierda (7 cols): Datos del Cliente + Transferencia y Comprobante */}
      <div className="lg:col-span-7 space-y-8">
        {errorMessage && (
          <div
            role="alert"
            className="bg-red-50 border-l-4 border-red-600 p-4 flex items-start gap-3 text-red-900"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* PASO 1: DATOS DEL COMPRADOR Y ENTREGA */}
        <section className="bg-white border border-slate-200 p-6 md:p-8 shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200">
            <span className="w-8 h-8 bg-institutional-blue text-ancestral-gold font-bold text-sm flex items-center justify-center">
              1
            </span>
            <div>
              <h2 className="text-lg font-bold text-institutional-blue uppercase tracking-wider">
                Datos del Cliente y Entrega
              </h2>
              <p className="text-xs text-slate-500 font-serif">
                Información para el despacho y registro de tu pedido comunitario
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label
                htmlFor="fullName"
                className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
              >
                Nombres y Apellidos Completos *
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={customer.fullName}
                onChange={(e) =>
                  handleCustomerField('fullName', e.target.value)
                }
                placeholder="Ej. María Fernanda Quispe"
                className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
              />
            </div>

            <div>
              <label
                htmlFor="identification"
                className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
              >
                Cédula o RUC *
              </label>
              <input
                id="identification"
                type="text"
                required
                maxLength={13}
                value={customer.identification}
                onChange={(e) =>
                  handleCustomerField('identification', e.target.value)
                }
                placeholder="Ej. 0201948271"
                className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
              >
                Teléfono / WhatsApp *
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={customer.phone}
                onChange={(e) => handleCustomerField('phone', e.target.value)}
                placeholder="Ej. 0991234567"
                className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
              >
                Correo Electrónico *
              </label>
              <input
                id="email"
                type="email"
                required
                value={customer.email}
                onChange={(e) => handleCustomerField('email', e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
              />
            </div>

            {/* Modalidad de Entrega */}
            <div className="sm:col-span-2 pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-3">
                Modalidad de Entrega *
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleCustomerField('deliveryMethod', 'shipping')
                  }
                  className={`p-4 border text-left transition-all cursor-pointer ${
                    customer.deliveryMethod === 'shipping'
                      ? 'border-institutional-blue bg-institutional-blue text-white'
                      : 'border-slate-200 bg-paper text-slate-700 hover:border-ancestral-gold'
                  }`}
                >
                  <span className="block text-xs font-bold uppercase tracking-wider">
                    Envío a Domicilio / Encomienda
                  </span>
                  <span
                    className={`text-xs font-serif ${
                      customer.deliveryMethod === 'shipping'
                        ? 'text-ancestral-gold'
                        : 'text-slate-500'
                    }`}
                  >
                    Gratis desde $25 USD ($3.50 tarifa estándar)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCustomerField('deliveryMethod', 'pickup_community')
                  }
                  className={`p-4 border text-left transition-all cursor-pointer ${
                    customer.deliveryMethod === 'pickup_community'
                      ? 'border-institutional-blue bg-institutional-blue text-white'
                      : 'border-slate-200 bg-paper text-slate-700 hover:border-ancestral-gold'
                  }`}
                >
                  <span className="block text-xs font-bold uppercase tracking-wider">
                    Retiro en Comunidad Kasaychi
                  </span>
                  <span
                    className={`text-xs font-serif ${
                      customer.deliveryMethod === 'pickup_community'
                        ? 'text-ancestral-gold'
                        : 'text-slate-500'
                    }`}
                  >
                    Sin costo ($0.00) · Km 19 Vía Riobamba
                  </span>
                </button>
              </div>
            </div>

            {customer.deliveryMethod === 'shipping' && (
              <>
                <div>
                  <label
                    htmlFor="province"
                    className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
                  >
                    Provincia *
                  </label>
                  <select
                    id="province"
                    value={customer.province}
                    onChange={(e) =>
                      handleCustomerField('province', e.target.value)
                    }
                    className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
                  >
                    {ECUADOR_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
                  >
                    Ciudad / Cantón *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) =>
                      handleCustomerField('city', e.target.value)
                    }
                    placeholder="Ej. Guaranda, Quito, Riobamba, Ambato..."
                    className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
                  >
                    Dirección Exacta y Referencia *
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) =>
                      handleCustomerField('address', e.target.value)
                    }
                    placeholder="Calle principal, número de casa, intersección y referencia"
                    className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
              >
                Notas Adicionales para el Pedido (Opcional)
              </label>
              <textarea
                id="notes"
                rows={2}
                value={customer.notes}
                onChange={(e) => handleCustomerField('notes', e.target.value)}
                placeholder="Horario preferido de recepción o indicaciones especiales..."
                className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
              />
            </div>
          </div>
        </section>

        {/* PASO 2: PAGO POR TRANSFERENCIA BANCARIA Y SUBIDA DE COMPROBANTE */}
        <section className="bg-white border border-slate-200 p-6 md:p-8 shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200">
            <span className="w-8 h-8 bg-institutional-blue text-ancestral-gold font-bold text-sm flex items-center justify-center">
              2
            </span>
            <div>
              <h2 className="text-lg font-bold text-institutional-blue uppercase tracking-wider">
                Transferencia Bancaria y Comprobante
              </h2>
              <p className="text-xs text-slate-500 font-serif">
                Realiza la transferencia por{' '}
                <strong className="text-institutional-blue">
                  ${totals.total.toFixed(2)} USD
                </strong>{' '}
                a una de nuestras cuentas comunitarias y sube tu comprobante
              </p>
            </div>
          </div>

          {/* Selección de Cuenta Bancaria de la Comunidad */}
          <div className="mb-6">
            <span className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-3">
              Selecciona la entidad bancaria donde transferiste:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_BANK_ACCOUNTS.map((account) => {
                const isSelected = account.id === selectedBank.id;
                return (
                  <div
                    key={account.id}
                    onClick={() => setSelectedBankId(account.id)}
                    className={`p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-ancestral-gold bg-paper shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-institutional-blue">
                        <Building2 className="w-4 h-4 text-ancestral-gold" />
                        {account.bankName}
                      </span>
                      <input
                        type="radio"
                        name="bankAccount"
                        checked={isSelected}
                        onChange={() => setSelectedBankId(account.id)}
                        className="accent-institutional-blue"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">
                      {account.accountType}
                    </p>
                    <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-1.5 my-2">
                      <span className="font-mono text-sm font-bold text-institutional-blue">
                        {account.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyAccount(account.accountNumber);
                        }}
                        className="text-[11px] font-bold uppercase tracking-wider text-ancestral-gold hover:text-institutional-blue flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAccount === account.accountNumber ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong>Beneficiario:</strong> {account.beneficiaryName}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      <strong>RUC:</strong> {account.beneficiaryId}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Número de referencia y fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label
                htmlFor="referenceNumber"
                className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
              >
                Nro. de Comprobante / Referencia *
              </label>
              <input
                id="referenceNumber"
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Ej. 84920144"
                className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
              />
            </div>

            <div>
              <label
                htmlFor="transferDate"
                className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2"
              >
                Fecha de la Transferencia *
              </label>
              <input
                id="transferDate"
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-4 py-3 bg-paper border border-slate-200 text-sm focus:outline-none focus:border-ancestral-gold"
              />
            </div>
          </div>

          {/* Subida del Archivo del Comprobante */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-institutional-blue mb-2">
              Subir Comprobante de Transferencia (Imagen o PDF) *
            </label>

            {!receiptFile ? (
              <label
                htmlFor="receipt-upload"
                className="border-2 border-dashed border-ancestral-gold/60 hover:border-institutional-blue bg-paper p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <div className="w-14 h-14 bg-white border border-slate-200 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-ancestral-gold" />
                </div>
                <span className="text-sm font-bold text-institutional-blue mb-1">
                  Haz clic aquí para seleccionar la foto o PDF del comprobante
                </span>
                <span className="text-xs text-slate-500 font-serif">
                  Formatos aceptados: JPG, PNG, WEBP o PDF (Máx. 5 MB)
                </span>
                <input
                  ref={fileInputRef}
                  id="receipt-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="border border-emerald-300 bg-emerald-50/50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Comprobante Adjuntado Correctamente
                      </p>
                      <p className="text-sm font-bold text-institutional-blue truncate">
                        {receiptFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(receiptFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cambiar
                  </button>
                </div>

                {receiptPreviewUrl && (
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Vista Previa del Comprobante:
                    </span>
                    <img
                      src={receiptPreviewUrl}
                      alt="Vista previa del comprobante bancario"
                      className="max-h-64 w-auto border border-slate-200 shadow-sm bg-white p-1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Columna Derecha (5 cols): Resumen del Pedido */}
      <aside className="lg:col-span-5 bg-white border border-slate-200 p-6 md:p-8 shadow-sm lg:sticky lg:top-28">
        <div className="pb-4 mb-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-institutional-blue uppercase tracking-wider">
            Resumen del Pedido
          </h3>
          <a
            href="/tienda/"
            className="text-xs font-bold uppercase tracking-wider text-ancestral-gold hover:text-institutional-blue"
          >
            Editar Tienda
          </a>
        </div>

        {/* Lista de ítems */}
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1 mb-6 divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="pt-4 first:pt-0 flex items-start gap-3"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-institutional-blue truncate">
                  {item.name}
                </p>
                <p className="text-xs text-ancestral-gold font-semibold">
                  {item.variantLabel}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="inline-flex items-center border border-slate-200 bg-paper">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.quantity - 1)
                      }
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-institutional-blue">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.quantity + 1)
                      }
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.cartItemId)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-institutional-blue">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desglose de Totales */}
        <div className="space-y-3 pt-4 border-t border-slate-200 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal productos</span>
            <span className="font-semibold">${totals.subtotal.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>
              {customer.deliveryMethod === 'pickup_community'
                ? 'Retiro en Comunidad Kasaychi'
                : 'Costo de Envío'}
            </span>
            <span className="font-semibold">
              {totals.shipping === 0
                ? 'GRATIS ($0.00)'
                : `$${totals.shipping.toFixed(2)} USD`}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold text-institutional-blue pt-3 border-t border-slate-200">
            <span>Total a Transferir</span>
            <span className="text-2xl text-ancestral-gold">
              ${totals.total.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Botón de Confirmar Pedido */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 bg-ancestral-gold text-white py-4 px-6 font-bold uppercase text-xs tracking-[0.2em] hover:bg-institutional-blue disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            'Registrando Pedido y Comprobante...'
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Confirmar Pedido y Enviar Comprobante
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-500 font-serif mt-4 text-center leading-relaxed">
          Al confirmar, tu orden quedará registrada con estado{' '}
          <strong>Pendiente de Verificación</strong> para ser validada por la administración de la Comunidad Kasaychi.
        </p>
      </aside>
    </form>
  );
}

