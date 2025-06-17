# REDMEXSU RED MEXICANA DE SUPERCOMPUTO

[![Estado del Proyecto](https://img.shields.io/badge/estado-activo-brightgreen.svg)](https://github.com/rogeliovc/Temporary_Lawhpc)

![LAW HPC Banner](/pages/homePage/assets/banner.png)

Sitio web oficial de Latin American Women in High Performance Computing (LAW HPC), una iniciativa para promover y visibilizar la participación de mujeres en el campo de la computación de alto rendimiento en América Latina. Este proyecto busca crear una comunidad inclusiva que fomente la colaboración, el aprendizaje y el crecimiento profesional en el área de HPC.

##  Características Principales

- **🖥️ Diseño Adaptativo**: Interfaz que se ajusta perfectamente a cualquier dispositivo, desde móviles hasta pantallas de escritorio.
- **⚡ Rendimiento Optimizado**: Carga ultrarrápida gracias a la optimización de recursos y técnicas de carga diferida.
- **🔍 Accesibilidad**: Desarrollado siguiendo las pautas WCAG 2.1 para garantizar la accesibilidad universal.
- **🔄 Componentes Modulares**: Arquitectura basada en componentes reutilizables para un mantenimiento sencillo.
- **🔒 Seguridad Mejorada**: Configuraciones de seguridad avanzadas mediante headers HTTP y políticas de contenido.


##  Comenzando

### Requisitos del Sistema

- Navegador web moderno (últimas 2 versiones de):
  - Chrome / Edge
  - Firefox
  - Safari
- Editor de código (recomendado):
  - [Visual Studio Code](https://code.visualstudio.com/)
  - [Sublime Text](https://www.sublimetext.com/)
  - [WebStorm](https://www.jetbrains.com/webstorm/)
- [Git](https://git-scm.com/) (para control de versiones)

###  Instalación Local

1. **Clonar el repositorio**:
   ```bash

   ```

2. **Iniciar un servidor local**:
   ```bash
   # Opción 1: Usando Python (preinstalado en la mayoría de sistemas)
   python3 -m http.server 8000
   
   # Opción 2: Usando Node.js con http-server
   npx http-server -p 8000
   
   # Opción 3: Usando PHP (si está instalado)
   php -S localhost:8000
   ```

3. **Abrir en el navegador**:
   ```
   http://localhost:8000
   ```

###  Flujo de Trabajo

1. Crear una rama para nuevas características:
   ```bash
   git checkout -b feature/nombre-de-la-caracteristica
   ```
2. Hacer commit de los cambios:
   ```bash
   git add .
   git commit -m "Descripción clara de los cambios"
   ```
3. Sincronizar con el repositorio remoto:
   ```bash
   git push origin feature/nombre-de-la-caracteristica
   ```
4. Crear un Pull Request para revisión

###  Herramientas Recomendadas

- **Editores**: VS Code con extensiones como Live Server, Prettier, ESLint
- **Pruebas**: BrowserStack para pruebas multiplataforma
- **Rendimiento**: Lighthouse, WebPageTest
- **SEO**: Google Search Console, Screaming Frog

##  Desarrollo

### Estructura de Componentes

- **Header**: Navegación principal del sitio
- **Footer**: Información de contacto y enlaces importantes
- **Páginas**: Cada sección tiene su propia carpeta con HTML y CSS dedicados

### Convenciones de Código

- **HTML**: Semántico y accesible
- **CSS**: Nombrado BEM para clases
- **JS**: Funciones modulares con manejo de errores

##  Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Configuración del Servidor**: Archivo .htaccess para URLs limpias y optimizaciones
- **Compatibilidad**: Navegadores modernos (últimas 2 versiones de Chrome, Firefox, Safari, Edge)

##  Optimizaciones

El proyecto incluye:
- Caché para activos estáticos
- Compresión GZIP para transferencia de archivos
- Headers de seguridad mejorados
- Redireccionamiento HTTPS forzado (configurado en el host)

##  Despliegue

El despliegue se realiza automáticamente a través del servicio de hosting configurado. Los cambios en la rama `main` se reflejarán automáticamente en producción.

### Requisitos del Hosting
- Soporte para archivos estáticos (HTML, CSS, JS)
- Compatibilidad con .htaccess para las reglas de reescritura
- Certificado SSL para conexiones seguras

##  Contribuyendo

Si deseas contribuir al proyecto, por favor:
1. Crea un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -am 'Añade nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

##  Contacto

Para más información sobre el proyecto o colaboraciones, por favor contacta al equipo de LAW HPC a través de los canales oficiales que se encuentran en el sitio web.

---

<div align="center">
  <p>© 2025 Latin American Women in HPC</p>
</div>
