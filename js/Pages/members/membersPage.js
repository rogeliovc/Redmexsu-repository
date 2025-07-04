// Cargar footer
fetch('/components/footer.html')
    .then(res => res.text())
    .then(html => {
        const footer = document.getElementById('footer-container');
        if (footer) footer.innerHTML = html;
    });

// Cargar SDK de Supabase
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
supabaseScript.onload = initApp; // Inicializar la app cuando cargue el SDK
document.body.appendChild(supabaseScript);

// Importar configuración
import { CONFIG } from '/config.js';

// Configuración de Supabase
const { SUPABASE_URL, SUPABASE_KEY } = CONFIG;

// Inicializar Supabase
let supabase;

// Función para inicializar la app
function initApp() {
    // Inicializar Supabase
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Aquí puedes agregar más lógica de inicialización
    console.log('Supabase inicializado correctamente');
    
    // Cargar miembros cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargarMiembros);
    } else {
        cargarMiembros();
    }
}

// Función para cargar miembros
async function cargarMiembros() {
    const grid = document.querySelector('.gridContainermembers');
    if (!grid) {
        console.error('No se encontró el contenedor de miembros');
        return;
    }

    // Verificar si hay datos en caché
    const CACHE_KEY = 'miembros_cache';
    const CACHE_DURATION = 3600000; // 1 hora en milisegundos
    const now = Date.now();
    
    try {
        // Mostrar mensaje de carga
        grid.innerHTML = '<div class="loading-spinner"></div><p>Cargando miembros...</p>';

        // Intentar obtener datos del caché
        const cachedData = localStorage.getItem(CACHE_KEY);
        let data = null;
        let shouldUpdateCache = true;

        if (cachedData) {
            const { timestamp, members } = JSON.parse(cachedData);
            // Si los datos en caché son recientes, usarlos
            if (now - timestamp < CACHE_DURATION) {
                data = members;
                shouldUpdateCache = false;
                console.log('Usando datos en caché');
            }
        }

        // Si no hay datos en caché o están desactualizados, obtener de Supabase
        if (shouldUpdateCache) {
            console.log('Actualizando caché desde Supabase...');
            const { data: miembros, error } = await supabase
                .from('miembros')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            
            data = miembros;
            
            // Guardar en caché
            if (data) {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: now,
                    members: data
                }));
            }
        }

        // Mostrar los miembros
        if (data && data.length > 0) {
            grid.innerHTML = data.map(miembro => `
                <div class="memberCard">
                    <div class="image-container">
                        <img 
                            src="${miembro.foto_url || 'https://via.placeholder.com/150'}" 
                            alt="${miembro.nombre}" 
                            class="memberImage"
                            loading="lazy"
                            width="150"
                            height="150"
                            onload="this.classList.add('loaded');"
                            onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=Imagen+no+disponible'; this.classList.add('loaded');"
                        >
                    </div>
                    <h3>${miembro.nombre}</h3>
                    ${miembro.puesto ? `<p>${miembro.puesto}</p>` : ''}
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<p>No hay miembros para mostrar</p>';
        }
    } catch (error) {
        console.error('Error al cargar miembros:', error);
        // Intentar mostrar datos en caché aunque estén desactualizados
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const { members } = JSON.parse(cachedData);
                if (members && members.length > 0) {
                    grid.innerHTML = '<p>Mostrando datos en caché (pueden estar desactualizados)</p>' + 
                    members.map(miembro => `
                        <div class="memberCard">
                            <div class="image-container">
                                <img 
                                    src="${miembro.foto_url || 'https://via.placeholder.com/150'}" 
                                    alt="${miembro.nombre}" 
                                    class="memberImage"
                                    loading="lazy"
                                    width="150"
                                    height="150"
                                    onload="this.classList.add('loaded');"
                                    onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=Imagen+no+disponible'; this.classList.add('loaded');"
                                >
                            </div>
                            <h3>${miembro.nombre}</h3>
                            ${miembro.puesto ? `<p>${miembro.puesto}</p>` : ''}
                        </div>
                    `).join('');
                    return;
                }
            }
            grid.innerHTML = '<p class="error">Error al cargar los miembros. Por favor, intenta recargar la página.</p>';
        } catch (e) {
            grid.innerHTML = '<p class="error">Error al cargar los miembros. Por favor, intenta recargar la página.</p>';
        }
    }
}