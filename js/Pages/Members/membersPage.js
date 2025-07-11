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

        // Siempre obtener datos de Supabase
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
        
        // No guardar en caché para asegurar datos actualizados
        
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
        let html = '';
        
        // Botón para mostrar todos los miembros
        html += `
            <div class="institutionCard">
                <div class="institutionLogo">
                    <div class="institutionInitials">ALL</div>
                </div>
                <h3>Todos los miembros</h3>
            </div>`;

        // Tarjetas para cada institución
        instituciones.forEach((institucion, index) => {
            if (!institucion.titulo) {
                console.warn(`La institución en la posición ${index} no tiene título:`, institucion);
                return;
            }

            const titulo = institucion.titulo || 'Sin título';
            const logoUrl = institucion.logo_url || '';
            const sitioWeb = institucion.pagina_web || '';
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
                    ${sitioWeb ? `
                        <a href="${sitioWeb.startsWith('http') ? sitioWeb : 'https://' + sitioWeb}" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           class="memberLink">
                            <i class="fas fa-globe"></i> Sitio web
                        </a>` 
                    : ''}
                </div>`;
        });

        grid.innerHTML = html;
        
        // Agregar manejadores de eventos
        const cards = grid.querySelectorAll('.institutionCard');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Remover la clase active de todas las tarjetas
                cards.forEach(c => c.classList.remove('active'));
                // Agregar la clase active a la tarjeta clickeada
                card.classList.add('active');
                
                // Obtener el título de la institución
                const titulo = card === cards[0] ? null : card.dataset.titulo;
                filtrarMiembrosPorInstitucion(titulo);
            });
        });

        console.log('Instituciones mostradas correctamente en la interfaz');
    } catch (error) {
        console.error('Error al generar el HTML de las instituciones:', error);
    }
}

// Función para mostrar los miembros en la interfaz, agrupados por título y/o institución
async function mostrarMiembros(miembros, institucionTitulo = null) {
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
        // Actualizar el contador de miembros en las tarjetas de institución
        const cards = document.querySelectorAll('.institutionCard');
        cards.forEach(card => {
            const cardId = card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (cardId) {
                const count = miembros.filter(m => m.instituciones_id === cardId).length;
                card.querySelector('.memberCount').textContent = `${count} ${count === 1 ? 'miembro' : 'miembros'}`;
            }
        });

        // Filtrar miembros si se proporciona un institucionTitulo (comparación insensible a mayúsculas/minúsculas)
        console.log('Filtrando miembros para la institución:', institucionTitulo);
        const miembrosFiltrados = institucionTitulo 
            ? miembros.filter(miembro => {
                const match = miembro.instituciones_id && 
                    miembro.instituciones_id.toString().toLowerCase() === institucionTitulo.toLowerCase();
                return match;
            })
            : miembros;
        console.log('Total de miembros encontrados:', miembrosFiltrados.length);

        // Ordenar miembros por nombre
        miembrosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));

        // Agrupar miembros por título y/o institución
        const grupos = {};
        
        miembrosFiltrados.forEach(miembro => {
            const titulo = miembro.titulo || 'Sin título';
            const institucionId = miembro.instituciones_id || 'sin-institucion';
            
            // Si estamos mostrando una sola institución, agrupamos solo por título
            const grupoKey = institucionTitulo 
                ? titulo 
                : `${titulo}_${institucionId}`;
            
            if (!grupos[grupoKey]) {
                grupos[grupoKey] = {
                    titulo: titulo,
                    institucionId: institucionId,
                    miembros: []
                };
            }
            grupos[grupoKey].miembros.push(miembro);
        });

        // Generar HTML para cada grupo
        let gruposHTML = '';
        
        // Ordenar los grupos por título
        const gruposOrdenados = Object.values(grupos).sort((a, b) => 
            a.titulo.localeCompare(b.titulo) || 
            (a.institucionId || '').toString().localeCompare(b.institucionId || '')
        );

        for (const grupo of gruposOrdenados) {
            const miembrosHTML = grupo.miembros.map(miembro => {
                const nombre = miembro.nombre || 'Sin nombre';
                const correo = miembro.correo || '';
                const fotoUrl = miembro.foto_url || '';
                const iniciales = getInitials(nombre);

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
                            ${!institucionTitulo && miembro.instituciones_id 
                                ? `<p class="member-institution">${miembro.instituciones_id}</p>` 
                                : ''}
                        </div>
                    </div>
                `;
            }).join('');

            // Solo mostrar el título del grupo si hay más de un grupo o si el título no está vacío
            const mostrarTituloGrupo = gruposOrdenados.length > 1 || grupo.titulo !== 'Sin título';
            
            gruposHTML += `
                <div class="member-group">
                    ${mostrarTituloGrupo ? `<h2 class="group-title">${grupo.titulo}</h2>` : ''}
                    <div class="members-container">
                        ${miembrosHTML}
                    </div>
                </div>
            `;
        }

        // Mostrar mensaje si no hay miembros
        if (miembrosFiltrados.length === 0) {
            grid.innerHTML = `
                <div class="no-members-message">
                    <p>No hay miembros disponibles${institucionTitulo ? ' en esta institución' : ''}.</p>
                </div>
            `;
        } else {
            grid.innerHTML = gruposHTML;
        }
    } catch (error) {
        console.error('Error al mostrar miembros:', error);
        grid.innerHTML = `
            <div class="error-message">
                <p>Error al mostrar los miembros. Por favor, intenta recargar la página.</p>
            </div>
        `;
    }
}

// Hacer la función disponible globalmente
window.filtrarMiembrosPorInstitucion = async function(institucionTitulo) {
    console.log('Filtrando miembros por institución:', institucionTitulo);
    
    try {
        // Obtener instancia de Supabase
        const supabase = await getSupabase();
        if (!supabase) {
            throw new Error('No se pudo inicializar el cliente de Supabase');
        }

        // Obtener miembros de la base de datos
        let query = supabase
            .from('miembros')
            .select('*');

        // Si se proporciona un título de institución, filtrar por él
        if (institucionTitulo) {
            query = query.eq('instituciones_id', institucionTitulo);
        }

        const { data: miembros, error } = await query;

        if (error) {
            console.error('Error al obtener miembros:', error);
            throw error;
        }

        // Si no hay título de institución (caso 'Todos'), agrupar por título
        if (!institucionTitulo) {
            // Ordenar miembros por nombre
            const miembrosOrdenados = [...miembros].sort((a, b) => 
                a.nombre.localeCompare(b.nombre)
            );
            
            // Agrupar por título
            const grupos = {};
            miembrosOrdenados.forEach(miembro => {
                const titulo = miembro.titulo || 'Sin título';
                if (!grupos[titulo]) {
                    grupos[titulo] = [];
                }
                grupos[titulo].push(miembro);
            });

            // Generar HTML para cada grupo
            let gruposHTML = '';
            
            // Ordenar los grupos por título
            const titulosOrdenados = Object.keys(grupos).sort();
            
            for (const titulo of titulosOrdenados) {
                const miembrosGrupo = grupos[titulo];
                const miembrosHTML = miembrosGrupo.map(miembro => {
                    const nombre = miembro.nombre || 'Sin nombre';
                    const correo = miembro.correo || '';
                    const fotoUrl = miembro.foto_url || '';
                    const iniciales = getInitials(nombre);

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
                                ${miembro.instituciones_id 
                                    ? `<p class="member-institution">${miembro.instituciones_id}</p>` 
                                    : ''}
                            </div>
                        </div>
                    `;
                }).join('');

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

            // Mostrar los grupos
            const grid = document.getElementById('membersGrid');
            if (grid) {
                grid.innerHTML = gruposHTML || `
                    <div class="no-members-message">
                        <p>No hay miembros disponibles.</p>
                    </div>
                `;
            }
        } else {
            // Si hay un título de institución, mostrar los miembros directamente
            mostrarMiembros(miembros, institucionTitulo);
        }
    } catch (error) {
        console.error('Error al filtrar miembros:', error);
        const grid = document.getElementById('membersGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <p>Error al filtrar los miembros: ${error.message}</p>
                    <button onclick="cargarMiembros()" class="retry-button">Reintentar</button>
                </div>
            `;
        }
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