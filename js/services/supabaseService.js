// Importar configuración
import { CONFIG } from '../../config.js';

// Extraer configuración
const { SUPABASE_URL, SUPABASE_KEY: SUPABASE_ANON_KEY } = CONFIG;

// Inicializar Supabase
let _supabase = null;
let _initializing = false;

// Función para obtener la instancia de Supabase
export async function getSupabase() {
    console.log('getSupabase() llamado');
    
    // Si ya está inicializado, retornar la instancia
    if (_supabase) {
        console.log('Retornando instancia existente de Supabase');
        return _supabase;
    }
    
    // Si ya se está inicializando, esperar a que termine
    if (_initializing) {
        console.log('Supabase ya se está inicializando, esperando...');
        return new Promise(resolve => {
            const checkInitialized = setInterval(() => {
                if (_supabase) {
                    clearInterval(checkInitialized);
                    resolve(_supabase);
                }
            }, 100);
        });
    }
    
    try {
        _initializing = true;
        console.log('Inicializando Supabase...');
        
        // Cargar el SDK de Supabase si no está disponible
        if (typeof window.supabase === 'undefined') {
            console.log('Cargando SDK de Supabase...');
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Error al cargar el SDK de Supabase'));
                document.head.appendChild(script);
            });
            console.log('SDK de Supabase cargado correctamente');
        } else {
            console.log('SDK de Supabase ya estaba cargado');
        }
        
        // Crear y guardar la instancia de Supabase
        console.log('Creando cliente de Supabase...');
        console.log('URL:', SUPABASE_URL);
        console.log('Clave:', SUPABASE_ANON_KEY ? '***' : 'No definida');
        
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Falta la configuración de Supabase. Verifica tus variables de entorno.');
        }
        
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Cliente de Supabase creado correctamente');
        
        return _supabase;
    } catch (error) {
        console.error('Error al inicializar Supabase:', error);
        throw error;
    } finally {
        _initializing = false;
    }
}

// No inicializar automáticamente, dejar que cada página lo haga cuando lo necesite
// Esto evita problemas con la carga del SDK

// Obtener noticias destacadas
export async function getFeaturedNews() {
    try {
        const supabase = await getSupabase();
        console.log('Obteniendo noticias destacadas...');
        
        const { data, error } = await supabase
            .from('noticias')
            .select('*')
            .eq('destacada', true)
            .order('fecha_publicacion', { ascending: false })
            .limit(5);
            
        if (error) throw error;
        
        console.log('Noticias destacadas obtenidas:', data ? data.length : 0);
        return data || [];
    } catch (error) {
        console.error('Error al obtener noticias destacadas:', error);
        return [];
    }
}

// Obtener últimas noticias
export async function getLatestNews() {
    try {
        const supabase = await getSupabase();
        console.log('Obteniendo últimas noticias...');
        
        const { data, error } = await supabase
            .from('noticias')
            .select('*')
            .order('fecha_publicacion', { ascending: false }); // Ordenar por fecha de publicación descendente
            
        if (error) throw error;
        
        console.log('Últimas noticias obtenidas:', data ? data.length : 0);
        return data || [];
    } catch (error) {
        console.error('Error al obtener últimas noticias:', error);
        return [];
    }
}