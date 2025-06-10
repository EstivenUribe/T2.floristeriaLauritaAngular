import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, finalize, map } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse, TokenPayload } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // En producción, usa ruta relativa para IIS proxy
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  
  // BehaviorSubjects para el estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  
  // Observables públicos
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();
  public isAdmin$ = this.isAdminSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) { 
    // Inicializar estado de autenticación al cargar el servicio
    this.loadAuthState();
  }
  
  // Iniciar sesión
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, credentials).pipe(
      tap(response => this.handleAuthResponse(response, credentials.rememberMe)),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  
  // Iniciar sesión como administrador
  adminLogin(password: string): Observable<boolean> {
    // En un caso real, esto sería una petición al backend
    // Por ahora, simulamos una verificación simple
    this.isLoadingSubject.next(true);
    
    // Implementar con llamada real a API en producción
    if (password === 'admin123') {
      const mockResponse: AuthResponse = {
        token: 'admin_token',
        user: {
          _id: 'admin',
          username: 'Administrador',
          email: 'admin@example.com',
          role: 'admin'
        }
      };
      
      this.handleAuthResponse(mockResponse, false);
      this.isLoadingSubject.next(false);
      return of(true);
    } else {
      this.isLoadingSubject.next(false);
      return throwError(() => new Error('Contraseña de administrador incorrecta'));
    }
  }
  
  // Registrar usuario
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, userData).pipe(
      tap(response => this.handleAuthResponse(response, false)),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  
  // Cerrar sesión
  logout(): void {
    // Eliminar token y datos de usuario
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    
    // Actualizar estado
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.isAdminSubject.next(false);
    
    // Redirigir a inicio
    this.router.navigate(['/']);
  }
  
  // Obtener información del usuario actual
  getCurrentUser(forceRefresh: boolean = false): Observable<User | null> {
    // Si ya tenemos usuario en el estado y no se pide refresh, devolverlo
    if (this.currentUserSubject.value && !forceRefresh) {
      return of(this.currentUserSubject.value);
    }
    
    // Si tenemos token, obtener usuario desde API
    const token = this.getToken();
    if (token) {
      this.isLoadingSubject.next(true);
      
      return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
        tap(user => {
          console.log('Usuario recuperado del servidor:', user);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.isAdminSubject.next(user.role === 'admin');
          
          // Guardar usuario actualizado
          this.saveUser(user);
        }),
        catchError(error => {
          console.error('Error al obtener perfil de usuario:', error);
          // Solo cerrar sesión si hay error de autenticación
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => error);
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
    }
    
    // Si no hay token, no hay usuario autenticado
    return of(null);
  }
  
  // Actualizar perfil de usuario
  updateProfile(userData: Partial<User>): Observable<User> {
    this.isLoadingSubject.next(true);
    
    return this.http.put<User>(`${this.apiUrl}/profile`, userData).pipe(
      tap(updatedUser => {
        // Actualizar estado
        const currentUser = this.currentUserSubject.value;
        this.currentUserSubject.next({ ...currentUser, ...updatedUser });
        
        // Actualizar almacenamiento
        this.saveUser({ ...currentUser, ...updatedUser } as User);
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  
  // Cambiar contraseña del usuario
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<any>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  
  // Verificar token
  isTokenValid(): Observable<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return of(false);
    }
    
    try {
      const payload = this.parseToken(token);
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        this.logout();
        return of(false);
      }
      
      return of(true);
    } catch (error) {
      this.logout();
      return of(false);
    }
  }
  
  // Obtener token actual
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }
  
  // Verificación de correo electrónico
  sendVerificationEmail(): Observable<any> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<any>(`${this.apiUrl}/send-verification-email`, {}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  
  // Verificar correo electrónico con token
  verifyEmail(token: string): Observable<any> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<any>(`${this.apiUrl}/verify-email`, { token }).pipe(
      tap(response => {
        // Actualizar el estado del usuario si la verificación es exitosa
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = { ...currentUser, emailVerified: true };
          this.currentUserSubject.next(updatedUser);
          this.saveUser(updatedUser);
        }
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  
  // Métodos privados
  
  // Manejar respuesta de autenticación
  private handleAuthResponse(response: AuthResponse, rememberMe: boolean = false): void {
    const { token, user } = response;
    
    // Guardar token y usuario
    this.saveToken(token, rememberMe);
    this.saveUser(user);
    
    // Actualizar estado
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.isAdminSubject.next(user.role === 'admin');
  }
  
  // Guardar token
  private saveToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      sessionStorage.setItem(this.tokenKey, token);
    }
  }
  
  // Guardar datos de usuario
  private saveUser(user: User): void {
    const storage = localStorage.getItem(this.tokenKey) ? localStorage : sessionStorage;
    storage.setItem(this.userKey, JSON.stringify(user));
  }
  
  // Cargar estado de autenticación al iniciar
  private loadAuthState(): void {
    const token = this.getToken();
    
    if (token) {
      try {
        // Verificar si el token es válido
        const payload = this.parseToken(token);
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          this.logout();
          return;
        }
        
        // Cargar usuario desde almacenamiento
        const storage = localStorage.getItem(this.tokenKey) ? localStorage : sessionStorage;
        const userJson = storage.getItem(this.userKey);
        
        if (userJson) {
          const user = JSON.parse(userJson) as User;
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.isAdminSubject.next(user.role === 'admin');
        } else {
          // Si tenemos token pero no usuario, intentar obtener usuario
          this.getCurrentUser().subscribe();
        }
      } catch (error) {
        this.logout();
      }
    }
  }
  
  // Analizar payload del token JWT
  private parseToken(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as TokenPayload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
  
  // Manejador de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error de autenticación';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del backend
      switch (error.status) {
        case 400:
          errorMessage = 'Datos de acceso inválidos';
          break;
        case 401:
          errorMessage = 'Credenciales incorrectas';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 409:
          errorMessage = 'El correo electrónico ya está registrado';
          break;
        case 500:
          errorMessage = 'Error en el servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Error de autenticación:', error);
    return throwError(() => new Error(errorMessage));
  }
}