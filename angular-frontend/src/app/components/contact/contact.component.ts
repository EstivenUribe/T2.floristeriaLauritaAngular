import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component'; // No utilizado en el template
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // NavFooterComponent, // No utilizado en el template
    FormsModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  submitForm() {
    console.log('Formulario enviado:', this.contactForm);
    // Aquí se implementaría la lógica para enviar el formulario al backend
    
    // Reset del formulario después de enviar
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
    
    // Mostrar mensaje de éxito (en una implementación real se usaría un servicio de notificaciones)
    alert('¡Gracias por contactarnos! Te responderemos a la brevedad.');
  }
}
