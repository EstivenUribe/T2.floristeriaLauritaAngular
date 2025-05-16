import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse, TokenPayload } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  
  // BehaviorSubjects para el estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private tokenExpirationTimer: any = null;
  private tokenRefreshSubscription: Subscription | null = null;
  
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

  // Obtener el token actual
  getToken(): string | null {
    // Primero intentar obtener del localStorage
    const token = localStorage.getItem(this.tokenKey);
    if (token) return token;
    
    // Si no existe en localStorage, intentar sessionStorage
    return sessionStorage.getItem(this.tokenKey);
  }

  // Cerrar sesión
  logout(): void {
    console.log('Cerrando sesión...');
    
    // Limpiar el almacenamiento
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    
    // Limpiar los observables
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.isAdminSubject.next(false);
    
    // Limpiar el temporizador de cierre de sesión automático
    this.clearAutoLogout();
    
    console.log('Sesión cerrada');
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }
  
  // Configurar el cierre de sesión automático
  private setAutoLogout(expirationDuration: number): void {
    // Limpiar el temporizador existente si lo hay
    this.clearAutoLogout();
    
    console.log(`La sesión expirará en ${expirationDuration / 1000} segundos`);
    
    // Configurar un nuevo temporizador
    this.tokenExpirationTimer = setTimeout(() => {
      console.log('La sesión ha expirado automáticamente');
      this.logout();
    }, expirationDuration);
  }
  
  // Limpiar el temporizador de cierre de sesión automático
  private clearAutoLogout(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
    
    if (this.tokenRefreshSubscription) {
      this.tokenRefreshSubscription.unsubscribe();
      this.tokenRefreshSubscription = null;
    }
  }

  // Iniciar sesión
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response, credentials.rememberMe)),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // Iniciar sesión como administrador
  adminLogin(password: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    
    // Simulamos una respuesta del servidor
    if (password === 'admin123') {
      const expiresIn = 3600; // 1 hora en segundos
      const mockResponse: AuthResponse = {
        token: 'admin_token',
        user: {
          _id: 'admin',
          name: 'Administrador',
          email: 'admin@example.com',
          role: 'admin',
          isAdmin: true
        },
        expiresIn: expiresIn
      };
      
      // Guardar la información de autenticación
      this.handleAuthResponse(mockResponse, true);
      
      // Configurar el temporizador para cerrar sesión automáticamente
      this.setAutoLogout(expiresIn * 1000);
      
      this.isLoadingSubject.next(false);
      return of(true);
    } else {
      this.isLoadingSubject.next(false);
      return throwError(() => new Error('Contraseña de administrador incorrecta'));
    }
  }
  }

  // Registrar usuario
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuthResponse(response, false)),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // Obtener información del usuario actual
  getCurrentUser(): Observable<User | null> {
    // Si ya tenemos usuario en el estado, devolverlo
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }
    
    // Si tenemos token pero no usuario, obtener usuario desde API
    const token = this.getToken();
    if (token) {
      this.isLoadingSubject.next(true);
      
      return this.http.get<User>(`${this.apiUrl}/me`).pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.isAdminSubject.next(user.role === 'admin');
          
          // Guardar usuario actualizado
          this.saveUser(user);
        }),
        catchError(error => {
          // Si hay error al obtener usuario, cerrar sesión
          this.logout();
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

  // Métodos privados
  
  // Manejar la respuesta de autenticación
  private handleAuthResponse(authData: AuthResponse, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage;
    
    // Asegurarse de que el rol de administrador esté configurado correctamente
    const isAdmin = authData.user.role === 'admin' || authData.user.isAdmin === true;
    const user: User = {
      ...authData.user,
      isAdmin: isAdmin
    };
    
    // Guardar token y usuario en el almacenamiento
    storage.setItem(this.tokenKey, authData.token);
    storage.setItem(this.userKey, JSON.stringify(user));
    
    // Actualizar los observables
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.isAdminSubject.next(isAdmin);
    
    console.log('Usuario autenticado:', { user, token: authData.token });
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
        // Cargar usuario desde el almacenamiento local
        const userData = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
        
        if (userData) {
          const user: User = JSON.parse(userData);
          const isAdmin = user.role === 'admin' || user.isAdmin === true;
          
          // Actualizar los observables con los datos del usuario
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.isAdminSubject.next(isAdmin);
          
          console.log('Sesión cargada:', { user, isAdmin });
          
          // Configurar el temporizador para cerrar sesión automáticamente
          const expiresIn = 3600 * 1000; // 1 hora por defecto para el token de admin
          this.setAutoLogout(expiresIn);
        } else {
          console.warn('Token encontrado pero no hay datos de usuario');
          this.logout();
        }
      } catch (error) {
        console.error('Error al cargar el estado de autenticación:', error);
        this.logout();
      }
    } else {
      // No hay token, asegurarse de que el estado sea de no autenticado
      this.logout();
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