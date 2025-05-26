import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SlideData {
  src: string;
  title: string;
  copy: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-carousel-principal',
  templateUrl: './carousel-principal.component.html',
  styleUrls: ['./carousel-principal.component.css']
})
export class CarouselPrincipalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('container', { static: false }) container!: ElementRef<HTMLDivElement>;
  @ViewChild('leftCol', { static: false }) leftCol!: ElementRef<HTMLDivElement>; // Selector cambiado a 'leftCol' para coincidir con la nueva variable de plantilla #leftCol
  @ViewChild('upButton', { static: false }) upButton!: ElementRef<HTMLAnchorElement>; // Selector cambiado a 'upButton' para coincidir con #upButton
  @ViewChild('down_button', { static: false }) downButton!: ElementRef<HTMLAnchorElement>;

  slide_data: SlideData[] = [
    {
      src: 'https://images.unsplash.com/photo-1506765336936-bb05e7e06295?ixlib=rb-0.3.5&s=d40582dbbbb66c7e0812854374194c2e&auto=format&fit=crop&w=1050&q=80',
      title: 'PRECIOS QUE SE TE AJUSTAN',
      copy: 'Calidad garantizada sin pagar de más.'
    },
    {
      src: 'https://images.unsplash.com/photo-1496309732348-3627f3f040ee?ixlib=rb-0.3.5&s=4d04f3d5a488db4031d90f5a1fbba42d&auto=format&fit=crop&w=1050&q=80',
      title: 'CALIDAD SUPERIOR EN CADA DETALLE',
      copy: 'Seleccionamos lo mejor para tu hogar.'
    },
    {
      src: 'https://images.unsplash.com/photo-1504271863819-d279190bf871?ixlib=rb-0.3.5&s=7a2b986d405a04b3f9be2e56b2be40dc&auto=format&fit=crop&w=334&q=80',
      title: 'DURABILIDAD QUE IMPRESIONA',
      copy: 'Nuestros productos resisten el paso del tiempo.'
    },
    {
      src: 'https://images.unsplash.com/photo-1478728073286-db190d3d8ce6?ixlib=rb-0.3.5&s=87131a6b538ed72b25d9e0fc4bf8df5b&auto=format&fit=crop&w=1050&q=80',
      title: 'ENORME VARIEDAD DE FLORES',
      copy: 'Colores, formas y aromas para cada ocasión.'
    },
  ];

  slides: HTMLElement[] = [];
  captions: HTMLElement[] = [];
  autoplayInterval: any;

  // Listener removers
  private unlistenDownButton!: () => void;
  private unlistenUpButton!: () => void;
  private transitionListeners: Array<() => void> = [];

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    // Data is already initialized
  }

  ngAfterViewInit(): void {
    // Primero, asegurarnos que los ViewChild con ID se conecten al HTML
    // Cambiando los id en el HTML a referencias de plantilla #nombre
    // Por ahora, asumiré que los id funcionan con ViewChild si los elementos están en la plantilla.
    // Si no, necesitaremos cambiar a #templateRefs en el HTML.
    this.initSlider();
    this.startAutoplay();
    this.setupButtonListeners();
  }

  ngOnDestroy(): void {
    this.clearAutoplay();
    this.removeButtonListeners();
    this.removeTransitionListeners();
  }

  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  clearAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  setupButtonListeners(): void {
    if (this.downButton && this.downButton.nativeElement) {
      this.unlistenDownButton = this.renderer.listen(this.downButton.nativeElement, 'click', (event) => {
        event.preventDefault();
        this.clearAutoplay();
        this.nextSlide();
      });
    }
    if (this.upButton && this.upButton.nativeElement) {
      this.unlistenUpButton = this.renderer.listen(this.upButton.nativeElement, 'click', (event) => {
        event.preventDefault();
        this.clearAutoplay();
        this.prevSlide();
      });
    }
  }

  removeButtonListeners(): void {
    if (this.unlistenDownButton) {
      this.unlistenDownButton();
    }
    if (this.unlistenUpButton) {
      this.unlistenUpButton();
    }
  }

  removeTransitionListeners(): void {
    this.transitionListeners.forEach(unlisten => unlisten());
    this.transitionListeners = [];
  }

  initSlider(): void {
    const leftSliderEl = this.leftCol.nativeElement;
    const containerEl = this.container.nativeElement;

    for (let i = 0; i < this.slide_data.length; i++) {
      // Create slide
      const slide = this.renderer.createElement('div');
      this.renderer.addClass(slide, 'slide');
      this.renderer.setStyle(slide, 'background', 'url(' + this.slide_data[i].src + ')');

      // Create caption
      const caption = this.renderer.createElement('div');
      this.renderer.addClass(caption, 'caption');

      // Create caption heading
      const slide_title = this.renderer.createElement('div');
      this.renderer.addClass(slide_title, 'caption-heading');
      const h1 = this.renderer.createElement('h1');
      this.renderer.addClass(h1, 'caption-title'); // Aplica clase
      const text = this.renderer.createText(this.slide_data[i].title);
      this.renderer.appendChild(h1, text);
      this.renderer.appendChild(slide_title, h1);


      // Set initial classes
      if (i === 0) {
        this.renderer.addClass(slide, 'current');
        this.renderer.addClass(caption, 'current-caption');
      } else if (i === 1) {
        this.renderer.addClass(slide, 'next');
        this.renderer.addClass(caption, 'next-caption');
      } else if (i === this.slide_data.length - 1 && this.slide_data.length > 2) {
        this.renderer.addClass(slide, 'previous');
        this.renderer.addClass(caption, 'previous-caption');
      }

      // Build caption
      this.renderer.appendChild(caption, slide_title);
      const subhead = this.renderer.createElement('div');
      this.renderer.addClass(subhead, 'caption-subhead');

      const subText = this.renderer.createElement('span');
      this.renderer.addClass(subText, 'caption-subtext'); // nueva clase para estilizar desde CSS
      this.renderer.setProperty(subText, 'textContent', this.slide_data[i].copy);

      this.renderer.appendChild(subhead, subText);
      this.renderer.appendChild(caption, subhead);

      const btnLink = this.renderer.createElement('a');
      this.renderer.addClass(btnLink, 'btn');
      this.renderer.addClass(btnLink, 'caption-btn'); // nueva clase para estilizar desde CSS
      this.renderer.setAttribute(btnLink, 'href', '#');
      this.renderer.setProperty(btnLink, 'textContent', 'View More');

      this.renderer.appendChild(caption, btnLink);

      // Add to arrays
      this.slides.push(slide);
      this.captions.push(caption);

      // Add to DOM
      this.renderer.appendChild(leftSliderEl, slide);
      this.renderer.appendChild(containerEl, caption);
    }
    this.setupTransitionListeners();
  }

  nextSlide(): void {
    if (this.slides.length < 2) return;

    this.renderer.removeClass(this.slides[0], 'current');
    this.renderer.addClass(this.slides[0], 'previous');
    this.renderer.addClass(this.slides[0], 'change');

    this.renderer.removeClass(this.slides[1], 'next');
    this.renderer.addClass(this.slides[1], 'current');

    if (this.slides[2]) {
      this.renderer.addClass(this.slides[2], 'next');
    }
    const last = this.slides.length - 1;
    this.renderer.removeClass(this.slides[last], 'previous');

    // Captions
    this.renderer.removeClass(this.captions[0], 'current-caption');
    this.renderer.addClass(this.captions[0], 'previous-caption');
    this.renderer.addClass(this.captions[0], 'change');

    this.renderer.removeClass(this.captions[1], 'next-caption');
    this.renderer.addClass(this.captions[1], 'current-caption');

    if (this.captions[2]) {
      this.renderer.addClass(this.captions[2], 'next-caption');
    }
    const last_caption = this.captions.length - 1;
    this.renderer.removeClass(this.captions[last_caption], 'previous-caption');

    const placeholder = this.slides.shift();
    const caption_placeholder = this.captions.shift();

    if (placeholder && caption_placeholder) {
      this.slides.push(placeholder);
      this.captions.push(caption_placeholder);
    }
  }

  prevSlide(): void {
    if (this.slides.length < 2) return;

    const last = this.slides.length - 1;
    this.renderer.addClass(this.slides[last], 'next');
    this.renderer.removeClass(this.slides[0], 'current');
    this.renderer.addClass(this.slides[0], 'next');
    this.renderer.removeClass(this.slides[1], 'next');
    this.renderer.removeClass(this.slides[last], 'previous');
    if (this.slides[last - 1]) {
      this.renderer.removeClass(this.slides[last - 1], 'previous');
    }
    this.renderer.addClass(this.slides[last], 'current');

    // Captions
    const last_caption = this.captions.length - 1;
    this.renderer.addClass(this.captions[last], 'next-caption');
    this.renderer.removeClass(this.captions[0], 'current-caption');
    this.renderer.addClass(this.captions[0], 'next-caption');
    this.renderer.removeClass(this.captions[1], 'next-caption');
    this.renderer.removeClass(this.captions[last], 'previous-caption');
    if (this.captions[last - 1]) {
      this.renderer.removeClass(this.captions[last - 1], 'previous-caption');
    }
    this.renderer.addClass(this.captions[last], 'current-caption');

    const placeholder = this.slides.pop();
    const caption_placeholder = this.captions.pop();

    if (placeholder && caption_placeholder) {
      this.slides.unshift(placeholder);
      this.captions.unshift(caption_placeholder);
    }
  }

  // Transition detection
  whichTransitionEvent(): string | null {
    const el = this.renderer.createElement('fakeelement');
    const transitions: { [key: string]: string } = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (const t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
    return null;
  }

  customFunction(event: Event): void {
    const caption = event.target as HTMLElement;
    const transitionEventName = this.whichTransitionEvent();
    if (transitionEventName && caption) {
      // this.renderer.listen on an element returns a function to remove the listener
      // We need to store these unlisten functions and call them to remove.
      // This approach is tricky because the listener function itself is what's removed.
      // For simplicity, this example won't auto-remove like the original, but it should be handled.
      // Or better, use Angular animations which manage this.
    }
    // console.log('Animation ended on:', caption);
  }

  setupTransitionListeners(): void {
    const transitionEventName = this.whichTransitionEvent();
    if (transitionEventName) {
      this.captions.forEach(caption => {
        const unlisten = this.renderer.listen(caption, transitionEventName, (event) => this.customFunction(event));
        this.transitionListeners.push(unlisten);
      });
    }
  }
}
