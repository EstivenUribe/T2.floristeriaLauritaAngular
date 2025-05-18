import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NavFooterComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;
  
  // Patrones para validación
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Crear formulario con validaciones
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.passwordPattern)
      ]],
      confirmPassword: ['', Validators.required],
      profileImage: [''],
      termsAccepted: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
    
    // Suscribirse al estado de carga
    this.authService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }
  
  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.notificationService.error('Formato de imagen no válido. Solo se permiten archivos JPG, PNG o GIF.');
        return;
      }
      
      // Validar tamaño máximo (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.notificationService.error('La imagen es demasiado grande. El tamaño máximo permitido es 2MB.');
        return;
      }
      
      this.selectedFile = file;
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      
      // Actualizar valor en el formulario
      this.registerForm.patchValue({
        profileImage: file.name
      });
    }
  }

  signInWithGoogle() {
    this.notificationService.info('Funcionalidad de inicio de sesión con Google será implementada pronto.');
  }
  
  // Getters para facilitar el acceso a los campos del formulario en la plantilla
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get termsAccepted() { return this.registerForm.get('termsAccepted'); }
  
  // Verificar si un campo es inválido y ha sido tocado
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }
  
  // Obtener mensaje de error para un campo específico
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (!field) return '';
    
    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    
    if (field.hasError('pattern')) {
      if (fieldName === 'email') {
        return 'Ingrese un correo electrónico válido';
      }
      if (fieldName === 'password') {
        return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
      }
    }
    
    if (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    
    return 'Campo inválido';
  }

  onSubmit() {
    // Marcar todos los campos como tocados para mostrar errores
    this.registerForm.markAllAsTouched();
    
    if (this.registerForm.invalid) {
      this.notificationService.warning('Por favor, corrige los errores en el formulario antes de continuar.');
      return;
    }
    
    // Preparar datos para enviar
    const registerData = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      termsAccepted: this.registerForm.value.termsAccepted
    };
    
    // Enviar al servicio de autenticación
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.notificationService.success('¡Registro exitoso! Bienvenido/a a Floristería Laurita.');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.notificationService.error(error.message || 'Error al registrarse. Por favor, inténtelo de nuevo.');
      }
    });
  }
}
