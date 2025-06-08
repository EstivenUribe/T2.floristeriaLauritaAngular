import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.apiUrl}/api/email`;

  constructor(private http: HttpClient) { }

  /**
   * Envía un mensaje de contacto al servidor y envía un correo de confirmación al usuario
   * @param contactData Datos del formulario de contacto
   * @returns Observable con la respuesta del servidor
   */
  sendContactMessage(contactData: ContactMessage): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, contactData);
  }
}
