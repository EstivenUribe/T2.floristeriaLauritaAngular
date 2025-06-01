import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { TeamService } from '../../services/team.service';
import { BannerService } from '../../services/banner.service';
import { CompanyInfoService } from '../../services/company-info.service';
import { UploadService } from '../../services/upload.service';
import { Product, PaginationParams } from '../../models/product.model';
import { TeamMember } from '../../models/team-member.model';
import { Banner, BannerSection } from '../../models/banner.model';
<<<<<<< Updated upstream
import { CompanyInfo } from '../../models/company-info.model';
=======
import { CompanyInfo, Valor, Integrante, TerminoSeccion } from '../../models/company-info.model';
import { Review, UserReviewInfo, ProductReviewInfo } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
>>>>>>> Stashed changes
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    // Banner
    bannerList: Banner[] = [];
    selectedBannerSection: BannerSection | null = null;
  // State variables
<<<<<<< Updated upstream
  activeTab: 'productos' | 'equipo' | 'banners' | 'configuracion' = 'productos';
  
  // Productos
  products: Product[] = [];
=======
  activeTab: 'productos' | 'equipo' | 'banners' | 'politicas' | 'comentarios' | 'configuracion' = 'productos';
  product: Product = {} as Product;
  products: Product[] = [];
  banners: Banner[] = [];
  filteredBanners: Banner[] = [];
  teamMembers: TeamMember[] = [];
  reviews: Review[] = [];
  
  // Reviews state
  loadingReviews = false;
  deletingReview = false;
  
  // Banner filter states - unified to avoid duplication
  bannerStatusFilter: string = 'all';
  bannerSectionFilter: string = 'all';
  
  // Team member states
  currentTeamMemberId = '';
  teamMemberSelectedFile: File | null = null;
  teamMemberImagePreview: string | null = null;
  uploadingTeamMemberImage = false;
  
  // Productos
>>>>>>> Stashed changes
  productForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  success = '';
  isEditing = false;
  currentProductId = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;
  
  // Equipo
<<<<<<< Updated upstream
  teamMembers: TeamMember[] = [];
=======
>>>>>>> Stashed changes
  teamMemberForm!: FormGroup;
  loadingTeamMembers = false;
  submittedTeamMember = false;
  isEditingTeamMember = false;
  
  // Banners
<<<<<<< Updated upstream
  banners: Banner[] = [];
  filteredBanners: Banner[] = [];
=======
>>>>>>> Stashed changes
  bannerForm!: FormGroup;
  loadingBanners = false;
  submittedBanner = false;
  submittingBanner = false;
  deletingBanner = false;
  isEditingBanner = false;
  currentBannerId = '';
  bannerSelectedFile: File | null = null;
  bannerImagePreview: string | null = null;
  uploadingBannerImage = false;
  
  // Configuración
  companyInfoForm!: FormGroup;
  loadingCompanyInfo = false;
  submittedCompanyInfo = false;
  companyInfo: CompanyInfo = {} as CompanyInfo;

<<<<<<< Updated upstream
  // Método para subir imagen
  uploadImage(): void {
    if (!this.selectedFile) {
      this.error = 'Por favor, seleccione una imagen primero';
      return;
    }

    this.uploadingImage = true;
    this.error = '';
    this.success = '';

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('folder', 'products'); // O 'team' o 'banners' según el contexto

    this.uploadService.uploadImage(formData).subscribe(
      (response) => {
        this.imagePreview = response.imageUrl;
        this.productForm.patchValue({ imagen: response.imageUrl });
        this.success = 'Imagen subida exitosamente';
        this.uploadingImage = false;
      },
      (error) => {
        this.uploadingImage = false;
        let errorMessage = 'Error al subir la imagen';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente';
        } else if (error.status === 413) {
          errorMessage = 'El archivo es demasiado grande';
        } else if (error.status === 400) {
          errorMessage = 'Formato de archivo no válido';
        }
        
        this.error = errorMessage;
      }
    );
  }
=======
  // Historia Image Preview & Upload
  companyHistoryImageFile: File | null = null;
  companyHistoryImagePreview: string | ArrayBuffer | null = null;
  uploadingHistoryImage = false;
  
  // Estados adicionales
  loadingProducts = false;
  submittingCompanyInfo = false;

  // Propiedad error general
  error = '';

  // Propiedades para la imagen de Historia
  historiaSelectedFile: File | null = null;
  historiaImagePreview: string | ArrayBuffer | null = null;
  uploadingHistoriaImage = false;

  // Filtro de banners
  bannerFilter: string = 'all';
>>>>>>> Stashed changes

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private teamService: TeamService,
    private bannerService: BannerService,
    private companyInfoService: CompanyInfoService,
<<<<<<< Updated upstream
    private uploadService: UploadService
  ) {
    this.initProductForm();
    this.initTeamMemberForm();
    this.initBannerForm();
    this.initCompanyInfoForm();
=======
    private uploadService: UploadService,
    private reviewService: ReviewService
  ) { }

  // Este método ha sido movido a su posición más abajo para eliminar la duplicación

  initForms(): void {
    // Initialize product form
    this.productForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      rebaja: [false]
    });
    
    // Initialize team member form
    this.teamMemberForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cargo: ['', Validators.required],
      biografia: [''],
      foto: [''],
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
      titulo: ['', Validators.required],
      subtitulo: [''],
      imagen: ['', Validators.required],
      url: [''],
      seccion: ['inicio', Validators.required], // Default to inicio section
      fechaInicio: [new Date().toISOString().split('T')[0]],
      fechaFin: [''], // Optional
      textoBoton: [''],
      posicionTexto: ['center'], // Default
      animacion: ['fade'], // Default
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
      historiaImagenUrl: [''],
      valores: this.formBuilder.array([]),
      integrantes: this.formBuilder.array([]),
      // Nuevos campos para términos y condiciones
      terminosTitulo: ['Términos y Condiciones'],
      terminosIntroduccion: [''],
      terminosSecciones: this.formBuilder.array([]),
      terminosActualizacion: [new Date().toISOString().split('T')[0]]
    });

    // Añadir un valor inicial vacío
    this.addValor();
    // Añadir una sección de términos inicial vacía
    this.addTerminoSeccion();
  }

  // Getters para FormArrays
  get valoresFormArray(): FormArray {
    return this.companyInfoForm.get('valores') as FormArray;
  }
  
  get terminosSeccionesFormArray(): FormArray {
    return this.companyInfoForm.get('terminosSecciones') as FormArray;
  }

  // Métodos para crear grupos de formularios
  createValorGroup(valor: any = null): FormGroup {
    return this.formBuilder.group({
      titulo: [valor ? valor.titulo : '', Validators.required],
      descripcion: [valor ? valor.descripcion : '', Validators.required],
      icono: [valor ? valor.icono : 'fa-heart', Validators.required]
    });
>>>>>>> Stashed changes
  }

  createTerminoSeccionGroup(seccion: any = null): FormGroup {
    return this.formBuilder.group({
      titulo: [seccion ? seccion.titulo : '', Validators.required],
      contenido: [seccion ? seccion.contenido : '', Validators.required]
    });
  }

  // Método para resetear mensajes de error y éxito
  resetMessages(): void {
    this.errorMessage = '';
    this.success = '';
    this.error = '';
  }

  ngOnInit(): void {
<<<<<<< Updated upstream
    // Cargar datos iniciales para la pestaña activa
    this.loadProducts();

    // Suscribirse a los estados de carga para retroalimentación de UI
    this.productService.isLoading.subscribe((isLoading: boolean) => {
=======
    // Inicializar formularios
    this.initForms();
    
    // Cargar datos iniciales
    this.loadBanners();
    this.loadProducts();
    this.loadTeamMembers();
    this.loadCompanyInfo();
    this.loadReviews();
    
    // Subscribe to loading states for UI feedback
    this.productService.isLoading.subscribe(isLoading => {
>>>>>>> Stashed changes
      this.loading = isLoading;
    });

    this.teamService.isLoading.subscribe((isLoading: boolean) => {
      this.loadingTeamMembers = isLoading;
    });

    this.bannerService.isLoading.subscribe((isLoading: boolean) => {
      this.loadingBanners = isLoading;
    });

<<<<<<< Updated upstream
    this.companyInfoService.isLoading.subscribe((isLoading: boolean) => {
      this.loadingCompanyInfo = isLoading;
=======
    this.reviewService.isLoading.subscribe(isLoading => {
      this.loadingReviews = isLoading;
>>>>>>> Stashed changes
    });
  }

  // Inicialización de formularios
  initProductForm(): void {
    this.productForm = this.formBuilder.group({
      _id: [''],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      imagen: ['', [Validators.required]],
      precio: [0, [Validators.required, Validators.min(0)]],
      rebaja: [0, [Validators.min(0)]],
      activo: [true]
    });
  }

  initTeamMemberForm(): void {
    this.teamMemberForm = this.formBuilder.group({
      _id: [''],
      nombre: ['', [Validators.required]],
      apellido: [''],
      cargo: ['', [Validators.required]],
      foto: [''],
      biografia: ['', [Validators.required]]
    });
  }

  initBannerForm(): void {
    this.bannerForm = this.formBuilder.group({
      _id: [''],
      titulo: ['', [Validators.required]],
      imagen: ['', [Validators.required]],
      seccion: ['hero', [Validators.required]],
      url: [''],
      activo: [true],
      fechaInicio: [null],
      fechaFin: [null],
      orden: [0]
    });
  }

  initCompanyInfoForm(): void {
    this.companyInfoForm = this.formBuilder.group({
      _id: [''],
      mision: ['', [Validators.required]],
      vision: ['', [Validators.required]],
      integrantes: [[]]
    });
  }

  // Navegación por pestañas
  setActiveTab(tab: 'productos' | 'equipo' | 'banners' | 'configuracion'): void {
    this.activeTab = tab;
    this.resetMessages();
    
    // Cargar datos para la pestaña seleccionada si aún no se han cargado
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
      case 'configuracion':
        if (!this.companyInfo) {
          this.loadCompanyInfo();
        }
        break;
    }
  }
<<<<<<< Updated upstream

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
      if (!this.selectedFile) {
        this.error = 'Debes seleccionar una imagen para el producto.';
        return;
      }
      this.productService.createProduct(product, this.selectedFile)
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
      _id: product._id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      imagen: product.imagen,
      precio: product.precio,
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
      _id: '',
      nombre: '',
      descripcion: '',
      imagen: '',
      precio: 0,
      rebaja: 0
    });
  }

  // Product file handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Opcional: mostrar previsualización
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Equipo
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

  createTeamMember() {
    this.submittedTeamMember = true;
    if (this.teamMemberForm.valid) {
      const teamMember = {
        nombre: this.teamMemberForm.get('nombre')?.value,
        apellido: this.teamMemberForm.get('apellido')?.value || '',
        cargo: this.teamMemberForm.get('cargo')?.value || '',
        foto: this.teamMemberSelectedFile ? this.teamMemberImagePreview || '' : '',
        biografia: this.teamMemberForm.get('biografia')?.value || ''
      };

      if (this.isEditingTeamMember) {
        this.teamService.updateTeamMember(this.currentTeamMemberId, teamMember).subscribe({
          next: () => {
            this.loadTeamMembers();
            this.resetTeamMemberForm();
          },
          error: (error) => console.error('Error updating team member', error)
        });
      } else {
        this.teamService.createTeamMember(teamMember).subscribe({
          next: () => {
            this.loadTeamMembers();
            this.resetTeamMemberForm();
          },
          error: (error) => console.error('Error creating team member', error)
        });
      }
    }
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
      _id: teamMember._id,
      nombre: teamMember.nombre,
      apellido: teamMember.apellido,
      cargo: teamMember.cargo,
      biografia: teamMember.biografia
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
      _id: '',
      nombre: '',
      cargo: '',
      imagen: '',
      descripcion: '',
      activo: true
    });
  }

  // Team member file handling
  onTeamMemberFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.teamMemberSelectedFile = file;
      
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.teamMemberImagePreview = reader.result as string;
        this.teamMemberForm.patchValue({
          foto: this.teamMemberImagePreview
        });
      };
      reader.readAsDataURL(file);
    }
  }

  uploadTeamMemberImage(): void {
    if (!this.teamMemberSelectedFile) {
      return;
    }

    this.uploadingTeamMemberImage = true;
    this.resetMessages();

    const teamMemberFormData = new FormData();
    teamMemberFormData.append('image', this.teamMemberSelectedFile);
    teamMemberFormData.append('folder', 'team');
    this.uploadService.uploadImage(teamMemberFormData)
      .subscribe({
        next: (response) => {
          // Update form with image path
          this.teamMemberForm.patchValue({
            imagen: response.imagePath
          });
          this.uploadingTeamMemberImage = false;
          this.success = 'Foto subida correctamente';
        },
        error: (err) => {
          this.error = 'Error al subir la foto';
          this.uploadingTeamMemberImage = false;
          console.error('Error al subir foto:', err);
        }
      });
  }

=======
  


>>>>>>> Stashed changes
  // BANNERS
  loadBanners(): void {
    this.loadingBanners = true;
    this.bannerService.getAllBanners().subscribe({
      next: (banners: Banner[]) => {
        this.banners = banners;
        this.filteredBanners = [...this.banners];
        this.filterBanners(); // Filtrar banners según criterios actuales
        this.loadingBanners = false;
      },
      error: (error) => {
        console.error('Error al cargar los banners:', error);
        this.errorMessage = 'Error al cargar banners. Por favor, intenta recargar la página.';
        this.loadingBanners = false;
      }
    });
  }
  
  // Manejar la selección de archivo para la imagen del banner
  onBannerFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.bannerSelectedFile = inputElement.files[0];
      this.bannerImagePreview = null; // Limpiar previsualización anterior
      
      // Crear previsualización
      const reader = new FileReader();
      reader.onload = () => {
        // Corregir el tipo convertiendo reader.result a string si es un ArrayBuffer
        if (reader.result) {
          this.bannerImagePreview = typeof reader.result === 'string' ? reader.result : null;
        } else {
          this.bannerImagePreview = null;
        }
<<<<<<< Updated upstream
      });
  }

  filterBanners(): void {
    if (this.bannerFilter === 'all') {
      this.filteredBanners = [...this.banners];
    } else {
      this.filteredBanners = this.banners.filter(
        banner => banner.seccion === this.bannerFilter
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
=======
      };
      reader.readAsDataURL(this.bannerSelectedFile);
      
      // Limpiar la URL de la imagen en el formulario, se establecerá al subir con éxito
      this.bannerForm.patchValue({ imagen: '' });
    }
  }
  
  // Subir imagen para el banner
  uploadBannerImage(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.bannerSelectedFile) {
        reject('No hay imagen seleccionada');
        return;
      }
      
      this.uploadingBannerImage = true;
      
      // Usar 'banners' como subcarpeta en el backend
      this.uploadService.uploadImage(this.bannerSelectedFile, 'banners')
        .pipe(finalize(() => this.uploadingBannerImage = false))
>>>>>>> Stashed changes
        .subscribe({
          next: (response: any) => {
            resolve(response.imagePath);
          },
          error: (error: any) => {
            console.error('Error al subir imagen del banner:', error);
            reject('Error al subir la imagen del banner. Por favor, intenta de nuevo.');
          }
        });
    });
  }
<<<<<<< Updated upstream

=======
  
  // Comenzar a editar un banner existente
>>>>>>> Stashed changes
  editBanner(banner: Banner): void {
    this.resetMessages();
    this.isEditingBanner = true;
<<<<<<< Updated upstream
    this.currentBannerId = banner._id as string;

    // Convert date strings to Date objects
    const fechaInicio = banner.fechaInicio ? new Date(banner.fechaInicio) : new Date();
    const fechaFin = banner.fechaFin ? new Date(banner.fechaFin) : null;

    // Format dates for input[type=date]
    const formattedFechaInicio = fechaInicio.toISOString().split('T')[0];
    const formattedFechaFin = fechaFin ? fechaFin.toISOString().split('T')[0] : null;

    // Update form with banner data
=======
    this.currentBannerId = banner._id || '';
    
    // Rellenar el formulario con los datos del banner
>>>>>>> Stashed changes
    this.bannerForm.patchValue({
      _id: banner._id,
      titulo: banner.titulo,
      imagen: banner.imagen,
      seccion: banner.seccion,
<<<<<<< Updated upstream
      url: banner.url,
      activo: banner.activo,
      fechaInicio: formattedFechaInicio,
      fechaFin: formattedFechaFin,
      orden: banner.orden
    });
  }

  resetBannerForm(): void {
    this.submittedBanner = false;
    this.isEditingBanner = false;
    this.currentBannerId = '';
    this.bannerSelectedFile = null;
    this.bannerImagePreview = null;

=======
      fechaInicio: banner.fechaInicio ? new Date(banner.fechaInicio).toISOString().split('T')[0] : '',
      fechaFin: banner.fechaFin ? new Date(banner.fechaFin).toISOString().split('T')[0] : '',
      textoBoton: banner.textoBoton || '',
      posicionTexto: banner.posicionTexto || 'center',
      animacion: banner.animacion || 'fade',
      activo: banner.activo
    });
    
    // Establecer colores
    const colorGroup = this.bannerForm.get('color');
    if (colorGroup && banner.color) {
      colorGroup.patchValue({
        textoPrincipal: banner.color.textoPrincipal || '#FFFFFF',
        textoSecundario: banner.color.textoSecundario || '#FFFFFF',
        boton: banner.color.boton || '#9966CC',
        overlay: banner.color.overlay || 'rgba(0,0,0,0.3)'
      });
    }
    
    // Mostrar la imagen actual como preview
    if (banner.imagen) {
      this.bannerImagePreview = banner.imagen;
    }
    
    // Desplazarse al formulario
    // Puedes usar ViewChild para obtener una referencia al elemento del formulario
    // y llamar a element.scrollIntoView() aquí
  }
  
  // Limpiar el formulario de banners
  resetBannerForm(): void {
>>>>>>> Stashed changes
    this.bannerForm.reset({
      _id: '',
      titulo: '',
      imagen: '',
      seccion: 'hero',
      url: '',
<<<<<<< Updated upstream
=======
      seccion: 'inicio',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      textoBoton: '',
      posicionTexto: 'center',
      animacion: 'fade',
>>>>>>> Stashed changes
      activo: true,
      fechaInicio: null,
      fechaFin: null,
      orden: 0
    });
    
    this.isEditingBanner = false;
    this.currentBannerId = '';
    this.bannerSelectedFile = null;
    this.bannerImagePreview = null;
    this.resetMessages();
  }
<<<<<<< Updated upstream

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

    const bannerFormData = new FormData();
    bannerFormData.append('image', this.bannerSelectedFile);
    bannerFormData.append('folder', 'banners');
    this.uploadService.uploadImage(bannerFormData).pipe(
      finalize(() => this.uploadingBannerImage = false)
    ).subscribe({
      next: (response: any) => {
        this.bannerImagePreview = response.url;
        this.bannerForm.patchValue({ imagen: response.url });
        this.bannerSelectedFile = null;
      },
      error: (error) => {
        console.error('Upload failed', error);
      }
    });
  }

  deleteBanner(bannerId: string): void {
    this.bannerService.deleteBanner(bannerId)
      .subscribe({
        next: () => {
          this.loadBanners();
        },
        error: (error) => console.error('Error deleting banner', error)
      });
=======
  
  // Enviar formulario de banner (crear/editar)
  async onSubmitBanner(): Promise<void> {
    this.submittedBanner = true;
    if (this.bannerForm.invalid) {
      return;
    }
    
    this.submittingBanner = true;
    this.resetMessages();
    
    try {
      // Si hay una imagen seleccionada, subirla primero
      let imagePath = this.bannerForm.get('imagen')?.value || '';
      if (this.bannerSelectedFile) {
        imagePath = await this.uploadBannerImage();
      }
      
      // Preparar los datos del banner para enviar
      const bannerData: Banner = {
        titulo: this.bannerForm.get('titulo')?.value,
        subtitulo: this.bannerForm.get('subtitulo')?.value,
        imagen: imagePath,
        url: this.bannerForm.get('url')?.value,
        seccion: this.bannerForm.get('seccion')?.value,
        fechaInicio: this.bannerForm.get('fechaInicio')?.value,
        fechaFin: this.bannerForm.get('fechaFin')?.value,
        textoBoton: this.bannerForm.get('textoBoton')?.value,
        posicionTexto: this.bannerForm.get('posicionTexto')?.value,
        animacion: this.bannerForm.get('animacion')?.value,
        activo: this.bannerForm.get('activo')?.value,
        color: this.bannerForm.get('color')?.value
      };
      
      if (this.isEditingBanner && this.currentBannerId) {
        // Actualizar banner existente
        this.bannerService.updateBanner(this.currentBannerId, bannerData).subscribe({
          next: () => {
            this.success = 'Banner actualizado con éxito.';
            this.loadBanners(); // Recargar los banners
            this.resetBannerForm();
            this.submittingBanner = false;
          },
          error: (error: any) => {
            console.error('Error al actualizar banner:', error);
            this.errorMessage = 'Error al actualizar el banner. Por favor, intenta de nuevo.';
            this.submittingBanner = false;
          }
        });
      } else {
        // Crear nuevo banner
        this.bannerService.createBanner(bannerData).subscribe({
          next: () => {
            this.success = 'Banner creado con éxito.';
            this.loadBanners(); // Recargar los banners
            this.resetBannerForm();
            this.submittingBanner = false;
          },
          error: (error: any) => {
            console.error('Error al crear banner:', error);
            this.errorMessage = 'Error al crear el banner. Por favor, intenta de nuevo.';
            this.submittingBanner = false;
          }
        });
      }
    } catch (error) {
      console.error('Error en el proceso de subida/guardado:', error);
      this.errorMessage = 'Error en el proceso. Por favor, intenta de nuevo.';
      this.submittingBanner = false;
    }
  }
  // Eliminar un banner
  deleteBanner(bannerId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este banner? Esta acción no se puede deshacer.')) {
      return;
    }
    
    this.deletingBanner = true;
    this.resetMessages();
    
    this.bannerService.deleteBanner(bannerId).subscribe({
      next: () => {
        this.success = 'Banner eliminado con éxito.';
        this.loadBanners(); // Recargar los banners
        this.deletingBanner = false;
      },
      error: (error: any) => {
        console.error('Error al eliminar banner:', error);
        this.errorMessage = 'Error al eliminar el banner. Por favor, intenta de nuevo.';
        this.deletingBanner = false;
      }
    });
  }
  
  // Activar/Desactivar un banner
  toggleBannerStatus(bannerId: string | Banner): void {
    const id = typeof bannerId === 'string' ? bannerId : bannerId._id;
    this.resetMessages();
    
    const updatedBanner = {
      activo: typeof bannerId === 'string' ? undefined : !bannerId.activo
    };
    
    this.bannerService.updateBanner(id!, updatedBanner).subscribe({
      next: (updatedBanner: Banner) => {
        this.success = `Banner ${updatedBanner.activo ? 'activado' : 'desactivado'} con éxito.`;
        this.loadBanners(); // Recargar los banners
      },
      error: (error: any) => {
        console.error('Error al cambiar estado del banner:', error);
        this.errorMessage = 'Error al cambiar el estado del banner. Por favor, intenta de nuevo.';
      }
    });
>>>>>>> Stashed changes
  }

  toggleBannerStatus(bannerId: string): void {
    this.bannerService.toggleBannerStatus(bannerId)
      .subscribe({
        next: () => {
          this.loadBanners();
        },
        error: (error) => console.error('Error toggling banner status', error)
      });
  }

  // Helper to get section name
<<<<<<< Updated upstream
  getBannerSectionName(section: BannerSection): string {
    switch (section) {
      case BannerSection.Hero:
        return 'Hero';
      case BannerSection.About:
        return 'Sobre Nosotros';
      case BannerSection.Products:
        return 'Productos';
      case BannerSection.Testimonials:
        return 'Testimonios';
      case BannerSection.Contact:
        return 'Contacto';
      default:
        return '';
    }
  }

  // COMPANY INFO
  loadCompanyInfo(): void {
    this.companyInfoService.getCompanyInfo()
      .subscribe({
        next: (data) => {
          this.companyInfo = data;
          this.companyInfoForm.patchValue({
            _id: data._id,
            mision: data.mision,
            vision: data.vision,
            integrantes: data.integrantes
          });
        },
        error: (err) => {
          this.error = 'Error al cargar información de la empresa.';
          console.error('Error al cargar info empresa:', err);
        }
      });
  }

  onSubmitCompanyInfo(): void {
    this.submittedCompanyInfo = true;
    this.resetMessages();

    const companyInfo: CompanyInfo = this.companyInfoForm.value;

    this.companyInfoService.updateCompanyInfo(companyInfo)
      .subscribe({
        next: () => {
          this.success = 'Información de la empresa actualizada correctamente.';
          this.loadCompanyInfo();
        },
        error: (err) => {
          this.error = 'Error al actualizar información de la empresa.';
          console.error('Error al actualizar info empresa:', err);
        }
      });
  }

  resetCompanyInfoForm(): void {
    this.submittedCompanyInfo = false;

    if (this.companyInfo) {
      this.companyInfoForm.patchValue({
        _id: this.companyInfo._id,
        mision: this.companyInfo.mision,
        vision: this.companyInfo.vision,
        integrantes: this.companyInfo.integrantes
      });
    } else {
      this.companyInfoForm.reset({
        _id: '',
        mision: '',
        vision: '',
        integrantes: []
      });
=======
  getBannerSectionName(section: string): string {
    switch (section) {
      case 'inicio':
        return 'Inicio';
      case 'productos':
        return 'Productos';
      case 'nosotros':
        return 'Nosotros';
      case 'contacto':
        return 'Contacto';
      default:
        return section.charAt(0).toUpperCase() + section.slice(1);
    }
  }

  // Filtrar banners por sección y estado
  filterBanners(): void {
    let filtered = [...this.banners];
    
    // Filtrar por sección
    if (this.bannerSectionFilter !== 'all') {
      filtered = filtered.filter(banner => banner.seccion === this.bannerSectionFilter);
    }
    
    // Filtrar por estado
    if (this.bannerStatusFilter !== 'all') {
      const isActive = this.bannerStatusFilter === 'active';
      filtered = filtered.filter(banner => banner.activo === isActive);
    }
    
    this.filteredBanners = filtered;
  }

  // Cargar todos los productos desde el servicio
  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getProducts({ page: 1, limit: 100 }).subscribe({
      next: (response: any) => {
        this.products = response.products || [];
        this.loadingProducts = false;
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.errorMessage = 'Error al cargar productos. Por favor, intenta recargar la página.';
        this.loadingProducts = false;
      }
    });
  }

  // Cargar todos los miembros del equipo desde el servicio
  loadTeamMembers(): void {
    this.loadingTeamMembers = true;
    this.teamService.getTeamMembers().subscribe({
      next: (members: any[]) => {
        this.teamMembers = members;
        this.loadingTeamMembers = false;
      },
      error: (error: any) => {
        console.error('Error al cargar equipo:', error);
        this.errorMessage = 'Error al cargar miembros del equipo. Por favor, intenta recargar la página.';
        this.loadingTeamMembers = false;
      }
    });
  }

  // Eliminar un review
  deleteReview(reviewId: string): void {
    if (confirm('¿Está seguro que desea eliminar esta reseña? Esta acción no se puede deshacer.')) {
      this.deletingReview = true;
      this.reviewService.deleteReview(reviewId).subscribe({
        next: () => {
          this.success = 'Reseña eliminada con éxito.';
          this.loadReviews();
          this.deletingReview = false;
        },
        error: (err: any) => {
          this.errorMessage = 'Error al eliminar reseña.';
          console.error('Error al eliminar reseña:', err);
          this.deletingReview = false;
        }
      });
    }
  }
  
  // Cargar todas las reseñas desde el servicio
  loadReviews(): void {
    this.loadingReviews = true;
    this.reviewService.getReviews().subscribe({
      next: (reviews: any[]) => {
        this.reviews = reviews;
        this.loadingReviews = false;
      },
      error: (error: any) => {
        console.error('Error al cargar reseñas:', error);
        this.errorMessage = 'Error al cargar reseñas. Por favor, intenta recargar la página.';
        this.loadingReviews = false;
      }
    });
  }

  // Crea o actualiza un producto
  submitProduct(): void {
    this.submitted = true;
    this.loadingProducts = true;
    if (this.productForm.valid) {
      const productData = {...this.productForm.value};
      // Aseguramos que los campos opcionales sean null en lugar de undefined
      if (productData.imagen === undefined) productData.imagen = null;
      const isEdit = !!this.currentProductId;
      if (isEdit) {
        this.productService.updateProduct(this.currentProductId, productData).subscribe({
          next: () => {
            this.success = 'Producto actualizado exitosamente';
            this.resetForm();
            this.loadProducts();
            this.loadingProducts = false;
          },
          error: (error) => {
            this.error = `Error al actualizar producto: ${error.message}`;
            this.loadingProducts = false;
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.success = 'Producto creado exitosamente';
            this.resetForm();
            this.loadProducts();
            this.loadingProducts = false;
          },
          error: (error) => {
            this.error = `Error al crear producto: ${error.message}`;
            this.loadingProducts = false;
          }
        });
      }
    } else {
      this.error = 'Por favor, complete todos los campos requeridos';
      this.loadingProducts = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage(): void {
    if (this.selectedFile) {
      this.uploadingImage = true;
      this.uploadService.uploadImage(this.selectedFile, 'products').subscribe({
        next: (response) => {
          this.productForm.patchValue({ imagen: response.url });
          this.uploadingImage = false;
          this.success = 'Imagen subida exitosamente';
        },
        error: (error) => {
          this.error = `Error al subir imagen: ${error.message}`;
          this.uploadingImage = false;
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.submitted = false;
    this.isEditing = false;
    this.currentProductId = '';
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = '';
    this.success = '';
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.currentProductId = product._id!;
    this.productForm.patchValue({
      nombre: product.nombre,
      descripcion: product.descripcion,
      imagen: product.imagen,
      precio: product.precio,
      rebaja: product.rebaja
    });
    this.imagePreview = product.imagen || null;
  }

  deleteProduct(productId: string): void {
    if (confirm('¿Está seguro que desea eliminar este producto?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.success = 'Producto eliminado exitosamente';
          this.loadProducts();
        },
        error: (error) => {
          this.error = `Error al eliminar producto: ${error.message}`;
        }
      });
    }
  }
  
  // Métodos para equipo
  onSubmitTeamMember(): void {
    this.submittedTeamMember = true;
    if (this.teamMemberForm.invalid) {
      return;
    }
    
    const teamMemberData = this.teamMemberForm.value;
    if (this.isEditingTeamMember) {
      this.teamService.updateTeamMember(this.currentTeamMemberId, teamMemberData).subscribe({
        next: () => {
          this.success = 'Miembro del equipo actualizado exitosamente';
          this.resetTeamMemberForm();
          this.loadTeamMembers();
        },
        error: (error) => {
          this.error = `Error al actualizar miembro del equipo: ${error.message}`;
        }
      });
    } else {
      this.teamService.createTeamMember(teamMemberData).subscribe({
        next: () => {
          this.success = 'Miembro del equipo creado exitosamente';
          this.resetTeamMemberForm();
          this.loadTeamMembers();
        },
        error: (error) => {
          this.error = `Error al crear miembro del equipo: ${error.message}`;
        }
      });
    }
  }

  onTeamMemberFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.teamMemberSelectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.teamMemberImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.teamMemberSelectedFile);
    }
  }

  uploadTeamMemberImage(): void {
    if (this.teamMemberSelectedFile) {
      this.uploadingTeamMemberImage = true;
      this.uploadService.uploadImage(this.teamMemberSelectedFile, 'team').subscribe({
        next: (response) => {
          this.teamMemberForm.patchValue({ foto: response.url });
          this.uploadingTeamMemberImage = false;
          this.success = 'Imagen subida exitosamente';
        },
        error: (error) => {
          this.error = `Error al subir imagen: ${error.message}`;
          this.uploadingTeamMemberImage = false;
        }
      });
    }
  }

  resetTeamMemberForm(): void {
    this.teamMemberForm.reset();
    this.submittedTeamMember = false;
    this.isEditingTeamMember = false;
    this.currentTeamMemberId = '';
    this.teamMemberSelectedFile = null;
    this.teamMemberImagePreview = null;
    this.error = '';
    this.success = '';
    this.teamMemberForm.patchValue({
      activo: true,
      redesSociales: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      }
    });
  }

  editTeamMember(teamMember: TeamMember): void {
    this.isEditingTeamMember = true;
    this.currentTeamMemberId = teamMember._id!;
    this.teamMemberForm.patchValue({
      nombre: teamMember.nombre,
      apellido: teamMember.apellido,
      cargo: teamMember.cargo,
      biografia: teamMember.biografia,
      foto: teamMember.foto,
      activo: teamMember.activo,
      redesSociales: teamMember.redesSociales
    });
    this.teamMemberImagePreview = teamMember.foto || null;
  }

  toggleTeamMemberStatus(teamMemberId: string): void {
    this.teamService.toggleMemberStatus(teamMemberId).subscribe({
      next: () => {
        this.loadTeamMembers();
        this.success = 'Estado del miembro actualizado exitosamente';
      },
      error: (error) => {
        this.error = `Error al cambiar estado: ${error.message}`;
      }
    });
  }

  deleteTeamMember(teamMemberId: string): void {
    if (confirm('¿Está seguro que desea eliminar este miembro del equipo?')) {
      this.teamService.deleteTeamMember(teamMemberId).subscribe({
        next: () => {
          this.success = 'Miembro del equipo eliminado exitosamente';
          this.loadTeamMembers();
        },
        error: (error) => {
          this.error = `Error al eliminar miembro del equipo: ${error.message}`;
        }
      });
    }
  }
  
  // Manejo de reseñas
  toggleApproval(review: Review): void {
    this.reviewService.updateReview(review._id!, { approved: !review.approved }).subscribe({
      next: () => {
        this.success = 'Estado de aprobación actualizado';
        this.loadReviews();
      },
      error: (err) => {
        this.error = `Error al cambiar estado: ${err.message}`;
      }
    });
  }

  // Métodos para la historia de la empresa
  onHistoriaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.historiaSelectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.historiaImagePreview = reader.result;
      };
      reader.readAsDataURL(this.historiaSelectedFile);
    }
  }

  uploadHistoriaImage(): void {
    if (this.historiaSelectedFile) {
      this.uploadingHistoriaImage = true;
      this.uploadService.uploadImage(this.historiaSelectedFile, 'companyInfo').subscribe({
        next: (response) => {
          this.companyInfoForm.patchValue({ historiaImagenUrl: response.url });
          this.uploadingHistoriaImage = false;
          this.success = 'Imagen de nuestra historia subida exitosamente';
        },
        error: (error) => {
          this.error = `Error al subir imagen: ${error.message}`;
          this.uploadingHistoriaImage = false;
        }
      });
    }
  }
  
  // Método para mover secciones de términos
  moveTerminoSeccion(index: number, direction: 'up' | 'down'): void {
    const items = this.terminosSeccionesFormArray;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;
    
    const currentItem = items.at(index).value;
    const swapItem = items.at(newIndex).value;
    
    items.at(index).patchValue(swapItem);
    items.at(newIndex).patchValue(currentItem);
  }

  // COMPANY INFO (Ahora Políticas)
  // Métodos para los FormArrays del formulario de CompanyInfo
  addValor(): void {
    this.valoresFormArray.push(this.createValorGroup());
  }

  removeValor(index: number): void {
    this.valoresFormArray.removeAt(index);
    if (this.valoresFormArray.length === 0) {
      this.addValor(); // Mantener al menos un valor
    }
  }

  addTerminoSeccion(): void {
    this.terminosSeccionesFormArray.push(this.createTerminoSeccionGroup());
  }

  removeTerminoSeccion(index: number): void {
    this.terminosSeccionesFormArray.removeAt(index);
    if (this.terminosSeccionesFormArray.length === 0) {
      this.addTerminoSeccion(); // Mantener al menos una sección
    }
  }

  // Actualizar el formulario con los datos de la empresa
  patchCompanyInfoFormValues(): void {
    if (!this.companyInfo) return;

    // Patch valores simples
    this.companyInfoForm.patchValue({
      _id: this.companyInfo._id,
      mision: this.companyInfo.mision,
      vision: this.companyInfo.vision,
      historiaTitulo: this.companyInfo.historiaTitulo,
      historiaTexto: this.companyInfo.historiaTexto,
      historiaImagenUrl: this.companyInfo.historiaImagenUrl,
      terminosTitulo: this.companyInfo.terminosTitulo || 'Términos y Condiciones',
      terminosIntroduccion: this.companyInfo.terminosIntroduccion,
      terminosActualizacion: this.companyInfo.terminosActualizacion || new Date().toISOString().split('T')[0]
    });

    // Actualizar preview de imagen si existe
    if (this.companyInfo.historiaImagenUrl) {
      this.companyHistoryImagePreview = this.companyInfo.historiaImagenUrl;
    }

    // Actualizar FormArray de valores
    this.valoresFormArray.clear();
    if (this.companyInfo.valores && this.companyInfo.valores.length > 0) {
      this.companyInfo.valores.forEach(valor => {
        this.valoresFormArray.push(this.createValorGroup(valor));
      });
    } else {
      this.addValor(); // Agregar un valor vacío por defecto
    }

    // Actualizar FormArray de secciones de términos
    this.terminosSeccionesFormArray.clear();
    if (this.companyInfo.terminosSecciones && this.companyInfo.terminosSecciones.length > 0) {
      // Ordenar secciones si tienen un campo 'orden'
      const seccionesOrdenadas = [...this.companyInfo.terminosSecciones];
      if (seccionesOrdenadas.length > 0 && 'orden' in seccionesOrdenadas[0]) {
        seccionesOrdenadas.sort((a: any, b: any) => a.orden - b.orden);
      }
      seccionesOrdenadas.forEach(seccion => {
        this.terminosSeccionesFormArray.push(this.createTerminoSeccionGroup(seccion));
      });
    } else {
      this.addTerminoSeccion(); // Agregar una sección vacía por defecto
    }
  }

  // Resetear el formulario de información de la empresa
  resetCompanyInfoForm(): void {
    this.companyInfoForm.reset({
      _id: this.companyInfo?._id || '',
      mision: '',
      vision: '',
      historiaTitulo: '',
      historiaTexto: '',
      historiaImagenUrl: '',
      terminosTitulo: 'Términos y Condiciones',
      terminosIntroduccion: '',
      terminosActualizacion: new Date().toISOString().split('T')[0]
    });
    
    // Limpiar FormArrays
    this.valoresFormArray.clear();
    this.addValor(); // Agregar uno vacío por defecto
    
    this.terminosSeccionesFormArray.clear();
    this.addTerminoSeccion(); // Agregar una sección vacía por defecto
    
    // Limpiar previews e imágenes
    this.companyHistoryImageFile = null;
    this.companyHistoryImagePreview = null;
  }

  loadCompanyInfo(): void {
    this.loadingCompanyInfo = true;
    this.companyInfoService.getCompanyInfo().subscribe({
      next: (data) => {
        this.companyInfo = data;
        this.patchCompanyInfoFormValues();
        this.loadingCompanyInfo = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar información de la empresa.';
        console.error('Error al cargar info de empresa:', err);
        this.loadingCompanyInfo = false;
      }
    });
  }

  // Manejar la selección de archivos para la imagen de historia
  onCompanyHistoryImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.companyHistoryImageFile = input.files[0];
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.companyHistoryImagePreview = reader.result;
      };
      reader.readAsDataURL(this.companyHistoryImageFile);
    }
  }

  // Subir imagen de historia de la empresa
  async uploadCompanyHistoryImage(): Promise<string> {
    if (!this.companyHistoryImageFile) {
      return Promise.resolve(this.companyInfo?.historiaImagenUrl || '');
    }
    
    this.uploadingHistoryImage = true;
    return new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      if (this.companyHistoryImageFile) {
        formData.append('file', this.companyHistoryImageFile);
      }
      
      if (this.companyHistoryImageFile) {
        this.uploadService.uploadImage(this.companyHistoryImageFile, 'companyInfo')
          .pipe(
            finalize(() => {
              this.uploadingHistoryImage = false;
            })
          )
          .subscribe({
            next: (response: any) => {
              resolve(response.imagePath);
            },
            error: (error: any) => {
              console.error('Error al subir imagen de historia:', error);
              reject('Error al subir la imagen de historia. Por favor, intenta de nuevo.');
            }
          });
      } else {
        this.uploadingHistoryImage = false;
        resolve('');
      }
    });
  }

  // Enviar formulario de información de la empresa
  async onSubmitCompanyInfo(): Promise<void> {
    this.submittedCompanyInfo = true;
    if (this.companyInfoForm.invalid) {
      return;
    }

    this.submittingCompanyInfo = true;
    this.errorMessage = '';
    this.success = '';

    try {
      // Si hay una imagen seleccionada, subirla primero
      let historiaImagenUrl = this.companyInfo?.historiaImagenUrl || '';
      if (this.companyHistoryImageFile) {
        historiaImagenUrl = await this.uploadCompanyHistoryImage();
      }

      // Preparar datos para enviar
      const companyInfoData: CompanyInfo = {
        _id: this.companyInfo?._id || '',
        mision: this.companyInfoForm.get('mision')?.value,
        vision: this.companyInfoForm.get('vision')?.value,
        historiaTitulo: this.companyInfoForm.get('historiaTitulo')?.value,
        historiaTexto: this.companyInfoForm.get('historiaTexto')?.value,
        historiaImagenUrl: historiaImagenUrl,
        valores: this.valoresFormArray.value,
        integrantes: this.companyInfoForm.get('integrantes')?.value || [],
        terminosTitulo: this.companyInfoForm.get('terminosTitulo')?.value || 'Términos y Condiciones',
        terminosIntroduccion: this.companyInfoForm.get('terminosIntroduccion')?.value,
        terminosSecciones: this.terminosSeccionesFormArray.value,
        terminosActualizacion: this.companyInfoForm.get('terminosActualizacion')?.value || new Date().toISOString().split('T')[0]
      };

      // Enviar datos al servidor
      this.companyInfoService.updateCompanyInfo(companyInfoData).subscribe({
        next: () => {
          this.success = 'Información de la empresa actualizada con éxito.';
          this.submittingCompanyInfo = false;
          this.loadCompanyInfo(); // Recargar datos actualizados
        },
        error: (error: any) => {
          console.error('Error al actualizar información de la empresa:', error);
          this.errorMessage = 'Error al actualizar información de la empresa. Por favor, intenta de nuevo.';
          this.submittingCompanyInfo = false;
        }
      });
    } catch (error) {
      console.error('Error en el proceso de actualización:', error);
      this.errorMessage = 'Error al procesar la solicitud. Por favor, intenta de nuevo.';
      this.submittingCompanyInfo = false;
>>>>>>> Stashed changes
    }
  }
}