/**
 * ============================================================================
 * CAPA DE DATOS MOCK TEMPORAL (PRE-INTEGRACIÓN CON SUPABASE)
 * ============================================================================
 * IMPORTANTE:
 * Este archivo actúa como la fuente de datos temporal (Mock) mientras se
 * desarrolla el frontend del catálogo, carrito y checkout.
 *
 * En la siguiente fase de escalabilidad (integración con Supabase):
 * 1. Estos datos se migrarán a las tablas `products` y `product_variants` en PostgreSQL.
 * 2. El servicio `src/services/productService.ts` reemplazará la lectura de este
 *    array por consultas con `@supabase/supabase-js` (`supabase.from('products').select(...)`).
 * 3. El futuro panel `/admin` permitirá editar stock, precios y productos en vivo.
 * ============================================================================
 */

import type { Product, ProductCategory, BankAccountInfo } from '../types/store';

export const PRODUCT_CATEGORIES: {
  id: 'all' | ProductCategory;
  label: string;
  description: string;
}[] = [
  {
    id: 'all',
    label: 'Todos los Productos',
    description: 'Catálogo completo de la Comunidad Kasaychi - Inti Churi',
  },
  {
    id: 'quesos',
    label: 'Quesos Artesanales',
    description: 'Elaborados a mano con leche fresca de pastoreo andino y más de 70 años de tradición',
  },
  {
    id: 'lacteos',
    label: 'Derivados Lácteos',
    description: 'Yogurt natural y leche fresca de altura sin conservantes ni aditivos artificiales',
  },
  {
    id: 'agricultura',
    label: 'Agricultura Andina',
    description: 'Cosechas agroecológicas cultivadas entre los 3.000 y 3.400 m.s.n.m.',
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-queso-premium',
    slug: 'queso-inti-churi-premium',
    name: 'Queso Inti Churi Premium',
    subtitle: 'Receta Insignia de la Comunidad Kasaychi',
    category: 'quesos',
    shortDescription:
      'Nuestro queso insignia de pasta semidura, elaborado con leche 100% fresca del ordeño matutino y maduración controlada en clima frío andino.',
    description:
      'El Queso Inti Churi Premium representa más de 70 años de herencia quesera en los páramos de Guaranda. Elaborado diariamente con leche entera de vacas alimentadas en pastizales naturales a más de 3.200 metros de altitud, ofrece una textura firme pero cremosa al paladar, con notas lácteas profundas y un equilibrio de sal perfecto. Ideal para tablas de quesos, maridajes, sánduches gourmet o degustación directa.',
    price: 4.5,
    variants: [
      {
        id: 'var-premium-500g',
        label: 'Media Libra / 500 g',
        weightGrams: 500,
        price: 4.5,
        stock: 25,
        sku: 'KAS-QPR-500',
      },
      {
        id: 'var-premium-1kg',
        label: '1 Kilogramo',
        weightGrams: 1000,
        price: 8.5,
        stock: 18,
        sku: 'KAS-QPR-1000',
      },
      {
        id: 'var-premium-rueda',
        label: 'Rueda Familiar (2.2 Kg)',
        weightGrams: 2200,
        price: 17.5,
        stock: 8,
        sku: 'KAS-QPR-2200',
      },
    ],
    images: [
      '/images/queso_premium_v2.png',
      '/images/inti_churi_premium.png',
      '/images/queso_tradicion.jpg',
    ],
    badges: ['Más Vendido', 'Receta Ancestral', '100% Natural'],
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewsCount: 127,
    specs: {
      weight: '500 g / 1 Kg / 2.2 Kg',
      origin: 'Sector Kasaichi, Km 19 Vía Riobamba - Guaranda',
      altitude: '3.200 m.s.n.m.',
      conservation: 'Refrigeración entre 4°C y 8°C (Empacado al vacío)',
      maturation: '21 días en cava comunitaria de altura',
      ingredients: [
        'Leche entera pasteurizada de libre pastoreo',
        'Cultivos lácticos seleccionados',
        'Cuajo natural',
        'Sal en grano andina',
      ],
    },
  },
  {
    id: 'prod-queso-mozzarella',
    slug: 'queso-mozzarella-artesanal',
    name: 'Mozzarella Artesanal Andino',
    subtitle: 'Hilado a mano de fundido perfecto',
    category: 'quesos',
    shortDescription:
      'Suave, elástico y sumamente cremoso. Perfecto para pizzas artesanales, lasañas, ensaladas frescas y gratinados.',
    description:
      'Nuestro queso Mozzarella Artesanal se elabora mediante la técnica tradicional de pasta hilada (*pasta filata*) utilizando leche recién ordeñada en la comunidad. Gracias a la riqueza grasa natural de los pastos de altura en Bolívar, logra un fundido uniforme, hilos largos y un sabor lácteo delicado sin exceso de grasa libre ni conservantes químicos.',
    price: 4.0,
    variants: [
      {
        id: 'var-mozz-500g',
        label: 'Bloque 500 g',
        weightGrams: 500,
        price: 4.0,
        stock: 30,
        sku: 'KAS-QMZ-500',
      },
      {
        id: 'var-mozz-1kg',
        label: 'Bloque 1 Kilogramo',
        weightGrams: 1000,
        price: 7.5,
        stock: 20,
        sku: 'KAS-QMZ-1000',
      },
      {
        id: 'var-mozz-2500g',
        label: 'Barra Gastronómica (2.5 Kg)',
        weightGrams: 2500,
        price: 17.9,
        stock: 10,
        sku: 'KAS-QMZ-2500',
      },
    ],
    images: ['/images/queso_mozarella.png', '/images/QUESO.jpg'],
    badges: ['Especial Pizzas', 'Pasta Hilada', 'Sin Conservantes'],
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewsCount: 94,
    specs: {
      weight: '500 g / 1 Kg / 2.5 Kg',
      origin: 'Comunidad Kasaychi, Guaranda - Bolívar',
      altitude: '3.100 - 3.400 m.s.n.m.',
      conservation: 'Refrigeración entre 2°C y 6°C',
      maturation: 'Fresco de pasta hilada (reposo 48 horas)',
      ingredients: [
        'Leche fresca entera de vaca',
        'Fermentos lácticos',
        'Cuajo natural',
        'Sal mineral',
      ],
    },
  },
  {
    id: 'prod-queso-oregano-aji',
    slug: 'queso-oregano-y-aji',
    name: 'Queso con Orégano & Ají',
    subtitle: 'Fusión aromática de hierbas y toque picante andino',
    category: 'quesos',
    shortDescription:
      'Una explosión de sabores que combina la cremosidad del queso artesanal con el aroma del orégano de huerta y el toque cálido del ají.',
    description:
      'Creado para quienes buscan carácter y personalidad en cada bocado. Incorporamos en la cuajada hojas de orégano deshidratado al sol y hojuelas seleccionadas de ají criollo ecuatoriano. El resultado es un queso aromático, con un picor suave y elegante que realza desayunos tradicionales con choclo o mote, picadas entre amigos y sánduches calientes.',
    price: 4.75,
    variants: [
      {
        id: 'var-oregano-500g',
        label: 'Molde 500 g',
        weightGrams: 500,
        price: 4.75,
        stock: 22,
        sku: 'KAS-QOA-500',
      },
      {
        id: 'var-oregano-1kg',
        label: 'Molde 1 Kilogramo',
        weightGrams: 1000,
        price: 9.0,
        stock: 14,
        sku: 'KAS-QOA-1000',
      },
    ],
    images: ['/images/queso_oregano.png', '/images/queso_tradicion.jpg'],
    badges: ['Especiado', 'Sabor Andino', 'Artesanal'],
    featured: true,
    inStock: true,
    rating: 4.8,
    reviewsCount: 68,
    specs: {
      weight: '500 g / 1 Kg',
      origin: 'Comunidad Kasaychi, Guaranda - Bolívar',
      altitude: '3.200 m.s.n.m.',
      conservation: 'Refrigeración entre 4°C y 8°C',
      maturation: '10 a 15 días con infusión de especias',
      ingredients: [
        'Leche entera pasteurizada',
        'Orégano orgánico de altura',
        'Hojuelas de ají criollo seleccionado',
        'Cultivos lácticos y cuajo natural',
        'Sal',
      ],
    },
  },
  {
    id: 'prod-queso-curado',
    slug: 'queso-curado-especial',
    name: 'Queso Curado Especial',
    subtitle: 'Maduración prolongada y carácter intenso',
    category: 'quesos',
    shortDescription:
      'Queso de maduración prolongada con sabor profundo, corteza natural cepillada y textura firme. Ideal para paladares exigentes.',
    description:
      'El Queso Curado Especial de Inti Churi reposa durante más de 60 días bajo el clima frío y seco de los Andes de Bolívar. Durante su afinado manual, desarrolla aromas a mantequilla tostada, frutos secos y hierbas de páramo. Su pasta compacta y quebradiza lo convierte en la joya gastronómica de nuestra comunidad.',
    price: 6.0,
    variants: [
      {
        id: 'var-curado-500g',
        label: 'Cuña 500 g',
        weightGrams: 500,
        price: 6.0,
        stock: 15,
        sku: 'KAS-QCU-500',
      },
      {
        id: 'var-curado-1kg',
        label: 'Horma 1 Kilogramo',
        weightGrams: 1000,
        price: 11.5,
        stock: 9,
        sku: 'KAS-QCU-1000',
      },
    ],
    images: ['/images/queso_curado.png', '/images/queso_premium_v2.png'],
    badges: ['Maduración 60+ Días', 'Edición Gourmet', 'Calidad Certificada'],
    featured: true,
    inStock: true,
    rating: 5.0,
    reviewsCount: 81,
    specs: {
      weight: '500 g / 1 Kg',
      origin: 'Cava Comunitaria Kasaychi, Guaranda',
      altitude: '3.300 m.s.n.m.',
      conservation: 'Lugar fresco y seco o refrigeración entre 6°C y 10°C',
      maturation: '60 a 90 días de maduración controlada',
      ingredients: [
        'Leche entera cruda controlada de libre pastoreo',
        'Fermentos de afinado andino',
        'Cuajo natural',
        'Sal marina',
      ],
    },
  },
  {
    id: 'prod-queso-fresco-mesa',
    slug: 'queso-fresco-tradicional-kasaichi',
    name: 'Queso Fresco de Mesa Kasaichi',
    subtitle: 'El sabor diario de los hogares andinos',
    category: 'quesos',
    shortDescription:
      'Queso blanco tierno, húmedo y suave en sal. El acompañante tradicional para humitas, locro de papa, chocolate caliente y plátano maduro.',
    description:
      'Elaborado cada madrugada con la leche recién ordeñada de las seis comunidades de Kasaychi. Es un queso tierno, de coagulación suave y prensado artesanal en lienzo, que conserva todo el suero nutritivo y el dulzor natural de la leche fresca de montaña.',
    price: 3.25,
    variants: [
      {
        id: 'var-fresco-500g',
        label: 'Molde 500 g',
        weightGrams: 500,
        price: 3.25,
        stock: 40,
        sku: 'KAS-QFR-500',
      },
      {
        id: 'var-fresco-1kg',
        label: 'Molde Familiar 1 Kg',
        weightGrams: 1000,
        price: 6.0,
        stock: 28,
        sku: 'KAS-QFR-1000',
      },
    ],
    images: ['/images/QUESO.jpg', '/images/queseria.jpeg'],
    badges: ['Fresco del Día', 'Bajo en Sal', 'Tradición Familiar'],
    featured: false,
    inStock: true,
    rating: 4.8,
    reviewsCount: 112,
    specs: {
      weight: '500 g / 1 Kg',
      origin: 'Planta Comunitaria Inti Churi - Kasaychi',
      altitude: '3.200 m.s.n.m.',
      conservation: 'Mantener refrigerado entre 2°C y 5°C. Consumir en 10 días.',
      maturation: 'Queso fresco del día',
      ingredients: [
        'Leche fresca pasteurizada del día',
        'Cuajo enzimático natural',
        'Pizca de sal',
      ],
    },
  },
  {
    id: 'prod-yogurt-natural',
    slug: 'yogurt-natural-artesanal-andino',
    name: 'Yogurt Natural Artesanal Inti Churi',
    subtitle: 'Cremoso con probióticos vivos y fruta natural',
    category: 'lacteos',
    shortDescription:
      'Yogurt de textura espesa y cremosa elaborado con leche entera de altura y cultivos probióticos vivos, sin espesantes ni almidones.',
    description:
      'Nuestro yogurt comunitario fermenta lentamente a temperatura controlada utilizando leche pura de Kasaychi. A diferencia de los yogures industriales, su consistencia densa proviene exclusivamente de los sólidos naturales de la leche de páramo y sus cepas probióticas benéficas para la digestión.',
    price: 2.5,
    variants: [
      {
        id: 'var-yogurt-1l',
        label: 'Botella 1 Litro (Natural)',
        weightGrams: 1000,
        price: 2.5,
        stock: 35,
        sku: 'KAS-YOG-1000N',
      },
      {
        id: 'var-yogurt-mora-1l',
        label: 'Botella 1 Litro (Mora de Castilla)',
        weightGrams: 1000,
        price: 2.75,
        stock: 30,
        sku: 'KAS-YOG-1000M',
      },
      {
        id: 'var-yogurt-2l',
        label: 'Galón Familiar 2 Litros',
        weightGrams: 2000,
        price: 4.8,
        stock: 20,
        sku: 'KAS-YOG-2000',
      },
    ],
    images: ['/images/YOGURT.jpg', '/images/LECHE.jpg'],
    badges: ['Probiótico', 'Sin Almidones', '100% Leche Pura'],
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewsCount: 54,
    specs: {
      weight: '1 Litro / 2 Litros',
      origin: 'Comunidad Kasaychi, Guaranda',
      altitude: '3.200 m.s.n.m.',
      conservation: 'Cadena de frío continua entre 2°C y 6°C',
      ingredients: [
        'Leche entera fresca pasteurizada',
        'Cultivos lácticos probióticos (L. bulgaricus, S. thermophilus)',
        'Fruta natural andina (en versión frutada)',
      ],
    },
  },
  {
    id: 'prod-leche-pastoreo',
    slug: 'pack-lacteo-fresco-comunitario',
    name: 'Pack Lácteo Familiar de Pastoreo',
    subtitle: 'Selección directa de nuestra planta quesera',
    category: 'lacteos',
    shortDescription:
      'Combinación económica que incluye Queso Fresco de Mesa, Queso Mozzarella y Yogurt Natural elaborados en la semana.',
    description:
      'Pensado para el abastecimiento semanal de las familias que valoran alimentos limpios y el comercio justo directo con los productores indígenas de Kasaychi. Cada compra apoya directamente a las familias ganaderas de las 6 comunidades.',
    price: 9.5,
    variants: [
      {
        id: 'var-pack-familiar',
        label: 'Pack Familiar (2 Quesos 500g + 1L Yogurt)',
        weightGrams: 2000,
        price: 9.5,
        stock: 20,
        sku: 'KAS-PCK-FAM',
      },
      {
        id: 'var-pack-degustacion',
        label: 'Pack Degustación 4 Quesos (2 Kg total)',
        weightGrams: 2000,
        price: 16.5,
        stock: 12,
        sku: 'KAS-PCK-DEG',
      },
    ],
    images: ['/images/LECHE.jpg', '/images/queso_premium_v2.png'],
    badges: ['Ahorro Familiar', 'Comercio Justo', 'Directo del Productor'],
    featured: false,
    inStock: true,
    rating: 4.9,
    reviewsCount: 41,
    specs: {
      weight: '2.0 Kg netos',
      origin: 'Asociación Comunitaria Kasaychi - Inti Churi',
      altitude: '3.000 - 3.400 m.s.n.m.',
      conservation: 'Refrigeración entre 2°C y 6°C',
      ingredients: [
        'Queso Inti Churi Premium',
        'Queso Mozzarella Artesanal',
        'Queso Fresco de Mesa',
        'Yogurt Natural Andino',
      ],
    },
  },
  {
    id: 'prod-cosecha-andina',
    slug: 'canasta-agricola-andina-papa-granos',
    name: 'Canasta Agrícola de Altura (Papas y Granos)',
    subtitle: 'Cultivos ancestrales sin agroquímicos',
    category: 'agricultura',
    shortDescription:
      'Selección de papas nativas recién cosechadas y granos andinos cultivados en las chakras comunitarias de Kasaychi bajo prácticas sostenibles.',
    description:
      'La tierra fértil de los páramos de Gallo Rumi y Kasaychi produce tubérculos y granos con un valor nutricional superior. Cultivados mediante mingas familiares y rotación ancestral del suelo en respeto a la Pachamama, esta canasta lleva del campo a tu mesa papas chola/superchola de altura, habas tiernas y mellocos.',
    price: 6.5,
    variants: [
      {
        id: 'var-canasta-5kg',
        label: 'Canasta Hogar (5 Kg surtidos)',
        weightGrams: 5000,
        price: 6.5,
        stock: 25,
        sku: 'KAS-AGR-5K',
      },
      {
        id: 'var-canasta-12kg',
        label: 'Arroba de Papa Nativa Seleccionada (11.5 Kg)',
        weightGrams: 11500,
        price: 11.0,
        stock: 18,
        sku: 'KAS-AGR-ARR',
      },
    ],
    images: ['/images/cosecha.jpg', '/images/fondoLejano.jpg'],
    badges: ['Agroecológico', 'Cosecha de Altura', 'Minga Comunitaria'],
    featured: false,
    inStock: true,
    rating: 4.9,
    reviewsCount: 37,
    specs: {
      weight: '5 Kg / 11.5 Kg (1 Arroba)',
      origin: 'Chakras Comunitarias de Kasaychi, Guaranda',
      altitude: '3.300 m.s.n.m.',
      conservation: 'Lugar fresco, seco y ventilado protegido de la luz directa',
      ingredients: [
        'Papas nativas de altura seleccionadas',
        'Habas tiernas de páramo',
        'Mellocos y cebada andina (en Canasta Hogar)',
      ],
    },
  },
];

/**
 * MOCK TEMPORAL DE CUENTAS BANCARIAS PARA TRANSFERENCIA
 * En la integración con Supabase podrá configurarse desde la tabla `store_settings`.
 */
export const MOCK_BANK_ACCOUNTS: BankAccountInfo[] = [
  {
    id: 'bank-pichincha',
    bankName: 'Banco Pichincha',
    accountType: 'Cuenta de Ahorros',
    accountNumber: '2208491035',
    beneficiaryName: 'Comunidad Indígena Kasaychi - Inti Churi',
    beneficiaryId: '0290018472001',
    notificationEmail: 'pedidos@kasaychi.org',
  },
  {
    id: 'bank-coop-guaranda',
    bankName: 'Cooperativa Jardín Azuayo / Mushuc Runa',
    accountType: 'Cuenta de Ahorros',
    accountNumber: '40100928371',
    beneficiaryName: 'Asociación de Productores Inti Churi Kasaychi',
    beneficiaryId: '0290018472001',
    notificationEmail: 'pedidos@kasaychi.org',
  },
];

