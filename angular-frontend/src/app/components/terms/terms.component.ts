import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyInfoService } from '../../services/company-info.service';
import { CompanyInfo } from '../../models/company-info.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class TermsComponent implements OnInit, OnDestroy {
  companyInfo: CompanyInfo | null = null;
  isLoading = true;
  error = '';
  private subscription = new Subscription();

  constructor(private companyInfoService: CompanyInfoService) {}

  ngOnInit(): void {
    this.loadCompanyInfo();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCompanyInfo(): void {
    this.isLoading = true;
    this.subscription.add(
      this.companyInfoService.getCompanyInfo().subscribe({
        next: (info) => {
          this.companyInfo = info;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'No se pudieron cargar los términos y condiciones. Por favor, inténtelo de nuevo más tarde.';
          this.isLoading = false;
          console.error('Error cargando información de la empresa:', err);
        }
      })
    );
  }

  // Función auxiliar para formatear fecha
  formatDate(date: Date | undefined): string {
    if (!date) return 'No disponible';
    try {
      // Intentar convertir string a Date si es necesario
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (error) {
      return 'Fecha inválida';
    }
  }
}
