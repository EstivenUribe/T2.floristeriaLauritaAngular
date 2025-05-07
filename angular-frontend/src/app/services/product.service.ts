import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, retry, tap, map, shareReplay, finalize } from 'rxjs/operators';
import { Product, ProductFilter, PaginationParams, PaginatedResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/productos';
  private productsCache = new Map<string, PaginatedResponse<Product>>();
  private productCache = new Map<string, Product>();
  private loadingProducts = new BehaviorSubject<boolean>(false);
  private loadingProduct = new BehaviorSubject<boolean>(false);
  private featuredProductsCache = new BehaviorSubject<Product[]>([]);
  private categoriesCache = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient) { }

  // Estado de carga
  get isLoading(): Observable<boolean> {
    return this.loadingProducts.asObservable();
  }

  get isLoadingProducts(): Observable<boolean> {
    return this.loadingProducts.asObservable();
  }

  get isLoadingProduct(): Observable<boolean> {
    return this.loadingProduct.asObservable();
  }

  // Obtener productos paginados y filtrados
  getProducts(params: PaginationParams): Observable<PaginatedResponse<Product>> {
    this.loadingProducts.next(true);
    
    // Construir clave de caché
    const cacheKey = this.getCacheKey(params);
    
    // Si ya tenemos estos productos en caché, devolverlos inmediatamente
    if (this.productsCache.has(cacheKey)) {
      this.loadingProducts.next(false);
      return of(this.productsCache.get(cacheKey)!);
    }
    
    // Preparar parámetros HTTP
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());
    
    // Añadir filtros si existen
    if (params.filter) {
      const filter = params.filter;
      
      if (filter.search) {
        httpParams = httpParams.set('search', filter.search);
      }
      
      if (filter.categoria) {
        httpParams = httpParams.set('categoria', filter.categoria);
      }
      
      if (filter.minPrice !== undefined) {
        httpParams = httpParams.set('minPrice', filter.minPrice.toString());
      }
      
      if (filter.maxPrice !== undefined) {
        httpParams = httpParams.set('maxPrice', filter.maxPrice.toString());
      }
      
      if (filter.destacado !== undefined) {
        httpParams = httpParams.set('destacado', filter.destacado.toString());
      }
      
      if (filter.rebaja !== undefined) {
        httpParams = httpParams.set('rebaja', filter.rebaja.toString());
      }
      
      if (filter.disponible !== undefined) {
        httpParams = httpParams.set('disponible', filter.disponible.toString());
      }
      
      if (filter.tags && filter.tags.length > 0) {
        filter.tags.forEach((tag, index) => {
          httpParams = httpParams.set(`tags[${index}]`, tag);
        });
      }
      
      if (filter.sortBy) {
        httpParams = httpParams.set('sortBy', filter.sortBy);
        if (filter.sortDirection) {
          httpParams = httpParams.set('sortDirection', filter.sortDirection);
        }
      }
    }
    
    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params: httpParams }).pipe(
      retry(1),
      tap(response => {
        // Actualizar caché
        this.productsCache.set(cacheKey, response);
        
        // Guardar productos individuales en caché
        response.items.forEach(product => {
          if (product._id) {
            this.productCache.set(product._id, product);
          }
        });
      }),
      catchError(this.handleError),
      finalize(() => this.loadingProducts.next(false)),
      shareReplay(1)
    );
  }

  // Obtener productos destacados
  getFeaturedProducts(limit: number = 6): Observable<Product[]> {
    // Si ya tenemos productos destacados en caché, devolverlos inmediatamente
    if (this.featuredProductsCache.value.length > 0) {
      return this.featuredProductsCache.asObservable();
    }

    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('destacado', 'true');
    
    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}`, { params }).pipe(
      map(response => response.items),
      tap(products => {
        this.featuredProductsCache.next(products);
        
        // Guardar productos individuales en caché
        products.forEach(product => {
          if (product._id) {
            this.productCache.set(product._id, product);
          }
        });
      }),
      catchError(this.handleError)
    );
  }

  // Obtener un producto por ID con caché
  getProductById(id: string): Observable<Product> {
    // Si ya tenemos el producto en caché, devolverlo inmediatamente
    if (this.productCache.has(id)) {
      return of(this.productCache.get(id)!);
    }

    this.loadingProduct.next(true);
    
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      tap(product => {
        this.productCache.set(id, product);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingProduct.next(false))
    );
  }

  // Obtener categorías disponibles
  getCategories(): Observable<string[]> {
    // Si ya tenemos categorías en caché, devolverlas inmediatamente
    if (this.categoriesCache.value.length > 0) {
      return this.categoriesCache.asObservable();
    }
    
    return this.http.get<string[]>(`${this.apiUrl}/categorias`).pipe(
      tap(categories => {
        this.categoriesCache.next(categories);
      }),
      catchError(this.handleError)
    );
  }

  // Crear un nuevo producto
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(newProduct => {
        // Actualizar caché individual
        if (newProduct._id) {
          this.productCache.set(newProduct._id, newProduct);
        }
        
        // Invalidar caché de productos para forzar recarga
        this.productsCache.clear();
        
        // Invalidar caché de productos destacados si el nuevo producto es destacado
        if (newProduct.destacado) {
          this.featuredProductsCache.next([]);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar un producto
  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap(updatedProduct => {
        // Actualizar caché individual
        this.productCache.set(id, updatedProduct);
        
        // Invalidar caché de productos para forzar recarga
        this.productsCache.clear();
        
        // Invalidar caché de productos destacados si se cambió esta propiedad
        if (updatedProduct.destacado !== undefined) {
          this.featuredProductsCache.next([]);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Eliminar un producto
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Eliminar de la caché individual
        this.productCache.delete(id);
        
        // Invalidar caché de productos para forzar recarga
        this.productsCache.clear();
        
        // Invalidar caché de productos destacados
        this.featuredProductsCache.next([]);
      }),
      catchError(this.handleError)
    );
  }

  // Obtener productos esenciales (versión ligera)
  getLightProducts(limit: number = 20): Observable<Product[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('fields', 'nombre,imagen,precio,rebaja');
    
    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/light`, { params }).pipe(
      map(response => response.items),
      catchError(this.handleError)
    );
  }

  // Forzar actualización de toda la caché
  refreshCache(): void {
    this.productsCache.clear();
    this.productCache.clear();
    this.featuredProductsCache.next([]);
    this.categoriesCache.next([]);
  }

  // Generar clave para caché basada en parámetros
  private getCacheKey(params: PaginationParams): string {
    let key = `page_${params.page}_limit_${params.limit}`;
    
    if (params.filter) {
      const filter = params.filter;
      
      if (filter.search) key += `_search_${filter.search}`;
      if (filter.categoria) key += `_cat_${filter.categoria}`;
      if (filter.minPrice !== undefined) key += `_min_${filter.minPrice}`;
      if (filter.maxPrice !== undefined) key += `_max_${filter.maxPrice}`;
      if (filter.destacado !== undefined) key += `_dest_${filter.destacado}`;
      if (filter.rebaja !== undefined) key += `_reb_${filter.rebaja}`;
      if (filter.disponible !== undefined) key += `_disp_${filter.disponible}`;
      if (filter.sortBy) key += `_sort_${filter.sortBy}_${filter.sortDirection || 'asc'}`;
      if (filter.tags && filter.tags.length > 0) key += `_tags_${filter.tags.join('_')}`;
    }
    
    return key;
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
          errorMessage = 'No se encontró el recurso solicitado';
          break;
        case 403:
          errorMessage = 'No tiene permiso para realizar esta acción';
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