import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export type UploadFolder = 'products' | 'team' | 'banners';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = '/api/uploads';

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Subir una imagen a una carpeta específica
   * @param image Archivo de imagen a subir
   * @param folder Carpeta de destino (products, team, banners)
   * @returns Observable con la respuesta del servidor
   */
  uploadImage(formData: FormData): Observable<any> {
    console.log('Iniciando solicitud de carga de imagen...');
    
    // El AuthInterceptor se encargará de agregar los headers de autenticación necesarios
    // Incluyendo el token de administrador si es necesario
    
    // No es necesario agregar manualmente los headers de autenticación aquí
    // ya que el interceptor se encargará de eso
    
    // Realizar la petición
    return this.http.post<any>(this.apiUrl, formData, { 
      withCredentials: true // Importante para mantener la sesión y CSRF
    }).pipe(
      catchError((error) => {
        console.error('Error en la petición de carga:', error);
        // Dejar que el interceptor maneje los errores de autenticación
        return throwError(() => error);
      })
    );
  }
}