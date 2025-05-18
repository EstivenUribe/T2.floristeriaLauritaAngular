import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews'; // Asume este endpoint

  private _isLoading = new BehaviorSubject<boolean>(false);
  public readonly isLoading = this._isLoading.asObservable();

  constructor(private http: HttpClient) { }

  private setLoading(isLoading: boolean): void {
    this._isLoading.next(isLoading);
  }

  getReviews(): Observable<Review[]> {
    this.setLoading(true);
    return this.http.get<Review[]>(this.apiUrl)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // NUEVO MÉTODO para actualizar un review (ej. para aprobarlo)
  updateReview(id: string, reviewData: Partial<Review>): Observable<Review> {
    this.setLoading(true);
    return this.http.patch<Review>(`${this.apiUrl}/${id}/status`, reviewData)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // NUEVO MÉTODO para obtener solo las reseñas destacadas/aprobadas
  getFeaturedReviews(): Observable<Review[]> {
    this.setLoading(true);
    return this.http.get<Review[]>(`${this.apiUrl}/featured`) // Nuevo endpoint
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // NUEVO MÉTODO para crear una reseña
  createReview(reviewData: Partial<Review>): Observable<any> { 
    this.setLoading(true);
    return this.http.post<any>(this.apiUrl, reviewData) 
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // Ejemplo de cómo podrías añadir un método para eliminar un review
  deleteReview(id: string): Observable<any> {
    this.setLoading(true);
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    // 'this' aquí podría no ser la instancia del servicio si no se usa .bind(this)
    // Si setLoading es un método de esta clase, this.setLoading(false) podría fallar.
    // Por eso se usa .bind(this) en las llamadas a catchError.
    if (this && typeof this.setLoading === 'function') {
      this.setLoading(false);
    }
    let errorMessage = 'Algo salió mal; por favor, inténtalo de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de respuesta no exitoso.
      // El cuerpo de la respuesta puede contener pistas sobre qué salió mal.
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += `\nDetalles: ${error.error}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
