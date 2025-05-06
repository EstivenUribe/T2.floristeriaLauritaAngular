import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, retry, tap, shareReplay, finalize } from 'rxjs/operators';
import { CompanyInfo } from '../models/company-info.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyInfoService {
  private apiUrl = '/api/company-info';
  
  // Caché para la información de la empresa
  private companyInfoCache = new BehaviorSubject<CompanyInfo | null>(null);
  private lastFetchTime: number = 0;
  private cacheDuration = 30 * 60 * 1000; // 30 minutos en milisegundos
  private loadingInfo = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  // Observable para el estado de carga
  get isLoading(): Observable<boolean> {
    return this.loadingInfo.asObservable();
  }

  // Obtener información de la empresa con caché
  getCompanyInfo(): Observable<CompanyInfo> {
    const currentTime = Date.now();
    
    // Si tenemos datos en caché y no han expirado, devolver la caché
    if (this.companyInfoCache.value && currentTime - this.lastFetchTime < this.cacheDuration) {
      return this.companyInfoCache.asObservable() as Observable<CompanyInfo>;
    }
    
    this.loadingInfo.next(true);
    
    return this.http.get<CompanyInfo>(this.apiUrl).pipe(
      retry(3), // Reintentar hasta 3 veces si hay errores
      tap(info => {
        this.companyInfoCache.next(info);
        this.lastFetchTime = Date.now();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingInfo.next(false)),
      shareReplay(1) // Compartir resultado entre múltiples suscriptores
    );
  }

  // Actualizar información de la empresa
  updateCompanyInfo(companyInfo: CompanyInfo): Observable<CompanyInfo> {
    this.loadingInfo.next(true);
    
    return this.http.put<CompanyInfo>(this.apiUrl, companyInfo).pipe(
      tap(updatedInfo => {
        // Actualizar caché
        this.companyInfoCache.next(updatedInfo);
        this.lastFetchTime = Date.now();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingInfo.next(false))
    );
  }

  // Forzar actualización de caché
  refreshCompanyInfo(): Observable<CompanyInfo> {
    this.companyInfoCache.next(null);
    this.lastFetchTime = 0;
    return this.getCompanyInfo();
  }

  // Manejador de errores centralizado
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del backend
      switch(error.status) {
        case 404:
          errorMessage = 'No se encontró la información de la empresa';
          break;
        case 403:
          errorMessage = 'No tiene permiso para acceder a esta información';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}