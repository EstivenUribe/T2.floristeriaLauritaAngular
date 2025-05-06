import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyInfo } from '../models/company-info.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyInfoService {
  private apiUrl = '/api/company-info';

  constructor(private http: HttpClient) { }

  // Obtener información de la empresa
  getCompanyInfo(): Observable<CompanyInfo> {
    return this.http.get<CompanyInfo>(this.apiUrl);
  }

  // Actualizar información de la empresa
  updateCompanyInfo(companyInfo: CompanyInfo): Observable<CompanyInfo> {
    return this.http.put<CompanyInfo>(this.apiUrl, companyInfo);
  }
}