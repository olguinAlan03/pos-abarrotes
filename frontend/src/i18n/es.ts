export const es = {
  app: {
    name: 'POS Abarrotes',
    tagline: 'Sistema de Gestión',
  },

  nav: {
    pos: 'Punto de Venta',
    products: 'Productos',
    sales: 'Ventas',
    logout: 'Cerrar sesión',
    roles: {
      admin: 'Administrador',
      cashier: 'Cajero',
    },
  },

  login: {
    title: 'POS Abarrotes',
    subtitle: 'Inicia sesión para continuar',
    username: 'Usuario',
    password: 'Contraseña',
    submit: 'Iniciar sesión',
    submitting: 'Iniciando sesión...',
    error: 'Usuario o contraseña incorrectos',
    validation: {
      usernameRequired: 'El usuario es obligatorio',
      passwordMin: 'La contraseña debe tener al menos 6 caracteres',
    },
  },

  pos: {
    barcodePlaceholder: 'Escanear código de barras o escribir código...',
    notFound: (code: string) => `Producto no encontrado: "${code}"`,
    saleSuccess: (total: string) => `¡Venta completada! Total: ${total}`,
    checkoutError: 'Error al procesar el cobro',
    emptyCart: {
      heading: 'Carrito vacío',
      hint: 'Escanea un producto para comenzar la venta',
    },
    table: {
      product: 'Producto',
      qty: 'Cant.',
      price: 'Precio',
      subtotal: 'Subtotal',
    },
    checkout: {
      title: 'Cobro',
      paymentMethod: 'Método de pago',
      items: 'Artículos',
      total: 'Total',
      confirm: 'Cobrar',
      confirming: 'Procesando...',
      clear: 'Limpiar carrito',
    },
    paymentMethods: {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      CREDIT: 'Crédito (Fiado)',
    },
  },

  products: {
    title: 'Productos',
    newButton: 'Nuevo producto',
    searchPlaceholder: 'Buscar productos...',
    allCategories: 'Todas las categorías',
    loading: 'Cargando...',
    noResults: 'No se encontraron productos',
    table: {
      name: 'Nombre',
      barcode: 'Código',
      category: 'Categoría',
      price: 'Precio',
      cost: 'Costo',
    },
    editButton: 'Editar',
    form: {
      titleCreate: 'Nuevo producto',
      titleEdit: 'Editar producto',
      name: 'Nombre',
      barcode: 'Código de barras',
      barcodePlaceholder: 'Escanear o escribir código',
      price: 'Precio (centavos)',
      cost: 'Costo (centavos)',
      stock: 'Existencias',
      category: 'Categoría',
      categoryPlaceholder: 'Seleccionar categoría',
      cancel: 'Cancelar',
      save: 'Guardar',
      saving: 'Guardando...',
      validation: {
        nameRequired: 'El nombre es obligatorio',
        barcodeRequired: 'El código de barras es obligatorio',
        pricePositive: 'El precio debe ser mayor a cero',
        costNonNegative: 'El costo no puede ser negativo',
        stockNonNegative: 'Las existencias no pueden ser negativas',
        categoryRequired: 'Selecciona una categoría',
      },
    },
  },

  sales: {
    title: 'Historial de Ventas',
    loading: 'Cargando...',
    noResults: 'Aún no hay ventas registradas',
    table: {
      id: 'ID Venta',
      date: 'Fecha',
      payment: 'Pago',
      total: 'Total',
    },
    paymentLabels: {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      CREDIT: 'Crédito',
    },
  },
} as const
