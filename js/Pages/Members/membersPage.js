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

// Manejador para el evento popstate (navegación con el botón de retroceso/avanzar)
window.addEventListener('popstate', async (event) => {
    console.log('Navegación detectada, actualizando vista...');
    const urlParams = new URLSearchParams(window.location.search);
    const institucionParam = urlParams.get('institucion');
    
    if (institucionParam) {
        // Filtrar por la institución del parámetro de URL
        await filtrarMiembrosPorInstitucion(institucionParam);
    } else {
        // Mostrar todos los miembros
        await filtrarMiembrosPorInstitucion('Todos');
    }
});

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
        
        // Verificar si hay un parámetro de URL para filtrar por institución
        const urlParams = new URLSearchParams(window.location.search);
        const institucionParam = urlParams.get('institucion');
        
        if (institucionParam) {
            // Filtrar por la institución del parámetro de URL
            console.log(`Filtrando por institución desde URL: ${institucionParam}`);
            await filtrarMiembrosPorInstitucion(institucionParam);
        } else {
            // Cargar y mostrar todos los miembros por defecto
            console.log('Iniciando carga de todos los miembros...');
            await cargarMiembros();
            console.log('Carga de miembros completada');
            
            // Seleccionar automáticamente el botón "Todos"
            const allInstitutionsBtn = document.getElementById('allInstitutionsBtn');
            if (allInstitutionsBtn) {
                allInstitutionsBtn.classList.add('active');
            }
        }
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        const grid = document.querySelector('.gridContainermembers');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar la página. Por favor, intenta recargar.</p>
                    <p><small>${error.message}</small></p>
                    <button onclick="location.reload()" class="retry-button">Reintentar</button>
                </div>
            `;
        }
    }
});

// Función para cargar y mostrar miembros
async function cargarMiembros(institucionTitulo = null) {
    console.log('Iniciando carga de miembros...');
    const grid = document.getElementById('membersGrid');
    
    if (!grid) {
        console.error('No se encontró el contenedor de miembros con ID "membersGrid"');
        return [];
    }

    // Mostrar mensaje de carga
    grid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>${institucionTitulo ? `Cargando miembros de ${institucionTitulo}...` : 'Cargando todos los miembros...'}</p>
        </div>
    `;
    
    try {
        // Obtener instancia de Supabase
        console.log('Obteniendo cliente Supabase...');
        const supabase = await getSupabase();
        if (!supabase) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        // Obtener miembros ordenados por nombre
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
            grid.innerHTML = `
                <div class="no-members-message">
                    <i class="fas fa-users-slash"></i>
                    <p>No se encontraron miembros en la base de datos</p>
                </div>
            `;
            return [];
        }
        
        // Actualizar contadores de instituciones
        actualizarContadorMiembros(miembros);
        
        // Filtrar si es necesario
        let miembrosAMostrar = [...(miembros || [])];
        if (institucionTitulo && institucionTitulo !== 'Todos') {
            miembrosAMostrar = miembrosAMostrar.filter(m => m.instituciones_id === institucionTitulo);
            
            if (miembrosAMostrar.length === 0) {
                grid.innerHTML = `
                    <div class="no-members-message">
                        <i class="fas fa-users-slash"></i>
                        <p>No se encontraron miembros para esta institución</p>
                        <button onclick="filtrarMiembrosPorInstitucion('Todos')" class="btn btn-primary mt-3">
                            Ver todos los miembros
                        </button>
                    </div>
                `;
                return [];
            }
        }
        
        // Mostrar los miembros
        mostrarMiembros(miembrosAMostrar, institucionTitulo);
        return miembrosAMostrar;
        
    } catch (error) {
        console.error('Error al cargar miembros:', error);
        const errorMessage = error.message || 'Error desconocido al cargar los miembros';
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los miembros. Por favor, intenta recargar la página.</p>
                <p><small>${errorMessage}</small></p>
                <button onclick="cargarMiembros('${institucionTitulo || ''}')" class="retry-button">Reintentar</button>
            </div>
        `;
        return [];
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
            .select('id, titulo, logo_url, pagina_web')
            .order('titulo', { ascending: true });
        
        if (error) {
            console.error('Error en la consulta a instituciones:', error);
            
            // Si falla, intentamos con una consulta más simple
            console.log('Intentando con consulta simple...');
            const { data: simpleInstituciones, error: simpleError } = await supabase
                .from('instituciones')
                .select('*')
                .order('titulo', { ascending: true });
                
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
async function mostrarInstituciones(instituciones) {
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
        let html = '';

        // Tarjetas para cada institución
        instituciones.forEach((institucion, index) => {
            if (!institucion.titulo) {
                console.warn(`La institución en la posición ${index} no tiene título:`, institucion);
                return;
            }

            const titulo = institucion.titulo || 'Sin título';
            const logoUrl = institucion.logo_url || '';
            const iniciales = getInitials(titulo);
            
            // Escapar comillas simples en el título para el onclick
            const tituloEscapado = titulo.replace(/'/g, "\\'");
            
            html += `
                <div class="institutionCard" data-titulo="${titulo}" onclick="filtrarMiembrosPorInstitucion('${tituloEscapado}')">
                    <div class="institutionLogo">
                        ${logoUrl 
                            ? `<img src="${logoUrl}" alt="${titulo}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'institutionInitials\'>${iniciales}</div>'">`
                            : `<div class="institutionInitials">${iniciales}</div>`
                        }
                    </div>
                    <h3>${titulo}</h3>
                    <div class="memberCount">0 miembros</div>
                </div>`;
        });

        grid.innerHTML = html;
        
        // Actualizar contadores de miembros
        await cargarMiembros();
        
        // Verificar si hay un parámetro de URL para filtrar por institución
        const urlParams = new URLSearchParams(window.location.search);
        const institucionParam = urlParams.get('institucion');
        
        // Obtener todas las tarjetas después de renderizar
        const cards = grid.querySelectorAll('.institutionCard');
        
        // Si hay un parámetro de URL, filtrar por esa institución
        if (institucionParam) {
            const targetCard = Array.from(cards).find(card => 
                card.dataset.titulo.toLowerCase() === institucionParam.toLowerCase()
            );
            
            if (targetCard) {
                targetCard.classList.add('active');
                await filtrarMiembrosPorInstitucion(institucionParam);
            }
        } else if (cards.length > 0) {
            // Por defecto, seleccionar la primera tarjeta
            cards[0].classList.add('active');
            await filtrarMiembrosPorInstitucion(null);
        }
        
        // Agregar manejadores de eventos a las tarjetas
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Prevenir la propagación para evitar conflictos con el manejador onclick
                e.stopPropagation();
                
                // Remover la clase active de todas las tarjetas
                cards.forEach(c => c.classList.remove('active'));
                
                // Agregar la clase active a la tarjeta clickeada
                card.classList.add('active');
                
                // Obtener el título de la institución
                const titulo = card.dataset.titulo;
                filtrarMiembrosPorInstitucion(titulo);
            });
        });

        console.log('Instituciones mostradas correctamente en la interfaz');
    } catch (error) {
        console.error('Error al generar el HTML de las instituciones:', error);
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las instituciones</p>
                <p><small>${error.message}</small></p>
                <button onclick="cargarInstituciones()" class="retry-button">Reintentar</button>
            </div>
        `;
    }
}

// Función para mostrar los miembros en la interfaz, agrupados por título y/o institución
async function mostrarMiembros(miembros, institucionTitulo = null) {
    console.log('Mostrando miembros...');
    const grid = document.getElementById('membersGrid');
    
    if (!grid) {
        console.error('No se encontró el contenedor de miembros');
        return;
    }

    try {
        // Verificar si los datos son válidos
        if (!Array.isArray(miembros)) {
            throw new Error('Los datos de miembros no son un array válido');
        }

        // Determinar si estamos en modo filtrado
        const esFiltroActivo = institucionTitulo && institucionTitulo !== 'Todos';
        
        // Filtrar miembros por institución si es necesario
        let miembrosFiltrados = [...miembros]; // Crear una copia del array original
        
        if (esFiltroActivo) {
            miembrosFiltrados = miembrosFiltrados.filter(miembro => {
                if (!miembro.instituciones_id) return false;
                return miembro.instituciones_id.toString().toLowerCase() === institucionTitulo.toLowerCase();
            });
        }

        console.log('Total de miembros encontrados:', miembrosFiltrados.length);

        // Mostrar mensaje si no hay miembros
        if (miembrosFiltrados.length === 0) {
            grid.innerHTML = `
                <div class="no-members-message">
                    <p>No se encontraron miembros${esFiltroActivo ? ' para esta institución' : ''}.</p>
                </div>
            `;
            return;
        }

        // Ordenar miembros por nombre
        miembrosFiltrados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

        // Función para generar el HTML de una tarjeta de miembro
        const generarTarjetaMiembro = (miembro, mostrarInstitucion = false) => {
            const nombre = miembro.nombre || 'Sin nombre';
            const correo = miembro.correo || '';
            const fotoUrl = miembro.foto_url || '';
            const iniciales = getInitials(nombre);
            const institucion = mostrarInstitucion && miembro.instituciones_id 
                ? `<p class="member-institution">${miembro.instituciones_id}</p>` 
                : '';

            return `
                <div class="member-card">
                    <div class="member-header">
                        ${fotoUrl 
                            ? `<img src="${fotoUrl}" alt="${nombre}" loading="lazy">`
                            : `<div class="member-initials">${iniciales}</div>`}
                    </div>
                    <div class="member-content">
                        <h3>${nombre}</h3>
                        ${correo ? `<p class="member-email">${correo}</p>` : ''}
                        ${institucion}
                    </div>
                </div>
            `;
        };

        // Siempre agrupar por título para mantener consistencia
        const grupos = {};
        
        // Agrupar miembros por título
        miembrosFiltrados.forEach(miembro => {
            const titulo = miembro.titulo || 'Sin título';
            if (!grupos[titulo]) {
                grupos[titulo] = [];
            }
            grupos[titulo].push(miembro);
        });

        // Generar HTML para cada grupo
        let gruposHTML = '';
        const titulosOrdenados = Object.keys(grupos).sort();

        for (const titulo of titulosOrdenados) {
            const miembrosGrupo = grupos[titulo];
            const miembrosHTML = miembrosGrupo
                .map(miembro => generarTarjetaMiembro(miembro, !esFiltroActivo)) // Mostrar institución solo cuando no hay filtro
                .join('');

            // Solo mostrar el título del grupo si hay más de un grupo o si el título no está vacío
            const mostrarTituloGrupo = titulosOrdenados.length > 1 || titulo !== 'Sin título';
            
            gruposHTML += `
                <div class="member-group">
                    ${mostrarTituloGrupo ? `<h2 class="group-title">${titulo}</h2>` : ''}
                    <div class="members-container">
                        ${miembrosHTML}
                    </div>
                </div>
            `;
        }

        grid.innerHTML = gruposHTML;
    } catch (error) {
        console.error('Error al mostrar miembros:', error);
        grid.innerHTML = `
            <div class="error-message">
                <p>Error al mostrar los miembros. Por favor, intenta recargar la página.</p>
                <p class="debug-info">${error.message}</p>
            </div>
        `;
    }
}

// Función para actualizar el contador de miembros en las tarjetas de instituciones
function actualizarContadorMiembros(miembros) {
    // Contar miembros por institución
    const contadorInstituciones = {};
    
    miembros.forEach(miembro => {
        const institucion = miembro.instituciones_id || 'Sin institución';
        contadorInstituciones[institucion] = (contadorInstituciones[institucion] || 0) + 1;
    });
    
    // Actualizar el contador en cada tarjeta de institución
    const cards = document.querySelectorAll('.institutionCard');
    cards.forEach(card => {
        const titulo = card.dataset.titulo;
        if (titulo) {  // No es la tarjeta de 'Todos'
            const count = contadorInstituciones[titulo] || 0;
            const countElement = card.querySelector('.memberCount');
            if (countElement) {
                countElement.textContent = `${count} miembro${count !== 1 ? 's' : ''}`;
            }
        }
    });
}

// Función para filtrar miembros por institución
window.filtrarMiembrosPorInstitucion = async function(institucionTitulo) {
    console.log('Filtrando miembros por institución:', institucionTitulo);
    
    // Actualizar la URL sin recargar la página
    const url = new URL(window.location);
    if (institucionTitulo && institucionTitulo !== 'Todos') {
        url.searchParams.set('institucion', institucionTitulo);
    } else {
        url.searchParams.delete('institucion');
    }
    window.history.pushState({}, '', url);
    
    // Actualizar clase activa en el botón 'Todos'
    const allInstitutionsBtn = document.getElementById('allInstitutionsBtn');
    if (allInstitutionsBtn) {
        if (institucionTitulo === 'Todos' || !institucionTitulo) {
            allInstitutionsBtn.classList.add('active');
        } else {
            allInstitutionsBtn.classList.remove('active');
        }
    }
    
    // Actualizar clase activa en las tarjetas de institución
    const cards = document.querySelectorAll('.institutionCard');
    cards.forEach(card => card.classList.remove('active'));
    
    // Activar la tarjeta correspondiente si no es 'Todos'
    if (institucionTitulo && institucionTitulo !== 'Todos') {
        const targetCard = document.querySelector(`.institutionCard[data-titulo="${institucionTitulo}"]`);
        if (targetCard) targetCard.classList.add('active');
    }
    
    // Mostrar mensaje de carga
    const grid = document.getElementById('membersGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>${institucionTitulo ? `Cargando miembros de ${institucionTitulo}...` : 'Cargando todos los miembros...'}</p>
            </div>
        `;
    }
    
    // Cargar los miembros con el filtro correspondiente
    await cargarMiembros(institucionTitulo);
};

// Función auxiliar para obtener las iniciales de un nombre
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}