document.addEventListener('DOMContentLoaded', function() {
  // Slide data structure
  const slide_data = [
    {
      src: 'https://images.unsplash.com/photo-1506765336936-bb05e7e06295?ixlib=rb-0.3.5&s=d40582dbbbb66c7e0812854374194c2e&auto=format&fit=crop&w=1050&q=80',
      title: 'Slide 1',
      copy: 'DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT.'
    },
    {
      src: 'https://images.unsplash.com/photo-1496309732348-3627f3f040ee?ixlib=rb-0.3.5&s=4d04f3d5a488db4031d90f5a1fbba42d&auto=format&fit=crop&w=1050&q=80',
      title: 'Slide 2',
      copy: 'DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT.'
    },
    {
      src: 'https://images.unsplash.com/photo-1504271863819-d279190bf871?ixlib=rb-0.3.5&s=7a2b986d405a04b3f9be2e56b2be40dc&auto=format&fit=crop&w=334&q=80',
      title: 'Slide 3',
      copy: 'DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT.'
    },
    {
      src: 'https://images.unsplash.com/photo-1478728073286-db190d3d8ce6?ixlib=rb-0.3.5&s=87131a6b538ed72b25d9e0fc4bf8df5b&auto=format&fit=crop&w=1050&q=80',
      title: 'Slide 4',
      copy: 'DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT.'
    },
  ];

  const slides = [];
  const captions = [];

  let autoplay = setInterval(function() {
    nextSlide();
  }, 5000);

  const container = document.getElementById('container');
  const leftSlider = document.getElementById('left-col');
  const down_button = document.getElementById('down_button');
  const up_button = document.getElementById('up_button');

  if (down_button) {
    down_button.addEventListener('click', function(e) {
      e.preventDefault();
      clearInterval(autoplay);
      nextSlide();
    });
  }

  if (up_button) {
    up_button.addEventListener('click', function(e) {
      e.preventDefault();
      clearInterval(autoplay);
      prevSlide();
    });
  }

  // Create slides and captions
  for (let i = 0; i < slide_data.length; i++) {
    // Create slide
    const slide = document.createElement('div');
    slide.classList.add('slide');
    slide.style.background = 'url(' + slide_data[i].src + ')';

    // Create caption
    const caption = document.createElement('div');
    caption.classList.add('caption');

    // Create caption heading
    const slide_title = document.createElement('div');
    slide_title.classList.add('caption-heading');
    slide_title.innerHTML = '<h1>' + slide_data[i].title + '</h1>';

    // Set initial classes
    if (i === 0) {
      slide.classList.add('current');
      caption.classList.add('current-caption');
    } else if (i === 1) {
      slide.classList.add('next');
      caption.classList.add('next-caption');
    } else if (i === slide_data.length - 1) {
      slide.classList.add('previous');
      caption.classList.add('previous-caption');
    }

    // Build caption
    caption.appendChild(slide_title);
    caption.insertAdjacentHTML('beforeend', '<div class="caption-subhead"><span>' + slide_data[i].copy + '</span></div>');
    caption.insertAdjacentHTML('beforeend', '<a class="btn" href="#">View More</a>');

    // Add to arrays
    slides.push(slide);
    captions.push(caption);

    // Add to DOM
    leftSlider.appendChild(slide);
    container.appendChild(caption);
  }

  function nextSlide() {
    slides[0].classList.remove('current');
    slides[0].classList.add('previous', 'change');
    slides[1].classList.remove('next');
    slides[1].classList.add('current');
    if (slides[2]) slides[2].classList.add('next');
    const last = slides.length - 1;
    slides[last].classList.remove('previous');

    captions[0].classList.remove('current-caption');
    captions[0].classList.add('previous-caption', 'change');
    captions[1].classList.remove('next-caption');
    captions[1].classList.add('current-caption');
    if (captions[2]) captions[2].classList.add('next-caption');
    const last_caption = captions.length - 1;
    captions[last_caption].classList.remove('previous-caption');

    const placeholder = slides.shift();
    const caption_placeholder = captions.shift();

    if (placeholder && caption_placeholder) {
      slides.push(placeholder);
      captions.push(caption_placeholder);
    }
  }

  function prevSlide() {
    const last = slides.length - 1;
    slides[last].classList.add('next');
    slides[0].classList.remove('current');
    slides[0].classList.add('next');
    slides[1].classList.remove('next');
    slides[last].classList.remove('previous');
    if (slides[last - 1]) slides[last - 1].classList.remove('previous');
    slides[last].classList.add('current');

    const last_caption = captions.length - 1;
    captions[last].classList.add('next-caption');
    captions[0].classList.remove('current-caption');
    captions[0].classList.add('next-caption');
    captions[1].classList.remove('next-caption');
    captions[last].classList.remove('previous-caption');
    if (captions[last - 1]) captions[last - 1].classList.remove('previous-caption');
    captions[last].classList.add('current-caption');

    const placeholder = slides.pop();
    const caption_placeholder = captions.pop();

    if (placeholder && caption_placeholder) {
      slides.unshift(placeholder);
      captions.unshift(caption_placeholder);
    }
  }

  // Transition detection
  function whichTransitionEvent() {
    const el = document.createElement('fakeelement');
    const transitions = {
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

  const transitionEvent = whichTransitionEvent();

  function customFunction(event) {
    const caption = event.target;
    if (transitionEvent) {
      caption.removeEventListener(transitionEvent, customFunction);
    }
    console.log('Animation ended');
  }

  if (transitionEvent) {
    captions.forEach(function(caption) {
      caption.addEventListener(transitionEvent, customFunction);
    });
  }
});
