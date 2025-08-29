// Función para cargar el header
function loadHeader() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) {
        console.error('No se encontró el contenedor del header');
        return;
    }

    // Cargar el contenido del header
    fetch('/components/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el header: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
            headerContainer.innerHTML = html;
            console.log('Header cargado correctamente');
            initializeMobileMenu();
        })
        .catch(error => {
            console.error('Error:', error);
            // Código de respaldo en caso de error
            const fallbackHeader = `
                <div class="headerContainer">
                    <div class="headerContent">
                        <div class="logoContainer">
                            <a href="/" class="headerLogo">
                                <img src="/assets/Components/Header/redmexsu_logotipo-encabezado.png" alt="REDMEXSU" class="logoImage">
                            </a>
                        </div>
                        <div class="menuToggle" id="mobile-menu">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </div>
                        <div class="overlay" id="overlay"></div>
                        <nav class="mainNav" id="main-nav">
                            <div class="navLinks">
                                <a href="/" class="navItem"><span class="navText">INICIO</span><div class="navUnderline"></div></a>
                                <a href="/pages/News/newsPage.html" class="navItem"><span class="navText">NOTICIAS</span><div class="navUnderline"></div></a>
                                <a href="/pages/Members/membersPage.html" class="navItem"><span class="navText">MIEMBROS</span><div class="navUnderline"></div></a>
                                <a href="/pages/Program/programPage.html" class="navItem"><span class="navText">PROGRAMA</span><div class="navUnderline"></div></a>
                                <a href="/pages/Contact/contactPage.html" class="navItem"><span class="navText">CONTACTO</span><div class="navUnderline"></div></a>
                            </div>
                        </nav>
                    </div>
                </div>
            `;
            headerContainer.innerHTML = fallbackHeader;
            initializeMobileMenu();
        });
}

// Función para inicializar el menú móvil
function initializeMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const nav = document.getElementById('main-nav');
    const overlay = document.getElementById('overlay');

    if (!menuToggle || !nav || !overlay) {
        console.warn('No se encontraron los elementos del menú móvil');
        return;
    }

    // Toggle del menú principal
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = document.body.style.overflow === 'hidden' ? '' : 'hidden';
    });

    // Manejar clic en los dropdowns
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.navLink');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (link && content) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    // Cerrar menús al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.navItem:not(.dropdown) > a, .dropdown-item');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Cerrar todos los dropdowns
            document.querySelectorAll('.dropdown').forEach(dd => {
                dd.classList.remove('active');
            });
        });
    });

    // Cerrar menú al hacer clic en el overlay
    overlay.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Cerrar todos los dropdowns
        document.querySelectorAll('.dropdown').forEach(dd => {
            dd.classList.remove('active');
        });
    });

    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isClickInside = nav.contains(e.target) || menuToggle.contains(e.target);
            if (!isClickInside) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                
                // Cerrar todos los dropdowns
                document.querySelectorAll('.dropdown').forEach(dd => {
                    dd.classList.remove('active');
                });
            }
        }
    });
}

// Inicializar cuando el DOM esté completamente cargado
function initHeader() {
    console.log('Inicializando header...');
    loadHeader();
}

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
} else {
    // DOM ya está listo
    initHeader();
}

// También exportar para acceso global (por si acaso)
window.initHeader = initHeader;
