import { getLatestNews } from '../../services/supabaseService.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtener la última noticia
        const latestNews = await getLatestNews(1); // Solo necesitamos la más reciente
        
        if (latestNews && latestNews.length > 0) {
            updateLatestNewsSection(latestNews[0]);
        }
    } catch (error) {
        console.error('Error al cargar la última noticia:', error);
        // Mantener el contenido por defecto en caso de error
    }
});

function updateLatestNewsSection(newsItem) {
    const newsContainer = document.querySelector('.news-card');
    if (!newsContainer) return;

    // Formatear la fecha
    const formattedDate = formatDate(newsItem.fecha_publicacion);
    const [day, month, year] = formattedDate.split(' ');
    
    // Actualizar el contenido de la tarjeta de noticias
    newsContainer.innerHTML = `
        <div class="news-header">
            <h3>Última Noticia</h3>
            <div class="news-date">${day} ${month.toUpperCase()} ${year}</div>
        </div>
        <div class="news-image">
            <img src="${newsItem.imagen_url || '/assets/Pages/Home/redmexsuNoticia.jpg'}" alt="${newsItem.titulo}">
        </div>
        <div class="news-content">
            <h3>${newsItem.titulo}</h3>
            <p>${newsItem.resumen || ''}</p>
            ${newsItem.enlace ? `<a href="${newsItem.enlace}" class="read-more">Leer más <i class="fas fa-arrow-right"></i></a>` : ''}
        </div>
    `;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
}
