import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  isEditing = false;
  isLoading = true;
  showPassword = false;
  changePassword = false;
  verifyingEmail = false;
  selectedAvatarId = 1; // Avatar predeterminado

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      phone: [''],
      avatarId: [1],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  // Método para actualizar el estado de habilitación de los controles del formulario
  private updateFormControlsState(): void {
    // El email siempre está deshabilitado
    this.profileForm.get('email')?.disable();
    
    // Los demás campos dependen del modo de edición
    const controls = [
      'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'
    ];
    
    controls.forEach(control => {
      if (this.isEditing) {
        this.profileForm.get(control)?.enable();
      } else {
        this.profileForm.get(control)?.disable();
      }
    });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    
    // Forzar recarga desde el servidor
    this.authService.getCurrentUser(true).subscribe({
      next: (user) => {
        this.user = user;
        if (user) {
          this.selectedAvatarId = user.avatarId || 1;
          
          // Actualizar formulario con datos del usuario
          this.profileForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            zipCode: user.zipCode || '',
            phone: user.phone || '',
            avatarId: user.avatarId || 1
          });
          
          // Aplicar estado de habilitación según modo de edición
          this.updateFormControlsState();
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('No se pudo cargar la información del perfil');
        this.isLoading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    
    // Actualizar estado de habilitación de los controles
    this.updateFormControlsState();
    
    if (!this.isEditing) {
      // Reset form when canceling edit
      this.loadUserProfile();
      this.changePassword = false;
      this.profileForm.get('currentPassword')?.setValue('');
      this.profileForm.get('newPassword')?.setValue('');
      this.profileForm.get('confirmPassword')?.setValue('');
    }
  }

  toggleChangePassword(): void {
    this.changePassword = !this.changePassword;
    
    if (this.changePassword) {
      this.profileForm.get('currentPassword')?.setValidators(Validators.required);
      this.profileForm.get('newPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.profileForm.get('confirmPassword')?.setValidators(Validators.required);
    } else {
      this.profileForm.get('currentPassword')?.clearValidators();
      this.profileForm.get('newPassword')?.clearValidators();
      this.profileForm.get('confirmPassword')?.clearValidators();
      
      // Reset password fields
      this.profileForm.get('currentPassword')?.setValue('');
      this.profileForm.get('newPassword')?.setValue('');
      this.profileForm.get('confirmPassword')?.setValue('');
    }
    
    // Update validation status
    this.profileForm.get('currentPassword')?.updateValueAndValidity();
    this.profileForm.get('newPassword')?.updateValueAndValidity();
    this.profileForm.get('confirmPassword')?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.notificationService.error('Por favor corrige los errores en el formulario');
      return;
    }

    // Obtener datos del formulario
    const formData = this.profileForm.value;
    
    // Preparar datos para enviar
    const profileData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      phone: formData.phone,
      avatarId: this.selectedAvatarId
    };

    // Incluir cambio de contraseña si está activada la opción
    if (this.changePassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        this.notificationService.error('Las contraseñas no coinciden');
        return;
      }
      profileData.currentPassword = formData.currentPassword;
      profileData.newPassword = formData.newPassword;
    }

    this.authService.updateProfile(profileData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser; // Actualizar usuario en el componente
        this.isEditing = false;
        this.changePassword = false;
        this.notificationService.success('Perfil actualizado correctamente');
        
        // Actualizar campos y estado del formulario
        this.loadUserProfile();
      },
      error: (error) => {
        if (error.status === 400 && error.error.message === 'Contraseña actual incorrecta') {
          this.notificationService.error('La contraseña actual es incorrecta');
        } else {
          this.notificationService.error('Error al actualizar el perfil');
        }
      }
    });
  }

  get userInitials(): string {
    if (!this.user) return '';
    const first = this.user.firstName?.charAt(0) || '';
    const last = this.user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }
  
  get userAvatarUrl(): string {
    if (!this.user) return 'assets/avatars/avatar-1.svg';
    const avatarId = this.user.avatarId || 1;
    return `assets/avatars/avatar-${avatarId}.svg`;
  }
  
  selectAvatar(id: number): void {
    this.selectedAvatarId = id;
    this.profileForm.get('avatarId')?.setValue(id);
  }
  
  sendVerificationEmail(): void {
    this.verifyingEmail = true;
    // Aquí implementaremos la llamada al servicio de autenticación para enviar el correo de verificación
    this.authService.sendVerificationEmail().subscribe({
      next: () => {
        this.notificationService.success('Se ha enviado un correo de verificación a tu email');
        this.verifyingEmail = false;
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Error al enviar el correo de verificación');
        this.verifyingEmail = false;
      }
    });
  }

  get fullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }
}
