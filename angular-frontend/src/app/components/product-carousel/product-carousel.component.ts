import { Component, OnInit, AfterViewInit, ViewEncapsulation, PLATFORM_ID, Inject, ElementRef, Renderer2 } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product, PaginationParams } from '../../models/product.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.css', './carousel-style.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProductCarouselComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  loading = true;
  error = '';
  
  // Arrays para los slides y captions
  slides: HTMLElement[] = [];
  captions: HTMLElement[] = [];
  
  // Intervalo para autoplay
  autoplayInterval: any;
  
  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private renderer: Renderer2,
    private el: ElementRef,
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
      // Inicializar el carrusel después de cargar la vista
      setTimeout(() => {
        if (this.products.length > 0) {
          this.setupCarousel();
        }
      }, 0);
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
        } else if (isPlatformBrowser(this.platformId)) {
          // Inicializar el carrusel después de cargar los productos
          setTimeout(() => {
            this.setupCarousel();
          }, 0);
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
  
  // Configurar el carrusel después de cargar los productos
  setupCarousel(): void {
    if (!this.products || this.products.length === 0) return;
    
    // Limpiar arrays existentes y elementos DOM
    this.slides = [];
    this.captions = [];
    const leftCol = this.el.nativeElement.querySelector('#left-col');
    const container = this.el.nativeElement.querySelector('#container');
    
    if (!leftCol || !container) return;
    
    // Limpiar contenido existente excepto la navegación
    const navElement = leftCol.querySelector('.nav');
    const existingSlides = leftCol.querySelectorAll('.slide');
    existingSlides.forEach((slide: Element) => {
      if (slide !== navElement) {
        leftCol.removeChild(slide);
      }
    });
    
    // Remover captions existentes
    const existingCaptions = container.querySelectorAll('.caption');
    existingCaptions.forEach((caption: Element) => {
      container.removeChild(caption);
    });
    
    // Crear slides y captions para cada producto
    for (let i = 0; i < this.products.length; i++) {
      const producto = this.products[i];
      
      // Crear slide
      const slide = this.renderer.createElement('div');
      this.renderer.addClass(slide, 'slide');
      this.renderer.setStyle(slide, 'background', `url(${producto.imagen || 'assets/images/placeholder.jpg'})`);
      
      // Crear caption
      const caption = this.renderer.createElement('div');
      this.renderer.addClass(caption, 'caption');
      
      // Crear caption heading
      const slideTitle = this.renderer.createElement('div');
      this.renderer.addClass(slideTitle, 'caption-heading');
      slideTitle.innerHTML = `<h1>${producto.nombre}</h1>`;
      
      // Establecer clases iniciales
      if (i === 0) {
        this.renderer.addClass(slide, 'current');
        this.renderer.addClass(caption, 'current-caption');
      } else if (i === 1) {
        this.renderer.addClass(slide, 'next');
        this.renderer.addClass(caption, 'next-caption');
      } else if (i === this.products.length - 1) {
        this.renderer.addClass(slide, 'previous');
        this.renderer.addClass(caption, 'previous-caption');
      }
      
      // Construir caption
      this.renderer.appendChild(caption, slideTitle);
      caption.insertAdjacentHTML('beforeend', `<div class="caption-subhead"><span>${this.formatPrice(producto.precio)}</span></div>`);
      
      // Crear botón con routerLink
      const btnElement = this.renderer.createElement('a');
      this.renderer.addClass(btnElement, 'btn');
      this.renderer.setProperty(btnElement, 'innerHTML', 'Ver detalles');
      this.renderer.setAttribute(btnElement, 'routerLink', `/product/${producto._id}`);
      this.renderer.appendChild(caption, btnElement);
      
      // Añadir a arrays
      this.slides.push(slide);
      this.captions.push(caption);
      
      // Añadir al DOM
      this.renderer.appendChild(leftCol, slide);
      this.renderer.appendChild(container, caption);
    }
    
    // Configurar el autoplay
    this.setupAutoplay();
  }
  
  // Configurar autoplay
  setupAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
    
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
  
  // Siguiente slide
  nextSlide(event?: Event): void {
    if (event) {
      event.preventDefault();
      clearInterval(this.autoplayInterval);
    }
    
    if (this.slides.length < 2) return;
    
    this.renderer.removeClass(this.slides[0], 'current');
    this.renderer.addClass(this.slides[0], 'previous');
    this.renderer.addClass(this.slides[0], 'change');
    
    this.renderer.removeClass(this.slides[1], 'next');
    this.renderer.addClass(this.slides[1], 'current');
    
    if (this.slides[2]) {
      this.renderer.addClass(this.slides[2], 'next');
    }
    
    const last = this.slides.length - 1;
    this.renderer.removeClass(this.slides[last], 'previous');
    
    // Actualizar captions
    this.renderer.removeClass(this.captions[0], 'current-caption');
    this.renderer.addClass(this.captions[0], 'previous-caption');
    this.renderer.addClass(this.captions[0], 'change');
    
    this.renderer.removeClass(this.captions[1], 'next-caption');
    this.renderer.addClass(this.captions[1], 'current-caption');
    
    if (this.captions[2]) {
      this.renderer.addClass(this.captions[2], 'next-caption');
    }
    
    const lastCaption = this.captions.length - 1;
    this.renderer.removeClass(this.captions[lastCaption], 'previous-caption');
    
    // Rotar arrays
    const placeholder = this.slides.shift();
    const captionPlaceholder = this.captions.shift();
    
    if (placeholder && captionPlaceholder) {
      this.slides.push(placeholder);
      this.captions.push(captionPlaceholder);
    }
  }
  
  // Slide anterior
  prevSlide(event?: Event): void {
    if (event) {
      event.preventDefault();
      clearInterval(this.autoplayInterval);
    }
    
    if (this.slides.length < 2) return;
    
    const last = this.slides.length - 1;
    
    this.renderer.addClass(this.slides[last], 'next');
    this.renderer.removeClass(this.slides[0], 'current');
    this.renderer.addClass(this.slides[0], 'next');
    this.renderer.removeClass(this.slides[1], 'next');
    this.renderer.removeClass(this.slides[last], 'previous');
    
    if (this.slides[last - 1]) {
      this.renderer.removeClass(this.slides[last - 1], 'previous');
    }
    
    this.renderer.addClass(this.slides[last], 'current');
    
    // Actualizar captions
    const lastCaption = this.captions.length - 1;
    
    this.renderer.addClass(this.captions[lastCaption], 'next-caption');
    this.renderer.removeClass(this.captions[0], 'current-caption');
    this.renderer.addClass(this.captions[0], 'next-caption');
    this.renderer.removeClass(this.captions[1], 'next-caption');
    this.renderer.removeClass(this.captions[lastCaption], 'previous-caption');
    
    if (this.captions[lastCaption - 1]) {
      this.renderer.removeClass(this.captions[lastCaption - 1], 'previous-caption');
    }
    
    this.renderer.addClass(this.captions[lastCaption], 'current-caption');
    
    // Rotar arrays
    const placeholder = this.slides.pop();
    const captionPlaceholder = this.captions.pop();
    
    if (placeholder && captionPlaceholder) {
      this.slides.unshift(placeholder);
      this.captions.unshift(captionPlaceholder);
    }
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
        // Reinicializar el carrusel con los nuevos productos
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.setupCarousel();
          }, 0);
        }
      },
      error: (err) => {
        this.error = err.message || 'Error al actualizar los productos.';
        this.notificationService.error(this.error);
      }
    });
  }
}