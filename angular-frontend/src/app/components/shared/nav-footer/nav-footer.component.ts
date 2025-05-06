import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
export class NavFooterComponent {
  showLoginMenu = false;
  showMobileMenu = false;
  showSidebar = false;
  isHeaderFixed = false;

  constructor(private router: Router) { }
  
  // Detecta el scroll para fijar el header
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isHeaderFixed = window.scrollY > 100;
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
