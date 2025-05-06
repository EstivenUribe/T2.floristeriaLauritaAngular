import { Component } from '@angular/core';
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
export class LoginComponent {
  loginForm: LoginRequest = {
    email: '',
    password: '',
    rememberMe: false
  };
  
  adminPassword = '';
  error = '';
  passwordVisible = false;
  isAdminLogin = false;
  isLoading = false;
  returnUrl: string = '/';

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

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  
  toggleLoginType() {
    this.isAdminLogin = !this.isAdminLogin;
    this.error = '';
  }

  signInWithGoogle() {
    // En un caso real, aquí implementaríamos la autenticación de Google
    console.log('Iniciar sesión con Google');
    alert('Funcionalidad de inicio de sesión con Google será implementada pronto');
  }

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
  
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

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
}