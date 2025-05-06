import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap, map, shareReplay, finalize } from 'rxjs/operators';
import { Banner, BannerSection, BannerReorder } from '../models/banner.model';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = '/api/banners';
  
  // Caché y estado
  private bannersCache = new BehaviorSubject<Banner[]>([]);
  private sectionBannersCache = new Map<BannerSection, Banner[]>();
  private bannerCache = new Map<string, Banner>();
  private loadingBanners = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }
  
  // Observable para el estado de carga
  get isLoading(): Observable<boolean> {
    return this.loadingBanners.asObservable();
  }
  
  /**
   * Obtener todos los banners
   * @param onlyActive Si es true, devuelve solo banners activos
   * @param current Si es true, devuelve solo banners vigentes (fechas)
   */
  getAllBanners(onlyActive: boolean = false, current: boolean = false): Observable<Banner[]> {
    // Si ya tenemos banners en caché, aplicar filtros y devolverlos
    if (this.bannersCache.value.length > 0) {
      let filteredBanners = this.bannersCache.value;
      
      if (onlyActive) {
        filteredBanners = filteredBanners.filter(banner => banner.activo);
        
        if (current) {
          const now = new Date();
          filteredBanners = filteredBanners.filter(banner => {
            const startDate = banner.fechaInicio ? new Date(banner.fechaInicio) : null;
            const endDate = banner.fechaFin ? new Date(banner.fechaFin) : null;
            
            return (!startDate || startDate <= now) && 
                   (!endDate || endDate > now);
          });
        }
      }
      
      return of(filteredBanners);
    }
    
    // Si no hay caché, obtener de la API
    this.loadingBanners.next(true);
    
    let params = new HttpParams();
    if (onlyActive) {
      params = params.set('active', 'true');
      if (current) {
        params = params.set('current', 'true');
      }
    }
    
    return this.http.get<{ success: boolean; data: Banner[] }>(this.apiUrl, { params }).pipe(
      retry(2),
      map(response => response.data),
      tap(banners => {
        // Actualizar caché principal
        this.bannersCache.next(banners);
        
        // Actualizar cachés por sección
        const sectionMap = new Map<BannerSection, Banner[]>();
        banners.forEach(banner => {
          // Cache individual
          this.bannerCache.set(banner._id!, banner);
          
          // Cache por sección
          const sectionBanners = sectionMap.get(banner.seccion) || [];
          sectionBanners.push(banner);
          sectionMap.set(banner.seccion, sectionBanners);
        });
        
        // Actualizar el caché por secciones
        this.sectionBannersCache = sectionMap;
      }),
      catchError(this.handleError),
      finalize(() => this.loadingBanners.next(false)),
      shareReplay(1)
    );
  }
  
  /**
   * Obtener banners por sección
   * @param section Sección a consultar
   * @param useCache Si es false, ignora la caché y consulta la API
   */
  getBannersBySection(section: BannerSection, useCache: boolean = true): Observable<Banner[]> {
    // Verificar caché por sección si está habilitado el uso de caché
    if (useCache && this.sectionBannersCache.has(section)) {
      return of(this.sectionBannersCache.get(section)!);
    }
    
    this.loadingBanners.next(true);
    
    return this.http.get<{ success: boolean; data: Banner[] }>(`${this.apiUrl}/section/${section}`).pipe(
      retry(1),
      map(response => response.data),
      tap(banners => {
        // Actualizar caché por sección
        this.sectionBannersCache.set(section, banners);
        
        // Actualizar cache individual
        banners.forEach(banner => {
          this.bannerCache.set(banner._id!, banner);
        });
        
        // Actualizar caché general si está vacía
        if (this.bannersCache.value.length === 0) {
          this.getAllBanners().subscribe();
        }
      }),
      catchError(this.handleError),
      finalize(() => this.loadingBanners.next(false))
    );
  }
  
  /**
   * Obtener un banner por ID
   * @param id ID del banner
   */
  getBannerById(id: string): Observable<Banner> {
    // Verificar caché individual
    if (this.bannerCache.has(id)) {
      return of(this.bannerCache.get(id)!);
    }
    
    // Verificar caché general
    const cachedBanners = this.bannersCache.value;
    if (cachedBanners.length > 0) {
      const banner = cachedBanners.find(b => b._id === id);
      if (banner) {
        this.bannerCache.set(id, banner);
        return of(banner);
      }
    }
    
    // Si no está en caché, consultar API
    this.loadingBanners.next(true);
    
    return this.http.get<{ success: boolean; data: Banner }>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      map(response => response.data),
      tap(banner => {
        this.bannerCache.set(id, banner);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingBanners.next(false))
    );
  }
  
  /**
   * Crear un nuevo banner
   * @param bannerData Datos del banner
   * @param imagen Archivo de imagen
   */
  createBanner(bannerData: Banner, imagen?: File): Observable<Banner> {
    this.loadingBanners.next(true);
    
    const formData = new FormData();
    
    // Añadir campos al formData
    Object.keys(bannerData).forEach(key => {
      if (key === 'color' && bannerData.color) {
        // Manejar objeto anidado
        Object.keys(bannerData.color).forEach(colorKey => {
          const value = bannerData.color![colorKey as keyof typeof bannerData.color];
          if (value) {
            formData.append(`color[${colorKey}]`, value);
          }
        });
      } else if (key === 'fechaInicio' || key === 'fechaFin') {
        // Convertir fechas a formato ISO
        const date = bannerData[key as keyof Banner] as Date;
        if (date) {
          formData.append(key, date instanceof Date ? date.toISOString() : date);
        }
      } else {
        // Para el resto de campos
        const value = bannerData[key as keyof Banner];
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Añadir imagen si existe
    if (imagen) {
      formData.append('imagen', imagen, imagen.name);
    }
    
    return this.http.post<{ success: boolean; data: Banner }>(this.apiUrl, formData).pipe(
      map(response => response.data),
      tap(newBanner => {
        // Actualizar cachés
        const currentBanners = this.bannersCache.value;
        this.bannersCache.next([...currentBanners, newBanner]);
        this.bannerCache.set(newBanner._id!, newBanner);
        
        // Actualizar caché por sección
        const sectionBanners = this.sectionBannersCache.get(newBanner.seccion) || [];
        this.sectionBannersCache.set(newBanner.seccion, [...sectionBanners, newBanner]);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingBanners.next(false))
    );
  }
  
  /**
   * Actualizar un banner existente
   * @param id ID del banner
   * @param bannerData Datos a actualizar
   * @param imagen Nuevo archivo de imagen (opcional)
   */
  updateBanner(id: string, bannerData: Partial<Banner>, imagen?: File): Observable<Banner> {
    this.loadingBanners.next(true);
    
    const formData = new FormData();
    
    // Añadir campos al formData
    Object.keys(bannerData).forEach(key => {
      if (key === 'color' && bannerData.color) {
        // Manejar objeto anidado
        Object.keys(bannerData.color).forEach(colorKey => {
          const value = bannerData.color![colorKey as keyof typeof bannerData.color];
          if (value !== undefined) {
            formData.append(`color[${colorKey}]`, value || '');
          }
        });
      } else if (key === 'fechaInicio' || key === 'fechaFin') {
        // Convertir fechas a formato ISO
        const date = bannerData[key as keyof Banner] as Date;
        if (date) {
          formData.append(key, date instanceof Date ? date.toISOString() : date);
        }
      } else {
        // Para el resto de campos
        const value = bannerData[key as keyof Banner];
        if (value !== undefined) {
          formData.append(key, value === null ? '' : value.toString());
        }
      }
    });
    
    // Añadir imagen si existe
    if (imagen) {
      formData.append('imagen', imagen, imagen.name);
    }
    
    return this.http.put<{ success: boolean; data: Banner }>(`${this.apiUrl}/${id}`, formData).pipe(
      map(response => response.data),
      tap(updatedBanner => {
        // Actualizar cachés
        this.updateCaches(id, updatedBanner);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingBanners.next(false))
    );
  }
  
  /**
   * Cambiar estado activo/inactivo de un banner
   * @param id ID del banner
   */
  toggleBannerStatus(id: string): Observable<Banner> {
    this.loadingBanners.next(true);
    
    return this.http.patch<{ success: boolean; data: Banner }>(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
      map(response => response.data),
      tap(updatedBanner => {
        // Actualizar cachés
        this.updateCaches(id, updatedBanner);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingBanners.next(false))
    );
  }
  
  /**
   * Eliminar un banner
   * @param id ID del banner a eliminar
   */
  deleteBanner(id: string): Observable<any> {
    this.loadingBanners.next(true);
    
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Obtener información del banner antes de eliminarlo de los cachés
        const banner = this.bannerCache.get(id);
        
        // Eliminar de cachés
        const currentBanners = this.bannersCache.value;
        this.bannersCache.next(currentBanners.filter(b => b._id !== id));
        this.bannerCache.delete(id);
        
        // Eliminar de caché por sección si conocemos la sección
        if (banner) {
          const sectionBanners = this.sectionBannersCache.get(banner.seccion) || [];
          this.sectionBannersCache.set(
            banner.seccion, 
            sectionBanners.filter(b => b._id !== id)
          );
        }
      }),
      catchError(this.handleError),
      finalize(() => this.loadingBanners.next(false))
    );
  }
  
  /**
   * Reordenar banners
   * @param banners Array de objetos {id, orden}
   */
  reorderBanners(banners: BannerReorder[]): Observable<any> {
    this.loadingBanners.next(true);
    
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/reorder`, { banners }).pipe(
      tap(() => {
        // Actualizar orden en los cachés
        const currentBanners = [...this.bannersCache.value];
        
        banners.forEach(item => {
          // Actualizar en caché principal
          const banner = currentBanners.find(b => b._id === item.id);
          if (banner) {
            banner.orden = item.orden;
          }
          
          // Actualizar en caché individual
          if (this.bannerCache.has(item.id)) {
            const cachedBanner = this.bannerCache.get(item.id)!;
            cachedBanner.orden = item.orden;
            this.bannerCache.set(item.id, cachedBanner);
          }
          
          // La actualización en caché por sección es más compleja, por lo que
          // optamos por refrescar ese caché cuando se solicite nuevamente
        });
        
        // Ordenar la caché principal por orden
        currentBanners.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        this.bannersCache.next(currentBanners);
        
        // Limpiar caché por sección para forzar recarga cuando se solicite
        this.sectionBannersCache.clear();
      }),
      catchError(this.handleError),
      finalize(() => this.loadingBanners.next(false))
    );
  }
  
  /**
   * Actualizar todas las cachés con un banner actualizado
   */
  private updateCaches(id: string, updatedBanner: Banner): void {
    // Actualizar caché individual
    this.bannerCache.set(id, updatedBanner);
    
    // Actualizar caché principal
    const currentBanners = this.bannersCache.value;
    const index = currentBanners.findIndex(b => b._id === id);
    
    if (index !== -1) {
      const updatedBanners = [...currentBanners];
      
      // Si cambió la sección, hay que manejar las dos secciones
      const oldBanner = updatedBanners[index];
      const sectionChanged = oldBanner.seccion !== updatedBanner.seccion;
      
      updatedBanners[index] = updatedBanner;
      this.bannersCache.next(updatedBanners);
      
      // Actualizar caché por sección
      if (sectionChanged) {
        // Eliminar de la sección anterior
        const oldSectionBanners = this.sectionBannersCache.get(oldBanner.seccion) || [];
        this.sectionBannersCache.set(
          oldBanner.seccion,
          oldSectionBanners.filter(b => b._id !== id)
        );
        
        // Añadir a la nueva sección
        const newSectionBanners = this.sectionBannersCache.get(updatedBanner.seccion) || [];
        this.sectionBannersCache.set(
          updatedBanner.seccion,
          [...newSectionBanners, updatedBanner]
        );
      } else {
        // Actualizar en la misma sección
        const sectionBanners = this.sectionBannersCache.get(updatedBanner.seccion) || [];
        const sectionIndex = sectionBanners.findIndex(b => b._id === id);
        
        if (sectionIndex !== -1) {
          const updatedSectionBanners = [...sectionBanners];
          updatedSectionBanners[sectionIndex] = updatedBanner;
          this.sectionBannersCache.set(updatedBanner.seccion, updatedSectionBanners);
        }
      }
    }
  }
  
  /**
   * Forzar recarga de datos desde la API
   */
  refreshBanners(): Observable<Banner[]> {
    // Limpiar todas las cachés
    this.bannersCache.next([]);
    this.bannerCache.clear();
    this.sectionBannersCache.clear();
    
    // Obtener datos frescos
    return this.getAllBanners();
  }
  
  /**
   * Manejador centralizado de errores
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del backend
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 404:
            errorMessage = 'Banner no encontrado';
            break;
          case 403:
            errorMessage = 'No tiene permiso para realizar esta acción';
            break;
          case 400:
            errorMessage = 'Datos inválidos. Por favor verifique la información.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.statusText || 'Desconocido'}`;
        }
      }
    }
    
    console.error('Error en BannerService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}