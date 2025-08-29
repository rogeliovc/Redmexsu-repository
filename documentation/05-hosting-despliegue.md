# Hosting y Despliegue

## Información del Hosting

### Detalles del Servidor
- **Proveedor**: Hostinger

## Configuración de Dominio

### Dominio Principal
- **Nombre de Dominio**: redmexsu.org

### Configuración en .htaccess
```apache
# Forzar HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# HSTS (Strict-Transport-Security)
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>
```

## Despliegue Automático

### Configuración con GitHub

1. **Repositorio**: github.com/rogeliovc/Redmexsu-repository
2. **Rama de Producción**: main
3. **Rama de Desarrollo**: develop
4. **Webhook**: Configurado para despliegue automático

### Pasos para el Despliegue

1. **Preparación**
   ```bash
   # Actualizar rama local
   git checkout main
   git pull origin main

2. **Subir Cambios**
   ```bash
   # Agregar cambios
   git add .
   
   # Hacer commit
   git commit -m "Descripción de los cambios" utilizando la nomenclatura feat:, fix:, etc.
   
   # Subir a GitHub
   git push origin main
   ```

## Configuración del Entorno


```

## Copias de Seguridad

### Automáticas
- **Frecuencia**: Diaria
- **Retención**: 30 días
- **Ubicación**: Almacenamiento externo seguro
- **Notificaciones**: Por correo electrónico

### Manuales
1. **Base de Datos**
   ```bash
   # Exportar base de datos
   mysqldump -u usuario -p nombre_base_datos > backup_$(date +%Y%m%d).sql
   
   # Comprimir
   gzip backup_$(date +%Y%m%d).sql
   ```

2. **Archivos**
   ```bash
   # Crear archivo comprimido
   tar -czf redmexsu_backup_$(date +%Y%m%d).tar.gz /ruta/al/sitio
   ```

## Monitoreo

### Herramientas

1. **Google Analytics**
   - Tráfico en tiempo real
   - Comportamiento de usuarios
   - Fuentes de tráfico

2. **Google Search Console**
   - Errores de rastreo
   - Rendimiento en búsquedas
   - Enlaces internos/externos

## Solución de Problemas Comunes

### El sitio no se actualiza
1. Limpiar caché del navegador
2. Verificar caché de Cloudflare
3. Revisar configuración de caché en .htaccess

### Problemas con la Base de Datos
1. Verificar conexión
2. Revisar credenciales config.js
3. Revisar el estado de la base de datos en Supabase (se desactiva sin uso)


[Volver al índice](../00-index.md)
