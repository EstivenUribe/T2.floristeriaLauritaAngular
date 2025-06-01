import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component'; // No utilizado en el template
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem, PaymentMethod, ShippingInfo } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
    // NavFooterComponent // No utilizado en el template
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  currentStep = 1; // 1: Carrito, 2: Envío, 3: Pago, 4: Confirmación
  subtotal = 0;
  shippingCost = 0;
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod = '';
  isLoading = false;
  isProcessingOrder = false;
  error = '';
  isAuthenticated = false;
  // Hacer Math accesible en la plantilla
  Math = Math;
  
  // Para usar Date en la plantilla
  currentDate = new Date();
  
  shippingForm: ShippingInfo = {
    fullName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    notes: ''
  };
  
  paymentForm = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  };
  
  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    // Suscribirse a los cambios en el carrito
    this.cartService.items.subscribe(items => {
      this.cartItems = items;
      this.updateTotals();
    });
    
    // Cargar información de envío si existe
    this.cartService.shipping.subscribe(info => {
      if (info) {
        this.shippingForm = info;
      }
    });
    
    // Obtener métodos de pago disponibles
    this.paymentMethods = this.cartService.getPaymentMethods();
    
    // Obtener costo de envío
    this.shippingCost = this.cartService.getShippingCost();
    
    // Suscribirse a estado de carga de la orden
    this.cartService.isProcessingOrder.subscribe(isProcessing => {
      this.isProcessingOrder = isProcessing;
    });
  }
  
  updateTotals() {
    this.subtotal = this.cartService.getSubtotal();
  }
  
  getTotal() {
    return this.cartService.getTotal();
  }
  
  updateQuantity(index: number, isIncrement: boolean) {
    const item = this.cartItems[index];
    const newQuantity = isIncrement ? item.quantity + 1 : item.quantity - 1;
    
    if (newQuantity > 0) {
      this.cartService.updateQuantity(index, newQuantity);
    }
  }
  
  removeItem(index: number) {
    this.cartService.removeItem(index);
  }
  
  nextStep() {
    if (this.currentStep === 2) {
      // Guardar información de envío
      this.cartService.saveShippingInfo(this.shippingForm);
    }
    
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }
  
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  setPaymentMethod(methodId: string) {
    this.selectedPaymentMethod = methodId;
  }
  
  validateShippingForm(): boolean {
    // Validación básica
    return (
      !!this.shippingForm.fullName &&
      !!this.shippingForm.address &&
      !!this.shippingForm.city &&
      !!this.shippingForm.phone &&
      !!this.shippingForm.email
    );
  }
  
  validatePaymentForm(): boolean {
    if (this.selectedPaymentMethod === 'credit_card' || this.selectedPaymentMethod === 'debit_card') {
      return (
        !!this.paymentForm.cardNumber &&
        !!this.paymentForm.cardName &&
        !!this.paymentForm.expiryDate &&
        !!this.paymentForm.cvv
      );
    }
    
    return !!this.selectedPaymentMethod;
  }
  
  placeOrder() {
    // Verificar si el usuario está autenticado
    if (!this.isAuthenticated) {
      // Redirigir al login con la URL de retorno
      this.error = 'Debes iniciar sesión para completar tu compra';
      // Guardar estado actual para volver después
      localStorage.setItem('redirectAfterLogin', '/cart');
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
      return;
    }

    if (!this.validatePaymentForm()) {
      this.error = 'Por favor completa la información de pago';
      return;
    }
    
    this.error = '';
    
    this.cartService.placeOrder({
      method: this.selectedPaymentMethod,
      details: this.paymentForm
    }).subscribe({
      next: (order) => {
        console.log('Orden procesada:', order);
        this.nextStep();
      },
      error: (err) => {
        if (err.status === 401) {
          // Error de autenticación
          this.error = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          localStorage.setItem('redirectAfterLogin', '/cart');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.error = err.message || 'Error al procesar la orden';
        }
      }
    });
  }
  
  continueShopping() {
    this.router.navigate(['/productos']);
  }
  
  clearCart() {
    this.cartService.clearCart();
  }
  
  // Formatear precio con moneda
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
  }
}
