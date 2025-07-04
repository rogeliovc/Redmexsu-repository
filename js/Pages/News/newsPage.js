import { getFeaturedNews, getLatestNews } from '../../services/supabaseService.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cargar noticias destacadas
        const featuredNews = await getFeaturedNews();
        
        if (featuredNews && featuredNews.length > 0) {
            // Mostrar noticias destacadas en el carrusel
            renderFeaturedNews(featuredNews);
            initSlider();
            
            // Obtener IDs de noticias destacadas para evitar duplicados
            const featuredIds = new Set(featuredNews.map(n => n.id));
            
            // Cargar últimas noticias excluyendo las ya mostradas como destacadas
            const latestNews = await getLatestNews();
            
            if (latestNews && latestNews.length > 0) {
                // Filtrar noticias para excluir las ya mostradas como destacadas
                const filteredLatestNews = latestNews.filter(news => !featuredIds.has(news.id));
                
                // Mostrar noticias destacadas primero, luego las demás
                const allNews = [...featuredNews, ...filteredLatestNews];
                renderLatestNews(allNews);
            } else {
                // Si no hay más noticias, mostrar solo las destacadas
                renderLatestNews(featuredNews);
            }
        } else {
            // Si no hay noticias destacadas, cargar las últimas noticias normalmente
            const latestNews = await getLatestNews();
            if (latestNews && latestNews.length > 0) {
                renderLatestNews(latestNews);
            }
        }
    } catch (error) {
        console.error('Error al cargar las noticias:', error);
        // Mostrar mensaje de error al usuario
        const newsGrid = document.querySelector('.news-grid');
        if (newsGrid) {
            newsGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No se pudieron cargar las noticias. Por favor, inténtalo de nuevo más tarde.</p>
                </div>
            `;
        }
    }
});

function renderFeaturedNews(news) {
    const slider = document.querySelector('.featured-slider');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (!slider || !dotsContainer) return;

    // Limpiar contenido existente
    slider.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Crear slides y puntos de navegación
    news.forEach((item, index) => {
        // Crear slide
        const slide = document.createElement('div');
        slide.className = 'featured-slide';
        slide.setAttribute('data-slide', index);
        
        slide.innerHTML = `
            <div class="featured-slide-content">
                <div class="featured-image-container">
                    <img src="${item.imagen_url || '/assets/images/placeholder-news.jpg'}" alt="${item.titulo}">
                </div>
                <div class="featured-text">
                    <span class="news-date">${formatDate(item.fecha_publicacion)}</span>
                    <h2>${item.titulo}</h2>
                    <p>${item.resumen || ''}</p>
                    <a href="/pages/News/detalle-noticia.html?id=${item.id}" class="read-more">Leer más <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
        
        slider.appendChild(slide);

        // Crear punto de navegación
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        dot.setAttribute('data-slide', index);
        dot.setAttribute('aria-label', `Ir a noticia ${index + 1}`);
        if (index === 0) dot.classList.add('active');
        dotsContainer.appendChild(dot);
    });
}

function renderLatestNews(news) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    // Limpiar contenido existente (excepto el primer elemento de ejemplo si existe)
    const exampleArticle = newsGrid.querySelector('.news-card:first-child');
    newsGrid.innerHTML = exampleArticle ? '' : '';

    // Agregar noticias al grid
    news.forEach(item => {
        const article = document.createElement('article');
        article.className = 'news-card';
        
        article.innerHTML = `
            <div class="news-image">
                <img src="${item.imagen_url || '/assets/images/placeholder-news.jpg'}" alt="${item.titulo}">
                <span class="news-date">${formatDate(item.fecha_publicacion)}</span>
            </div>
            <div class="news-content">
                <h2>${item.titulo}</h2>
                <p>${item.resumen || ''}</p>
                <a href="/pages/News/detalle-noticia.html?id=${item.id}" class="read-more">Leer más <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        
        newsGrid.appendChild(article);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
}

function initSlider() {
    const slider = document.querySelector('.featured-slider');
    const slides = document.querySelectorAll('.featured-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const nextBtn = document.querySelector('.slider-arrow.next');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    
    if (!slider || slides.length === 0) {
        console.error('No se encontraron slides o el contenedor del slider');
        return;
    }

    console.log(`Iniciando slider con ${slides.length} diapositivas`);
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let slideInterval;

    // Configuración inicial del slider
    function initSliderStyles() {
        // Asegurarse de que el contenedor tenga posición relativa
        slider.style.position = 'relative';
        slider.style.overflow = 'hidden';
        slider.style.width = '100%';
        slider.style.minHeight = '400px'; // Asegurar altura mínima
        
        // Establecer estilos para cada slide
        slides.forEach((slide, index) => {
            slide.style.position = 'absolute';
            slide.style.top = '0';
            slide.style.left = '0';
            slide.style.width = '100%';
            slide.style.height = '100%';
            slide.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
            slide.style.display = 'flex';
            slide.style.justifyContent = 'center';
            slide.style.alignItems = 'center';
        });
        
        // Mostrar el primer slide
        if (slides[0]) {
            slides[0].style.opacity = '1';
            slides[0].style.visibility = 'visible';
        }
    }

    function updateSlider() {
        console.log(`Actualizando slider a la diapositiva ${currentSlide}`);
        
        // Ocultar todos los slides primero
        slides.forEach((slide, index) => {
            if (index !== currentSlide) {
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
                slide.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Mostrar solo el slide actual
        if (slides[currentSlide]) {
            // Asegurar que el slide actual sea visible
            setTimeout(() => {
                slides[currentSlide].style.opacity = '1';
                slides[currentSlide].style.visibility = 'visible';
                slides[currentSlide].setAttribute('aria-hidden', 'false');
            }, 10);
        }
        
        // Actualizar indicadores de navegación
        dots.forEach((dot, index) => {
            const isActive = index === currentSlide;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    function goToSlide(index) {
        if (index < 0) {
            currentSlide = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        updateSlider();
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    function startAutoSlide() {
        stopAutoSlide();
        slideInterval = setInterval(nextSlide, 5000); // Cambiar cada 5 segundos
    }
    
    function stopAutoSlide() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }
    
    // Inicializar el slider
    initSliderStyles();
    updateSlider();
    
    // Agregar event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Navegación por puntos
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });
    
    // Iniciar autoplay
    startAutoSlide();
    
    // Pausar autoplay al hacer hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Event listeners
    nextBtn?.addEventListener('click', nextSlide);
    prevBtn?.addEventListener('click', prevSlide);

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.getAttribute('data-slide')));
        });
    });

    // Inicializar slider
    updateSlider();

    // Autoplay
    let autoplay = setInterval(nextSlide, 5000);

    // Pausar autoplay al hacer hover
    slider.addEventListener('mouseenter', () => {
        clearInterval(autoplay);
    });

    slider.addEventListener('mouseleave', () => {
        autoplay = setInterval(nextSlide, 5000);
    });
}
