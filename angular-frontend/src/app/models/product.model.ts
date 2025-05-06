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
    variaciones?: Variation[];
}