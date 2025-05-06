import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="skeleton-loader"
      [ngClass]="{ 
        'animate-pulse': animation === 'pulse',
        'animate-wave': animation === 'wave',
        'rounded': rounded,
        'circle': circle,
        'custom-height': height
      }"
      [ngStyle]="{
        'width': width,
        'height': circle ? width : height,
        'background-color': background,
        'border-radius': circle ? '50%' : (rounded ? '8px' : '0')
      }"
    ></div>
  `,
  styles: [`
    .skeleton-loader {
      display: inline-block;
      position: relative;
      overflow: hidden;
      background-color: #e0e0e0;
    }
    
    .animate-pulse {
      animation: pulse 1.5s ease-in-out 0.5s infinite;
    }
    
    .animate-wave {
      position: relative;
    }
    
    .animate-wave::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg, 
        rgba(255, 255, 255, 0) 0%, 
        rgba(255, 255, 255, 0.3) 50%, 
        rgba(255, 255, 255, 0) 100%
      );
      animation: wave 2s infinite;
    }
    
    .custom-height {
      min-height: 8px;
    }
    
    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }
    
    @keyframes wave {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() width: string = '100%';
  @Input() height: string = '16px';
  @Input() rounded: boolean = true;
  @Input() circle: boolean = false;
  @Input() animation: 'pulse' | 'wave' = 'wave';
  @Input() background: string = '#e0e0e0';
}