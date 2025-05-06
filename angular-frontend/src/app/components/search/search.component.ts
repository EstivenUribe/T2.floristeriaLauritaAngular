import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductSkeletonComponent } from '../shared/product-skeleton/product-skeleton.component';
import { NotificationService } from '../../services/notification.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NavFooterComponent,
    ProductSkeletonComponent
  ],
  template: `
    <app-nav-footer></app-nav-footer>
    
    <div class="container mt-5 mb-5">
      <div class="row">
        <div class="col-12">
          <h1 class="text-center mb-4">Buscar Productos</h1>
          
          <div class="search-form mb-4">
            <div class="input-group">
              <input 
                type="text"
                [formControl]="searchControl"
                class="form-control"
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
              >
              <button 
                class="btn btn-primary" 
                type="button"
                (click)="search()"
              >
                <i class="fas fa-search"></i> Buscar
              </button>
            </div>
          </div>
          
          <!-- Filtros -->
          <div class="filters mb-4">
            <div class="row">
              <div class="col-md-4 mb-3">
                <select 
                  class="form-select" 
                  [formControl]="categoryControl"
                >
                  <option value="">Todas las categorías</option>
                  <option value="rosas">Rosas</option>
                  <option value="orquideas">Orquídeas</option>
                  <option value="girasoles">Girasoles</option>
                  <option value="arreglos">Arreglos</option>
                </select>
              </div>
              
              <div class="col-md-4 mb-3">
                <select 
                  class="form-select" 
                  [formControl]="sortControl"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="price_asc">Precio: Menor a Mayor</option>
                  <option value="price_desc">Precio: Mayor a Menor</option>
                  <option value="name_asc">Nombre: A-Z</option>
                  <option value="name_desc">Nombre: Z-A</option>
                </select>
              </div>
              
              <div class="col-md-4 mb-3">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="discountedOnly"
                    [formControl]="discountedControl"
                  >
                  <label class="form-check-label" for="discountedOnly">
                    Solo productos con descuento
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Resultados de búsqueda -->
          <div class="search-results">
            <div *ngIf="isLoading" class="row">
              <div class="col-md-3 mb-4" *ngFor="let i of skeletonArray">
                <app-product-skeleton></app-product-skeleton>
              </div>
            </div>
            
            <div *ngIf="!isLoading && products.length === 0" class="no-results text-center p-5">
              <i class="fas fa-search fa-3x mb-3 text-muted"></i>
              <h3>No se encontraron productos</h3>
              <p class="text-muted">Intenta con otros términos de búsqueda o filtros.</p>
            </div>
            
            <div *ngIf="!isLoading && products.length > 0" class="row">
              <div class="col-md-3 mb-4" *ngFor="let product of products">
                <div class="card product-card h-100">
                  <img 
                    [src]="product.imagen || 'assets/images/placeholder.jpg'" 
                    class="card-img-top" 
                    [alt]="product.nombre"
                  >
                  <div class="card-body d-flex flex-column">
                    <h5 class="card-title">{{ product.nombre }}</h5>
                    <p class="card-text flex-grow-1">{{ product.descripcion || 'Sin descripción' }}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                      <span class="price">{{ formatPrice(product.precio) }}</span>
                      <button 
                        class="btn btn-primary"
                        [routerLink]="['/producto', product._id]"
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      transition: transform 0.3s, box-shadow 0.3s;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .product-card img {
      height: 200px;
      object-fit: cover;
    }
    
    .price {
      font-weight: bold;
      font-size: 1.1rem;
      color: #28a745;
    }
    
    .no-results {
      background-color: #f8f9fa;
      border-radius: 8px;
    }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  sortControl = new FormControl('relevance');
  discountedControl = new FormControl(false);
  
  products: Product[] = [];
  isLoading = false;
  skeletonArray = new Array(8);
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }
  
  ngOnInit(): void {
    // Subscribirse al estado de carga
    this.productService.isLoadingProducts.subscribe(loading => {
      this.isLoading = loading;
    });
    
    // Obtener parámetros de la URL y aplicarlos a los controles
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const { query, category, sort, discounted } = params;
      
      if (query) this.searchControl.setValue(query);
      if (category) this.categoryControl.setValue(category);
      if (sort) this.sortControl.setValue(sort);
      if (discounted) this.discountedControl.setValue(discounted === 'true');
      
      // Si hay algún parámetro, realizar la búsqueda
      if (query || category || sort || discounted) {
        this.search();
      }
    });
    
    // Subscribirse a cambios en los filtros para actualizar la URL y resultados
    this.categoryControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300)
    ).subscribe(() => this.updateUrlAndSearch());
    
    this.sortControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateUrlAndSearch());
    
    this.discountedControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateUrlAndSearch());
    
    // Implementar búsqueda en tiempo real al escribir
    this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),  // Esperar 300ms después de la última pulsación
      distinctUntilChanged()  // Solo emitir si el valor es diferente
    ).subscribe(() => this.updateUrlAndSearch());
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  search(): void {
    const query = this.searchControl.value || '';
    const category = this.categoryControl.value || '';
    
    this.productService.getFilteredProducts(query, category).subscribe({
      next: (products) => {
        // Filtrar por descuento si está seleccionado
        if (this.discountedControl.value) {
          products = products.filter(p => p.rebaja);
        }
        
        // Ordenar productos según el criterio seleccionado
        this.sortProducts(products);
        
        this.products = products;
        
        if (products.length === 0 && (query || category)) {
          this.notificationService.info('No se encontraron productos que coincidan con tu búsqueda');
        }
      },
      error: (err) => {
        this.notificationService.error('Error al buscar productos: ' + err.message);
      }
    });
  }
  
  // Método para actualizar la URL y realizar búsqueda
  updateUrlAndSearch(): void {
    // Construir objeto de parámetros
    const queryParams: any = {};
    
    if (this.searchControl.value) queryParams.query = this.searchControl.value;
    if (this.categoryControl.value) queryParams.category = this.categoryControl.value;
    if (this.sortControl.value !== 'relevance') queryParams.sort = this.sortControl.value;
    if (this.discountedControl.value) queryParams.discounted = 'true';
    
    // Actualizar URL sin recargar la página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    
    // Realizar búsqueda
    this.search();
  }
  
  // Método para ordenar productos
  sortProducts(products: Product[]): void {
    const sortValue = this.sortControl.value;
    
    switch(sortValue) {
      case 'price_asc':
        products.sort((a, b) => a.precio - b.precio);
        break;
      case 'price_desc':
        products.sort((a, b) => b.precio - a.precio);
        break;
      case 'name_asc':
        products.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name_desc':
        products.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      // Para 'relevance' mantenemos el orden original
    }
  }
  
  // Método para formatear precio
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
  }
}