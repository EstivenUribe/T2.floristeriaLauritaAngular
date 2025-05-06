import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export const httpErrorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(request).pipe(
    // Reintentar la petición hasta 2 veces en caso de algunos errores
    retry(2),
    
    // Capturar y manejar errores
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 400:
            errorMessage = getBadRequestMessage(error);
            break;
          case 401:
            errorMessage = 'No autorizado. Por favor inicie sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'Acceso denegado. No tiene permisos para esta acción.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 408:
            errorMessage = 'Tiempo de espera agotado. Por favor intente nuevamente.';
            break;
          case 500:
            errorMessage = 'Error del servidor. Por favor intente más tarde.';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. Por favor intente más tarde.';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.statusText || 'Desconocido'}`;
        }
      }
      
      // Aquí se podría implementar la lógica para mostrar notificaciones globales
      console.error('Error interceptado:', errorMessage, error);
      
      // Re-lanzar el error con un mensaje mejor
      return throwError(() => new Error(errorMessage));
    })
  );
};

// Obtener un mensaje más descriptivo para errores 400
function getBadRequestMessage(error: HttpErrorResponse): string {
  // Intentar obtener mensaje específico del error
  if (error.error && typeof error.error === 'object') {
    if (error.error.message) {
      return error.error.message;
    }
    
    // Extraer mensajes de validación si existen
    if (error.error.errors) {
      const errorMsgs = Object.values(error.error.errors);
      if (errorMsgs.length > 0) {
        return errorMsgs.join(', ');
      }
    }
  }
  
  return 'Solicitud inválida. Por favor revise los datos ingresados.';
}