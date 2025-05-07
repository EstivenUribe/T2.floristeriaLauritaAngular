import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ],
  template: `
    <div *ngIf="visible" 
         class="notification-container"
         [ngClass]="type"
         [@fadeInOut]>
      <div class="notification-content">
        <div class="notification-icon">
          <i class="fas" 
             [ngClass]="{
               'fa-check-circle': type === 'success',
               'fa-exclamation-circle': type === 'error',
               'fa-exclamation-triangle': type === 'warning',
               'fa-info-circle': type === 'info'
             }"></i>
        </div>
        <div class="notification-message">
          <p class="title" *ngIf="title">{{ title }}</p>
          <p class="message">{{ message }}</p>
        </div>
        <button class="close-button" (click)="close()">×</button>
      </div>
      <div *ngIf="autoClose" class="progress-bar">
        <div class="progress" [style.width.%]="progressWidth"></div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      z-index: 1000;
      min-width: 300px;
      max-width: 400px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      overflow: hidden;
      margin: 16px;
      transition: all 0.3s ease;
    }
    
    :host.top-right .notification-container {
      top: 20px;
      right: 20px;
    }
    
    :host.top-left .notification-container {
      top: 20px;
      left: 20px;
    }
    
    :host.bottom-right .notification-container {
      bottom: 20px;
      right: 20px;
    }
    
    :host.bottom-left .notification-container {
      bottom: 20px;
      left: 20px;
    }
    
    .notification-container.success {
      background-color: #f0fff0;
      border-left: 4px solid #52c41a;
    }
    
    .notification-container.error {
      background-color: #fff1f0;
      border-left: 4px solid #ff4d4f;
    }
    
    .notification-container.warning {
      background-color: #fffbe6;
      border-left: 4px solid #faad14;
    }
    
    .notification-container.info {
      background-color: #e6f7ff;
      border-left: 4px solid #1890ff;
    }
    
    .notification-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
    }
    
    .notification-icon {
      font-size: 24px;
      margin-right: 16px;
    }
    
    .success .notification-icon {
      color: #52c41a;
    }
    
    .error .notification-icon {
      color: #ff4d4f;
    }
    
    .warning .notification-icon {
      color: #faad14;
    }
    
    .info .notification-icon {
      color: #1890ff;
    }
    
    .notification-message {
      flex: 1;
    }
    
    .notification-message .title {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .notification-message .message {
      margin: 0;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 18px;
      color: #858585;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
    }
    
    .progress-bar {
      height: 2px;
      width: 100%;
      background-color: rgba(0,0,0,0.08);
    }
    
    .progress {
      height: 100%;
      background-color: rgba(0,0,0,0.2);
      transition: width linear;
    }
  `],
  host: {
    '[class.top-right]': 'position === "top-right"',
    '[class.top-left]': 'position === "top-left"',
    '[class.bottom-right]': 'position === "bottom-right"',
    '[class.bottom-left]': 'position === "bottom-left"'
  }
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() type: NotificationType = 'info';
  @Input() message: string = '';
  @Input() title?: string;
  @Input() duration: number = 5000; // ms
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  @Input() autoClose: boolean = true;
  
  @Output() closed = new EventEmitter<void>();
  
  visible: boolean = true;
  progressWidth: number = 100;
  
  private timerSubscription?: Subscription;
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    if (this.autoClose && this.duration > 0) {
      // Iniciar temporizador para cierre automático
      this.timerSubscription = timer(0, this.duration / 100)
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          this.progressWidth = 100 - value;
          
          if (this.progressWidth <= 0) {
            this.close();
          }
        });
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
  
  close(): void {
    this.visible = false;
    this.closed.emit();
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}