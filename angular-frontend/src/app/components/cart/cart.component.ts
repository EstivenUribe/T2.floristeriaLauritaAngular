import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

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
  shippingCost = 10000;
  paymentMethods: PaymentMethod[] = [
    { id: 'credit_card', name: 'Tarjeta de Crédito', icon: 'fa-credit-card' },
    { id: 'debit_card', name: 'Tarjeta de Débito', icon: 'fa-credit-card' },
    { id: 'pse', name: 'PSE', icon: 'fa-university' },
    { id: 'paypal', name: 'PayPal', icon: 'fa-paypal' }
  ];
  selectedPaymentMethod = '';
  
  // Hacer Math accesible en la plantilla
  Math = Math;
  
  // Para usar Date en la plantilla
  currentDate = new Date();
  
  shippingForm = {
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
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Simular productos en el carrito
    this.cartItems = [
      {
        id: 1,
        name: 'Ramo de Rosas Rojas',
        price: 85000,
        image: 'assets/images/products/product1.jpg',
        quantity: 1
      },
      {
        id: 2,
        name: 'Orquídea Phalaenopsis',
        price: 120000,
        image: 'assets/images/products/product2.jpg',
        quantity: 1
      }
    ];
    
    this.calculateSubtotal();
  }
  
  calculateSubtotal() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  getTotal() {
    return this.subtotal + this.shippingCost;
  }
  
  updateQuantity(item: CartItem, isIncrement: boolean) {
    if (isIncrement) {
      item.quantity++;
    } else if (item.quantity > 1) {
      item.quantity--;
    }
    this.calculateSubtotal();
  }
  
  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.calculateSubtotal();
  }
  
  nextStep() {
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
  
  placeOrder() {
    // En una implementación real, enviaríamos la orden al backend
    console.log('Orden enviada:', {
      items: this.cartItems,
      shipping: this.shippingForm,
      payment: {
        method: this.selectedPaymentMethod,
        details: this.paymentForm
      },
      total: this.getTotal()
    });
    
    // Simular envío exitoso
    this.nextStep();
  }
  
  continueShopping() {
    this.router.navigate(['/productos']);
  }
}
