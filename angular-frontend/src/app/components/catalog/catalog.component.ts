import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component'; // No utilizado en el template
import { ProductListComponent } from '../product-list/product-list.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // NavFooterComponent, // No utilizado en el template
    ProductListComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent {

}
