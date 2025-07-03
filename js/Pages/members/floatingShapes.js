document.addEventListener('DOMContentLoaded', () => {
    const floatingShapes = document.createElement('div');
    floatingShapes.className = 'floating-shapes';
    document.body.appendChild(floatingShapes);

    // Crear formas flotantes
    const shapes = [];
    const colors = [
        'rgba(30, 64, 175, 0.08)',
        'rgba(59, 130, 246, 0.12)',
        'rgba(37, 99, 235, 0.1)',
        'rgba(29, 78, 216, 0.15)'
    ];

    // Función para generar un número aleatorio entre min y max
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Crear formas flotantes
    for (let i = 0; i < 6; i++) {
        const shape = document.createElement('div');
        shape.className = 'floating-shape';
        
        // Tamaño aleatorio
        const size = randomInRange(150, 400);
        
        // Posición aleatoria
        const posX = randomInRange(0, 100);
        const posY = randomInRange(0, 100);
        
        // Estilo de la forma
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.left = `${posX}%`;
        shape.style.top = `${posY}%`;
        
        // Color aleatorio
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        shape.style.background = `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;
        
        // Animación única para cada forma
        shape.style.animation = `floatShape ${randomInRange(15, 25)}s infinite ease-in-out ${randomInRange(0, 10)}s`;
        
        // Opacidad aleatoria
        shape.style.opacity = randomInRange(0.3, 0.8);
        
        // Añadir al contenedor
        floatingShapes.appendChild(shape);
        shapes.push(shape);
    }

    // Actualizar posición en el movimiento del mouse
    let mouseX = 0;
    let mouseY = 0;
    const strength = 30; // Fuerza del efecto de parallax

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Aplicar efecto de parallax
    function updateParallax() {
        const scrollY = window.scrollY;
        
        shapes.forEach((shape, index) => {
            const depth = (index + 1) / shapes.length;
            const x = (mouseX * strength * depth);
            const y = (mouseY * strength * depth) + (scrollY * 0.1 * depth);
            
            shape.style.transform = `translate(${x}px, ${y}px) scale(${1 + depth * 0.2})`;
        });
        
        requestAnimationFrame(updateParallax);
    }

    updateParallax();

    // Manejar el redimensionamiento de la ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            shapes.forEach(shape => {
                shape.style.animation = 'none';
                void shape.offsetWidth; // Trigger reflow
                shape.style.animation = `floatShape ${randomInRange(15, 25)}s infinite ease-in-out ${randomInRange(0, 10)}s`;
            });
        }, 100);
    });
});
