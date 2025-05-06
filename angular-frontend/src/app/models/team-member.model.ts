/**
 * Modelo para los miembros del equipo de la empresa
 */
export interface TeamMember {
  _id?: string;
  nombre: string;
  apellido: string;
  cargo: string;
  foto: string;
  biografia: string;
  orden?: number;
  activo?: boolean;
  redesSociales?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  nombreCompleto?: string; // Propiedad virtual que viene del backend
}

/**
 * Interfaz para reordenar miembros del equipo
 */
export interface TeamMemberReorder {
  id: string;
  orden: number;
}