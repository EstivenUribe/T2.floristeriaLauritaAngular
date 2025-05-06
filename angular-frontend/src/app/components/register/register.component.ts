import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavFooterComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: '',
    agreeTerms: false
  };

  passwordVisible = false;
  confirmPasswordVisible = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  signInWithGoogle() {
    // En un caso real, aquí implementaríamos la autenticación de Google
    console.log('Iniciar sesión con Google');
    alert('Funcionalidad de inicio de sesión con Google será implementada con Firebase Authentication');
  }

  onSubmit() {
    // Validar que las contraseñas coincidan
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validar aceptación de términos
    if (!this.registerForm.agreeTerms) {
      alert('Debes aceptar los términos y condiciones para registrarte');
      return;
    }

    // En una implementación real, enviaríamos esto al servidor
    console.log('Formulario enviado:', {
      ...this.registerForm,
      profileImage: this.selectedFile ? this.selectedFile.name : 'No image'
    });

    // Simular registro exitoso
    alert('¡Registro exitoso! En una implementación real, te enviaríamos un correo de confirmación.');
    this.router.navigate(['/login']);
  }
}
