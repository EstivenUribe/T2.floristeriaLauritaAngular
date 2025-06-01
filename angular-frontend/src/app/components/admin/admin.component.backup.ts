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
import { CompanyInfo, Valor, Integrante, TerminoSeccion } from '../../models/company-info.model';
import { Review, UserReviewInfo, ProductReviewInfo } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
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
  productForm!: FormGroup;
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
  teamMemberForm!: FormGroup;
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
  bannerFilter: string = 'all';
  bannerFilterSection: string = 'todos';
  
  // Configuración
  companyInfoForm!: FormGroup;
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

  // Método para resetear mensajes de error y éxito
  resetMessages(): void {
    this.error = '';
    this.success = '';
  }

  ngOnInit(): void {
    // Inicializar formularios
    this.initForms();
    
    // Cargar datos iniciales
    this.loadProducts();
    this.loadTeamMembers();
    this.loadBanners();
    this.loadCompanyInfo();
    this.loadReviews();
    
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
      this.loadingReviews = isLoading;
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
      }
    });
    
    // Mostrar previsualización de la imagen
this.bannerSelectedFile = null; // Limpiar selección de archivo
    
    // Cambiar a la tab de banners si no está activa
    this.activeTab = 'banners';
  }

  // Eliminar un banner
  deleteBanner(bannerId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este banner? Esta acción no se puede deshacer.')) {
      return;
    }
    
    this.resetMessages();
    this.deletingBanner = true;
    
    this.bannerService.deleteBanner(bannerId).subscribe({
      next: () => {
        this.success = 'Banner eliminado con éxito';
        this.loadBanners(); // Recargar lista de banners
      },
      error: (error) => {
        console.error('Error al eliminar banner:', error);
        this.error = 'Error al eliminar el banner. Por favor, intenta de nuevo.';
      },
      complete: () => {
        this.deletingBanner = false;
      }
    });
  }

  // Activar/Desactivar un banner
  toggleBannerStatus(banner: Banner | string): void {
    let bannerId: string;
    
    if (typeof banner === 'string') {
      bannerId = banner;
    } else if (banner && banner._id) {
      bannerId = banner._id;
    } else {
      console.error('Banner no tiene ID. No se puede cambiar estado.');
      this.error = 'No se pudo cambiar el estado del banner. Identificador faltante.';
      return;
    }
    
    this.bannerService.toggleBannerStatus(bannerId).subscribe({
      next: (updatedBanner) => {
        this.success = `Banner ${updatedBanner.activo ? 'activado' : 'desactivado'} correctamente.`;
        this.loadBanners(); // Recargar banners para reflejar cambio
      },
      error: (error) => {
        console.error('Error al cambiar estado del banner:', error);
        this.error = 'Error al cambiar el estado del banner. Por favor, intenta de nuevo.';
      }
    });
  }

  // COMPANY INFO (Ahora Políticas)
  loadCompanyInfo(): void {
    this.companyInfoService.getCompanyInfo()
{{ ... }}
        next: (data) => {
          this.companyInfo = data;
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
        historiaImagenUrl: this.companyInfo.historiaImagenUrl || '',
        // Campos de términos y condiciones
        terminosTitulo: this.companyInfo.terminosTitulo || 'Términos y Condiciones',
        terminosIntroduccion: this.companyInfo.terminosIntroduccion || '',
        terminosActualizacion: this.companyInfo.terminosActualizacion ? 
          new Date(this.companyInfo.terminosActualizacion).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
        // No parchear 'valores', 'integrantes' o 'terminosSecciones' directamente aquí
      });

      // Valores
      this.valoresFormArray.clear();
      if (this.companyInfo.valores && this.companyInfo.valores.length > 0) {
        this.companyInfo.valores.forEach(valor => this.valoresFormArray.push(this.createValorGroup(valor)));
      } else {
        this.addValor(); // Añadir uno vacío por defecto si no hay
      }
      
      // Integrantes
      const integrantesControl = this.companyInfoForm.get('integrantes') as FormArray;
      integrantesControl.clear();
      if (this.companyInfo.integrantes && this.companyInfo.integrantes.length > 0) {
        // Lógica para repoblar integrantes si es un FormArray editable
      }

      // Secciones de términos
      this.terminosSeccionesFormArray.clear();
      if (this.companyInfo.terminosSecciones && this.companyInfo.terminosSecciones.length > 0) {
        // Ordenar secciones por el campo 'orden'
        const seccionesOrdenadas = [...this.companyInfo.terminosSecciones].sort((a, b) => a.orden - b.orden);
        seccionesOrdenadas.forEach(seccion => {
          this.terminosSeccionesFormArray.push(this.createTerminoSeccionGroup(seccion));
        });
      } else {
        this.addTerminoSeccion(); // Añadir una sección vacía por defecto si no hay
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
        terminosTitulo: 'Términos y Condiciones',
        terminosIntroduccion: '',
        terminosActualizacion: new Date().toISOString().split('T')[0],
        // No resetear FormArrays aquí, se limpian explícitamente
        integrantes: [] // Resetear a array vacío si es un campo simple del form
      });
      
      // Limpiar y inicializar arrays
      this.valoresFormArray.clear();
      this.addValor(); // Añadir uno vacío por defecto
      
      (this.companyInfoForm.get('integrantes') as FormArray).clear(); // Si es FormArray
      
      this.terminosSeccionesFormArray.clear();
      this.addTerminoSeccion(); // Añadir una sección vacía por defecto
    }
  }
}