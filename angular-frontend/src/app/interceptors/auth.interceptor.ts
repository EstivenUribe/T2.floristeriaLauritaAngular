import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CsrfService } from '../services/csrf.service';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { Router } from '@angular/router';

// Función auxiliar para obtener cookies por nombre
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const csrfService = inject(CsrfService);
  const router = inject(Router);
  
  // Skip token for authentication requests and CSRF token requests
  if (request.url.includes('/api/auth/login') || 
      request.url.includes('/api/auth/register') ||
      request.url.includes('/api/csrf/token')) {
    return next(request);
  }
  
  // Obtener token de autenticación
  const token = authService.getToken();
  
  // Si hay token, añadirlo a los headers de la petición
  if (token) {
    // Preparar los headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    };
    
    // Obtener el token CSRF de las cookies
    const csrfToken = csrfService.getCsrfCookie();
    
    // Añadir el token CSRF si existe
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    } else if (!request.url.includes('/api/auth') && request.method !== 'GET') {
      // Solo mostrar advertencia para operaciones de escritura no relacionadas con autenticación
      console.warn('CSRF token no encontrado en cookies. Algunas operaciones pueden fallar.');
      
      // Intentar obtener un nuevo token CSRF si es necesario para operaciones de escritura
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        return csrfService.getToken().pipe(
          switchMap(() => {
            // Intentar de nuevo con el nuevo token
            const newCsrfToken = csrfService.getCsrfCookie();
            if (newCsrfToken) {
              headers['X-CSRF-Token'] = newCsrfToken;
            }
            request = request.clone({
              withCredentials: true,
              setHeaders: headers
            });
            return next(request);
          })
        );
      }
    }
    
    // Clonar la petición con los headers actualizados
    request = request.clone({
      withCredentials: true, // Importante para enviar cookies en solicitudes cross-origin
      setHeaders: headers
    });
  }
  
  // Continuar con la petición y manejar errores de token
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors (token expired)
      if (error.status === 401 && !request.url.includes('/api/auth/refresh')) {
        // Implement token refresh logic here when your backend supports it
        // For now, just logout and redirect to login
        authService.logout();
        router.navigate(['/login'], { 
          queryParams: { returnUrl: router.url, expired: true }
        });
      }
      
      return throwError(() => error);
    })
  );
};