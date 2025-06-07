import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component'; // No utilizado en el template
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // NavFooterComponent, // No utilizado en el template
    ReactiveFormsModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, this.emailValidator]],
      phone: ['', [Validators.pattern(/^[\+]?[0-9]{7,15}$/)]],
      subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  get f() { return this.contactForm.controls; }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  emailValidator(control: any) {
    const email = control.value;
    if (!email) return null;

    // Verificar formato básico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { invalidEmail: true };
    }

    // Verificar que tenga al menos un punto después del @
    const parts = email.split('@');
    if (parts.length !== 2) return { invalidEmail: true };

    const domain = parts[1];
    if (!domain.includes('.')) return { invalidEmail: true };

    // Verificar que no termine en punto
    if (domain.endsWith('.')) return { invalidEmail: true };

    return null;
  }

  submitForm() {
    if (this.contactForm.valid) {
      console.log('Formulario enviado:', this.contactForm.value);
      // Aquí se implementaría la lógica para enviar el formulario al backend

      // Reset del formulario después de enviar
      this.contactForm.reset();

      // Mostrar mensaje de éxito (en una implementación real se usaría un servicio de notificaciones)
      alert('¡Gracias por contactarnos! Te responderemos a la brevedad.');
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}
