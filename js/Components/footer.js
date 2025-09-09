// Cargar el footer en el contenedor correspondiente
document.addEventListener('DOMContentLoaded', function() {
    const footerContainer = document.getElementById('footer-container');
    
    if (footerContainer) {
        fetch('/components/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo cargar el footer');
                }
                return response.text();
            })
            .then(html => {
                footerContainer.innerHTML = html;
            })
            .catch(error => {
                console.error('Error al cargar el footer:', error);
                footerContainer.innerHTML = `
                    <div class="footer">
                        <div class="footerContent">
                            <div class="footerCopyright">
                                &copy; 2025 REDMEXSU - Red Mexicana de Supercómputo. Todos los derechos reservados.
                            </div>
                        </div>
                    </div>
                `;
            });
    }
});
