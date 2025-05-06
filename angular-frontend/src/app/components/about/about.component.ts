import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component';
import { CompanyInfoComponent } from '../company-info/company-info.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavFooterComponent,
    CompanyInfoComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}
