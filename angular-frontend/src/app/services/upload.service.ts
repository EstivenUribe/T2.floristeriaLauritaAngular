import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UploadFolder = 'products' | 'team' | 'banners' | 'companyInfo';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = '/api/uploads';

  constructor(private http: HttpClient) { }

  /**
   * Subir una imagen a una carpeta específica
   * @param image Archivo de imagen a subir
   * @param folder Carpeta de destino (products, team, banners)
   * @returns Observable con la respuesta del servidor
   */
  uploadImage(image: File, folder: UploadFolder = 'products'): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('folder', folder);
    
    return this.http.post<any>(this.apiUrl, formData);
  }
}