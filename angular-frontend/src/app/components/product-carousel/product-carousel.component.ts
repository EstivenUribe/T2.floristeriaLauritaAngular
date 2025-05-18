import { Component, OnInit, AfterViewInit, ViewEncapsulation, PLATFORM_ID, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product, PaginationParams } from '../../models/product.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

// Swiper
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.css'],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Añadido para permitir elementos web personalizados
})
export class ProductCarouselComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  loading = true;
  error = '';
  
  // Configuración de Swiper
  swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: true,
    pagination: { clickable: true },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 20
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 30
      }
    }
  };
  
  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Subscribirse al estado de carga
    this.productService.isLoadingProducts.subscribe(isLoading => {
      this.loading = isLoading;
    });
    
    this.loadProducts();
  }
  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      register();
    }
  }

  loadProducts(): void {
    // Using the new paginated API with filter for discounted products
    const params: PaginationParams = {
      page: 1,
      limit: 8, // Limit to show in carousel
      filter: {
        rebaja: true,
        sortBy: 'fechaCreacion',
        sortDirection: 'desc'
      }
    };
    
    this.productService.getProducts(params).subscribe({
      next: (response) => {
        // Get items from paginated response
        this.products = response.items;
        
        // Si no hay productos destacados, mostrar un mensaje
        if (this.products.length === 0) {
          this.notificationService.info('No hay productos en oferta en este momento.');
        }
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar productos para el carrusel.';
        this.notificationService.error(this.error);
      }
    });
  }
  
  // Método para formatear precio con moneda
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
  }
  
  // Método para refrescar productos
  refreshProducts(): void {
    // Force refresh cache then reload
    this.productService.refreshCache();
    
    // Reload products with same parameters
    const params: PaginationParams = {
      page: 1,
      limit: 8,
      filter: {
        rebaja: true,
        sortBy: 'fechaCreacion', 
        sortDirection: 'desc'
      }
    };
    
    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.items;
        this.notificationService.success('Productos actualizados correctamente');
      },
      error: (err) => {
        this.error = err.message || 'Error al actualizar los productos.';
        this.notificationService.error(this.error);
      }
    });
  }
}