// Importar el servicio de Supabase
import { getSupabase } from '../../services/supabaseService.js';

// Variables globales
let allMembers = [];
let allInstitutions = [];

// Cargar footer
fetch('/components/footer.html')
    .then(res => res.text())
    .then(html => {
        const footer = document.getElementById('footer-container');
        if (footer) footer.innerHTML = html;
    })
    .catch(error => console.error('Error al cargar el footer:', error));

// Función para cambiar entre pestañas
function showTab(tabName) {
    console.log('Mostrando pestaña:', tabName);
    
    // Ocultar todos los contenidos de pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Desactivar todos los botones de pestaña
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    try {
        // Mostrar la pestaña seleccionada
        const contentElement = document.getElementById(`${tabName}Content`);
        const buttonElement = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
        
        if (contentElement && buttonElement) {
            contentElement.classList.add('active');
            buttonElement.classList.add('active');
            
            // Actualizar la URL sin recargar la página
            const newUrl = `${window.location.pathname}?tab=${tabName}`;
            window.history.pushState({ tab: tabName }, '', newUrl);
            
            // Cargar contenido según la pestaña
            if (tabName === 'members') {
                console.log('Cargando miembros...');
                mostrarTodosLosMiembros();
            } else if (tabName === 'institutions') {
                console.log('Cargando instituciones...');
                // Cargar las instituciones desde la base de datos
                cargarInstituciones().then(instituciones => {
                    if (instituciones && instituciones.length > 0) {
                        mostrarInstituciones(instituciones);
                    }
                }).catch(error => {
                    console.error('Error al cargar instituciones:', error);
                });
            }
        } else {
            console.error('No se pudo encontrar el elemento de la pestaña:', tabName);
        }
    } catch (error) {
        console.error('Error en showTab:', error);
    }
}

// Manejador para el evento popstate (navegación con el botón de retroceso/avanzar)
window.addEventListener('popstate', async (event) => {
    console.log('Navegación detectada, actualizando vista...');
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') || 'members';
    const institucionParam = urlParams.get('institucion');
    
    // Mostrar la pestaña correspondiente
    showTab(tabParam);
    
    // Si hay un parámetro de institución, filtrar
    if (institucionParam) {
        await filtrarMiembrosPorInstitucion(institucionParam);
    }
});

// Función para mostrar todos los miembros
async function mostrarTodosLosMiembros() {
    const grid = document.getElementById('membersGrid');
    if (!grid) return;
    
    if (allMembers.length === 0) {
        grid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando miembros...</p>
            </div>
        `;
        
        try {
            const supabase = await getSupabase();
            const { data: miembros, error } = await supabase
                .from('miembros')
                .select('*')
                .order('nombre', { ascending: true });
                
            if (error) throw error;
            
            allMembers = miembros || [];
            mostrarMiembros(allMembers);
        } catch (error) {
            console.error('Error al cargar miembros:', error);
            grid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los miembros. Por favor, intenta recargar la página.</p>
                    <p><small>${error.message}</small></p>
                    <button onclick="mostrarTodosLosMiembros()" class="retry-button">Reintentar</button>
                </div>
            `;
        }
    } else {
        mostrarMiembros(allMembers);
    }
}

// Función para cargar los miembros del comité
async function cargarComite() {
    try {
        console.log('Cargando comité directivo...');
        const supabase = await getSupabase();
        if (!supabase) throw new Error('No se pudo conectar a la base de datos');
        
        // Obtener solo los miembros del comité
        const { data: miembros, error } = await supabase
            .from('miembros')
            .select('*')
            .eq('comite', true)
            .order('nombre', { ascending: true });
            
        if (error) throw error;
        
        // Mostrar el comité si hay miembros
        const committeeGrid = document.getElementById('committeeGrid');
        if (miembros && miembros.length > 0 && committeeGrid) {
            console.log(`Mostrando ${miembros.length} miembros del comité`);
            
            // Limpiar el contenedor
            committeeGrid.innerHTML = '';
            
            // Crear elementos para cada miembro del comité
            miembros.forEach((miembro, index) => {
                const memberElement = document.createElement('div');
                memberElement.className = 'committee-member';
                
                // Obtener iniciales para el avatar
                const nombres = miembro.nombre ? miembro.nombre.split(' ') : [];
                const iniciales = nombres.length > 0 
                    ? (nombres[0][0] + (nombres.length > 1 ? nombres[1][0] : nombres[0][nombres[0].length > 1 ? 1 : 0])).toUpperCase()
                    : '??';
                
                // Crear el contenido del miembro con estructura optimizada
                memberElement.innerHTML = `
                    <div class="member-avatar">
                        ${miembro.foto_url 
                            ? `<img src="${miembro.foto_url}" alt="${miembro.nombre || 'Miembro'}">`
                            : `<div class="member-avatar-initials">${iniciales}</div>`
                        }
                    </div>
                    <div class="member-details">
                        <div class="member-info">
                            <h3 class="member-name" title="${miembro.nombre || ''}">${miembro.nombre || 'Nombre no disponible'}</h3>
                            <p class="member-role">${miembro.puesto || 'Miembro del Comité'}</p>
                            ${miembro.descripcion ? `<p class="member-bio">${miembro.descripcion}</p>` : ''}
                        </div>
                        <div class="member-social">
                            ${miembro.linkedin ? `<a href="${miembro.linkedin}" target="_blank" rel="noopener noreferrer" title="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
                            ${miembro.twitter ? `<a href="${miembro.twitter}" target="_blank" rel="noopener noreferrer" title="Twitter"><i class="fab fa-twitter"></i></a>` : ''}
                            ${miembro.email ? `<a href="mailto:${miembro.email}" title="Correo electrónico"><i class="fas fa-envelope"></i></a>` : ''}
                        </div>
                    </div>
                `;
                
                // Agregar efecto de aparición secuencial
                memberElement.style.opacity = '0';
                memberElement.style.transform = 'translateY(10px)';
                memberElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                committeeGrid.appendChild(memberElement);
                
                // Animación de aparición
                setTimeout(() => {
                    memberElement.style.opacity = '1';
                    memberElement.style.transform = 'translateY(0)';
                }, 100 * index);
            });
            
        } else if (committeeGrid) {
            committeeGrid.innerHTML = `
                <div class="no-members-message">
                    <i class="fas fa-info-circle"></i>
                    <p>No se encontraron miembros del comité directivo.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar el comité:', error);
        const committeeGrid = document.getElementById('committeeGrid');
        if (committeeGrid) {
            committeeGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar el comité directivo.</p>
                    <p><small>${error.message}</small></p>
                </div>
            `;
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM cargado, inicializando pestañas...');
    
    // Configurar manejadores de eventos para las pestañas
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log('Botón de pestaña clickeado:', tabName);
            showTab(tabName);
        });
    });
    
    // Cargar el comité directivo inmediatamente
    await cargarComite();
    
    // Verificar si hay una pestaña en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    // Mostrar la pestaña correcta basada en la URL o la pestaña por defecto
    if (tabParam === 'institutions') {
        showTab('institutions');
    } else {
        showTab('members');
    }
    console.log('DOM cargado, inicializando aplicación...');
    try {
        console.log('Obteniendo cliente Supabase...');
        const supabase = await getSupabase();
        console.log('Cliente Supabase listo:', !!supabase);
        
        // Cargar instituciones
        console.log('Iniciando carga de instituciones...');
        allInstitutions = await cargarInstituciones();
        console.log('Carga de instituciones completada');
        
        // Verificar la pestaña activa desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab') || 'members';
        const institucionParam = urlParams.get('institucion');
        
        // Mostrar la pestaña correspondiente
        showTab(tabParam);
        
        // Si hay un parámetro de institución, filtrar
        if (institucionParam) {
            console.log(`Filtrando por institución desde URL: ${institucionParam}`);
            await filtrarMiembrosPorInstitucion(institucionParam);
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
    const membersGrid = document.getElementById('membersGrid');
    const committeeGrid = document.getElementById('committeeGrid');
    
    if (!membersGrid) {
        console.error('No se encontró el contenedor de miembros con ID "membersGrid"');
        return [];
    }

    // Mostrar mensaje de carga para miembros regulares
    membersGrid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>${institucionTitulo ? `Cargando miembros de ${institucionTitulo}...` : 'Cargando todos los miembros...'}</p>
        </div>
    `;
    
    // Mostrar mensaje de carga para el comité
    if (committeeGrid) {
        committeeGrid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando comité directivo...</p>
            </div>
        `;
    }
    
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
            membersGrid.innerHTML = `
                <div class="no-members-message">
                    <i class="fas fa-info-circle"></i>
                    <p>No se encontraron miembros${institucionTitulo ? ` para la institución "${institucionTitulo}"` : ''}.</p>
                </div>
            `;
            return [];
        }
        
        // Guardar todos los miembros para búsquedas/filtrados posteriores
        allMembers = miembros;
        
        // Filtrar miembros del comité (donde comite = true)
        const miembrosComite = miembros.filter(miembro => miembro.comite === true);
        console.log('Miembros del comité encontrados:', miembrosComite.length);
        
        // Mostrar el comité si hay miembros
        if (miembrosComite.length > 0 && committeeGrid) {
            // Ocultar la sección de comité si estamos mostrando una institución específica
            if (!institucionTitulo) {
                document.querySelector('.committee-section').style.display = 'block';
                await mostrarMiembros(miembrosComite, null, 'committeeGrid', true);
            } else {
                document.querySelector('.committee-section').style.display = 'none';
            }
        } else if (committeeGrid) {
            committeeGrid.innerHTML = `
                <div class="no-members-message">
                    <i class="fas fa-info-circle"></i>
                    <p>No se encontraron miembros del comité directivo.</p>
                </div>
            `;
        }
        
        // Mostrar los miembros en la interfaz (filtrados por institución si es necesario)
        await mostrarMiembros(miembros, institucionTitulo, 'membersGrid');
        
        // Actualizar contadores en las tarjetas de instituciones
        actualizarContadorMiembros(miembros);
        
        return miembros;
        
    } catch (error) {
        console.error('Error al cargar miembros:', error);
        const errorMessage = error.message || 'Error desconocido al cargar los miembros';
        const errorGrid = document.getElementById('membersGrid');
        if (errorGrid) {
            errorGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los miembros. Por favor, intenta recargar la página.</p>
                    <p><small>${errorMessage}</small></p>
                    <button onclick="cargarMiembros('${institucionTitulo || ''}')" class="retry-button">Reintentar</button>
                </div>
            `;
        }
        return [];
    }
}
async function cargarInstituciones() {
    console.log('Iniciando carga de instituciones...');
    const grid = document.getElementById('institutionsGrid');
    const now = Date.now();
    const CACHE_KEY = 'instituciones_cache';
    
    // Mostrar mensaje de carga solo si estamos en la pestaña de instituciones
    const isInstitutionsTabActive = document.getElementById('institutionsContent')?.classList.contains('active');
    
    if (isInstitutionsTabActive && grid) {
        grid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando instituciones...</p>
            </div>
        `;
    }

    try {
        console.log('Obteniendo cliente Supabase...');
        const supabase = await getSupabase();
        
        if (!supabase) {
            throw new Error('No se pudo inicializar el cliente de Supabase');
        }
        
        console.log('Consultando la tabla de instituciones...');
        const { data: instituciones, error } = await supabase
            .from('instituciones')
            .select('*')
            .order('nombre', { ascending: true });
            
        if (error) {
            console.error('Error al obtener instituciones:', error);
            throw new Error(`Error al cargar las instituciones: ${error.message}`);
        }

        // Si no hay datos, mostrar un mensaje
        if (!instituciones || instituciones.length === 0) {
            console.warn('No se encontraron instituciones en la base de datos');
            if (grid) {
                grid.innerHTML = `
                    <div class="no-institutions-message">
                        <i class="fas fa-university"></i>
                        <p>No se encontraron instituciones registradas</p>
                    </div>
                `;
            }
            return [];
        }

        // Si hay un error en los datos, usar datos de ejemplo
        if (instituciones.some(inst => !inst.nombre)) {
            console.warn('Datos de instituciones inválidos, usando datos de ejemplo');
            const simpleInstituciones = [
                { id: 1, nombre: 'Institución 1', logo_url: 'https://via.placeholder.com/150', descripcion: 'Descripción de la institución 1' },
                { id: 2, nombre: 'Institución 2', logo_url: 'https://via.placeholder.com/150', descripcion: 'Descripción de la institución 2' },
                { id: 3, nombre: 'Institución 3', logo_url: 'https://via.placeholder.com/150', descripcion: 'Descripción de la institución 3' },
            ];
            if (isInstitutionsTabActive) {
                await mostrarInstituciones(simpleInstituciones);
            }
            return simpleInstituciones;
        }
        
        console.log(`Se encontraron ${instituciones.length} instituciones`);
        
        // Si estamos en la pestaña de instituciones, mostrarlas
        if (isInstitutionsTabActive) {
            await mostrarInstituciones(instituciones);
        }
        
        // Guardar en caché (sin bloquear la ejecución si falla)
        try {
            const cacheData = {
                data: instituciones,
                timestamp: now
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('No se pudo guardar en caché:', e);
        }
        
        return instituciones;
        
    } catch (error) {
        console.error('Error al cargar instituciones:', error);
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar las instituciones: ${error.message}</p>
                    <button onclick="cargarInstituciones()" class="retry-button">Reintentar</button>
                </div>
            `;
        }
        return [];
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
            
            html += `
                <div class="institutionCard" data-titulo="${titulo}">
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
        
        // Agregar manejadores de eventos a las tarjetas de institución
        document.querySelectorAll('.institutionCard').forEach(card => {
            card.addEventListener('click', async () => {
                const titulo = card.getAttribute('data-titulo');
                console.log('Clic en institución:', titulo);
                await filtrarMiembrosPorInstitucion(titulo);
            });
        });
        
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
async function mostrarMiembros(miembros, institucionTitulo = null, targetGridId = 'membersGrid') {
    console.log('Mostrando miembros en el contenedor:', targetGridId);
    const grid = document.getElementById(targetGridId);
    
    if (!grid) {
        console.error('No se encontró el contenedor de miembros con ID:', targetGridId);
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

        // Función para generar el HTML de un elemento de lista de miembro
        const generarFilaMiembro = (miembro, mostrarInstitucion = false) => {
            const nombre = miembro.nombre || 'Sin nombre';
            const correo = miembro.correo || '';
            const fotoUrl = miembro.foto_url || '';
            const puesto = miembro.puesto || '';
            const iniciales = getInitials(nombre);
            const institucion = mostrarInstitucion && miembro.instituciones_id 
                ? `<span class="member-list-institution">${miembro.instituciones_id}</span>` 
                : '';

            return `
                <div class="member-list-item">
                    <div class="member-list-avatar">
                        ${fotoUrl 
                            ? `<img src="${fotoUrl}" alt="${nombre}" loading="lazy">`
                            : `<div class="member-initials">${iniciales}</div>`}
                    </div>
                    <div class="member-list-info">
                        <h3 class="member-list-name">${nombre}</h3>
                        <div class="member-list-details">
                            ${puesto ? `<span class="member-list-position"><i class="fas fa-briefcase"></i> ${puesto}</span>` : ''}
                            ${correo ? `<span class="member-list-email"><i class="fas fa-envelope"></i> ${correo}</span>` : ''}
                            ${institucion}
                        </div>
                    </div>
                </div>
            `;
        };

        // Agrupar miembros por título si hay títulos definidos
        const grupos = {};
        const miembrosSinTitulo = [];
        
        // Separar miembros con y sin título
        miembrosFiltrados.forEach(miembro => {
            if (miembro.titulo) {
                if (!grupos[miembro.titulo]) {
                    grupos[miembro.titulo] = [];
                }
                grupos[miembro.titulo].push(miembro);
            } else {
                miembrosSinTitulo.push(miembro);
            }
        });

        // Generar HTML para la lista de miembros
        let listaHTML = '<div class="member-list-container">';
        
        // Agregar miembros agrupados por título
        const titulosOrdenados = Object.keys(grupos).sort();
        for (const titulo of titulosOrdenados) {
            const miembrosGrupo = grupos[titulo];
            
            // Agregar título del grupo
            listaHTML += `<div class="member-group">
                            <h2 class="group-title">${titulo}</h2>`;
            
            // Agregar miembros del grupo
            listaHTML += miembrosGrupo
                .map(miembro => generarFilaMiembro(miembro, !esFiltroActivo))
                .join('');
                
            listaHTML += '</div>'; // Cerrar el grupo
        }
        
        // Agregar miembros sin título al final (sin agrupar)
        if (miembrosSinTitulo.length > 0) {
            listaHTML += '<div class="member-group">';
            
            // Solo agregar el título si hay miembros con título
            if (titulosOrdenados.length > 0) {
                listaHTML += '<h2 class="group-title">Miembros</h2>';
            }
            
            // Agregar miembros sin título
            listaHTML += miembrosSinTitulo
                .map(miembro => generarFilaMiembro(miembro, !esFiltroActivo))
                .join('');
                
            listaHTML += '</div>'; // Cerrar el grupo
        }
        
        listaHTML += '</div>'; // Cerrar el contenedor principal
        grid.innerHTML = listaHTML;
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
    
    // Elementos del DOM
    const membersContainer = document.getElementById('institutionMembersContainer');
    const membersTitle = document.getElementById('institutionMembersTitle');
    const membersGrid = document.getElementById('institutionMembersGrid');
    
    // Si no hay institución seleccionada o es 'Todos', ocultar la sección de miembros
    if (!institucionTitulo || institucionTitulo === 'Todos') {
        if (membersContainer) {
            membersContainer.style.display = 'none';
        }
        return;
    }
    
    // Activar la tarjeta correspondiente
    const targetCard = document.querySelector(`.institutionCard[data-titulo="${institucionTitulo}"]`);
    if (targetCard) {
        targetCard.classList.add('active');
        
        // Mostrar la sección de miembros de la institución
        if (membersContainer && membersTitle && membersGrid) {
            membersTitle.textContent = `Miembros de ${institucionTitulo}`;
            membersContainer.style.display = 'block';
            
            // Mostrar mensaje de carga
            membersGrid.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Cargando miembros de ${institucionTitulo}...</p>
                </div>
            `;
            
            // Desplazarse suavemente a la sección de miembros
            membersContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Cargar los miembros con el filtro correspondiente
    try {
        const supabase = await getSupabase();
        if (!supabase) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        // Obtener miembros de la institución
        const { data: miembros, error } = await supabase
            .from('miembros')
            .select('*')
            .eq('instituciones_id', institucionTitulo)
            .order('nombre', { ascending: true });
            
        if (error) {
            throw new Error(`Error al cargar los miembros: ${error.message}`);
        }
        
        console.log(`Se encontraron ${miembros ? miembros.length : 0} miembros para la institución ${institucionTitulo}`);
        
        // Mostrar los miembros
        if (membersGrid) {
            if (!miembros || miembros.length === 0) {
                membersGrid.innerHTML = `
                    <div class="no-members-message">
                        <i class="fas fa-users-slash"></i>
                        <p>No se encontraron miembros para esta institución</p>
                    </div>
                `;
            } else {
                // Usar la función mostrarMiembros para mostrar los resultados
                mostrarMiembros(miembros, institucionTitulo, 'institutionMembersGrid');
            }
        }
    } catch (error) {
        console.error('Error al cargar miembros de la institución:', error);
        if (membersGrid) {
            membersGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los miembros: ${error.message}</p>
                </div>
            `;
        }
    }
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