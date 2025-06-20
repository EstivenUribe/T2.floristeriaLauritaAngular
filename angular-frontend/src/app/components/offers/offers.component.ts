import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component'; // No utilizado en el template
import { ProductCarouselComponent } from '../product-carousel/product-carousel.component';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // NavFooterComponent, // No utilizado en el template
    ProductCarouselComponent
  ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent {

}
