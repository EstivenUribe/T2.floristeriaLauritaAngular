import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { TeamService } from '../../services/team.service';
import { BannerService } from '../../services/banner.service';
import { CompanyInfoService } from '../../services/company-info.service';
import { UploadService } from '../../services/upload.service';
import { Product, PaginationParams } from '../../models/product.model';
import { TeamMember } from '../../models/team-member.model';
import { Banner, BannerSection } from '../../models/banner.model';
import { CompanyInfo, Valor, Integrante } from '../../models/company-info.model';
import { Review, UserReviewInfo, ProductReviewInfo } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  // Nuevos métodos para la plantilla de reviews
  getReviewUserName(user: UserReviewInfo | string): string {
    if (typeof user === 'object' && user !== null && user.nombre) {
      return user.nombre;
    }
    if (typeof user === 'string') {
      return user; // Devuelve el ID si no es un objeto con nombre
    }
    return 'Usuario Desconocido'; // Fallback
  }

  getReviewProductName(product: ProductReviewInfo | string): string {
    if (typeof product === 'object' && product !== null && product.nombre) {
      return product.nombre;
    }
    if (typeof product === 'string') {
      return product; // Devuelve el ID si no es un objeto con nombre
    }
    return 'Producto Desconocido'; // Fallback
  }

  // State variables
  activeTab: 'productos' | 'equipo' | 'banners' | 'politicas' | 'comentarios' | 'configuracion' = 'productos';

  // Productos
  products: Product[] = [];
  productForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  isEditing = false;
  currentProductId = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;

  // Equipo
  teamMembers: TeamMember[] = [];
  teamMemberForm: FormGroup;
  loadingTeamMembers = false;
  submittedTeamMember = false;
  isEditingTeamMember = false;
  currentTeamMemberId = '';
  teamMemberSelectedFile: File | null = null;
  teamMemberImagePreview: string | null = null;
  uploadingTeamMemberImage = false;

  // Banners
  banners: Banner[] = [];
  filteredBanners: Banner[] = [];
  bannerForm: FormGroup;
  loadingBanners = false;
  submittedBanner = false;
  isEditingBanner = false;
  currentBannerId = '';
  bannerSelectedFile: File | null = null;
  bannerImagePreview: string | null = null;
  uploadingBannerImage = false;
  bannerFilter: string = 'all';

  // Configuración
  companyInfoForm: FormGroup;
  loadingCompanyInfo = false;
  submittedCompanyInfo = false;
  companyInfo: CompanyInfo | null = null;

  // Historia Image Preview & Upload
  historiaSelectedFile: File | null = null;
  historiaImagePreview: string | ArrayBuffer | null = null;
  uploadingHistoriaImage = false;

  // Reviews
  reviews: Review[] = [];
  loadingReviews = false;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private teamService: TeamService,
    private bannerService: BannerService,
    private companyInfoService: CompanyInfoService,
    private uploadService: UploadService,
    private reviewService: ReviewService
  ) {
    // Initialize product form
    this.productForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      imagen: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      rebaja: [false]
    });

    // Initialize team member form
    this.teamMemberForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cargo: ['', Validators.required],
      biografia: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(500)]],
      foto: ['', Validators.required],
      activo: [true],
      redesSociales: this.formBuilder.group({
        facebook: [''],
        instagram: [''],
        twitter: [''],
        linkedin: ['']
      })
    });

    // Initialize banner form
    this.bannerForm = this.formBuilder.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      subtitulo: ['', Validators.maxLength(200)],
      imagen: ['', Validators.required],
      url: [''],
      seccion: ['', Validators.required],
      fechaInicio: [new Date()],
      fechaFin: [null],
      textoBoton: ['', Validators.maxLength(30)],
      posicionTexto: ['center'],
      animacion: ['fade'],
      activo: [true],
      color: this.formBuilder.group({
        textoPrincipal: ['#FFFFFF'],
        textoSecundario: ['#FFFFFF'],
        boton: ['#9966CC'],
        overlay: ['rgba(0,0,0,0.3)']
      })
    });

    // Initialize company info form
    this.companyInfoForm = this.formBuilder.group({
      _id: [''],
      mision: [''],
      vision: [''],
      historiaTitulo: [''],
      historiaTexto: [''],
      historiaImagenUrl: [''], // Se llenará después de subir la imagen
      valores: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    // Load initial data for the active tab
    this.loadProducts();

    // Subscribe to loading states for UI feedback
    this.productService.isLoading.subscribe(isLoading => {
      this.loading = isLoading;
    });

    this.teamService.isLoading.subscribe(isLoading => {
      this.loadingTeamMembers = isLoading;
    });

    this.bannerService.isLoading.subscribe(isLoading => {
      this.loadingBanners = isLoading;
    });

    this.companyInfoService.isLoading.subscribe(isLoading => {
      this.loadingCompanyInfo = isLoading;
    });

    this.reviewService.isLoading.subscribe(isLoading => {
      this.loadingReviews = isLoading; // O usar una variable local si se prefiere control más granular
    });
  }

  // Tab Navigation
  setActiveTab(tab: 'productos' | 'equipo' | 'banners' | 'politicas' | 'comentarios' | 'configuracion'): void {
    this.activeTab = tab;
    this.resetMessages();

    // Load data for the selected tab if not loaded yet
    switch(tab) {
      case 'productos':
        if (this.products.length === 0) {
          this.loadProducts();
        }
        break;
      case 'equipo':
        if (this.teamMembers.length === 0) {
          this.loadTeamMembers();
        }
        break;
      case 'banners':
        if (this.banners.length === 0) {
          this.loadBanners();
        }
        break;
      case 'politicas':
        if (!this.companyInfo) {
          this.loadCompanyInfo();
        }
        break;
      case 'comentarios':
        if (this.reviews.length === 0 && !this.loadingReviews) {
          this.loadReviews();
        }
        break;
      case 'configuracion':
        // Esta es la nueva pestaña de Configuración, inicialmente vacía
        console.log('Pestaña Configuración (nueva) seleccionada.');
        break;
    }
  }

  resetMessages(): void {
    this.success = '';
    this.error = '';
  }

  // PRODUCTOS
  loadProducts(): void {
    // Using the new paginated API
    const params: PaginationParams = {
      page: 1,
      limit: 100, // Fetch a large number of products for admin view
      filter: {
        sortBy: 'fechaCreacion',
        sortDirection: 'desc'
      }
    };

    this.productService.getProducts(params)
      .subscribe({
        next: (response) => {
          this.products = response.items;
        },
        error: (err) => {
          this.error = 'Error al cargar productos.';
          console.error('Error al cargar productos admin:', err);
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    this.resetMessages();

    // Validate form
    if (this.productForm.invalid) {
      return;
    }

    const product: Product = this.productForm.value;

    if (this.isEditing) {
      // Update existing product
      this.productService.updateProduct(this.currentProductId, product)
        .subscribe({
          next: () => {
            this.success = 'Producto actualizado correctamente.';
            this.loadProducts();
            this.resetForm();
          },
          error: (err) => {
            this.error = 'Error al actualizar producto.';
            console.error('Error al actualizar producto:', err);
          }
        });
    } else {
      // Create new product
      this.productService.createProduct(product)
        .subscribe({
          next: () => {
            this.success = 'Producto creado correctamente.';
            this.loadProducts();
            this.resetForm();
          },
          error: (err) => {
            this.error = 'Error al crear producto.';
            console.error('Error al crear producto:', err);
          }
        });
    }
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.currentProductId = product._id as string;
    this.productForm.patchValue({
      nombre: product.nombre,
      descripcion: product.descripcion,
      imagen: product.imagen,
      precio: product.precio,
      categoria: product.categoria || '',
      rebaja: product.rebaja
    });

    // Set image preview if available
    if (product.imagen) {
      this.imagePreview = product.imagen;
    }
  }

  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(id)
        .subscribe({
          next: () => {
            this.success = 'Producto eliminado correctamente.';
            this.loadProducts();
          },
          error: (err) => {
            this.error = 'Error al eliminar producto.';
            console.error('Error al eliminar producto:', err);
          }
        });
    }
  }

  resetForm(): void {
    this.submitted = false;
    this.isEditing = false;
    this.currentProductId = '';
    this.selectedFile = null;
    this.imagePreview = null;
    this.productForm.reset({
      nombre: '',
      descripcion: '',
      imagen: '',
      precio: 0,
      categoria: '',
      rebaja: false
    });
  }

  // Product file handling
  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFile = inputElement.files[0];

      // Create preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      return;
    }

    this.uploadingImage = true;
    this.resetMessages();

    this.uploadService.uploadImage(this.selectedFile)
      .subscribe({
        next: (response) => {
          // Update form with image path
          this.productForm.patchValue({
            imagen: response.imagePath
          });
          this.uploadingImage = false;
          this.success = 'Imagen subida correctamente';
        },
        error: (err) => {
          this.error = 'Error al subir la imagen';
          this.uploadingImage = false;
          console.error('Error al subir imagen:', err);
        }
      });
  }

  // TEAM MEMBERS
  loadTeamMembers(): void {
    this.teamService.getTeamMembers(false) // Get all team members including inactive
      .subscribe({
        next: (data) => {
          this.teamMembers = data;
        },
        error: (err) => {
          this.error = 'Error al cargar miembros del equipo.';
          console.error('Error al cargar miembros del equipo:', err);
        }
      });
  }

  onSubmitTeamMember(): void {
    this.submittedTeamMember = true;
    this.resetMessages();

    // Validate form
    if (this.teamMemberForm.invalid) {
      return;
    }

    const teamMember: TeamMember = this.teamMemberForm.value;

    if (this.isEditingTeamMember) {
      // Update existing team member
      this.teamService.updateTeamMember(this.currentTeamMemberId, teamMember)
        .subscribe({
          next: () => {
            this.success = 'Miembro del equipo actualizado correctamente.';
            this.loadTeamMembers();
            this.resetTeamMemberForm();
          },
          error: (err) => {
            this.error = 'Error al actualizar miembro del equipo.';
            console.error('Error al actualizar miembro del equipo:', err);
          }
        });
    } else {
      // Create new team member
      this.teamService.createTeamMember(teamMember)
        .subscribe({
          next: () => {
            this.success = 'Miembro del equipo creado correctamente.';
            this.loadTeamMembers();
            this.resetTeamMemberForm();
          },
          error: (err) => {
            this.error = 'Error al crear miembro del equipo.';
            console.error('Error al crear miembro del equipo:', err);
          }
        });
    }
  }

  editTeamMember(teamMember: TeamMember): void {
    this.isEditingTeamMember = true;
    this.currentTeamMemberId = teamMember._id as string;

    // Update form with team member data
    this.teamMemberForm.patchValue({
      nombre: teamMember.nombre,
      apellido: teamMember.apellido,
      cargo: teamMember.cargo,
      biografia: teamMember.biografia,
      foto: teamMember.foto,
      activo: teamMember.activo,
      redesSociales: teamMember.redesSociales || {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      }
    });

    // Set image preview if available
    if (teamMember.foto) {
      this.teamMemberImagePreview = teamMember.foto;
    }
  }

  deleteTeamMember(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?')) {
      this.teamService.deleteTeamMember(id)
        .subscribe({
          next: () => {
            this.success = 'Miembro del equipo eliminado correctamente.';
            this.loadTeamMembers();
          },
          error: (err) => {
            this.error = 'Error al eliminar miembro del equipo.';
            console.error('Error al eliminar miembro del equipo:', err);
          }
        });
    }
  }

  toggleTeamMemberStatus(id: string): void {
    this.teamService.toggleMemberStatus(id)
      .subscribe({
        next: (updatedMember) => {
          this.success = `Miembro del equipo ${updatedMember.activo ? 'activado' : 'desactivado'} correctamente.`;
          this.loadTeamMembers();
        },
        error: (err) => {
          this.error = 'Error al cambiar el estado del miembro del equipo.';
          console.error('Error al cambiar estado del miembro:', err);
        }
      });
  }

  resetTeamMemberForm(): void {
    this.submittedTeamMember = false;
    this.isEditingTeamMember = false;
    this.currentTeamMemberId = '';
    this.teamMemberSelectedFile = null;
    this.teamMemberImagePreview = null;
    this.teamMemberForm.reset({
      nombre: '',
      apellido: '',
      cargo: '',
      biografia: '',
      foto: '',
      activo: true,
      redesSociales: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      }
    });
  }

  // Team member file handling
  onTeamMemberFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.teamMemberSelectedFile = inputElement.files[0];

      // Create preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        this.teamMemberImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.teamMemberSelectedFile);
    }
  }

  uploadTeamMemberImage(): void {
    if (!this.teamMemberSelectedFile) {
      return;
    }

    this.uploadingTeamMemberImage = true;
    this.resetMessages();

    this.uploadService.uploadImage(this.teamMemberSelectedFile, 'team')
      .subscribe({
        next: (response) => {
          // Update form with image path
          this.teamMemberForm.patchValue({
            foto: response.imagePath
          });
          this.uploadingTeamMemberImage = false;
          this.success = 'Foto subida correctamente';
        },
        error: (err) => {
          this.error = 'Error al subir la foto';
          this.uploadingTeamMemberImage = false;
        }
      });
  }

  // BANNERS
  loadBanners(): void {
    this.bannerService.getAllBanners()
      .subscribe({
        next: (data: Banner[]) => {
          this.banners = data;
          this.filterBanners(this.bannerFilter);
        },
        error: (err: any) => {
          this.error = 'Error al cargar los banners';
          console.error('Error al cargar banners:', err);
        }
      });
  }
  
  filterBanners(section: string): void {
    this.bannerFilter = section;
    if (section === 'all') {
      this.filteredBanners = [...this.banners];
    } else {
      this.filteredBanners = this.banners.filter(
        banner => banner.seccion === section
      );
    }
  }
  
  onSubmitBanner(): void {
    this.submittedBanner = true;
    this.resetMessages();
    
    // Validate form
    if (this.bannerForm.invalid) {
      return;
    }

    const banner: Banner = this.bannerForm.value;

    if (this.isEditingBanner) {
      // Update existing banner
      this.bannerService.updateBanner(this.currentBannerId, banner)
        .subscribe({
          next: () => {
            this.success = 'Banner actualizado correctamente.';
            this.loadBanners();
            this.resetBannerForm();
          },
          error: (err: any) => {
            this.error = 'Error al actualizar banner.';
            console.error('Error al actualizar banner:', err);
          }
        });
    } else {
      // Create new banner
      this.bannerService.createBanner(banner)
        .subscribe({
          next: () => {
            this.success = 'Banner creado correctamente.';
            this.loadBanners();
            this.resetBannerForm();
          },
          error: (err: any) => {
            this.error = 'Error al crear banner.';
            console.error('Error al crear banner:', err);
          }
        });
    }
  }
  
  editBanner(banner: Banner): void {
    this.isEditingBanner = true;
    this.currentBannerId = banner._id as string;

    // Convert date strings to Date objects
    const fechaInicio = banner.fechaInicio ? new Date(banner.fechaInicio) : new Date();
    const fechaFin = banner.fechaFin ? new Date(banner.fechaFin) : null;

    // Format dates for input[type=date]
    const formattedFechaInicio = fechaInicio.toISOString().split('T')[0];
    const formattedFechaFin = fechaFin ? fechaFin.toISOString().split('T')[0] : null;

    // Update form with banner data
    this.bannerForm.patchValue({
      titulo: banner.titulo,
      subtitulo: banner.subtitulo || '',
      imagen: banner.imagen,
      url: banner.url || '',
      seccion: banner.seccion,
      fechaInicio: formattedFechaInicio,
      fechaFin: formattedFechaFin,
      textoBoton: banner.textoBoton || '',
      posicionTexto: banner.posicionTexto || 'center',
      animacion: banner.animacion || 'fade',
      activo: banner.activo !== undefined ? banner.activo : true,
      color: banner.color || {
        textoPrincipal: '#FFFFFF',
        textoSecundario: '#FFFFFF',
        boton: '#9966CC',
        overlay: 'rgba(0,0,0,0.3)'
      }
    });

    // Set image preview if available
    if (banner.imagen) {
      this.bannerImagePreview = banner.imagen;
    }
  }

  deleteBanner(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este banner?')) {
      this.bannerService.deleteBanner(id)
        .subscribe({
          next: () => {
            this.success = 'Banner eliminado correctamente.';
            this.loadBanners();
          },
          error: (err: any) => {
            this.error = 'Error al eliminar banner.';
            console.error('Error al eliminar banner:', err);
          }
        });
    }
  }

  toggleBannerStatus(id: string): void {
    this.bannerService.toggleBannerStatus(id)
      .subscribe({
        next: (updatedBanner: Banner) => {
          this.success = `Banner ${updatedBanner.activo ? 'activado' : 'desactivado'} correctamente.`;
          this.loadBanners();
        },
        error: (err: any) => {
          this.error = 'Error al cambiar el estado del banner.';
          console.error('Error al cambiar estado del banner:', err);
        }
      });
  }

  resetBannerForm(): void {
    this.submittedBanner = false;
    this.isEditingBanner = false;
    this.currentBannerId = '';
    this.bannerSelectedFile = null;
    this.bannerImagePreview = null;

    // Initialize with default values
    this.bannerForm.reset({
      titulo: '',
      subtitulo: '',
      imagen: '',
      url: '',
      seccion: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: null,
      textoBoton: '',
      posicionTexto: 'center',
      animacion: 'fade',
      activo: true,
      color: {
        textoPrincipal: '#FFFFFF',
        textoSecundario: '#FFFFFF',
        boton: '#9966CC',
        overlay: 'rgba(0,0,0,0.3)'
      }
    });
  }

  // Banner file handling
  onBannerFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.bannerSelectedFile = inputElement.files[0];

      // Create preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.bannerSelectedFile);
    }
  }

  uploadBannerImage(): void {
    if (!this.bannerSelectedFile) {
      return;
    }

    this.uploadingBannerImage = true;
    this.resetMessages();

    this.uploadService.uploadImage(this.bannerSelectedFile, 'banners')
      .subscribe({
        next: (response: {imagePath: string}) => {
          // Update form with image path
          this.bannerForm.patchValue({
            imagen: response.imagePath
          });
          this.uploadingBannerImage = false;
          this.success = 'Imagen subida correctamente';
        },
        error: (err: any) => {
          this.error = 'Error al subir la imagen';
          this.uploadingBannerImage = false;
          console.error('Error al subir imagen de banner:', err);
        }
      });
  }

  // Helper to get section name
  getBannerSectionName(section: BannerSection): string {
    const sectionNames: Record<BannerSection, string> = {
      'inicio': 'Página de Inicio',
      'productos': 'Productos',
      'ofertas': 'Ofertas',
      'ocasiones': 'Ocasiones',
      'nosotros': 'Nosotros',
      'contacto': 'Contacto'
    };

    return sectionNames[section] || section;
  }

  // REVIEWS
  loadReviews(): void {
    this.loadingReviews = true;
    this.reviewService.getReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.loadingReviews = false;
        this.success = 'Comentarios cargados.'; // Opcional
      },
      error: (err) => {
        this.error = 'Error al cargar comentarios.';
        console.error('Error al cargar comentarios:', err);
        this.loadingReviews = false;
      }
    });
  }

  deleteReview(id: string): void {
    if (!id) {
      console.error('ID de review no proporcionado para eliminar.');
      this.error = 'No se pudo eliminar el comentario: ID faltante.';
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      this.reviewService.deleteReview(id).subscribe({
        next: () => {
          this.success = 'Comentario eliminado correctamente.';
          this.loadReviews(); // Recargar la lista después de eliminar
        },
        error: (err) => {
          this.error = 'Error al eliminar comentario.';
          console.error('Error al eliminar comentario:', err);
        }
      });
    }
  }

  toggleApproval(reviewToUpdate: Review): void {
    if (!reviewToUpdate._id) {
      console.error('Review ID is missing, cannot update.');
      this.error = 'No se pudo actualizar el comentario: ID faltante.';
      return;
    }

    const newReviewData: Partial<Review> = { approved: !reviewToUpdate.approved };
    const originalApprovedState = reviewToUpdate.approved;

    const index = this.reviews.findIndex(r => r._id === reviewToUpdate._id);
    if (index !== -1) {
      this.reviews[index].approved = !originalApprovedState;
    }

    this.resetMessages();

    this.reviewService.updateReview(reviewToUpdate._id, newReviewData).subscribe({
      next: (updatedReview) => {
        if (index !== -1) {
          this.reviews[index] = { ...this.reviews[index], ...updatedReview };
        }
        this.success = `Comentario ${updatedReview.approved ? 'aprobado' : 'desaprobado'} correctamente.`;
      },
      error: (err) => {
        console.error('Error updating review approval:', err);
        this.error = 'Error al actualizar la aprobación del comentario.';
        if (index !== -1) {
          this.reviews[index].approved = originalApprovedState;
        }
      }
    });
  }

  // Métodos para el FormArray de Valores
  createValorGroup(valor: Valor = { titulo: '', descripcion: '', icono: '' }): FormGroup {
    return this.formBuilder.group({
      titulo: [valor.titulo, Validators.required],
      descripcion: [valor.descripcion, Validators.required],
      icono: [valor.icono] // Opcional, puede ser clase de FontAwesome o URL
    });
  }

  get valoresFormArray(): FormArray {
    return this.companyInfoForm.get('valores') as FormArray;
  }

  addValor(): void {
    this.valoresFormArray.push(this.createValorGroup());
  }

  removeValor(index: number): void {
    if (this.valoresFormArray.length > 1 || confirm('¿Seguro que quieres eliminar este valor? Si es el único, considera editarlo.')) {
        this.valoresFormArray.removeAt(index);
    } else if (this.valoresFormArray.length === 1 && index === 0) {
        // No permitir eliminar el último si se quiere mantener al menos uno, o resetearlo
        // this.valoresFormArray.at(0).reset({ titulo: '', descripcion: '', icono: '' });
        // O simplemente no hacer nada si la confirmación es 'no'
    }
  }

  // Historia image file handling
  onHistoriaFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.historiaSelectedFile = inputElement.files[0];
      this.historiaImagePreview = null; // Limpiar previsualización anterior
      const reader = new FileReader();
      reader.onload = () => {
        this.historiaImagePreview = reader.result;
      };
      reader.readAsDataURL(this.historiaSelectedFile);
      // Limpiar la URL de la imagen en el formulario, se establecerá al subir con éxito
      this.companyInfoForm.patchValue({ historiaImagenUrl: '' });
    }
  }

  uploadHistoriaImage(): void {
    if (!this.historiaSelectedFile) {
      this.error = 'Por favor, selecciona una imagen para la sección de historia.';
      return;
    }
    this.uploadingHistoriaImage = true;
    this.resetMessages();
    // Usar 'company' o 'nosotros' como posible subcarpeta en el backend
    this.uploadService.uploadImage(this.historiaSelectedFile, 'companyInfo').subscribe({
      next: (response: {imagePath: string}) => {
        this.companyInfoForm.patchValue({
          historiaImagenUrl: response.imagePath
        });
        this.historiaImagePreview = response.imagePath; // Actualizar previsualización con la ruta del servidor
        this.uploadingHistoriaImage = false;
        this.success = 'Imagen de historia subida correctamente.';
        this.historiaSelectedFile = null; // Limpiar archivo seleccionado
      },
      error: (err: any) => {
        this.error = 'Error al subir la imagen de historia.';
        this.uploadingHistoriaImage = false;
        console.error('Error al subir imagen de historia:', err);
      }
    });
  }

  // Método para cargar la información de la empresa
  loadCompanyInfo(): void {
    this.loadingCompanyInfo = true;
    this.companyInfoService.getCompanyInfo().subscribe({
      next: (data: CompanyInfo) => {
        this.companyInfo = data;
        
        // Rellenar el formulario con los datos obtenidos
        this.companyInfoForm.patchValue({
          _id: data._id,
          mision: data.mision || '',
          vision: data.vision || '',
          historiaTitulo: data.historiaTitulo || '',
          historiaTexto: data.historiaTexto || '',
          historiaImagenUrl: data.historiaImagenUrl || ''
          // No parchear 'integrantes' o 'valores' directamente aquí, se manejan por separado
        });

          // Manejar FormArray de Valores
          this.valoresFormArray.clear();
          if (data.valores && data.valores.length > 0) {
            data.valores.forEach(valor => this.valoresFormArray.push(this.createValorGroup(valor)));
          } else {
            // Opcional: añadir un valor por defecto si está vacío y se requiere al menos uno
             this.addValor(); 
          }

          // La lógica para 'integrantes' ha sido removida ya que se gestiona en la pestaña Equipo.

          if (data.historiaImagenUrl) {
            this.historiaImagePreview = data.historiaImagenUrl;
          } else {
            this.historiaImagePreview = null;
          }
        },
        error: (err) => {
          this.error = 'Error al cargar información de la empresa.';
          console.error('Error al cargar info de empresa:', err);
        }
      });
  }
  
  onSubmitCompanyInfo(): void {
    this.submittedCompanyInfo = true;
    
    // Validar formulario
    if (this.companyInfoForm.invalid) {
      this.error = 'Por favor, completa los campos requeridos correctamente';
      return;
    }
    
    this.resetMessages();
    
    // Create the company info object from form
    const companyInfo: CompanyInfo = this.companyInfoForm.value;
    
    this.companyInfoService.updateCompanyInfo(companyInfo)
      .subscribe({
        next: () => {
          this.success = 'Información de la empresa actualizada correctamente.';
          this.loadCompanyInfo();
        },
        error: (err) => {
          this.error = 'Error al actualizar información de la empresa.';
          console.error('Error al actualizar info de empresa:', err);
        }
      });
  }

  resetCompanyInfoForm(): void {
    this.submittedCompanyInfo = false;
    this.historiaImagePreview = null;
    this.historiaSelectedFile = null;
    this.uploadingHistoriaImage = false;

    if (this.companyInfo) {
      this.companyInfoForm.patchValue({
        _id: this.companyInfo._id,
        mision: this.companyInfo.mision || '',
        vision: this.companyInfo.vision || '',
        historiaTitulo: this.companyInfo.historiaTitulo || '',
        historiaTexto: this.companyInfo.historiaTexto || '',
        historiaImagenUrl: this.companyInfo.historiaImagenUrl || ''
        // No parchear 'valores' o 'integrantes' directamente aquí
      });

      this.valoresFormArray.clear();
      if (this.companyInfo.valores && this.companyInfo.valores.length > 0) {
        this.companyInfo.valores.forEach(valor => this.valoresFormArray.push(this.createValorGroup(valor)));
      } else {
        this.addValor(); // Añadir uno vacío por defecto si no hay
      }

      const integrantesControl = this.companyInfoForm.get('integrantes') as FormArray;
      integrantesControl.clear();
      if (this.companyInfo.integrantes && this.companyInfo.integrantes.length > 0) {
        // Lógica para repoblar integrantes si es un FormArray editable
      }

      if (this.companyInfo.historiaImagenUrl) {
        this.historiaImagePreview = this.companyInfo.historiaImagenUrl;
      }
    } else {
      this.companyInfoForm.reset({
        _id: '',
        mision: '',
        vision: '',
        historiaTitulo: '',
        historiaTexto: '',
        historiaImagenUrl: '',
        // No resetear FormArrays aquí, se limpian explícitamente
        integrantes: [] // Resetear a array vacío si es un campo simple del form, sino manejar el FormArray
      });
      this.valoresFormArray.clear();
      this.addValor(); // Añadir uno vacío por defecto
      (this.companyInfoForm.get('integrantes') as FormArray).clear(); // Si es FormArray
    }
  }
}
