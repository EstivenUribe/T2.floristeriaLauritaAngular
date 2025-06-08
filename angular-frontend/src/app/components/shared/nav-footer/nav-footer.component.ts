import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/auth.model';
import { Subscription, Observable } from 'rxjs';
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
  public showLayout = true;
  isAuthenticated$!: Observable<boolean>;
  currentUser$!: Observable<User | null>;
  isUserMenuOpen = false;
  showSidebar = false;
  cartItemCount = 0;
  private cartSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) { }

  // HostListener para cerrar el menú al hacer clic fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenuContainer = document.querySelector('.user-menu-container');

    // Si el clic fue fuera del contenedor del menú de usuario, cerrar el menú
    if (userMenuContainer && !userMenuContainer.contains(target)) {
      this.isUserMenuOpen = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
    }
  }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.items.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    // Subscribirse a cambios de ruta para asegurar que el menú se actualiza correctamente
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showLayout = !event.urlAfterRedirects.startsWith('/login');
        this.ensureNavConsistency();
        this.cdr.detectChanges();
      });

    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngAfterViewInit(): void {
    // Asegurarse que el nav se muestra correctamente después de renderizar la vista
    setTimeout(() => {
      this.showLayout = !this.router.url.startsWith('/login');
      this.ensureNavConsistency();
      this.cdr.detectChanges();
    }, 0);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  viewProfile(): void {
    this.router.navigate(['/perfil']);
    this.isUserMenuOpen = false;
  }

  viewOrderHistory(): void {
    this.router.navigate(['/historial-compras']);
    this.isUserMenuOpen = false;
  }

  navigateToAdminOrders(): void {
    this.router.navigate(['/admin-orders']);
    this.isUserMenuOpen = false;
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/']);
  }

  goToHomeE() {
    this.router.navigate(['/']);
  }

  goToHomeAndCloseSidebar() {
    this.goToHomeE();
    this.toggleSidebar();
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
      mainMenu.style.visibility = 'visible';
      mainMenu.style.display = 'block';

      const computedStyle = window.getComputedStyle(mainMenu);
      if (computedStyle.paddingBottom === '0px') {
        mainMenu.style.paddingBottom = '15px';
      }
    }
  }

  // Menú lateral (sidebar)
  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
    document.body.style.overflow = this.showSidebar ? 'hidden' : '';
  }

  // Navegación
  goToLogin(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/login']);

    if (this.showSidebar) {
      this.toggleSidebar();
    }
  }
}
