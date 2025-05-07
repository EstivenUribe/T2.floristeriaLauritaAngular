import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './nav-footer.component.html',
  styleUrl: './nav-footer.component.css'
})
export class NavFooterComponent implements OnInit, OnDestroy {
  showLoginMenu = false;
  showMobileMenu = false;
  showSidebar = false;
  isHeaderFixed = false;
  cartItemCount = 0;
  private cartSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private cartService: CartService
  ) { }
  
  ngOnInit(): void {
    this.cartSubscription = this.cartService.items.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }
  
  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
  
  // Ya no usamos el header fijo
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // No fijar el header al hacer scroll
  }

  // Menú lateral (sidebar)
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
    
    // Bloquear scroll cuando el menú está abierto
    if (this.showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
  
  // Menú de login desplegable (legacy)
  toggleLoginMenu(): void {
    this.showLoginMenu = !this.showLoginMenu;
  }
  
  // Menú móvil
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    
    // Bloquear scroll cuando el menú está abierto
    if (this.showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
  
  closeMobileMenu(): void {
    if (this.showMobileMenu) {
      this.showMobileMenu = false;
      document.body.style.overflow = '';
    }
  }

  // Navegación
  goToLogin(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/login']);
  }
}
