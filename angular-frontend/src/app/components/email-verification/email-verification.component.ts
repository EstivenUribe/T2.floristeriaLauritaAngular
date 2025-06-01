import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Obtener el token de la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (!token) {
        this.isLoading = false;
        this.errorMessage = 'El enlace de verificación no es válido. No se encontró ningún token.';
        return;
      }

      this.verifyEmail(token);
    });
  }

  verifyEmail(token: string): void {
    this.isLoading = true;
    
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.notificationService.success('¡Tu correo electrónico ha sido verificado con éxito!');
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'No se pudo verificar tu correo electrónico. Por favor, intenta nuevamente.';
        this.notificationService.error(this.errorMessage);
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  resendVerification(): void {
    this.isLoading = true;
    
    this.authService.sendVerificationEmail().subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success('Se ha enviado un nuevo correo de verificación a tu email');
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al enviar el correo de verificación';
        this.notificationService.error(this.errorMessage);
      }
    });
  }
}
