# Tecnologías Utilizadas

## Frontend

### Lenguajes de Marcado
- **HTML5**
  - Estructura semántica
  - Compatibilidad con navegadores modernos
  - Validación de formularios nativa

### Hojas de Estilo
- **CSS3**
  - Flexbox y Grid para diseños responsivos
  - Variables CSS para temas y colores
  - Animaciones y transiciones
  - Media queries para diseño adaptativo

### JavaScript
- **Vanilla JavaScript**
  - Manipulación del DOM
  - Eventos y manejo de formularios
  - Peticiones AJAX con Fetch API

### Bibliotecas y Frameworks
- **Font Awesome**
  - Iconos y elementos de interfaz
  - Versión: 6.0+
- **Google Fonts**
  - Fuentes: Inter y Montserrat
  - Peso: 300-800

## Backend

### Base de Datos
- **Supabase**
  - Base de datos PostgreSQL en la nube
  - Autenticación y autorización integradas
  - API REST y en tiempo real
  - Almacenamiento de archivos
  - Interfaz de panel de administración

### Implementación de Supabase

#### Configuración
- **Archivo de Configuración**: `config.js`
  ```javascript
  export const CONFIG = {
      SUPABASE_URL: 'https://objeqynusiykuovhjauf.supabase.co',
      SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.C.6A0jdMOLjlgE3gYsnrQb_z5ZwZScBImuIqW_yiGac1k'
  };
  ```

#### Servicio de Supabase
- **Ubicación**: `/js/services/supabaseService.js`
- **Funcionalidades**:
  - Inicialización segura del cliente Supabase
  - Manejo de conexiones
  - Exportación de funciones de utilidad

#### Uso en Componentes
1. **Página de Miembros**
   - Consulta a la tabla `miembros`
   - Filtrado por comité directivo
   - Ordenamiento por nombre

2. **Página de Noticias**
   - Carga de noticias destacadas
   - Listado de últimas noticias
   - Integración con el carrusel principal

3. **Agenda de Actividades**
   - Consulta a la tabla `agenda`
   - Ordenamiento por fecha

#### Estructura de Tablas
- `miembros`: Información de los miembros de la red
  - Campos: id, nombre, cargo, institución, comité (booleano), etc.
- `instituciones`: Instituciones afiliadas
- `agenda`: Eventos y actividades
- `noticias`: Publicaciones y artículos

#### Seguridad
- Uso de políticas de RLS (Row Level Security)
- Acceso anónimo solo a datos públicos

#### Ventajas en el Proyecto
1. **Desarrollo Rápido**: API generada automáticamente
2. **Escalabilidad**: Infraestructura administrada
3. **Tiempo Real**: Actualizaciones en vivo sin configuración adicional
4. **Almacenamiento**: Hosting de archivos estáticos

## Herramientas de Desarrollo

### Control de Versiones
- **Git**
  - Plataforma: GitHub
  - Flujo de trabajo: Git Flow
  - Ramas principales: main, develop

### Entorno de Desarrollo
- **Editores de Código**
  - VS Code
  - Extensiones recomendadas:
    - Prettier
    - ESLint
    - Live Server
    - IntelliSense

## APIs y Servicios Externos

### Mapas
- **Google Maps**
  - API Key: [Configurada en el panel de administración]
  - Uso: Mapa de ubicación

### Análisis
- **Google Analytics**
  - Seguimiento de visitas
  - Eventos personalizados
  - Integración con Google Search Console

### Correo Electrónico
- **SMTP**
  - Servidor: mail.redmexsu.mx
  - Puerto: 587 (TLS)
  - Autenticación: Requerida

## Seguridad

### Protección Básica
- **HTTPS**
  - Certificado SSL/TLS
  - HSTS habilitado
  - Redirección forzada de HTTP a HTTPS

### Validación y Filtrado
- **Entrada de Usuario**
  - Validación del lado del cliente
  - Validación del lado del servidor
  - Filtrado de datos

### Protección contra Ataques
- **CSRF**
  - Tokens en formularios
  - Validación de origen
- **XSS**
  - Escapado de salida
  - Headers de seguridad
- **SQL Injection**
  - Consultas preparadas
  - ORM para operaciones de base de datos

## Rendimiento

### Optimización Frontend
- **Caché del Navegador**
  - Headers de expiración
  - ETags
  - Service Workers

### Optimización de Recursos
- **Imágenes**
  - Formatos modernos (WebP) (falta implementar algunos)
  - Tamaños adaptativos
  - Lazy loading

## Compatibilidad

### Dispositivos
- Escritorio: 1280px y superiores
- Portátiles: 1024px - 1279px
- Tabletas: 768px - 1023px
- Móviles: hasta 767px

## Requisitos del Sistema

### Cliente
- Navegador web moderno
- JavaScript habilitado
- Conexión a Internet

## Actualizaciones y Mantenimiento

### Política de Actualización
- Actualizaciones de seguridad: Aplicar en cuanto estén disponibles
- Actualizaciones menores: Revisar mensualmente
- Actualizaciones mayores: Evaluar impacto antes de implementar

### Monitoreo
- Uptime Robot: Monitoreo de disponibilidad (Pendiente)
- Google Search Console: Errores de rastreo (Pendiente)

[Volver al índice](../00-index.md)
