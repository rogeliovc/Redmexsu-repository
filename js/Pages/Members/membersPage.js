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
        
        // Cargar instituciones
        console.log('Iniciando carga de instituciones...');
        await cargarInstituciones();
        console.log('Carga de instituciones completada');
        
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
    const grid = document.getElementById('membersGrid');
    
    if (!grid) {
        console.error('No se encontró el contenedor de miembros con ID "membersGrid"');
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
        if (!supabase) {
            throw new Error('No se pudo inicializar el cliente de Supabase');
        }
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
                    return; // Salir después de mostrar los datos en caché
                }
            } catch (e) {
                console.error('Error al procesar caché:', e);
                // Si hay error con el caché, forzar actualización
                shouldUpdateCache = true;
            }
        }

        // Si no hay datos en caché o están desactualizados, obtener de Supabase
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
        
    } catch (error) {
        console.error('Error en cargarMiembros:', error);
        const grid = document.getElementById('membersGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los miembros: ${error.message}</p>
                    <button onclick="cargarMiembros()" class="retry-button">Reintentar</button>
                </div>
            `;
        }
    }
}

// Función para mostrar los miembros en la interfaz
// Función para cargar instituciones
async function cargarInstituciones() {
    console.log('Iniciando carga de instituciones...');
    const grid = document.getElementById('institutionsGrid');
    
    if (!grid) {
        console.error('No se encontró el contenedor de instituciones');
        return;
    }

    // Mostrar mensaje de carga
    grid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando instituciones...</p>
        </div>
    `;

    const CACHE_KEY = 'instituciones_cache';
    const now = Date.now();
    
    try {
        console.log('Forzando recarga de instituciones desde Supabase...');
        console.log('Obteniendo cliente Supabase...');
        const supabase = await getSupabase();
        
        if (!supabase) {
            throw new Error('No se pudo inicializar el cliente de Supabase');
        }
        
        console.log('Consultando la tabla de instituciones...');
        console.log('Obteniendo datos de instituciones...');
        
        // Primero intentamos con las columnas que necesitamos
        const { data: instituciones, error } = await supabase
            .from('instituciones')
            .select('id, nombre, logo_url, pagina_web')
            .order('nombre', { ascending: true });
        
        if (error) {
            console.error('Error en la consulta a instituciones:', error);
            
            // Si falla, intentamos con una consulta más simple
            console.log('Intentando con consulta simple...');
            const { data: simpleInstituciones, error: simpleError } = await supabase
                .from('instituciones')
                .select('*')
                .order('id', { ascending: true });
                
            if (simpleError) {
                console.error('Error en consulta simple:', simpleError);
                throw new Error('No se pudo cargar la información de instituciones');
            }
            
            console.log(`Se encontraron ${simpleInstituciones.length} instituciones (con consulta simple)`);
            mostrarInstituciones(simpleInstituciones);
            return;
        }
        
        const institucionesData = instituciones || [];
        console.log(`Se encontraron ${institucionesData.length} instituciones`);
        
        // Mostrar las instituciones
        mostrarInstituciones(institucionesData);

        // Guardar en caché (sin bloquear la ejecución si falla)
        try {
            const cacheData = {
                data: institucionesData,
                timestamp: now
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('No se pudo guardar en caché:', e);
        }
        
    } catch (error) {
        console.error('Error al cargar instituciones:', error);
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las instituciones: ${error.message}</p>
                <button onclick="cargarInstituciones()" class="retry-button">Reintentar</button>
            </div>
        `;
    }
}

// Función para mostrar las instituciones en la interfaz
function mostrarInstituciones(instituciones) {
    console.log('Iniciando mostrarInstituciones con datos:', instituciones);
    const grid = document.getElementById('institutionsGrid');
    
    if (!grid) {
        console.error('No se encontró el contenedor con ID "institutionsGrid"');
        return;
    }

    if (!instituciones || !Array.isArray(instituciones)) {
        console.error('Las instituciones no son un array válido:', instituciones);
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error: Los datos recibidos no son válidos</p>
                <p class="debug-info">Tipo de dato recibido: ${instituciones === null ? 'null' : typeof instituciones}</p>
            </div>
        `;
        return;
    }

    if (instituciones.length === 0) {
        console.warn('El array de instituciones está vacío');
        grid.innerHTML = `
            <div class="no-data">
                <i class="fas fa-university"></i>
                <p>No se encontraron instituciones en la base de datos</p>
                <p class="debug-info">La consulta no devolvió resultados.</p>
            </div>
        `;
        return;
    }

    try {
        // Crear un botón para mostrar todos los miembros
        const html = `
            <div class="institutionCard" onclick="filtrarMiembrosPorInstitucion(null)">
                <div class="institutionLogo">
                    <div class="institutionInitials">ALL</div>
                </div>
                <h3>Todos los miembros</h3>
            </div>
        ` + instituciones.map((institucion, index) => {
            console.log(`Procesando institución ${index + 1}:`, institucion);
            
            // Validar datos de la institución
            if (!institucion.nombre) {
                console.warn(`La institución en la posición ${index} no tiene nombre:`, institucion);
                return ''; // Saltar esta institución
            }

            const nombre = institucion.nombre || 'Sin nombre';
            const logoUrl = institucion.logo_url || '';
            const sitioWeb = institucion.pagina_web || '';
            const iniciales = getInitials(nombre);
            
            return `
                <div class="institutionCard" onclick="filtrarMiembrosPorInstitucion('${institucion.id}')">
                    <div class="institutionLogo">
                        ${logoUrl 
                            ? `<img src="${logoUrl}" alt="${nombre}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'institutionInitials\'>${iniciales}</div>'">`
                            : `<div class="institutionInitials">${iniciales}</div>`
                        }
                    </div>
                    <h3>${nombre}</h3>
                    <div class="memberCount">0 miembros</div>
                    ${sitioWeb ? `
                        <a href="${sitioWeb.startsWith('http') ? sitioWeb : 'https://' + sitioWeb}" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           class="memberLink">
                            <i class="fas fa-globe"></i> Sitio web
                        </a>` 
                    : ''}
                </div>
            `;
        }).join('');

        grid.innerHTML = html;
        
        // Inicializar el estado de las tarjetas
        const cards = grid.querySelectorAll('.institutionCard');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Remover la clase active de todas las tarjetas
                cards.forEach(c => c.classList.remove('active'));
                // Agregar la clase active a la tarjeta clickeada
                card.classList.add('active');
            });
        });

        console.log('Instituciones mostradas correctamente en la interfaz');
    } catch (error) {
        console.error('Error al generar el HTML de las instituciones:', error);
    }
}

// Función para mostrar los miembros en la interfaz
async function mostrarMiembros(miembros, institucionId = null) {
    console.log('Iniciando mostrarMiembros con datos:', miembros);
    const grid = document.getElementById('membersGrid');
    
    if (!grid) {
        console.error('No se encontró el contenedor con ID "membersGrid"');
        return;
    }

    if (!miembros || !Array.isArray(miembros)) {
        console.error('Los miembros no son un array válido:', miembros);
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error: Los datos recibidos no son válidos</p>
                <p class="debug-info">Tipo de dato recibido: ${miembros === null ? 'null' : typeof miembros}</p>
            </div>
        `;
        return;
    }

    try {
        // Filtrar miembros según la institución seleccionada
        const miembrosFiltrados = institucionId 
            ? miembros.filter(m => m.institucion_id === institucionId)
            : miembros;

        if (miembrosFiltrados.length === 0) {
            grid.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-users"></i>
                    <p>No se encontraron miembros${institucionId ? ' en esta institución' : ''}</p>
                    <p class="debug-info">${institucionId ? `Filtrado por institución ${institucionId}` : 'Mostrando todos los miembros'}</p>
                </div>
            `;
            return;
        }

        // Actualizar el contador de miembros en las tarjetas de institución
        const cards = document.querySelectorAll('.institutionCard');
        cards.forEach(card => {
            const cardId = card.getAttribute('onclick')?.match(/'(\d+)'/)?.[1];
            if (cardId) {
                const count = miembros.filter(m => m.institucion_id === parseInt(cardId)).length;
                card.querySelector('.memberCount').textContent = `${count} miembros`;
            }
        });

        const html = miembrosFiltrados.map((miembro, index) => {
            console.log(`Procesando miembro ${index + 1}:`, miembro);
            
            // Validar datos del miembro
            if (!miembro.nombre) {
                console.warn(`El miembro en la posición ${index} no tiene nombre:`, miembro);
                return ''; // Saltar este miembro
            }

            const nombre = miembro.nombre || 'Sin nombre';
            const fotoUrl = miembro.foto_url || '';
            const correo = miembro.correo || '';
            const institucion = miembro.institucion || '';
            const iniciales = getInitials(nombre);
            
            return `
                <div class="memberCard">
                    <div class="image-container">
                        ${fotoUrl 
                            ? `<img src="${fotoUrl}" alt="${nombre}" class="memberImage">`
                            : `<div class="memberInitials">${iniciales}</div>`
                        }
                    </div>
                    <h3>${nombre}</h3>
                    <p>${institucion}</p>
                    ${correo ? `
                        <a href="mailto:${correo}" class="memberLink">
                            <i class="fas fa-envelope"></i> Contactar
                        </a>` : ''}
                </div>
            `;
        }).join('');

        grid.innerHTML = html;
        console.log('Miembros mostrados correctamente en la interfaz');
    } catch (error) {
        console.error('Error al generar el HTML de los miembros:', error);
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al mostrar los miembros</p>
                <p class="debug-info">${error.message}</p>
                <button onclick="cargarMiembros()" class="retry-button">Reintentar</button>
            </div>
        `;
    }
}

// Función para filtrar miembros por institución
function filtrarMiembrosPorInstitucion(institucionId) {
    console.log('Filtrando miembros por institución:', institucionId);
    
    // Obtener los miembros almacenados en caché
    const CACHE_KEY = 'miembros_cache';
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    if (!cachedData) {
        console.error('No hay datos en caché para filtrar');
        return;
    }

    try {
        const { members } = JSON.parse(cachedData);
        mostrarMiembros(members, institucionId);
    } catch (error) {
        console.error('Error al filtrar miembros:', error);
    }
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