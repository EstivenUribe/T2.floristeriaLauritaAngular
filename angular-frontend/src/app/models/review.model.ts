// Información básica del usuario para mostrar en un review
export interface UserReviewInfo {
  _id: string;
  nombre?: string; // Asumiendo que el usuario tiene un campo 'nombre'
  // email?: string; // Si también lo necesitas
}

// Información básica del producto para mostrar en un review
export interface ProductReviewInfo {
  _id: string;
  nombre?: string; // Asumiendo que el producto tiene un campo 'nombre'
  // imagen?: string; // Si también lo necesitas
}

export interface Review {
  _id?: string;
  user: UserReviewInfo | string; 
  product: ProductReviewInfo | string; 
  rating: number;
  comment: string;
  approved?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
