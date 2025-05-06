import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { TeamService } from '../../services/team.service';
import { BannerService } from '../../services/banner.service';
import { CompanyInfoService } from '../../services/company-info.service';
import { UploadService } from '../../services/upload.service';
import { Product } from '../../models/product.model';
import { TeamMember } from '../../models/team-member.model';
import { Banner, BannerSection } from '../../models/banner.model';
import { CompanyInfo } from '../../models/company-info.model';
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
  // State variables
  activeTab: 'productos' | 'equipo' | 'banners' | 'configuracion' = 'productos';
  
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

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private teamService: TeamService,
    private bannerService: BannerService,
    private companyInfoService: CompanyInfoService,
    private uploadService: UploadService
  ) {
    // Initialize product form
    this.productForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      imagen: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
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
      integrantes: [[]]
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
  }

  // Tab Navigation
  setActiveTab(tab: 'productos' | 'equipo' | 'banners' | 'configuracion'): void {
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
      case 'configuracion':
        if (!this.companyInfo) {
          this.loadCompanyInfo();
        }
        break;
    }
  }
  
  resetMessages(): void {
    this.success = '';
    this.error = '';
  }

  // PRODUCTOS
  loadProducts(): void {
    this.productService.getProducts()
      .subscribe({
        next: (data) => {
          this.products = data;
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
          console.error('Error al subir foto:', err);
        }
      });
  }
  
  // BANNERS
  loadBanners(): void {
    this.bannerService.getAllBanners()
      .subscribe({
        next: (data) => {
          this.banners = data;
          this.filterBanners();
        },
        error: (err) => {
          this.error = 'Error al cargar banners.';
          console.error('Error al cargar banners:', err);
        }
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
        .subscribe({
          next: () => {
            this.success = 'Banner actualizado correctamente.';
            this.loadBanners();
            this.resetBannerForm();
          },
          error: (err) => {
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
          error: (err) => {
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
          error: (err) => {
            this.error = 'Error al eliminar banner.';
            console.error('Error al eliminar banner:', err);
          }
        });
    }
  }
  
  toggleBannerStatus(id: string): void {
    this.bannerService.toggleBannerStatus(id)
      .subscribe({
        next: (updatedBanner) => {
          this.success = `Banner ${updatedBanner.activo ? 'activado' : 'desactivado'} correctamente.`;
          this.loadBanners();
        },
        error: (err) => {
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
        next: (response) => {
          // Update form with image path
          this.bannerForm.patchValue({
            imagen: response.imagePath
          });
          this.uploadingBannerImage = false;
          this.success = 'Imagen subida correctamente';
        },
        error: (err) => {
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
  
  // COMPANY INFO
  loadCompanyInfo(): void {
    this.companyInfoService.getCompanyInfo()
      .subscribe({
        next: (data) => {
          this.companyInfo = data;
          this.companyInfoForm.patchValue({
            _id: data._id,
            mision: data.mision || '',
            vision: data.vision || '',
            integrantes: data.integrantes || []
          });
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
    
    // Reset form to current values
    if (this.companyInfo) {
      this.companyInfoForm.patchValue({
        _id: this.companyInfo._id,
        mision: this.companyInfo.mision || '',
        vision: this.companyInfo.vision || '',
        integrantes: this.companyInfo.integrantes || []
      });
    } else {
      this.companyInfoForm.reset({
        _id: '',
        mision: '',
        vision: '',
        integrantes: []
      });
    }
  }
}