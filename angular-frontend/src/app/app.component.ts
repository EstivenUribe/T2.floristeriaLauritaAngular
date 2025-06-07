import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LoadingIndicatorComponent } from './components/shared/loading-indicator/loading-indicator.component';
import { NavFooterComponent } from './components/shared/nav-footer/nav-footer.component';
import { CsrfService } from './services/csrf.service';
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

  constructor(
    private csrfService: CsrfService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar el token CSRF al cargar la aplicación
    this.csrfService.getToken().subscribe();

    // Scroll al top en cada navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
