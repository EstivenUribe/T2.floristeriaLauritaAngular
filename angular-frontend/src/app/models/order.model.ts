export interface Order {
  _id: string;
  userId: string;
  orderNumber: number;
  date: string;
  products: OrderProduct[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  shippingPrice?: number;
}

export interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export enum OrderStatus {
  PENDING = 'Pendiente',
  PROCESSING = 'En proceso',
  SHIPPED = 'Enviado',
  DELIVERED = 'Entregado',
  CANCELLED = 'Cancelado'
}
