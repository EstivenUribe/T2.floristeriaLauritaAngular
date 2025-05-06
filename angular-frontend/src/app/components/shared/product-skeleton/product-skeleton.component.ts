import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  template: `
    <div class="product-skeleton">
      <div class="product-image">
        <app-skeleton-loader 
          width="100%" 
          height="200px"
          [rounded]="true">
        </app-skeleton-loader>
      </div>
      <div class="product-info">
        <div class="product-name">
          <app-skeleton-loader 
            width="85%" 
            height="24px"
            [rounded]="true">
          </app-skeleton-loader>
        </div>
        <div class="product-price" *ngIf="showPrice">
          <app-skeleton-loader 
            width="40%" 
            height="18px"
            [rounded]="true">
          </app-skeleton-loader>
        </div>
        <div class="product-description" *ngIf="showDescription">
          <app-skeleton-loader 
            width="100%" 
            height="16px"
            [rounded]="true">
          </app-skeleton-loader>
          <app-skeleton-loader 
            width="92%" 
            height="16px"
            [rounded]="true">
          </app-skeleton-loader>
          <app-skeleton-loader 
            width="85%" 
            height="16px"
            [rounded]="true">
          </app-skeleton-loader>
        </div>
        <div class="product-action" *ngIf="showAction">
          <app-skeleton-loader 
            width="120px" 
            height="40px"
            [rounded]="true">
          </app-skeleton-loader>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-skeleton {
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      background-color: #fff;
    }
    
    .product-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
    }
    
    .product-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .product-description {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `]
})
export class ProductSkeletonComponent {
  @Input() showPrice: boolean = true;
  @Input() showDescription: boolean = true;
  @Input() showAction: boolean = true;
}