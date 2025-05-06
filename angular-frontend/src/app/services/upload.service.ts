import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = '/api/uploads';

  constructor(private http: HttpClient) { }

  // Subir una imagen
  uploadImage(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    
    return this.http.post<any>(this.apiUrl, formData);
  }
}