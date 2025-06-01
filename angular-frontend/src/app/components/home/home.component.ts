import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../product-list/product-list.component';
// import { ProductCarouselComponent } from '../product-carousel/product-carousel.component'; // No utilizado en el template
import { CompanyInfoComponent } from '../company-info/company-info.component';
import { RouterModule } from '@angular/router';
// import {NavFooterComponent} from '../shared/nav-footer/nav-footer.component'; // No utilizado en el template
import { CarouselPrincipalComponent } from '../carousel-principal/carousel-principal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ProductListComponent,
    // ProductCarouselComponent, // No utilizado en el template
    CompanyInfoComponent,
    RouterModule,
    // NavFooterComponent, // No utilizado en el template
    CarouselPrincipalComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
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

  // Búsqueda de productos
  searchProducts(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.trim();

    if (searchTerm) {
      // Implementar búsqueda (podría navegar a una página de resultados)
      console.log('Buscando:', searchTerm);

      // Limpiar el input después de la búsqueda
      input.value = '';
    }
  }
}
