import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
export class NavFooterComponent implements OnInit, OnDestroy, AfterViewInit {
  showSidebar = false;
  cartItemCount = 0;
  private cartSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.items.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    // Subscribirse a cambios de ruta para asegurar que el menú se actualiza correctamente
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.ensureNavConsistency();
        this.cdr.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    // Asegurarse que el nav se muestra correctamente después de renderizar la vista
    setTimeout(() => {
      this.ensureNavConsistency();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Asegurar consistencia del nav en todas las páginas
  private ensureNavConsistency(): void {
    const mainMenu = document.querySelector('.main-menu') as HTMLElement;
    const headerTop = document.querySelector('.header-top') as HTMLElement;

    if (mainMenu && headerTop) {
      // Asegurar que el menú principal esté completamente visible
      mainMenu.style.visibility = 'visible';
      mainMenu.style.display = 'block';

      // Ajustar alturas/margen si es necesario
      const computedStyle = window.getComputedStyle(mainMenu);
      if (computedStyle.paddingBottom === '0px') {
        mainMenu.style.paddingBottom = '15px';
      }
    }
  }

  // Menú lateral (sidebar)
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;

    // Bloquear scroll cuando el menú está abierto
    document.body.style.overflow = this.showSidebar ? 'hidden' : '';
  }

  // Navegación
  goToLogin(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/login']);

    // Cerrar el sidebar si está abierto
    if (this.showSidebar) {
      this.toggleSidebar();
    }
  }
}
