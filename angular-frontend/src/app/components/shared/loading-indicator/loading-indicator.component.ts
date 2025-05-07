import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }
    
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
    
    p {
      margin: 0;
      font-weight: bold;
      color: #333;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingIndicatorComponent implements OnInit, OnDestroy {
  isLoading = false;
  private subscription = new Subscription();
  
  constructor(private loadingService: LoadingService) {}
  
  ngOnInit(): void {
    this.subscription.add(
      this.loadingService.isLoading$.subscribe(
        isLoading => {
          // Small delay to prevent flickering for very fast requests
          if (isLoading) {
            this.isLoading = true;
          } else {
            setTimeout(() => {
              this.isLoading = false;
            }, 100);
          }
        }
      )
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}