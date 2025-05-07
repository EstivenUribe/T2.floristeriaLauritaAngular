export interface VariationOption {
    valor: string;
    selected?: boolean;
}

export interface Variation {
    nombre: string;
    opciones: VariationOption[];
}

export interface Product {
    _id?: string;
    nombre: string;
    descripcion?: string;
    imagen?: string;
    precio: number;
    rebaja: boolean;
    descuento?: number;
    categoria?: string;
    tags?: string[];
    disponible?: boolean;
    destacado?: boolean;
    fechaCreacion?: Date;
    variaciones?: Variation[];
}

export interface ProductFilter {
    search?: string;
    categoria?: string;
    minPrice?: number;
    maxPrice?: number;
    destacado?: boolean;
    rebaja?: boolean;
    disponible?: boolean;
    tags?: string[];
    sortBy?: 'nombre' | 'precio' | 'fechaCreacion';
    sortDirection?: 'asc' | 'desc';
}

export interface PaginationParams {
    page: number;
    limit: number;
    filter?: ProductFilter;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}