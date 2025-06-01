import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  /**
   * Obtiene todos los pedidos del usuario actual
   */
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/me`).pipe(
      tap(orders => console.log('Fetched user orders')),
      catchError(this.handleError<Order[]>('getUserOrders', []))
    );
  }
  
  /**
   * Obtiene todos los pedidos (solo para administradores)
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      tap(orders => console.log('Fetched all orders (admin)')),
      catchError(this.handleError<Order[]>('getAllOrders', []))
    );
  }

  /**
   * Obtiene los detalles de un pedido específico
   * @param id ID del pedido
   */
  getOrderDetails(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`).pipe(
      tap(order => console.log(`Fetched order id=${id}`)),
      catchError(this.handleError<Order>(`getOrderDetails id=${id}`))
    );
  }
  
  /**
   * Actualiza el estado de un pedido (solo para administradores)
   * @param id ID del pedido
   * @param status Nuevo estado del pedido
   */
  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap(order => {
        console.log(`Updated order status id=${id} to ${status}`);
        this.notificationService.success('Estado de pedido actualizado correctamente', 'Éxito');
      }),
      catchError(this.handleError<Order>('updateOrderStatus'))
    );
  }
  
  /**
   * Marca un pedido como pagado (solo para administradores)
   * @param id ID del pedido
   * @param paymentInfo Información del pago
   */
  updateOrderToPaid(id: string, paymentInfo: any): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/pay`, paymentInfo).pipe(
      tap(order => {
        console.log(`Marked order id=${id} as paid`);
        this.notificationService.success('Pedido marcado como pagado', 'Éxito');
      }),
      catchError(this.handleError<Order>('updateOrderToPaid'))
    );
  }
  
  /**
   * Marca un pedido como entregado (solo para administradores)
   * @param id ID del pedido
   */
  updateOrderToDelivered(id: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/deliver`, {}).pipe(
      tap(order => {
        console.log(`Marked order id=${id} as delivered`);
        this.notificationService.success('Pedido marcado como entregado', 'Éxito');
      }),
      catchError(this.handleError<Order>('updateOrderToDelivered'))
    );
  }

  /**
   * Maneja los errores HTTP
   * @param operation Nombre de la operación que falló
   * @param result Valor opcional a devolver como observable
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      
      this.notificationService.error(
        `Error al ${operation}: ${error.message || 'Hubo un problema al procesar tu solicitud'}`,
        'Error'
      );
      
      // Devuelve un resultado vacío para mantener la aplicación funcionando
      return of(result as T);
    };
  }
}
