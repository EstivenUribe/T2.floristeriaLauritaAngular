import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, retry, tap, map, shareReplay, finalize } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/productos';
  private productsCache = new BehaviorSubject<Product[]>([]);
  private productCache = new Map<string, Product>();
  private loadingProducts = new BehaviorSubject<boolean>(false);
  private loadingProduct = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  // Observable público para el estado de carga
  get isLoading(): Observable<boolean> {
    return this.loadingProducts.asObservable();
  }

  get isLoadingProducts(): Observable<boolean> {
    return this.loadingProducts.asObservable();
  }

  get isLoadingProduct(): Observable<boolean> {
    return this.loadingProduct.asObservable();
  }

  // Obtener todos los productos con caché
  getProducts(): Observable<Product[]> {
    // Si ya tenemos productos en caché, devolverlos inmediatamente
    if (this.productsCache.value.length > 0) {
      return this.productsCache.asObservable();
    }

    this.loadingProducts.next(true);
    
    return this.http.get<Product[]>(this.apiUrl).pipe(
      retry(3), // Reintentar hasta 3 veces en caso de error
      tap(products => {
        this.productsCache.next(products);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingProducts.next(false)),
      shareReplay(1) // Compartir la respuesta con múltiples suscriptores
    );
  }

  // Obtener productos con filtros
  getFilteredProducts(filter: string, category?: string): Observable<Product[]> {
    // Primero obtenemos todos los productos
    return this.getProducts().pipe(
      map(products => {
        // Aplicar filtros
        return products.filter(product => {
          const matchesFilter = filter ? 
            product.nombre.toLowerCase().includes(filter.toLowerCase()) || 
            (product.descripcion && product.descripcion.toLowerCase().includes(filter.toLowerCase())) : 
            true;
          
          const matchesCategory = category ? 
            // Aquí deberías ajustar según cómo manejas las categorías en tu modelo
            product.nombre.toLowerCase().includes(category.toLowerCase()) : 
            true;
          
          return matchesFilter && matchesCategory;
        });
      })
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
      retry(2),
      tap(product => {
        this.productCache.set(id, product);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingProduct.next(false))
    );
  }

  // Crear un nuevo producto
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(newProduct => {
        // Actualizar caché
        const currentProducts = this.productsCache.value;
        this.productsCache.next([...currentProducts, newProduct]);
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar un producto
  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap(updatedProduct => {
        // Actualizar caché de productos
        const currentProducts = this.productsCache.value;
        const index = currentProducts.findIndex(p => p._id === id);
        if (index !== -1) {
          const updatedProducts = [...currentProducts];
          updatedProducts[index] = updatedProduct;
          this.productsCache.next(updatedProducts);
        }
        
        // Actualizar caché individual
        this.productCache.set(id, updatedProduct);
      }),
      catchError(this.handleError)
    );
  }

  // Eliminar un producto
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Actualizar caché de productos
        const currentProducts = this.productsCache.value;
        this.productsCache.next(currentProducts.filter(p => p._id !== id));
        
        // Eliminar de la caché individual
        this.productCache.delete(id);
      }),
      catchError(this.handleError)
    );
  }

  // Forzar actualización de la caché
  refreshProducts(): Observable<Product[]> {
    this.productsCache.next([]);
    return this.getProducts();
  }

  // Limpiar caché
  clearCache(): void {
    this.productsCache.next([]);
    this.productCache.clear();
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