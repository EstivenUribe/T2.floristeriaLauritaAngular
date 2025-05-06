export interface Integrante {
    nombre: string;
    apellido: string;
}

export interface CompanyInfo {
    _id?: string;
    mision?: string;
    vision?: string;
    integrantes?: Integrante[];
}