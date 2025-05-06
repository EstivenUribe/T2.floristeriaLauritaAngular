import { Component, OnInit } from '@angular/core';
import { CompanyInfoService } from '../../services/company-info.service';
import { CompanyInfo } from '../../models/company-info.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.css']
})
export class CompanyInfoComponent implements OnInit {
  companyInfo: CompanyInfo | null = null;
  loading = true;
  error = '';

  constructor(private companyInfoService: CompanyInfoService) { }

  ngOnInit(): void {
    this.loadCompanyInfo();
  }

  loadCompanyInfo(): void {
    this.loading = true;
    this.companyInfoService.getCompanyInfo()
      .subscribe({
        next: (data) => {
          this.companyInfo = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar información de la empresa.';
          this.loading = false;
          console.error('Error al cargar información de la empresa:', err);
        }
      });
  }
}