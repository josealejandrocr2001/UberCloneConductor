// AI-assisted: see docs/AI_LOG.md #7
// Estados de un viaje (sección 3 del taller): el campo "status" controla qué pantalla se muestra
export const TRIP_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

export const TRIP_STATUS_LABELS = {
  requested: 'Solicitado',
  accepted: 'Aceptado',
  driver_arriving: 'Yendo a recoger',
  in_progress: 'En curso',
  completed: 'Finalizado (pendiente de pago)',
  paid: 'Pagado',
  cancelled: 'Cancelado',
  rejected: 'Rechazado',
};

export const PAYMENT_METHODS = {
  MERCADOPAGO: 'mercadopago',
  CASH: 'cash',
};

export const PAYMENT_METHOD_LABELS = {
  mercadopago: 'Mercado Pago',
  stripe: 'Stripe',
  cash: 'Efectivo',
};

export const PAYMENT_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
  CASH: 'cash',
};

export const PAYMENT_STATUS_LABELS = {
  approved: { text: 'Aprobado', color: '#2E7D32' },
  pending: { text: 'Pendiente', color: '#E65100' },
  rejected: { text: 'Rechazado', color: '#D32F2F' },
  cash: { text: 'Efectivo', color: '#1565C0' },
};

export const CATEGORY_LABELS = { economy: 'Económico', xl: 'XL', premium: 'Premium' };

// Tiempo para aceptar una solicitud (segundos)
export const REQUEST_TIMEOUT_SECONDS = 15;
