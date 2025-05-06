import { Component, OnInit, AfterViewInit, ViewEncapsulation, PLATFORM_ID, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }
  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      register();
    }
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts()
      .subscribe({
        next: (data) => {
          // Filtrar productos destacados o mostrar todos si no hay destacados
          this.products = data.filter(product => product.rebaja) || data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar productos para el carrusel.';
          this.loading = false;
          console.error('Error al cargar productos para carrusel:', err);
        }
      });
  }
  
  // Método para formatear precio con moneda
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
  }
}