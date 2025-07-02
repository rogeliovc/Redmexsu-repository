// Cargar header
fetch('/components/header.html')
    .then(res => res.text())
    .then(html => {
        const header = document.getElementById('header-container');
        if (header) header.innerHTML = html;
    });

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

// Configuración
const SUPABASE_URL = 'https://objeqynusiykuovhjauf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamVxeW51c2l5a3VvdmhqYXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NzIwNzQsImV4cCI6MjA2NjA0ODA3NH0.6A0jdMOLjlgE3gYsnrQb_z5ZwZScBImuIqW_yiGac1k';

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

    try {
        // Mostrar mensaje de carga
        grid.innerHTML = '<p>Cargando miembros...</p>';

        // Obtener datos de Supabase
        const { data, error } = await supabase
            .from('miembros')
            .select('*');

        if (error) throw error;

        // Mostrar los miembros
        if (data && data.length > 0) {
            grid.innerHTML = data.map(miembro => `
                <div class="memberCard">
                    <img src="${miembro.foto_url || 'https://via.placeholder.com/150'}" 
                         alt="${miembro.nombre}" 
                         class="memberImage">
                    <h3>${miembro.nombre}</h3>
                    ${miembro.puesto ? `<p>${miembro.puesto}</p>` : ''}
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<p>No hay miembros para mostrar</p>';
        }
    } catch (error) {
        console.error('Error al cargar miembros:', error);
        const errorContainer = document.querySelector('.gridContainermembers');
        if (errorContainer) {
            errorContainer.innerHTML = '<p>Error al cargar los miembros</p>';
        }
    }
}