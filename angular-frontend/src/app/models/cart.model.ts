export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  selectedVariations?: { [key: string]: string }; // nombre de variación: valor seleccionado
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface PaymentInfo {
  method: string;
  details?: {
    cardNumber?: string;
    cardName?: string;
    expiryDate?: string;
    cvv?: string;
  };
}

export interface Order {
  items: CartItem[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
  subtotal: number;
  shippingCost: number;
  total: number;
  status?: string;
  createdAt?: Date;
  orderId?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}