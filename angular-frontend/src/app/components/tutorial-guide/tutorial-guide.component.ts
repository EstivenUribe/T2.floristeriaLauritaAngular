import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tutorial-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutorial-guide.component.html',
  styleUrl: './tutorial-guide.component.css'
})
export class TutorialGuideComponent implements OnInit {
  isVisible = false;
  currentStep = 0;
  totalSteps = 0;
  tourSteps = [
    { 
      selector: '.menu-hamburger', 
      position: 'right', 
      title: 'Menú principal',
      content: 'Aquí podrás acceder de forma rápida a cualquiera de las opciones de navegación. Haz clic en este menú para ver todas las secciones disponibles.',
      action: 'showMenuOnly'
    },
    { 
      selector: '.sidebar-menu li:nth-child(1) a', 
      position: 'bottom', 
      title: 'Inicio',
      content: 'En esta sección podrás ver lo nuevo que la floristería estará promocionando.',
      action: 'none'
    },
    { 
      selector: '.sidebar-menu li:nth-child(2) a', 
      position: 'bottom', 
      title: 'Catálogo',
      content: 'Explora nuestra completa colección de arreglos florales, ramos y detalles para toda ocasión.',
      action: 'none'
    },
    { 
      selector: '.sidebar-menu li:nth-child(3) a', 
      position: 'bottom', 
      title: 'Ofertas',
      content: 'Descubre nuestras promociones especiales y arreglos con descuentos exclusivos.',
      action: 'none'
    },
    { 
      selector: '.sidebar-menu li:nth-child(4) a', 
      position: 'bottom', 
      title: 'Nosotros',
      content: 'Conoce más sobre nuestra floristería, nuestra historia y nuestro equipo.',
      action: 'none'
    },
    { 
      selector: '.sidebar-menu li:nth-child(5) a', 
      position: 'bottom', 
      title: 'Contacto',
      content: 'Aquí podrás encontrar nuestros datos de contacto, ubicación y formulario de consultas.',
      action: 'none'
    },
    { 
      selector: '.user-button', 
      position: 'left', 
      title: 'Tu perfil',
      content: 'Accede a las opciones de tu cuenta, historial de compras y personalización de perfil.',
      action: 'none'
    },
    { 
      selector: '.cart-link', 
      position: 'left', 
      title: 'Carrito de compras',
      content: 'Aquí podrás ver tus productos seleccionados y proceder al checkout.',
      action: 'highlightOnly'
    }
  ];
  
  // Variables para animaciones
  arrowPosition = { top: '0px', left: '0px' };
  highlightPosition = { top: '0px', left: '0px', width: '0px', height: '0px' };
  tooltipPosition = { top: '0px', left: '0px' };

  // Estado del menú para el tutorial
  menuOpen = false;
  cartOpen = false;

  // Referencia a elementos del DOM
  @ViewChild('arrow') arrow!: ElementRef;
  @ViewChild('highlight') highlight!: ElementRef;
  @ViewChild('tooltip') tooltip!: ElementRef;

  constructor(
    private renderer: Renderer2, 
    private el: ElementRef,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Tutorial guiado: Componente inicializado');
    // Iniciar el tutorial inmediatamente
    // Dar un pequeño retraso para permitir que la página se cargue completamente
    setTimeout(() => {
      this.startTour();
    }, 1000);
  }

  startTour(): void {
    console.log('Iniciando tutorial guiado...');
    this.isVisible = true;
    this.currentStep = 0;
    this.totalSteps = this.tourSteps.length;
    this.showStep(this.currentStep);
    
    // Marcar que el tutorial ya ha comenzado para este usuario
    localStorage.removeItem('firstTimeUser');
    localStorage.setItem('userCompletedTutorial', 'false');
  }

  nextStep(): void {
    if (this.currentStep < this.tourSteps.length - 1) {
      // Si hay una acción de cierre para el paso actual, ejecutarla
      if (this.tourSteps[this.currentStep].action === 'toggleMenu' && this.menuOpen) {
        this.toggleMenuForTutorial();
      } else if (this.tourSteps[this.currentStep].action === 'showCart' && this.cartOpen) {
        this.toggleCartForTutorial();
      }
      
      this.currentStep++;
      this.showStep(this.currentStep);
    } else {
      this.endTour();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      // Si hay una acción de cierre para el paso actual, ejecutarla
      if (this.tourSteps[this.currentStep].action === 'toggleMenu' && this.menuOpen) {
        this.toggleMenuForTutorial();
      } else if (this.tourSteps[this.currentStep].action === 'showCart' && this.cartOpen) {
        this.toggleCartForTutorial();
      }
      
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }

  showStep(index: number): void {
    const step = this.tourSteps[index];
    
    // Ejecutar acciones específicas antes de mostrar el paso
    if (step.action === 'showMenuOnly' && !this.menuOpen) {
      // Abrir menú hamburguesa para ver las opciones
      this.toggleMenuForTutorial();
    } else if (step.action === 'highlightOnly') {
      // Solo destacar el elemento sin abrir nada
      console.log('Destacando elemento sin abrir: ' + step.selector);
    }
    
    setTimeout(() => {
      const element = document.querySelector(step.selector) as HTMLElement;
      if (!element) {
        console.error(`Elemento ${step.selector} no encontrado`);
        return;
      }
      
      const rect = element.getBoundingClientRect();
      
      // Posicionar flecha y destacado
      this.positionElements(rect, step.position);
    }, 300);
  }

  positionElements(rect: DOMRect, position: string): void {
    // 1. Hacer scroll para que el elemento esté en la vista si está fuera
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      const scrollTo = rect.top + window.scrollY - 100; // 100px desde la parte superior
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
    }
    
    // 2. Posicionar el destacado exactamente sobre el elemento
    this.highlightPosition = {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    };
    
    // 3. Posicionar la flecha apuntando al elemento
    switch (position) {
      case 'top':
        this.arrowPosition = {
          top: `${rect.top + window.scrollY - 20}px`,
          left: `${rect.left + window.scrollX + rect.width / 2}px`
        };
        break;
      case 'right':
        this.arrowPosition = {
          top: `${rect.top + window.scrollY + rect.height / 2}px`,
          left: `${rect.right + window.scrollX + 10}px`
        };
        break;
      case 'bottom':
        this.arrowPosition = {
          top: `${rect.bottom + window.scrollY + 10}px`,
          left: `${rect.left + window.scrollX + rect.width / 2}px`
        };
        break;
      case 'left':
        this.arrowPosition = {
          top: `${rect.top + window.scrollY + rect.height / 2}px`,
          left: `${rect.left + window.scrollX - 20}px`
        };
        break;
    }
    
    // 4. Posicionar el tooltip cerca del elemento pero visible
    const tooltipHeight = 200; // Altura aproximada del tooltip
    const tooltipWidth = 300;  // Ancho aproximado del tooltip
    
    let tooltipTop = rect.top + window.scrollY;
    let tooltipLeft = rect.left + window.scrollX;
    
    switch (position) {
      case 'top':
        tooltipTop = rect.top + window.scrollY - tooltipHeight - 30; 
        tooltipLeft = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'right':
        tooltipTop = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2);
        tooltipLeft = rect.right + window.scrollX + 30;
        break;
      case 'bottom':
        tooltipTop = rect.bottom + window.scrollY + 30;
        tooltipLeft = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        tooltipTop = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2);
        tooltipLeft = rect.left + window.scrollX - tooltipWidth - 30;
        break;
    }
    
    // Asegurar que el tooltip no se salga de la pantalla
    tooltipTop = Math.max(50, Math.min(tooltipTop, window.innerHeight + window.scrollY - tooltipHeight - 50));
    tooltipLeft = Math.max(10, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 10));
    
    this.tooltipPosition = {
      top: `${tooltipTop}px`,
      left: `${tooltipLeft}px`
    };
  }

  toggleMenuForTutorial(): void {
    this.menuOpen = true; // Solo abrir, no alternar
    const menuButton = document.querySelector('.menu-hamburger') as HTMLElement;
    if (menuButton) {
      menuButton.click();
      console.log('Menu hamburguesa abierto para el tutorial');
    }
  }

  // Este método ya no abre el carrito, solo lo destaca
  toggleCartForTutorial(): void {
    // No hacemos nada más que marcar que estamos destacando el carrito
    console.log('Destacando el carrito sin abrirlo');
  }

  endTour(): void {
    // Cerrar menús si están abiertos
    if (this.menuOpen) {
      this.toggleMenuForTutorial();
    }
    if (this.cartOpen) {
      this.toggleCartForTutorial();
    }
    
    this.isVisible = false;
    localStorage.setItem('userCompletedTutorial', 'true');
  }

  skipTour(): void {
    this.endTour();
  }
}
