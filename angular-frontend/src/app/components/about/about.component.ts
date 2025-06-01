import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product.service'; 
import { Product, PaginatedResponse } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { NavFooterComponent } from '../shared/nav-footer/nav-footer.component'; // No utilizado en el template
import { CompanyInfoComponent } from '../company-info/company-info.component';

// NUEVAS IMPORTACIONES
import { Review } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule, // Añadido para el formulario reactivo
    // NavFooterComponent, // No utilizado en el template
    CompanyInfoComponent
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  featuredReviews: Review[] = [];
  loadingReviews = true;
  reviewsError: string | null = null;

  // Nuevas propiedades para el formulario de creación de review
  showReviewForm = false;
  reviewForm!: FormGroup;
  availableProducts: Product[] = []; 
  loadingProducts = false;
  submittingReview = false;
  reviewSubmitMessage: string | null = null;
  reviewSubmitError = false;

  constructor(
    private reviewService: ReviewService,
    private productService: ProductService, 
    private fb: FormBuilder             
  ) {}

  ngOnInit(): void {
    this.loadFeaturedReviews();
    this.initReviewForm(); 
  }

  loadFeaturedReviews(): void {
    this.loadingReviews = true;
    this.reviewsError = null;
    this.reviewService.getFeaturedReviews().subscribe({
      next: (reviews) => {
        this.featuredReviews = reviews;
        this.loadingReviews = false;
      },
      error: (err) => {
        console.error('Error al cargar comentarios destacados:', err);
        this.reviewsError = 'No se pudieron cargar los comentarios en este momento. Inténtalo más tarde.';
        this.loadingReviews = false;
      }
    });
  }

  // --- Métodos para el formulario de creación de Reseñas ---

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    this.reviewSubmitMessage = null; 
    this.reviewSubmitError = false;
    if (this.showReviewForm && this.availableProducts.length === 0) {
      this.loadAvailableProducts(); 
    }
    if (!this.showReviewForm) {
        this.reviewForm.reset({ rating: 0 }); 
    }
  }

  initReviewForm(): void {
    this.reviewForm = this.fb.group({
      productId: [null, Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]], 
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  loadAvailableProducts(): void {
    this.loadingProducts = true;
    this.productService.getProducts({ page: 1, limit: 100 }).subscribe({ 
      next: (response: PaginatedResponse<Product>) => {
        this.availableProducts = response.items;
        this.loadingProducts = false;
      },
      error: (err: any) => {
        console.error('Error al cargar productos:', err);
        this.reviewSubmitMessage = 'Error al cargar la lista de productos. Inténtalo más tarde.';
        this.reviewSubmitError = true;
        this.loadingProducts = false;
      }
    });
  }

  setRating(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating);
    this.reviewForm.get('rating')?.markAsTouched(); 
  }

  onSubmitReview(): void {
    this.reviewForm.markAllAsTouched();
    this.reviewSubmitMessage = null;
    this.reviewSubmitError = false;

    if (this.reviewForm.invalid) {
      this.reviewSubmitMessage = 'Por favor, completa todos los campos requeridos.';
      this.reviewSubmitError = true;
      return;
    }

    this.submittingReview = true;
    // userId se asigna en el backend, el modelo Review en frontend no lo requiere al crear
    const reviewData = { 
      productId: this.reviewForm.value.productId,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
      // `approved` será false por defecto en el backend
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (response: { message?: string }) => {
        this.submittingReview = false;
        this.reviewSubmitMessage = response.message || '¡Gracias por tu reseña! Será revisada por un administrador.';
        this.reviewSubmitError = false;
        this.showReviewForm = false;
        this.reviewForm.reset({ rating: 0 });
      },
      error: (err: any) => {
        this.submittingReview = false;
        this.reviewSubmitMessage = err.error?.message || 'Ocurrió un error al enviar tu reseña. Inténtalo más tarde.';
        this.reviewSubmitError = true;
        console.error('Error al crear reseña:', err);
      }
    });
  }
}
