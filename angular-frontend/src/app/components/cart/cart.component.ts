import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';
import { CartService } from '../../services/cart.service';
import { CartItem, PaymentMethod, ShippingInfo } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavFooterComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
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
    private cartService: CartService
  ) {}
  
  ngOnInit() {
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
    
    // Obtener métodos de pago
    this.paymentMethods = this.cartService.getPaymentMethods();
    
    // Obtener costo de envío
    this.shippingCost = this.cartService.getShippingCost();
    
    // Suscribirse a estados de carga
    this.cartService.isLoading.subscribe(loading => {
      this.isLoading = loading;
    });
    
    this.cartService.isProcessingOrder.subscribe(processing => {
      this.isProcessingOrder = processing;
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
        this.error = err.message || 'Error al procesar la orden';
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
