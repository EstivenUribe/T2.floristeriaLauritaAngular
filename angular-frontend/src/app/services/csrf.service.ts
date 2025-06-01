import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private apiUrl = '/api/csrf';
  private csrfToken: string | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene un token CSRF del servidor
   * El servidor lo establecerá automáticamente como cookie
   */
  getToken(): Observable<{ csrfToken: string }> {
    // Si ya tenemos un token en memoria, no necesitamos pedirlo de nuevo
    if (this.csrfToken) {
      return of({ csrfToken: this.csrfToken });
    }

    return this.http.get<{ csrfToken: string }>(`${this.apiUrl}/token`, { withCredentials: true })
      .pipe(
        tap(response => {
          this.csrfToken = response.csrfToken;
          console.log('Token CSRF obtenido correctamente');
        }),
        catchError(error => {
          console.error('Error al obtener token CSRF:', error);
          return of({ csrfToken: '' });
        })
      );
  }

  /**
   * Verifica si hay un token CSRF en las cookies
   */
  hasCsrfCookie(): boolean {
    return !!this.getCsrfCookie();
  }

  /**
   * Obtiene el token CSRF de las cookies
   */
  getCsrfCookie(): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrfToken=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }
}
