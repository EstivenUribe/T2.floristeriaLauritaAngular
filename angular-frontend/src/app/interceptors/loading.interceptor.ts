import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const loadingService = inject(LoadingService);
  
  // Skip loading indicator for some requests
  const skipLoading = request.headers.has('x-skip-loading') ||
                      request.url.includes('/api/health') ||
                      request.url.includes('/api/ping');
  
  if (skipLoading) {
    return next(request);
  }
  
  // Show loading indicator
  loadingService.startLoading();
  
  // Continue with the request and make sure to stop loading when finished
  return next(request).pipe(
    finalize(() => {
      loadingService.stopLoading();
    })
  );
};