export interface Integrante {
    nombre: string;
    apellido: string;
}

<<<<<<< Updated upstream
=======
export interface Valor {
  _id?: string;
  titulo: string;
  descripcion: string;
  icono?: string; // e.g., 'fas fa-cogs', o una URL de imagen pequeña
}

export interface TerminoSeccion {
    _id?: string;
    titulo: string;
    contenido: string;
    orden: number;
}

>>>>>>> Stashed changes
export interface CompanyInfo {
    _id?: string;
    mision?: string;
    vision?: string;
    integrantes?: Integrante[];
<<<<<<< Updated upstream
=======

    // Nuevos campos para la sección "Nosotros"
    historiaTitulo?: string;
    historiaTexto?: string;
    historiaImagenUrl?: string;
    valores?: Valor[];
    
    // Campos para términos y condiciones
    terminosTitulo?: string;
    terminosIntroduccion?: string;
    terminosSecciones?: TerminoSeccion[];
    terminosActualizacion?: Date;
>>>>>>> Stashed changes
}