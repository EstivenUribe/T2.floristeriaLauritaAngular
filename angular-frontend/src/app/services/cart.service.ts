import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { CartItem, Order, ShippingInfo, PaymentInfo, PaymentMethod } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = '/api/cart';
  private ordersUrl = '/api/orders';
  
  // Estado del carrito
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private shippingInfo = new BehaviorSubject<ShippingInfo | null>(null);
  private loadingCart = new BehaviorSubject<boolean>(false);
  private processingOrder = new BehaviorSubject<boolean>(false);
  
  // Métodos de pago disponibles
  private paymentMethods: PaymentMethod[] = [
    { id: 'credit_card', name: 'Tarjeta de Crédito', icon: 'fa-credit-card' },
    { id: 'debit_card', name: 'Tarjeta de Débito', icon: 'fa-credit-card' },
    { id: 'pse', name: 'PSE', icon: 'fa-university' },
    { id: 'paypal', name: 'PayPal', icon: 'fa-paypal' }
  ];
  
  // Costos de envío
  private shippingCost = 10000; // COP
  
  constructor(private http: HttpClient) { 
    // Cargar carrito desde localStorage al inicializar
    this.loadCartFromStorage();
  }
  
  // Observables públicos
  get items(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }
  
  get shipping(): Observable<ShippingInfo | null> {
    return this.shippingInfo.asObservable();
  }
  
  get isLoading(): Observable<boolean> {
    return this.loadingCart.asObservable();
  }
  
  get isProcessingOrder(): Observable<boolean> {
    return this.processingOrder.asObservable();
  }
  
  getShippingCost(): number {
    return this.shippingCost;
  }
  
  getPaymentMethods(): PaymentMethod[] {
    return [...this.paymentMethods];
  }
  
  // Métodos para gestionar el carrito
  
  // Añadir producto al carrito
  addToCart(item: CartItem): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(i => 
      i.productId === item.productId && 
      JSON.stringify(i.selectedVariations) === JSON.stringify(item.selectedVariations)
    );
    
    let newItems: CartItem[];
    
    if (existingItem) {
      // Actualizar cantidad si ya existe
      newItems = currentItems.map(i => 
        i === existingItem 
          ? { ...i, quantity: i.quantity + item.quantity } 
          : i
      );
    } else {
      // Añadir nuevo item
      newItems = [...currentItems, item];
    }
    
    this.cartItems.next(newItems);
    this.saveCartToStorage();
  }
  
  // Actualizar cantidad de un producto
  updateQuantity(index: number, quantity: number): void {
    if (quantity < 1) return;
    
    const items = [...this.cartItems.value];
    items[index] = { ...items[index], quantity };
    
    this.cartItems.next(items);
    this.saveCartToStorage();
  }
  
  // Eliminar producto del carrito
  removeItem(index: number): void {
    const items = this.cartItems.value.filter((_, i) => i !== index);
    this.cartItems.next(items);
    this.saveCartToStorage();
  }
  
  // Vaciar carrito
  clearCart(): void {
    this.cartItems.next([]);
    this.saveCartToStorage();
  }
  
  // Calcular subtotal
  getSubtotal(): number {
    return this.cartItems.value.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
  }
  
  // Calcular total
  getTotal(): number {
    return this.getSubtotal() + this.shippingCost;
  }
  
  // Guardar información de envío
  saveShippingInfo(info: ShippingInfo): void {
    this.shippingInfo.next(info);
    localStorage.setItem('shippingInfo', JSON.stringify(info));
  }
  
  // Procesar pedido
  placeOrder(paymentInfo: PaymentInfo): Observable<Order> {
    // Extraer nombre y apellido del nombre completo
    const fullNameParts = this.shippingInfo.value?.fullName.split(' ') || ['', ''];
    const firstName = fullNameParts[0];
    const lastName = fullNameParts.slice(1).join(' ') || fullNameParts[0];
    
    // Mapear método de pago a uno de los valores permitidos en el backend
    let backendPaymentMethod = 'transferencia'; // Valor predeterminado
    
    // Mapear métodos de pago frontend a backend
    if (paymentInfo.method === 'credit_card' || paymentInfo.method === 'debit_card') {
      backendPaymentMethod = 'tarjeta';
    } else if (paymentInfo.method === 'pse') {
      backendPaymentMethod = 'transferencia';
    } else if (paymentInfo.method === 'paypal') {
      backendPaymentMethod = 'transferencia';
    }
    
    // Adaptamos nuestro modelo de orden al formato que espera el backend
    const orderData = {
      orderItems: this.cartItems.value.map(item => ({
        product: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
        // Eliminamos selectedVariations que no está en el modelo del backend
      })),
      shippingAddress: {
        firstName: firstName,
        lastName: lastName,
        address: this.shippingInfo.value?.address,
        city: this.shippingInfo.value?.city,
        state: this.shippingInfo.value?.province, // Mapear province a state
        zipCode: this.shippingInfo.value?.postalCode, // Mapear postalCode a zipCode
        country: 'Colombia', // Valor fijo para país
        phone: this.shippingInfo.value?.phone
        // No enviamos email ni notes que no están en el modelo del backend
      },
      paymentMethod: backendPaymentMethod,
      paymentResult: {
        id: Date.now().toString(), // ID temporal para el resultado del pago
        status: 'pending',
        update_time: new Date().toISOString(),
        email_address: this.shippingInfo.value?.email || ''
      },
      itemsPrice: this.getSubtotal(),
      shippingPrice: this.shippingCost,
      taxPrice: 0, // Si necesitas calcular impuestos
      totalPrice: this.getTotal()
    };
    
    this.processingOrder.next(true);
    
    return this.http.post<Order>(this.ordersUrl, orderData).pipe(
      tap(() => {
        // Limpiar carrito después de un pedido exitoso
        this.clearCart();
        this.shippingInfo.next(null);
        localStorage.removeItem('shippingInfo');
      }),
      catchError(this.handleError),
      finalize(() => this.processingOrder.next(false))
    );
  }
  
  // Métodos privados
  
  // Cargar carrito desde localStorage
  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        this.cartItems.next(JSON.parse(storedCart));
      }
      
      const storedShipping = localStorage.getItem('shippingInfo');
      if (storedShipping) {
        this.shippingInfo.next(JSON.parse(storedShipping));
      }
    } catch (error) {
      console.error('Error al cargar el carrito desde localStorage:', error);
      // Si hay error, reiniciar el carrito
      this.clearCart();
    }
  }
  
  // Guardar carrito en localStorage
  private saveCartToStorage(): void {
    try {
      localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
    } catch (error) {
      console.error('Error al guardar el carrito en localStorage:', error);
    }
  }
  
  // Manejador de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error al procesar tu pedido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del backend
      switch(error.status) {
        case 400:
          errorMessage = 'Información de pedido incompleta o inválida';
          break;
        case 401:
          errorMessage = 'Debes iniciar sesión para realizar un pedido';
          break;
        case 500:
          errorMessage = 'Error en el servidor al procesar tu pedido';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}