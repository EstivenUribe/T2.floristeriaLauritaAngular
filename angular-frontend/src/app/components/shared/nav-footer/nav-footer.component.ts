import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
    public authService: AuthService // Hacerlo público para acceso directo en plantilla si se prefiere
  ) { }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.items.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    // Subscribirse a cambios de ruta para asegurar que el menú se actualiza correctamente
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => { // Asegurarse que event es de tipo NavigationEnd
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
      this.showLayout = !this.router.url.startsWith('/login'); // Estado inicial
      this.ensureNavConsistency();
      this.cdr.detectChanges(); // Para asegurar que el cambio en showLayout se refleje
    }, 0);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  viewProfile(): void {
    alert('Opción "Ver perfil" en implementación.');
    this.isUserMenuOpen = false;
    // this.router.navigate(['/profile']); // Futura implementación
  }

  viewOrderHistory(): void {
    alert('Opción "Historial de compras" en implementación.');
    this.isUserMenuOpen = false;
    // this.router.navigate(['/order-history']); // Futura implementación
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/']); // O a la página de login
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
