import { Injectable } from '@angular/core';
import { CanActivateFn, Router, CanMatchFn, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

// Guard para rutas que requieren autenticación
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      // Redirigir a login si no está autenticado
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    })
  );
};

// Guard para rutas que requieren rol de administrador
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAdmin$.pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) {
        return true;
      }
      // Redirigir a inicio si no es admin
      return router.createUrlTree(['/']);
    })
  );
};

// Guard para rutas que solo deben ser accesibles si NO está autenticado
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }
      // Redirigir a inicio si ya está autenticado
      return router.createUrlTree(['/']);
    })
  );
};