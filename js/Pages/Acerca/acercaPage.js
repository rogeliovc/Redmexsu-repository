// Función para verificar si un elemento está en la vista
document.addEventListener('DOMContentLoaded', function() {
    // Función para verificar si un elemento está en la vista
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
            rect.bottom >= 0
        );
    }

    // Función para manejar las animaciones al hacer scroll
    function handleScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('animate');
            }
        });
    }

    // Ejecutar al cargar la página
    handleScrollAnimations();

    // Ejecutar al hacer scroll
    window.addEventListener('scroll', handleScrollAnimations);

    // También ejecutar cuando se redimensione la ventana
    window.addEventListener('resize', handleScrollAnimations);
});
