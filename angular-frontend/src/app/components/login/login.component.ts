
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NavFooterComponent, ReactiveFormsModule],
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

  // Nuevas propiedades para el formulario de registro reactivo
  registerForm!: FormGroup;
  confirmPasswordVisible = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Patrones para validación (copiados de register.component.ts)
  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private fb: FormBuilder, // Añadido FormBuilder
    private notificationService: NotificationService // Añadido NotificationService
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

    // Crear formulario de registro con validaciones (copiado de register.component.ts)
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
          error: (err: Error) => {
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
          error: (err: Error) => {
            this.error = err.message;
          }
        });
    }
  }

  /**
   * Proceso de registro de nuevo usuario
   */
  // Validador personalizado para verificar que las contraseñas coincidan (copiado de register.component.ts)
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true }); // Establecer error en confirmPassword
      return { passwordMismatch: true };
    }
    if (confirmPassword?.hasError('passwordMismatch') && password?.value === confirmPassword?.value) {
      confirmPassword.setErrors(null); // Limpiar error si coinciden
    }
    return null;
  }

  // (Copiado de register.component.ts)
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  // (Copiado de register.component.ts)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.notificationService.error('Formato de imagen no válido. Solo se permiten archivos JPG, PNG o GIF.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB
        this.notificationService.error('La imagen es demasiado grande. El tamaño máximo permitido es 2MB.');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.registerForm.patchValue({
        profileImage: file.name // O podrías guardar el archivo directamente si tu backend lo maneja
      });
    }
  }

  // Getters para facilitar el acceso a los campos del formulario en la plantilla (copiado de register.component.ts)
  get regName() { return this.registerForm.get('name'); }
  get regEmail() { return this.registerForm.get('email'); }
  get regPassword() { return this.registerForm.get('password'); }
  get regConfirmPassword() { return this.registerForm.get('confirmPassword'); }
  get regTermsAccepted() { return this.registerForm.get('termsAccepted'); }

  // Verificar si un campo es inválido y ha sido tocado (copiado de register.component.ts)
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }
  
  // Obtener mensaje de error para un campo específico (copiado de register.component.ts)
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
      if (fieldName === 'email') return 'Ingrese un correo electrónico válido';
      if (fieldName === 'password') return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
    }
    if (fieldName === 'confirmPassword' && field.hasError('passwordMismatch')) {
        return 'Las contraseñas no coinciden';
    }
    if (fieldName === 'termsAccepted' && field.hasError('requiredTrue')){
        return 'Debes aceptar los términos y condiciones';
    }
    return 'Campo inválido';
  }

  // Método de registro actualizado para usar ReactiveForm y NotificationService
  register(): void {
    // Marcar todos los campos como tocados para mostrar errores
    this.registerForm.markAllAsTouched();
    this.error = ''; // Limpiar errores previos del panel de login

    if (this.registerForm.invalid) {
      this.notificationService.warning('Por favor, corrige los errores en el formulario antes de continuar.');
      // Forzar que el panel de registro permanezca activo si hay errores
      if (!this.isRightPanelActive) this.showSignUpPanel(); 
      return;
    }

    this.isLoading = true;
    
    // Crear FormData para manejar la subida de archivos
    const formData = new FormData();
    formData.append('name', this.registerForm.value.name);
    formData.append('email', this.registerForm.value.email);
    formData.append('password', this.registerForm.value.password);
    formData.append('termsAccepted', this.registerForm.value.termsAccepted);
    
    // Si hay una imagen seleccionada, agregarla al FormData
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile, this.selectedFile.name);
    }

    // Llamar al servicio de autenticación
    this.authService.register(formData).subscribe({
      next: (response) => {
        // Registro exitoso
        this.notificationService.success('¡Registro exitoso! Bienvenido/a. Ahora puedes iniciar sesión.');
        this.registerForm.reset();
        this.imagePreview = null;
        this.selectedFile = null;
        this.showSignInPanel(); // Cambiar al panel de inicio de sesión
      },
      error: (err: Error) => {
        // Manejar diferentes tipos de errores
        if (err.status === 400) {
          this.notificationService.error(err.error.message || 'Datos de registro inválidos.');
        } else if (err.status === 409) {
          this.notificationService.error('El correo electrónico ya está registrado.');
        } else {
          this.notificationService.error('Error en el servidor. Por favor, inténtalo de nuevo más tarde.');
        }
        console.error('Error en el registro:', err);
        this.error = err.error?.message || 'Error en el registro. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
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
