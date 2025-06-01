import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading = true;
  isModalOpen = false;
  selectedFilter: string = 'all';

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filterOrders();
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('No se pudieron cargar los pedidos');
        this.isLoading = false;
      }
    });
  }

  filterOrders(): void {
    if (this.selectedFilter === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => 
        order.status.toLowerCase() === this.selectedFilter.toLowerCase()
      );
    }
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterOrders();
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.PROCESSING:
        return 'status-processing';
      case OrderStatus.SHIPPED:
        return 'status-shipped';
      case OrderStatus.DELIVERED:
        return 'status-delivered';
      case OrderStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  calculateTotal(order: Order): number {
    return order.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }
}
