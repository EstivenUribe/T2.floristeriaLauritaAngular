import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { Order as BaseOrder, OrderStatus } from '../../models/order.model';

// Extender la interfaz Order para incluir propiedades de UI
interface Order extends BaseOrder {
  showStatusDropdown?: boolean;
}

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective]
})
export class AdminOrdersComponent implements OnInit {
  // Exponer el enum OrderStatus para su uso en la plantilla
  OrderStatus = OrderStatus;

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedOrder: Order | null = null;
  orderStatuses = Object.values(OrderStatus);
  statusFilter: string = '';
  dateFilter: string = '';
  searchText: string = '';
  displayMode: 'list' | 'detail' = 'list';

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los pedidos: ' + (err.message || 'Error desconocido');
        this.loading = false;
        this.notificationService.error(this.error, 'Error');
      }
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.displayMode = 'detail';
  }

  backToList(): void {
    this.selectedOrder = null;
    this.displayMode = 'list';
  }

  updateOrderStatus(orderId: string, status: string): void {
    // Validaciones exhaustivas
    if (!orderId || orderId.trim() === '') {
      this.notificationService.error('ID de pedido no válido', 'Error de validación');
      console.error('updateOrderStatus llamado con ID inválido:', { orderId });
      return;
    }

    if (!status || status.trim() === '') {
      this.notificationService.error('Estado no válido', 'Error de validación');
      console.error('updateOrderStatus llamado con estado inválido:', { status });
      return;
    }

    // Verificar que el estado sea uno de los permitidos
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      this.notificationService.error(`Estado '${status}' no reconocido`, 'Error de validación');
      console.error('updateOrderStatus llamado con estado no reconocido:', { status, allowedValues: Object.values(OrderStatus) });
      return;
    }

    this.loading = true;
    console.log(`Intentando actualizar pedido ${orderId} a estado: ${status}`);
    
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updatedOrder) => {
        console.log('Respuesta del servidor:', updatedOrder);
        if (!updatedOrder) {
          this.notificationService.error('Respuesta del servidor vacía', 'Error');
          this.loading = false;
          return;
        }
        
        const index = this.orders.findIndex(o => o._id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.applyFilters();
        }
        if (this.selectedOrder && this.selectedOrder._id === orderId) {
          this.selectedOrder = updatedOrder;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al actualizar el estado del pedido:', err);
        // Mostrar más información sobre el error para depuración
        if (err.error && err.error.message) {
          console.error('Mensaje del servidor:', err.error.message);
        }
        if (err.status === 500) {
          console.error('Error interno del servidor. Posible problema en el backend con los datos enviados:', { orderId, status });
        }
        
        this.notificationService.error(
          `Error al actualizar el estado del pedido: ${err.error?.message || err.message || 'Error de comunicación con el servidor'}`, 
          'Error'
        );
        this.loading = false;
      }
    });
  }

  markAsPaid(orderId: string): void {
    // Validar parámetro antes de llamar al backend
    if (!orderId) {
      this.notificationService.error('ID de pedido no válido', 'Error');
      console.error('markAsPaid llamado con parámetro inválido:', { orderId });
      return;
    }
    
    const paymentInfo = {
      paymentMethod: 'admin-panel',
      paymentResult: {
        id: 'manual-payment-' + new Date().getTime(),
        status: 'Aprobado',
        update_time: new Date().toISOString()
      }
    };

    this.loading = true;
    console.log(`Intentando marcar pedido ${orderId} como pagado`);

    this.orderService.updateOrderToPaid(orderId, paymentInfo).subscribe({
      next: (updatedOrder) => {
        console.log('Respuesta del servidor:', updatedOrder);
        if (!updatedOrder) {
          this.notificationService.error('Respuesta del servidor vacía', 'Error');
          this.loading = false;
          return;
        }
        
        const index = this.orders.findIndex(o => o._id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.applyFilters();
        }
        if (this.selectedOrder && this.selectedOrder._id === orderId) {
          this.selectedOrder = updatedOrder;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al marcar el pedido como pagado:', err);
        this.notificationService.error(
          `Error al marcar el pedido como pagado: ${err.message || 'Error de comunicación con el servidor'}`, 
          'Error'
        );
        this.loading = false;
      }
    });
  }

  markAsDelivered(orderId: string): void {
    // Validar parámetro antes de llamar al backend
    if (!orderId) {
      this.notificationService.error('ID de pedido no válido', 'Error');
      console.error('markAsDelivered llamado con parámetro inválido:', { orderId });
      return;
    }

    this.loading = true;
    console.log(`Intentando marcar pedido ${orderId} como entregado`);

    this.orderService.updateOrderToDelivered(orderId).subscribe({
      next: (updatedOrder) => {
        console.log('Respuesta del servidor:', updatedOrder);
        if (!updatedOrder) {
          this.notificationService.error('Respuesta del servidor vacía', 'Error');
          this.loading = false;
          return;
        }
        
        const index = this.orders.findIndex(o => o._id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.applyFilters();
        }
        if (this.selectedOrder && this.selectedOrder._id === orderId) {
          this.selectedOrder = updatedOrder;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al marcar el pedido como entregado:', err);
        this.notificationService.error(
          `Error al marcar el pedido como entregado: ${err.message || 'Error de comunicación con el servidor'}`, 
          'Error'
        );
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Aplicar filtro por estado
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Aplicar filtro por fecha
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date).setHours(0, 0, 0, 0);
        return orderDate === filterDate;
      });
    }

    // Aplicar búsqueda por texto
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchLower) ||
        order.userId.toLowerCase().includes(searchLower) ||
        order.orderNumber.toString().includes(searchLower) ||
        order.shippingAddress.city.toLowerCase().includes(searchLower) ||
        order.shippingAddress.street.toLowerCase().includes(searchLower)
      );
    }

    this.filteredOrders = filtered;
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.dateFilter = '';
    this.searchText = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case OrderStatus.PENDING: return 'badge-warning';
      case OrderStatus.PROCESSING: return 'badge-info';
      case OrderStatus.SHIPPED: return 'badge-primary';
      case OrderStatus.DELIVERED: return 'badge-success';
      case OrderStatus.CANCELLED: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  // Calcular el total de productos en un pedido
  getTotalItems(order: Order): number {
    if (!order || !order.products || !Array.isArray(order.products)) {
      return 0;
    }
    return order.products.reduce((total, product) => total + product.quantity, 0);
  }

  // Formatear fecha para mostrar
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
