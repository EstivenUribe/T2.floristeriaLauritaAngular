import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip token for authentication requests
  if (request.url.includes('/api/auth/login') || request.url.includes('/api/auth/register')) {
    return next(request);
  }
  
  // Obtener token de autenticación
  const token = authService.getToken();
  
  // Si hay token, añadirlo a los headers de la petición
  if (token) {
    // Clonar la petición para no modificar la original
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        // Add CSRF protection header
        'X-XSRF-TOKEN': 'csrf-token-value'
      }
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