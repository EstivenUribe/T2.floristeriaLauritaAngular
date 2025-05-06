import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NavFooterComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = {
    email: '',
    password: '',
    rememberMe: false
  };
  
  adminPassword = '';
  error = '';
  passwordVisible = false;
  isAdminLogin = false;

  constructor(private router: Router) { }

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
    alert('Funcionalidad de inicio de sesión con Google será implementada con Firebase Authentication');
  }

  login(): void {
    if (this.isAdminLogin) {
      // Autenticación de administrador
      if (this.adminPassword === 'admin123') {
        this.router.navigate(['/admin']);
      } else {
        this.error = 'Clave de administrador incorrecta.';
      }
    } else {
      // Autenticación de usuario normal
      // Aquí se implementaría la lógica para verificar las credenciales con el backend
      console.log('Intento de inicio de sesión:', this.loginForm);
      
      // Simulación de inicio de sesión exitoso
      if (this.loginForm.email && this.loginForm.password) {
        console.log('Usuario autenticado:', this.loginForm.email);
        // Redirigir al usuario a la página principal
        this.router.navigate(['/']);
      } else {
        this.error = 'Por favor, introduce tu correo electrónico y contraseña.';
      }
    }
  }
}