import { Injectable, ApplicationRef, createComponent, EnvironmentInjector, Injector, Type } from '@angular/core';
import { NotificationComponent, NotificationType } from '../components/shared/notification/notification.component';

export interface NotificationOptions {
  type?: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoClose?: boolean;
}

interface ComponentOptions {
  type: NotificationType;
  title?: string;
  message: string;
  duration: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoClose: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: any[] = [];
  private maxNotifications = 5;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector,
    private injector: Injector
  ) {}

  // Método principal para mostrar notificaciones
  show(options: NotificationOptions): void {
    const notificationRef = this.createNotification(NotificationComponent, {
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
      position: options.position || 'top-right',
      autoClose: options.autoClose !== undefined ? options.autoClose : true
    });

    // Agregar a la lista y manejar el límite
    this.notifications.push(notificationRef);
    this.enforceMaxNotifications();
    
    // Configurar el cierre de la notificación
    notificationRef.instance.closed.subscribe(() => {
      this.removeNotification(notificationRef);
    });
  }

  // Métodos de conveniencia para diferentes tipos de notificaciones
  success(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    this.show({
      type: 'success',
      message,
      title,
      ...options
    });
  }

  error(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    this.show({
      type: 'error',
      message,
      title,
      ...options
    });
  }

  warning(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    this.show({
      type: 'warning',
      message,
      title,
      ...options
    });
  }

  info(message: string, title?: string, options?: Partial<NotificationOptions>): void {
    this.show({
      type: 'info',
      message,
      title,
      ...options
    });
  }

  // Cerrar todas las notificaciones activas
  clearAll(): void {
    this.notifications.forEach(notificationRef => {
      notificationRef.instance.close();
    });
  }

  // Crear componente de notificación dinámicamente
  private createNotification(component: Type<NotificationComponent>, options: ComponentOptions): any {
    // Crear el componente dinámicamente
    const componentRef = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector
    });

    // Asignar las propiedades de forma segura
    componentRef.instance.type = options.type;
    componentRef.instance.message = options.message;
    if (options.title) componentRef.instance.title = options.title;
    componentRef.instance.duration = options.duration;
    componentRef.instance.position = options.position;
    componentRef.instance.autoClose = options.autoClose;

    // Añadir al DOM
    document.body.appendChild(componentRef.location.nativeElement);
    
    // Conectar con el ciclo de detección de cambios
    this.appRef.attachView(componentRef.hostView);

    return componentRef;
  }

  // Eliminar una notificación
  private removeNotification(notificationRef: any): void {
    const index = this.notifications.indexOf(notificationRef);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.appRef.detachView(notificationRef.hostView);
      notificationRef.destroy();
    }
  }

  // Limitar el número máximo de notificaciones
  private enforceMaxNotifications(): void {
    if (this.notifications.length > this.maxNotifications) {
      const oldestNotification = this.notifications[0];
      oldestNotification.instance.close();
    }
  }
}