// Importar el servicio de Supabase
import { getSupabase } from '../../services/supabaseService.js';

// Cargar footer
fetch('/components/footer.html')
    .then(res => res.text())
    .then(html => {
        const footer = document.getElementById('footer-container');
        if (footer) footer.innerHTML = html;
    })
    .catch(error => console.error('Error al cargar el footer:', error));

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM cargado, inicializando aplicación...');
    try {
        console.log('Obteniendo cliente Supabase...');
        const supabase = await getSupabase();
        console.log('Cliente Supabase listo:', !!supabase);
        
        // Cargar miembros
        console.log('Iniciando carga de miembros...');
        await cargarMiembros();
        console.log('Carga de miembros completada');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        const grid = document.querySelector('.gridContainermembers');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los miembros. Por favor, intenta recargar la página.</p>
                    <p><small>${error.message}</small></p>
                </div>
            `;
        }
    }
});

// Función para cargar miembros
async function cargarMiembros() {
    console.log('Iniciando carga de miembros...');
    const grid = document.querySelector('.gridContainermembers');
    
    if (!grid) {
        console.error('No se encontró el contenedor de miembros');
        return;
    }

    // Mostrar mensaje de carga
    grid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando miembros...</p>
        </div>
    `;

    try {
        // Obtener instancia de Supabase
        console.log('Obteniendo cliente Supabase...');
        const supabase = await getSupabase();
        console.log('Cliente Supabase obtenido');

        // Verificar si hay datos en caché
        const CACHE_KEY = 'miembros_cache';
        const CACHE_DURATION = 3600000; // 1 hora en milisegundos
        const now = Date.now();
        let data = null;
        let shouldUpdateCache = true;

        // Intentar obtener datos del caché
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            try {
                const { timestamp, members } = JSON.parse(cachedData);
                // Si los datos en caché son recientes, usarlos
                if (now - timestamp < CACHE_DURATION) {
                    data = members;
                    shouldUpdateCache = false;
                    console.log('Usando datos en caché:', data.length, 'miembros');
                    mostrarMiembros(data);
                }
            } catch (e) {
                console.error('Error al procesar caché:', e);
                // Si hay error con el caché, forzar actualización
                shouldUpdateCache = true;
            }
        }

        // Si no hay datos en caché o están desactualizados, obtener de Supabase
        if (shouldUpdateCache) {
            console.log('Obteniendo miembros desde Supabase...');
            const { data: miembros, error } = await supabase
                .from('miembros')
                .select('*')
                .order('nombre', { ascending: true });
                
            console.log('Datos recibidos de Supabase:', JSON.stringify(miembros, null, 2));

            if (error) {
                console.error('Error al obtener miembros:', error);
                throw new Error(`Error al cargar los miembros: ${error.message}`);
            }
            
            console.log('Miembros obtenidos de Supabase:', miembros ? miembros.length : 0);
            
            if (!miembros || miembros.length === 0) {
                throw new Error('No se encontraron miembros en la base de datos');
            }
            
            data = miembros;
            
            // Guardar en caché
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: now,
                    members: data
                }));
                console.log('Datos guardados en caché');
            } catch (e) {
                console.warn('No se pudo guardar en caché:', e);
                // Continuar aunque falle el guardado en caché
            }
            
            // Mostrar los miembros
            mostrarMiembros(data);
        }
    } catch (error) {
        console.error('Error en cargarMiembros:', error);
        const grid = document.querySelector('.gridContainermembers');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los miembros: ${error.message}</p>
                    <button onclick="location.reload()" class="retry-button">Reintentar</button>
                </div>
            `;
        }
    }
}

// Función para mostrar los miembros en la interfaz
function mostrarMiembros(miembros) {
    const grid = document.querySelector('.gridContainermembers');
    if (!grid) return;

    if (!miembros || miembros.length === 0) {
        grid.innerHTML = `
            <div class="no-members">
                <i class="fas fa-users-slash"></i>
                <p>No se encontraron miembros para mostrar</p>
            </div>
        `;
        return;
    }

    console.log('Mostrando miembros con datos:', JSON.stringify(miembros, null, 2));

    // Crear el HTML para cada miembro
    const miembrosHTML = miembros.map(miembro => {
        // Mapear posibles nombres de campos
        const nombre = miembro.nombre || miembro.Nombre || 'Nombre no disponible';
        const cargo = miembro.cargo || miembro.puesto || miembro.Cargo || miembro.Puesto || '';
        const institucion = miembro.institucion || miembro.institucion || miembro.Institucion || '';
        const foto = miembro.foto_url || miembro.foto || miembro.imagen || miembro.Imagen || '';

        return `
        <div class="memberCard">
            <div class="image-container">
                ${foto ? 
                    `<img 
                        src="${foto}" 
                        alt="${nombre}" 
                        class="memberImage"
                        loading="lazy"
                        onload="this.classList.add('loaded')"
                        onerror="this.onerror=null; this.classList.add('error');"
                    >` :
                    `<div class="memberInitials">${getInitials(nombre)}</div>`
                }
            </div>
            <h3>${nombre}</h3>
            ${cargo ? `<p>${cargo}</p>` : ''}
            ${institucion ? `<p class="institution">${institucion}</p>` : ''}
        </div>`;
    }).join('');

    grid.innerHTML = miembrosHTML;
}

// Función auxiliar para obtener las iniciales de un nombre
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}