import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent {
  // Si necesitas añadir funcionalidad específica, puedes hacerlo aquí
  
  // Por ejemplo, puedes añadir un método para descargar la política en PDF
  downloadPrivacyPolicy(): void {
    // Implementación futura para descargar PDF
    console.log('Función para descargar política de privacidad en PDF');
    // Aquí podrías agregar código para generar y descargar un PDF
  }
  
  // O un método para navegar de vuelta a la página principal
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}