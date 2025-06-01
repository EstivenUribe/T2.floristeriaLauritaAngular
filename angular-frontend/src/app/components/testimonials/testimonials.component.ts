import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  reviews: Review[] = [];
  isLoading = false;
  error = '';
  private subscription = new Subscription();

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadFeaturedReviews();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadFeaturedReviews(): void {
    this.isLoading = true;
    this.subscription.add(
      this.reviewService.getFeaturedReviews()
        .subscribe({
          next: (reviews) => {
            this.reviews = reviews;
            this.isLoading = false;
          },
          error: (err) => {
            this.error = 'No se pudieron cargar las reseñas de clientes.';
            this.isLoading = false;
            console.error('Error cargando reseñas:', err);
          }
        })
    );
  }

  // Método de utilidad para mostrar el nombre del usuario
  getUserName(user: any): string {
    if (!user) {
      return 'Cliente';
    }
    if (typeof user === 'string') {
      return 'Cliente';
    }
    return user.nombre || 'Cliente';
  }
}
