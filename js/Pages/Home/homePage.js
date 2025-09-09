import { getLatestNews, getLatestEvents } from '../../services/supabaseService.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtener la última noticia
        const latestNews = await getLatestNews(1);
        
        if (latestNews && latestNews.length > 0) {
            updateLatestNewsSection(latestNews[0]);
        }
        
        // Obtener el próximo evento
        const latestEvents = await getLatestEvents(1);
        
        if (latestEvents && latestEvents.length > 0) {
            updateLatestEventSection(latestEvents[0]);
        }
    } catch (error) {
        console.error('Error al cargar contenido dinámico:', error);
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

function updateLatestEventSection(eventItem) {
    const eventContainer = document.querySelector('.event-card');
    if (!eventContainer) return;

    // Formatear la fecha
    const eventDate = new Date(eventItem.date);
    const formattedDate = eventDate.toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
    }).toUpperCase();
    
    // Construir la URL de la imagen (usar la primera imagen si existe)
    const imageUrl = eventItem.img_url && eventItem.img_url.length > 0 
        ? eventItem.img_url[0] 
        : '/assets/Pages/Home/evento1.png';
    
    // Actualizar el contenido de la tarjeta de eventos
    eventContainer.innerHTML = `
        <div class="event-header">
            <h3>Próximo Evento</h3>
            <div class="event-date">${formattedDate.replace(' ', '').replace(',', '').toUpperCase()}</div>
        </div>
        <div class="event-image">
            <img src="${imageUrl}" alt="${eventItem.description || 'Próximo evento'}">
        </div>
        <div class="event-content">
            <h4>${eventItem.description || 'Evento próximo'}</h4>
            ${eventItem.location ? `<p class="event-location">${eventItem.location}</p>` : ''}
            <p>${eventItem.details || 'Mantente atento para más información sobre nuestro próximo evento.'}</p>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
}
