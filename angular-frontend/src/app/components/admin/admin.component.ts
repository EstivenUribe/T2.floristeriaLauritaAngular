import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { UploadService } from '../../services/upload.service';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  isEditing = false;
  currentProductId = '';
  
  // Variables para manejo de imágenes
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private uploadService: UploadService
  ) {
    this.productForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      imagen: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      rebaja: [false]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts()
      .subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar productos.';
          this.loading = false;
          console.error('Error al cargar productos admin:', err);
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    this.success = '';
    this.error = '';

    // Validar formulario
    if (this.productForm.invalid) {
      return;
    }

    const product: Product = this.productForm.value;
    this.loading = true;

    if (this.isEditing) {
      // Actualizar producto existente
      this.productService.updateProduct(this.currentProductId, product)
        .subscribe({
          next: () => {
            this.success = 'Producto actualizado correctamente.';
            this.loadProducts();
            this.resetForm();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al actualizar producto.';
            this.loading = false;
            console.error('Error al actualizar producto:', err);
          }
        });
    } else {
      // Crear nuevo producto
      this.productService.createProduct(product)
        .subscribe({
          next: () => {
            this.success = 'Producto creado correctamente.';
            this.loadProducts();
            this.resetForm();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al crear producto.';
            this.loading = false;
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
  }

  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.loading = true;
      this.productService.deleteProduct(id)
        .subscribe({
          next: () => {
            this.success = 'Producto eliminado correctamente.';
            this.loadProducts();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al eliminar producto.';
            this.loading = false;
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
  
  // Método para manejar la selección de archivos
  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFile = inputElement.files[0];
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  // Método para subir la imagen seleccionada
  uploadImage(): void {
    if (!this.selectedFile) {
      return;
    }
    
    this.uploadingImage = true;
    this.error = '';
    
    this.uploadService.uploadImage(this.selectedFile)
      .subscribe({
        next: (response) => {
          // Actualizar el formulario con la ruta de la imagen
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
}