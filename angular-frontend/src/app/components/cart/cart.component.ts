import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  Math = Math;
  currentDate = new Date();

  // Errores de validación para formulario de envío
  shippingErrors = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: ''
  };

  // Errores de validación para formulario de pago
  paymentErrors = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    general: ''
  };

  // Estados de validación
  isShippingFormValid = false;
  isPaymentFormValid = false;

  // Tipo de tarjeta detectado
  cardType = '';

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
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.cartService.items.subscribe(items => {
      this.cartItems = items;
      this.updateTotals();
    });

    this.cartService.shipping.subscribe(info => {
      if (info) {
        this.shippingForm = info;
      }
    });

    this.paymentMethods = this.cartService.getPaymentMethods();
    this.shippingCost = this.cartService.getShippingCost();

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

  // VALIDACIONES DEL FORMULARIO DE ENVÍO
  validateFullName(): void {
    const name = this.shippingForm.fullName.trim();

    if (!name) {
      this.shippingErrors.fullName = 'El nombre completo es obligatorio';
    } else if (name.length < 2) {
      this.shippingErrors.fullName = 'El nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
      this.shippingErrors.fullName = 'El nombre solo puede contener letras y espacios';
    } else if (name.split(' ').length < 2) {
      this.shippingErrors.fullName = 'Ingresa tu nombre y apellido';
    } else {
      this.shippingErrors.fullName = '';
    }
  }

  validateEmail(): void {
    const email = this.shippingForm.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      this.shippingErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(email)) {
      this.shippingErrors.email = 'Ingresa un correo electrónico válido';
    } else if (email.length > 100) {
      this.shippingErrors.email = 'El correo es demasiado largo';
    } else {
      this.shippingErrors.email = '';
    }
  }

  validatePhone(): void {
    const phone = this.shippingForm.phone.trim();
    // Expresión regular para números colombianos
    const colombianPhoneRegex = /^(\+?57\s?)?[1-9]\d{6,9}$/;

    if (!phone) {
      this.shippingErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s\-()]+$/.test(phone)) {
      this.shippingErrors.phone = 'El teléfono solo puede contener números, espacios, guiones y paréntesis';
    } else if (!colombianPhoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
      this.shippingErrors.phone = 'Ingresa un número de teléfono colombiano válido';
    } else {
      this.shippingErrors.phone = '';
    }
  }

  validateAddress(): void {
    const address = this.shippingForm.address.trim();

    if (!address) {
      this.shippingErrors.address = 'La dirección es obligatoria';
    } else if (address.length < 10) {
      this.shippingErrors.address = 'La dirección debe ser más específica (mínimo 10 caracteres)';
    } else if (address.length > 200) {
      this.shippingErrors.address = 'La dirección es demasiado larga';
    } else if (!/\d/.test(address)) {
      this.shippingErrors.address = 'La dirección debe incluir un número';
    } else {
      this.shippingErrors.address = '';
    }
  }

  validateCity(): void {
    const city = this.shippingForm.city.trim();

    if (!city) {
      this.shippingErrors.city = 'La ciudad es obligatoria';
    } else if (city.length < 2) {
      this.shippingErrors.city = 'La ciudad debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(city)) {
      this.shippingErrors.city = 'La ciudad solo puede contener letras y espacios';
    } else {
      this.shippingErrors.city = '';
    }
  }

  validateProvince(): void {
    const province = this.shippingForm.province.trim();
    const colombianDepartments = [
      'amazonas', 'antioquia', 'arauca', 'atlántico', 'bolívar', 'boyacá',
      'caldas', 'caquetá', 'casanare', 'cauca', 'cesar', 'chocó', 'córdoba',
      'cundinamarca', 'guainía', 'guaviare', 'huila', 'la guajira', 'magdalena',
      'meta', 'nariño', 'norte de santander', 'putumayo', 'quindío', 'risaralda',
      'san andrés y providencia', 'santander', 'sucre', 'tolima', 'valle del cauca',
      'vaupés', 'vichada', 'bogotá'
    ];

    if (!province) {
      this.shippingErrors.province = 'El departamento es obligatorio';
    } else if (!colombianDepartments.includes(province.toLowerCase())) {
      this.shippingErrors.province = 'Ingresa un departamento colombiano válido';
    } else {
      this.shippingErrors.province = '';
    }
  }

  validatePostalCode(): void {
    const postalCode = this.shippingForm.postalCode.trim();

    if (postalCode && !/^\d{6}$/.test(postalCode)) {
      this.shippingErrors.postalCode = 'El código postal debe tener 6 dígitos';
    } else {
      this.shippingErrors.postalCode = '';
    }
  }

  // VALIDACIONES DEL FORMULARIO DE PAGO
  detectCardType(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');

    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';

    return '';
  }

  validateCardNumber(): void {
    const cardNumber = this.paymentForm.cardNumber.replace(/\s/g, '');

    if (!cardNumber) {
      this.paymentErrors.cardNumber = 'El número de tarjeta es obligatorio';
      this.cardType = '';
      return;
    }

    // Detectar tipo de tarjeta
    this.cardType = this.detectCardType(cardNumber);

    if (!/^\d+$/.test(cardNumber)) {
      this.paymentErrors.cardNumber = 'El número de tarjeta solo puede contener dígitos';
      return;
    }

    // Validar longitud según tipo de tarjeta
    let expectedLength = 16;
    if (this.cardType === 'amex') expectedLength = 15;

    if (cardNumber.length !== expectedLength) {
      this.paymentErrors.cardNumber = `El número de tarjeta debe tener ${expectedLength} dígitos`;
      return;
    }

    // Algoritmo de Luhn para validar número de tarjeta
    if (!this.luhnCheck(cardNumber)) {
      this.paymentErrors.cardNumber = 'Número de tarjeta inválido';
      return;
    }

    this.paymentErrors.cardNumber = '';
  }

  luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateCardName(): void {
    const cardName = this.paymentForm.cardName.trim();

    if (!cardName) {
      this.paymentErrors.cardName = 'El nombre del titular es obligatorio';
    } else if (cardName.length < 2) {
      this.paymentErrors.cardName = 'El nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cardName)) {
      this.paymentErrors.cardName = 'El nombre solo puede contener letras y espacios';
    } else {
      this.paymentErrors.cardName = '';
    }
  }

  validateExpiryDate(): void {
    const expiryDate = this.paymentForm.expiryDate.trim();

    if (!expiryDate) {
      this.paymentErrors.expiryDate = 'La fecha de vencimiento es obligatoria';
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      this.paymentErrors.expiryDate = 'Formato inválido. Use MM/AA';
      return;
    }

    const [month, year] = expiryDate.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (month < 1 || month > 12) {
      this.paymentErrors.expiryDate = 'Mes inválido';
      return;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      this.paymentErrors.expiryDate = 'La tarjeta ha expirado';
      return;
    }

    this.paymentErrors.expiryDate = '';
  }

  validateCVV(): void {
    const cvv = this.paymentForm.cvv.trim();
    const expectedLength = this.cardType === 'amex' ? 4 : 3;

    if (!cvv) {
      this.paymentErrors.cvv = 'El código CVV es obligatorio';
    } else if (!/^\d+$/.test(cvv)) {
      this.paymentErrors.cvv = 'El CVV solo puede contener dígitos';
    } else if (cvv.length !== expectedLength) {
      this.paymentErrors.cvv = `El CVV debe tener ${expectedLength} dígitos`;
    } else {
      this.paymentErrors.cvv = '';
    }
  }

  // Formatear número de tarjeta con espacios
  formatCardNumber(): void {
    let value = this.paymentForm.cardNumber.replace(/\s/g, '');
    let formattedValue = '';

    if (this.detectCardType(value) === 'amex') {
      // Formato AMEX: XXXX XXXXXX XXXXX
      formattedValue = value.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
      // Formato normal: XXXX XXXX XXXX XXXX
      formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    this.paymentForm.cardNumber = formattedValue;
    this.validateCardNumber();
  }

  // Formatear fecha de vencimiento
  formatExpiryDate(): void {
    let value = this.paymentForm.expiryDate.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentForm.expiryDate = value;
    this.validateExpiryDate();
  }

  // Validar todo el formulario de envío
  validateShippingForm(): boolean {
    this.validateFullName();
    this.validateEmail();
    this.validatePhone();
    this.validateAddress();
    this.validateCity();
    this.validateProvince();
    this.validatePostalCode();

    this.isShippingFormValid = !Object.values(this.shippingErrors).some(error => error !== '');
    return this.isShippingFormValid;
  }

  // Validar todo el formulario de pago
  validatePaymentForm(): boolean {
    if (this.selectedPaymentMethod === 'credit_card' || this.selectedPaymentMethod === 'debit_card') {
      this.validateCardNumber();
      this.validateCardName();
      this.validateExpiryDate();
      this.validateCVV();

      this.isPaymentFormValid = !Object.values(this.paymentErrors).some(error => error !== '');
    } else {
      this.isPaymentFormValid = !!this.selectedPaymentMethod;
      if (!this.isPaymentFormValid) {
        this.paymentErrors.general = 'Selecciona un método de pago';
      } else {
        this.paymentErrors.general = '';
      }
    }

    return this.isPaymentFormValid;
  }

  nextStep() {
    if (this.currentStep === 2) {
      if (!this.validateShippingForm()) {
        this.error = 'Por favor corrige los errores en el formulario';
        return;
      }
      this.cartService.saveShippingInfo(this.shippingForm);
    }

    if (this.currentStep < 4) {
      this.currentStep++;
      this.error = '';
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.error = '';
    }
  }

  setPaymentMethod(methodId: string) {
    this.selectedPaymentMethod = methodId;
    this.paymentErrors.general = '';
  }

  placeOrder() {
    if (!this.isAuthenticated) {
      this.error = 'Debes iniciar sesión para completar tu compra';
      localStorage.setItem('redirectAfterLogin', '/cart');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
      return;
    }

    if (!this.validatePaymentForm()) {
      this.error = 'Por favor corrige los errores en el formulario de pago';
      return;
    }

    this.error = '';

    // Simular procesamiento de orden (estático)
    this.isProcessingOrder = true;

    setTimeout(() => {
      this.isProcessingOrder = false;
      // Simulamos una orden exitosa
      console.log('Orden procesada:', {
        method: this.selectedPaymentMethod,
        details: this.paymentForm,
        shipping: this.shippingForm,
        items: this.cartItems,
        total: this.getTotal()
      });
      this.nextStep();
    }, 2000);
  }

  continueShopping() {
    this.router.navigate(['/productos']);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
  }
}
