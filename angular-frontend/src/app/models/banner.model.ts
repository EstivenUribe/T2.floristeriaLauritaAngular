/**
 * Modelo para banners promocionales y de secciones
 */
export interface Banner {
  _id?: string;
  titulo: string;
  subtitulo?: string;
  imagen: string;
  url?: string;
  seccion: BannerSection;
  fechaInicio?: Date;
  fechaFin?: Date;
  orden?: number;
  activo?: boolean;
  color?: {
    textoPrincipal?: string;
    textoSecundario?: string;
    boton?: string;
    overlay?: string;
  };
  animacion?: 'none' | 'fade' | 'slide' | 'zoom';
  textoBoton?: string;
  posicionTexto?: 'left' | 'center' | 'right';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tipos de secciones para los banners
 */
export type BannerSection = 'inicio' | 'productos' | 'ofertas' | 'ocasiones' | 'nosotros' | 'contacto';

/**
 * Interfaz para reordenar banners
 */
export interface BannerReorder {
  id: string;
  orden: number;
}