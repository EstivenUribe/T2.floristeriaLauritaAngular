import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from './components/shared/loading-indicator/loading-indicator.component';
import { NavFooterComponent } from './components/shared/nav-footer/nav-footer.component';
import { CsrfService } from './services/csrf.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingIndicatorComponent, NavFooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Catálogo de Productos';

  constructor(private csrfService: CsrfService) {}

  ngOnInit(): void {
    // Inicializar el token CSRF al cargar la aplicación
    this.csrfService.getToken().subscribe();
  }
}
