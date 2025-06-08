import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product, PaginatedResponse, PaginationParams, ProductFilter } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Datos de productos y paginación
  products: Product[] = [];
  productsResponse: PaginatedResponse<Product> | null = null;
  loading = true;
  error = '';
  
  // Parámetros de paginación y filtros
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;
  
  // Filtros
  filter: ProductFilter = {};
  categorias: string[] = [];
  
  // Variables para el modal de detalles
  selectedProduct: Product | null = null;
  showModal = false;
  quantity = 1;
  
  // Control de suscripciones
  private subscriptions = new Subscription();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Cargar categorías para filtros
    this.loadCategorias();
    
    // Observar cambios en los parámetros de la URL
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        // Obtener parámetros de paginación
        this.currentPage = parseInt(params['page']) || 1;
        this.pageSize = parseInt(params['limit']) || 12;
        
        // Obtener parámetros de filtro
        this.filter = {
          search: params['search'] || '',
          categoria: params['categoria'] || '',
          minPrice: params['minPrice'] ? parseFloat(params['minPrice']) : undefined,
          maxPrice: params['maxPrice'] ? parseFloat(params['maxPrice']) : undefined,
          destacado: params['destacado'] === 'true' ? true : undefined,
          rebaja: params['rebaja'] === 'true' ? true : undefined,
          disponible: params['disponible'] === 'false' ? false : true,
          sortBy: params['sortBy'] as any || 'fechaCreacion',
          sortDirection: params['sortDirection'] as any || 'desc'
        };
        
        // Cargar productos con los parámetros actualizados
        this.loadProducts();
      })
    );
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones al destruir el componente
    this.subscriptions.unsubscribe();
  }

  // Cargar categorías para filtros
  loadCategorias(): void {
    this.subscriptions.add(
      this.productService.getCategories().subscribe({
        next: (categorias) => {
          this.categorias = categorias;
        },
        error: (err) => {
          console.error('Error al cargar categorías:', err);
        }
      })
    );
  }

  // Cargar productos con paginación y filtros
  loadProducts(): void {
    this.loading = true;
    
    const params: PaginationParams = {
      page: this.currentPage,
      limit: this.pageSize,
      filter: this.filter
    };
    
    this.subscriptions.add(
      this.productService.getProducts(params).subscribe({
        next: (response) => {
          this.productsResponse = response;
          this.products = response.items;
          this.totalItems = response.total;
          this.totalPages = response.totalPages;
        console.log('Productos cargados:', this.products); // Para depurar producto.imagen
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar productos. Por favor, intenta de nuevo más tarde.';
          this.loading = false;
          console.error('Error al cargar productos:', err);
        }
      })
    );
  }
  
  // Navegar a una página específica
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    this.updateQueryParams({ page });
  }
  
  // Cambiar tamaño de página
  changePageSize(newSize: number): void {
    if (newSize === this.pageSize) {
      return;
    }
    
    this.updateQueryParams({ limit: newSize, page: 1 });
  }
  
  // Aplicar filtros
  applyFilter(): void {
    // Restablecer a la primera página al aplicar filtros
    this.updateQueryParams({
      ...this.convertFilterToParams(),
      page: 1
    });
  }
  
  // Limpiar filtros
  clearFilters(): void {
    this.filter = {
      search: '',
      categoria: '',
      minPrice: undefined,
      maxPrice: undefined,
      destacado: undefined,
      rebaja: undefined,
      sortBy: 'fechaCreacion',
      sortDirection: 'desc',
      disponible: true
    };
    
    // Reiniciar todos los parámetros de URL
    this.router.navigate(['/productos'], {
      queryParams: {
        page: 1,
        limit: this.pageSize,
        sortBy: 'fechaCreacion',
        sortDirection: 'desc',
        disponible: true
      }
    });
  }
  
  // Convertir filtro a parámetros de consulta
  private convertFilterToParams(): Record<string, string> {
    const params: Record<string, string> = {};
    
    if (this.filter.search) params['search'] = this.filter.search;
    
    // Si la categoría es 'todas', no incluimos el parámetro para mostrar todos los productos
    // en lugar de filtrar por 'todas'
    if (this.filter.categoria && this.filter.categoria !== 'todas') {
      params['categoria'] = this.filter.categoria;
    }
    
    if (this.filter.minPrice !== undefined) params['minPrice'] = this.filter.minPrice.toString();
    if (this.filter.maxPrice !== undefined) params['maxPrice'] = this.filter.maxPrice.toString();
    if (this.filter.destacado !== undefined) params['destacado'] = this.filter.destacado.toString();
    if (this.filter.rebaja !== undefined) params['rebaja'] = this.filter.rebaja.toString();
    if (this.filter.disponible !== undefined) params['disponible'] = this.filter.disponible.toString();
    if (this.filter.sortBy) params['sortBy'] = this.filter.sortBy;
    if (this.filter.sortDirection) params['sortDirection'] = this.filter.sortDirection;
    
    // If tags exist, add them as comma-separated
    if (this.filter.tags && this.filter.tags.length > 0) {
      params['tags'] = this.filter.tags.join(',');
    }
    
    return params;
  }
  
  // Actualizar parámetros de URL
  private updateQueryParams(params: Record<string, any>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }
  
  // Método para mostrar los detalles del producto en un modal
  showProductDetails(product: Product): void {
    this.selectedProduct = product;
    this.showModal = true;
    this.quantity = 1;
    
    // Bloquear el scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }
  
  // Método para cerrar el modal
  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
    
    // Restaurar el scroll del body
    document.body.style.overflow = '';
  }
  
  // Cerrar modal si se hace clic en el overlay
  closeModalOnOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('product-modal-overlay')) {
      this.closeModal();
    }
  }
  
  // Métodos para controlar la cantidad
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  incrementQuantity(): void {
    this.quantity++;
  }
  
  // Método para añadir al carrito
  addToCart(): void {
    if (this.selectedProduct) {
      // Create cart item from product
      const cartItem = {
        productId: this.selectedProduct._id as string,
        name: this.selectedProduct.nombre, // This matches the CartItem interface
        image: this.selectedProduct.imagen,
        price: this.getPrecioFinal(this.selectedProduct),
        quantity: this.quantity,
        selectedVariations: {} // Empty object for variations if applicable
      };
      
      this.cartService.addToCart(cartItem);
      
      this.notificationService.success(
        `${this.selectedProduct?.nombre} añadido al carrito.`,
        'Producto agregado'
      );
      this.closeModal();
    }
  }
  
  // Método para calcular el precio con descuento
  getPrecioFinal(product: Product): number {
    if (product.rebaja && product.descuento) {
      return product.precio * (1 - (product.descuento / 100));
    }
    return product.precio;
  }
  
  // Comprobar si hay páginas disponibles
  hasPagination(): boolean {
    return !this.loading && this.totalPages > 1;
  }
  
  // Obtener rango de páginas a mostrar
  getPageRange(): number[] {
    const range: number[] = [];
    const maxPagesToShow = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let end = Math.min(this.totalPages, start + maxPagesToShow - 1);
    
    // Ajustar el inicio si estamos cerca del final
    if (end === this.totalPages) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  }
  
  // Método para manejar imágenes no encontradas
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/products/placeholder.jpg';
    // Log para registro de errores de imagen
    console.warn('Error cargando imagen:', imgElement.alt);
  }
}