import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = '';
  
  // Variables para el modal de detalles
  selectedProduct: Product | null = null;
  showModal = false;
  quantity = 1;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts()
      .subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar productos. Por favor, intenta de nuevo más tarde.';
          this.loading = false;
          console.error('Error al cargar productos:', err);
        }
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
      // En una implementación real, aquí se manejaría la lógica para añadir al carrito
      console.log('Añadido al carrito:', {
        product: this.selectedProduct,
        quantity: this.quantity
      });
      
      // Mostrar un mensaje de confirmación
      alert(`${this.selectedProduct.nombre} añadido al carrito.`);
      
      // Cerrar el modal
      this.closeModal();
    }
  }
}