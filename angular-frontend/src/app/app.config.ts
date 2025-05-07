import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // Add animations provider
    provideHttpClient(
      withInterceptors([
        // Order matters for interceptors
        loadingInterceptor,  // First to track all requests
        authInterceptor,     // Second to add authentication
        httpErrorInterceptor // Last to handle any errors
      ])
    )
  ]
};
