import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';

export const httpErrorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const notificationService = inject(NotificationService);
  
  // Skip some URLs from error handling (e.g. health checks)
  if (request.url.includes('/health') || request.url.includes('/ping')) {
    return next(request);
  }
  
  // Skip retry for some methods (non-idempotent)
  const skipRetry = request.method === 'POST' || 
                    request.method === 'PATCH' || 
                    request.method === 'PUT';
  
  // Set up the pipeline based on the request type
  let response$ = next(request);
  
  // Conditionally add retry for idempotent methods
  if (!skipRetry) {
    response$ = response$.pipe(
      retry({ count: 2, delay: 1000 })
    );
  }
  
  // Add error handling to the pipeline
  return response$.pipe(
    // Capture and handle errors
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';
      let errorTitle = 'Error';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
        errorTitle = 'Error de conexión';
      } else {
        // Server-side error
        switch (error.status) {
          case 0:
            errorTitle = 'Error de conexión';
            errorMessage = 'No se puede conectar con el servidor. Verifique su conexión a internet.';
            break;
          case 400:
            errorTitle = 'Solicitud inválida';
            errorMessage = getBadRequestMessage(error);
            break;
          case 401:
            errorTitle = 'No autorizado';
            errorMessage = 'Por favor inicie sesión nuevamente.';
            break;
          case 403:
            errorTitle = 'Acceso denegado';
            errorMessage = 'No tiene permisos para esta acción.';
            break;
          case 404:
            errorTitle = 'No encontrado';
            errorMessage = 'El recurso solicitado no existe.';
            break;
          case 408:
            errorTitle = 'Tiempo agotado';
            errorMessage = 'La solicitud tardó demasiado. Por favor intente nuevamente.';
            break;
          case 429:
            errorTitle = 'Demasiadas solicitudes';
            errorMessage = 'Has realizado demasiadas solicitudes. Por favor, espera antes de intentar nuevamente.';
            break;
          case 500:
            errorTitle = 'Error del servidor';
            errorMessage = 'Ocurrió un error en el servidor. Por favor intente más tarde.';
            break;
          case 502:
            errorTitle = 'Servicio no disponible';
            errorMessage = 'El servidor está temporalmente fuera de servicio. Por favor intente más tarde.';
            break;
          case 503:
            errorTitle = 'Servicio no disponible';
            errorMessage = 'El servicio no está disponible en este momento. Por favor intente más tarde.';
            break;
          case 504:
            errorTitle = 'Tiempo de espera agotado';
            errorMessage = 'El servidor tardó demasiado en responder. Por favor intente más tarde.';
            break;
          default:
            errorTitle = `Error ${error.status}`;
            errorMessage = error.statusText || 'Ha ocurrido un error desconocido';
        }
      }
      
      // Show notification only for non-auth and retry errors (don't show notification on retry attempts)
      const isAuthError = error.status === 401 && !request.url.includes('/api/auth');
      if (!isAuthError) {
        notificationService.error(errorMessage, errorTitle, {
          duration: 7000, // Show longer for errors
          autoClose: true
        });
      }
      
      // Log error to console
      console.error('Error interceptado:', errorTitle, errorMessage, error);
      
      // Rethrow the error with a better message
      return throwError(() => new Error(errorMessage));
    })
  );
};

// Get more descriptive message for 400 errors
function getBadRequestMessage(error: HttpErrorResponse): string {
  // Try to get specific error message
  if (error.error && typeof error.error === 'object') {
    if (error.error.message) {
      return error.error.message;
    }
    
    // Extract validation messages if they exist
    if (error.error.errors) {
      // Handle different error formats
      if (Array.isArray(error.error.errors)) {
        return error.error.errors.join(', ');
      } else if (typeof error.error.errors === 'object') {
        const errorMsgs = Object.values(error.error.errors);
        if (errorMsgs.length > 0) {
          return Array.isArray(errorMsgs[0]) 
            ? errorMsgs.flat().join(', ') 
            : errorMsgs.join(', ');
        }
      }
    }
    
    // Handle mongoose validation errors
    if (error.error.name === 'ValidationError' && error.error.message) {
      return error.error.message;
    }
  }
  
  return 'Los datos proporcionados no son válidos. Por favor revise la información ingresada.';
}