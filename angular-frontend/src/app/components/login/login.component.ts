
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NavFooterComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Formulario de inicio de sesión
  loginForm: LoginRequest = {
    email: '',
    password: '',
    rememberMe: false
  };

  // Variables de estado
  adminPassword = '';
  error = '';
  passwordVisible = false;
  isAdminLogin = false;
  isLoading = false;
  returnUrl: string = '/';
  isRightPanelActive = false;

  // Campos del formulario de registro
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Capturar URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Suscribirse al estado de carga
    this.authService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    // Inicializar el estado del panel
    this.isRightPanelActive = false;
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Alterna entre login de usuario y administrador
   */
  toggleLoginType(): void {
    this.isAdminLogin = !this.isAdminLogin;
    this.error = '';
  }

  /**
   * Iniciar sesión con Google
   */
  signInWithGoogle(): void {
    // En un caso real, aquí implementaríamos la autenticación de Google
    console.log('Iniciar sesión con Google');
    alert('Funcionalidad de inicio de sesión con Google será implementada pronto');
  }

  /**
   * Valida el formulario antes de enviarlo
   * @returns boolean - Indica si el formulario es válido
   */
  validateForm(): boolean {
    if (this.isAdminLogin) {
      if (!this.adminPassword) {
        this.error = 'Por favor, introduce la contraseña de administrador.';
        return false;
      }
    } else {
      if (!this.loginForm.email) {
        this.error = 'Por favor, introduce tu correo electrónico.';
        return false;
      }

      if (!this.validateEmail(this.loginForm.email)) {
        this.error = 'Por favor, introduce un correo electrónico válido.';
        return false;
      }

      if (!this.loginForm.password) {
        this.error = 'Por favor, introduce tu contraseña.';
        return false;
      }
    }

    return true;
  }

  /**
   * Valida el formato del correo electrónico
   * @param email - Correo electrónico a validar
   * @returns boolean - Indica si el correo es válido
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Proceso de inicio de sesión
   */
  login(): void {
    if (!this.validateForm()) {
      return;
    }

    this.error = '';

    if (this.isAdminLogin) {
      // Autenticación de administrador
      this.authService.adminLogin(this.adminPassword)
        .subscribe({
          next: () => {
            this.router.navigate(['/admin']);
          },
          error: (err) => {
            this.error = err.message;
          }
        });
    } else {
      // Autenticación de usuario normal
      this.authService.login(this.loginForm)
        .subscribe({
          next: () => {
            // Navegar a la URL de retorno o página principal
            this.router.navigateByUrl(this.returnUrl);
          },
          error: (err) => {
            this.error = err.message;
          }
        });
    }
  }

  /**
   * Proceso de registro de nuevo usuario
   */
  register(): void {
    // Validar campos
    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.error = 'Por favor, completa todos los campos.';
      return;
    }
    if (!this.validateEmail(this.registerEmail)) {
      this.error = 'Por favor, introduce un correo electrónico válido.';
      return;
    }
    if (this.registerPassword.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.error = '';
    this.isLoading = true;
    this.authService.register({
      name: this.registerName,
      email: this.registerEmail,
      password: this.registerPassword,
      termsAccepted: true
    }).subscribe({
      next: (response) => {
        // Registro exitoso
        this.isLoading = false;
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        // Limpiar formulario de registro
        this.registerName = '';
        this.registerEmail = '';
        this.registerPassword = '';
        // Cambiar al panel de login
        this.showSignInPanel();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Error al registrar usuario';
      }
    });
  }

  // Funciones para alternar entre paneles

  /**
   * Muestra el panel de registro
   */
  showSignUpPanel(): void {
    this.isRightPanelActive = true;
  }

  /**
   * Muestra el panel de inicio de sesión
   */
  showSignInPanel(): void {
    this.isRightPanelActive = false;
  }
}
