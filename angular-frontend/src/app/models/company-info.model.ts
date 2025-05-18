export interface Integrante {
    nombre: string;
    apellido: string;
}

export interface Valor {
  _id?: string;
  titulo: string;
  descripcion: string;
  icono?: string; // e.g., 'fas fa-cogs', o una URL de imagen pequeña
}

export interface CompanyInfo {
    _id?: string;
    mision?: string;
    vision?: string;
    integrantes?: Integrante[];

    // Nuevos campos para la sección "Nosotros"
    historiaTitulo?: string;
    historiaTexto?: string;
    historiaImagenUrl?: string;
    valores?: Valor[];
}