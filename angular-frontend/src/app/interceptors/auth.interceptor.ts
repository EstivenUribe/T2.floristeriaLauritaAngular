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
  if (request.url.includes('/api/auth/login') || 
      request.url.includes('/api/auth/register') ||
      request.url.includes('/api/auth/refresh')) {
    return next(request);
  }
  
  // Obtener token de autenticación
  const token = authService.getToken();
  
  // Si no hay token, continuar sin modificar la petición
  if (!token) {
    return next(request);
  }

  // Clonar la petición para agregar los headers
  let authReq = request.clone();
  
  try {
    // Verificar si es el token de administrador especial
    if (token === 'admin_token') {
      // Para el token de admin, usarlo directamente sin 'Bearer'
      authReq = request.clone({
        setHeaders: {
          'Authorization': 'admin_token',
          'X-Admin-Request': 'true',
          'X-XSRF-TOKEN': 'csrf-token-value'
        },
        withCredentials: true
      });
      console.log('Auth Interceptor: Usando token de administrador');
    } else {
      // Para tokens JWT, agregar el prefijo 'Bearer' si no lo tiene
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      authReq = request.clone({
        setHeaders: {
          'Authorization': authToken,
          'X-XSRF-TOKEN': 'csrf-token-value'
        },
        withCredentials: true
      });
    }
    
    console.log('Headers de autenticación configurados para:', request.url);
  } catch (error) {
    console.error('Error al configurar headers de autenticación:', error);
    // Continuar con la petición sin modificar en caso de error
    return next(request);
  }
  
  // Continuar con la petición y manejar errores de token
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error en la petición:', error);
      
      // Manejar errores 401 (No autorizado)
      if (error.status === 401) {
        // No redirigir si es una petición de autenticación
        if (!request.url.includes('/api/auth/')) {
          console.warn('Sesión expirada o no autorizada');
          authService.logout();
          router.navigate(['/login'], { 
            queryParams: { 
              returnUrl: router.url, 
              expired: true 
            },
            replaceUrl: true
          });
        }
      }
      
      // Reenviar el error para que otros interceptores lo manejen
      return throwError(() => error);
    })
  );
};