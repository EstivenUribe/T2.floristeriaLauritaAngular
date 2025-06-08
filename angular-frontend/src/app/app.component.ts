import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { LoadingIndicatorComponent } from './components/shared/loading-indicator/loading-indicator.component';
import { NavFooterComponent } from './components/shared/nav-footer/nav-footer.component';
import { CsrfService } from './services/csrf.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingIndicatorComponent, NavFooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Catálogo de Productos';
  isLoggedIn = false;
  isFirstTimeUser = false;

  constructor(
    private csrfService: CsrfService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar el token CSRF al cargar la aplicación
    this.csrfService.getToken().subscribe();

    // Scroll al top en cada navegación y verificar ruta para tutorial
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Verificar si estamos en la página principal
      if (this.router.url === '/') {
        this.checkForFirstTimeUser();
      }
    });
    
    // Verificar estado de autenticación para tutorial
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      if (isAuthenticated) {
        this.checkForFirstTimeUser();
      }
    });
  }

  private checkForFirstTimeUser(): void {
    // Comprobar si es la primera vez del usuario
    if (localStorage.getItem('firstTimeUser') === 'true') {
      // Establecemos un pequeño retraso para asegurar que el componente se monte correctamente
      setTimeout(() => {
        this.isFirstTimeUser = true;
        console.log('Usuario nuevo detectado - Tutorial activado');
      }, 100);
    }
  }
}
