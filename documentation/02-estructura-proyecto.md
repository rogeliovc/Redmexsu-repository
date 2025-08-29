# Estructura del Proyecto

## Estructura de Directorios

```
/
├── assets/               # Recursos multimedia (imágenes, iconos, etc.)
│   ├── Components/       # Componentes reutilizables
│   └── Pages/            # Imágenes específicas por página
├── components/           # Componentes HTML reutilizables
├── css/                  # Hojas de estilo
│   ├── Pages/            # Estilos específicos por página
│   └── componentsStyles/  # Estilos de componentes
├── js/                   # Scripts JavaScript
│   ├── Components/       # Componentes JavaScript
│   └── services/         # Servicios y utilidades
├── pages/                # Páginas del sitio web
│   ├── Acerca/           # Información sobre REDMEXSU
│   ├── Activities/       # Actividades y eventos
│   ├── Contact/          # Formulario de contacto
│   ├── Members/          # Miembros de la red
│   ├── News/             # Noticias y actualizaciones
│   └── Program/          # Agenda de actividades
├── index.html            # Página principal
└── config.js             # Configuraciones del sitio
```

## Descripción de Directorios

### 1. `assets/`
Contiene todos los recursos multimedia del sitio:
- **Components/**: Imágenes y recursos reutilizables
- **Pages/**: Imágenes específicas para cada página
- **icons/**: Conjunto de iconos del sitio
- **docs/**: Documentación y archivos descargables

### 2. `components/`
Componentes HTML reutilizables:
- `header.html` - Encabezado del sitio
- `footer.html` - Pie de página
- `navigation.html` - Menú de navegación


### 3. `css/`
Hojas de estilo organizadas por funcionalidad:
- **Pages/**: Estilos específicos de cada página
- **componentsStyles/**: Estilos de componentes
- **base/**: Estilos base y reset
- **layout/**: Estructura general

### 4. `js/`
Lógica de la aplicación:
- **Components/**: Componentes JavaScript
- **services/**: Servicios y utilidades
- **pages/**: Código específico de cada página

### 5. `pages/`
Contenido de las páginas del sitio:
- **Acerca/**: Información sobre REDMEXSU 
- **Activities/**: Eventos y actividades
- **Contact/**: Formularios de contacto
- **Members/**: Directorio de miembros
- **News/**: Noticias y actualizaciones
- **Program/**: Agenda de actividades

## Archivos Principales

- `index.html` - Punto de entrada de la aplicación
- `config.js` - Configuración global
- `.htaccess` - Configuración del servidor Apache
- `robots.txt` - Instrucciones para motores de búsqueda
- `sitemap.xml` - Mapa del sitio para SEO

## Convenciones de Nombrado

- **Archivos HTML**: minúsculas con guiones (ej: `mi-pagina.html`)
- **Archivos CSS**: minúsculas con guiones (ej: `estilos-generales.css`)
- **Archivos JS**: camelCase (ej: `miFuncion.js`)
- **Imágenes**: descriptivo con guiones (ej: `banner-principal.jpg`)
- **Clases CSS**: minúsculas con guiones (ej: `.mi-clase`)
- **IDs**: minúsculas con guiones (ej: `#mi-seccion`)

## Flujo de Trabajo Recomendado

1. Crear una rama para la nueva característica (ten en cuenta que el host se actualiza automaticamente en la rama main)
2. Hacer cambios en los archivos correspondientes
3. Probar los cambios localmente
4. Hacer commit con mensajes descriptivos
5. Hacer push a la rama remota 

[Volver al índice](../00-index.md)
