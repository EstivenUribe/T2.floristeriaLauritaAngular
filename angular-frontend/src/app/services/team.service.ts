import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap, map, shareReplay, finalize } from 'rxjs/operators';
import { TeamMember, TeamMemberReorder } from '../models/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = '/api/team';
  
  // Caché y estado del servicio
  private teamCache = new BehaviorSubject<TeamMember[]>([]);
  private loadingTeam = new BehaviorSubject<boolean>(false);
  private teamMemberCache = new Map<string, TeamMember>();

  constructor(private http: HttpClient) { }
  
  // Observable público para el estado de carga
  get isLoading(): Observable<boolean> {
    return this.loadingTeam.asObservable();
  }
  
  /**
   * Obtener todos los miembros del equipo
   * @param onlyActive Si es true, solo devuelve miembros activos
   */
  getTeamMembers(onlyActive: boolean = true): Observable<TeamMember[]> {
    // Si ya tenemos miembros en caché, devolverlos inmediatamente
    if (this.teamCache.value.length > 0) {
      // Filtrar si es necesario
      if (onlyActive) {
        return this.teamCache.pipe(
          map(members => members.filter(member => member.activo))
        );
      }
      return this.teamCache.asObservable();
    }
    
    this.loadingTeam.next(true);
    
    // Construir URL con filtro si es necesario
    const url = onlyActive ? `${this.apiUrl}?onlyActive=true` : this.apiUrl;
    
    return this.http.get<{ success: boolean; data: TeamMember[] }>(url).pipe(
      retry(2),
      map(response => response.data),
      tap(members => {
        this.teamCache.next(members);
        // Almacenar en caché individual
        members.forEach(member => {
          this.teamMemberCache.set(member._id!, member);
        });
      }),
      catchError(this.handleError),
      finalize(() => this.loadingTeam.next(false)),
      shareReplay(1)
    );
  }
  
  /**
   * Obtener un miembro del equipo por ID
   * @param id ID del miembro
   */
  getTeamMemberById(id: string): Observable<TeamMember> {
    // Si ya tenemos el miembro en caché individual, devolverlo
    if (this.teamMemberCache.has(id)) {
      return of(this.teamMemberCache.get(id)!);
    }
    
    // Si tenemos todos los miembros en caché general, buscar ahí
    const cachedMembers = this.teamCache.value;
    if (cachedMembers.length > 0) {
      const member = cachedMembers.find(m => m._id === id);
      if (member) {
        // Guardar en caché individual también
        this.teamMemberCache.set(id, member);
        return of(member);
      }
    }
    
    // Si no está en caché, buscar en la API
    this.loadingTeam.next(true);
    
    return this.http.get<{ success: boolean; data: TeamMember }>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      map(response => response.data),
      tap(member => {
        // Guardar en caché individual
        this.teamMemberCache.set(id, member);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingTeam.next(false))
    );
  }
  
  /**
   * Crear un nuevo miembro del equipo
   * @param memberData Datos del miembro
   * @param foto Archivo de imagen
   */
  createTeamMember(memberData: TeamMember, foto?: File): Observable<TeamMember> {
    this.loadingTeam.next(true);
    
    // Crear FormData para enviar tanto datos como archivo
    const formData = new FormData();
    
    // Añadir todos los campos del miembro
    Object.keys(memberData).forEach(key => {
      // Manejar redes sociales como objeto anidado
      if (key === 'redesSociales' && memberData.redesSociales) {
        Object.keys(memberData.redesSociales).forEach(socialKey => {
          const value = memberData.redesSociales![socialKey as keyof typeof memberData.redesSociales];
          if (value) {
            formData.append(`redesSociales[${socialKey}]`, value);
          }
        });
      } else {
        // Para el resto de campos
        const value = memberData[key as keyof TeamMember];
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Añadir la foto si existe
    if (foto) {
      formData.append('foto', foto, foto.name);
    }
    
    return this.http.post<{ success: boolean; data: TeamMember }>(this.apiUrl, formData).pipe(
      map(response => response.data),
      tap(newMember => {
        // Actualizar caché
        const currentMembers = this.teamCache.value;
        this.teamCache.next([...currentMembers, newMember]);
        this.teamMemberCache.set(newMember._id!, newMember);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingTeam.next(false))
    );
  }
  
  /**
   * Actualizar un miembro del equipo
   * @param id ID del miembro
   * @param memberData Datos a actualizar
   * @param foto Nueva foto (opcional)
   */
  updateTeamMember(id: string, memberData: Partial<TeamMember>, foto?: File): Observable<TeamMember> {
    this.loadingTeam.next(true);
    
    // Crear FormData para enviar tanto datos como archivo
    const formData = new FormData();
    
    // Añadir todos los campos a actualizar
    Object.keys(memberData).forEach(key => {
      // Manejar redes sociales como objeto anidado
      if (key === 'redesSociales' && memberData.redesSociales) {
        Object.keys(memberData.redesSociales).forEach(socialKey => {
          const value = memberData.redesSociales![socialKey as keyof typeof memberData.redesSociales];
          if (value !== undefined) {
            formData.append(`redesSociales[${socialKey}]`, value || '');
          }
        });
      } else {
        // Para el resto de campos
        const value = memberData[key as keyof TeamMember];
        if (value !== undefined) {
          formData.append(key, value === null ? '' : value.toString());
        }
      }
    });
    
    // Añadir la foto si existe
    if (foto) {
      formData.append('foto', foto, foto.name);
    }
    
    return this.http.put<{ success: boolean; data: TeamMember }>(`${this.apiUrl}/${id}`, formData).pipe(
      map(response => response.data),
      tap(updatedMember => {
        // Actualizar caché
        const currentMembers = this.teamCache.value;
        const index = currentMembers.findIndex(m => m._id === id);
        
        if (index !== -1) {
          const updatedMembers = [...currentMembers];
          updatedMembers[index] = updatedMember;
          this.teamCache.next(updatedMembers);
        }
        
        this.teamMemberCache.set(id, updatedMember);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingTeam.next(false))
    );
  }
  
  /**
   * Cambiar el estado activo/inactivo de un miembro
   * @param id ID del miembro
   */
  toggleMemberStatus(id: string): Observable<TeamMember> {
    this.loadingTeam.next(true);
    
    return this.http.patch<{ success: boolean; data: TeamMember }>(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
      map(response => response.data),
      tap(updatedMember => {
        // Actualizar caché
        const currentMembers = this.teamCache.value;
        const index = currentMembers.findIndex(m => m._id === id);
        
        if (index !== -1) {
          const updatedMembers = [...currentMembers];
          updatedMembers[index] = updatedMember;
          this.teamCache.next(updatedMembers);
        }
        
        this.teamMemberCache.set(id, updatedMember);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingTeam.next(false))
    );
  }
  
  /**
   * Eliminar un miembro del equipo
   * @param id ID del miembro a eliminar
   */
  deleteTeamMember(id: string): Observable<any> {
    this.loadingTeam.next(true);
    
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Actualizar caché
        const currentMembers = this.teamCache.value;
        this.teamCache.next(currentMembers.filter(m => m._id !== id));
        this.teamMemberCache.delete(id);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingTeam.next(false))
    );
  }
  
  /**
   * Reordenar los miembros del equipo
   * @param members Array de objetos {id, orden}
   */
  reorderTeamMembers(members: TeamMemberReorder[]): Observable<any> {
    this.loadingTeam.next(true);
    
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/reorder`, { members }).pipe(
      tap(() => {
        // Actualizar caché con el nuevo orden
        const currentMembers = [...this.teamCache.value];
        
        // Aplicar el nuevo orden a los miembros en caché
        members.forEach(item => {
          const member = currentMembers.find(m => m._id === item.id);
          if (member) {
            member.orden = item.orden;
          }
        });
        
        // Ordenar la caché por el campo orden
        currentMembers.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        
        // Actualizar caché
        this.teamCache.next(currentMembers);
      }),
      catchError(this.handleError),
      finalize(() => this.loadingTeam.next(false))
    );
  }
  
  /**
   * Forzar recarga de los datos desde la API
   */
  refreshTeam(): Observable<TeamMember[]> {
    // Limpiar caché
    this.teamCache.next([]);
    this.teamMemberCache.clear();
    
    // Obtener datos frescos
    return this.getTeamMembers(false);
  }
  
  /**
   * Manejador centralizado de errores
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del backend
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 404:
            errorMessage = 'Miembro del equipo no encontrado';
            break;
          case 403:
            errorMessage = 'No tiene permiso para realizar esta acción';
            break;
          case 400:
            errorMessage = 'Datos inválidos. Por favor verifique la información.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.statusText || 'Desconocido'}`;
        }
      }
    }
    
    console.error('Error en TeamService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}