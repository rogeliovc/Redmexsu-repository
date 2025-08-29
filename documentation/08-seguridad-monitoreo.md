# Seguridad y Monitoreo

## Política de Seguridad

### Principios Fundamentales
- **Integridad**: Garantizar la precisión de los datos
- **Disponibilidad**: Mantener el servicio accesible
- **Cumplimiento**: Seguir regulaciones aplicables

### Responsabilidades
- **Equipo de Desarrollo**: Implementar prácticas seguras
- **Administradores**: Mantener sistemas actualizados

## Configuración de Seguridad

### Configuración de .htaccess
```apache
# Protección de archivos sensibles
<FilesMatch "^\.|composer\.json$|composer\.lock$|package\.json$|package-lock\.json$|\.env$|web\.config$|\.gitignore$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Prevenir listado de directorios
Options -Indexes

# Protección contra inyección de código
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Bloquear intentos de acceso a archivos sensibles
    RewriteCond %{QUERY_STRING} (\<|%3C).*script.*(\>|%3E) [NC,OR]
    RewriteCond %{QUERY_STRING} GLOBALS(=|\[|\%[0-9A-Z]{0,2}) [OR]
    RewriteCond %{QUERY_STRING} _REQUEST(=|\[|\%[0-9A-Z]{0,2})
    RewriteRule ^(.*)$ index.php [F,L]
    
    # Forzar HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Prevenir hotlinking
    RewriteCond %{HTTP_REFERER} !^$
    RewriteCond %{HTTP_REFERER} !^https://(www\.)?redmexsu\.mx/.*$ [NC]
    RewriteRule \.(jpe?g|gif|bmp|png|js|css)$ - [F]
</IfModule>

# Headers de seguridad
<IfModule mod_headers.c>
    # X-XSS-Protection
    Header set X-XSS-Protection "1; mode=block"
    
    # X-Content-Type-Options
    Header set X-Content-Type-Options "nosniff"
    
    # X-Frame-Options
    Header always set X-Frame-Options "SAMEORIGIN"
    
    # Referrer-Policy
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Permissions-Policy
    Header set Permissions-Policy "geolocation=(), midi=(), sync-xhr=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), fullscreen=(self)"
    
    # Content-Security-Policy
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'; form-action 'self';"
</IfModule>

# Configuración de cookies seguras
<IfModule mod_headers.c>
    Header always edit Set-Cookie ^(.*)$ $1;HttpOnly;Secure;SameSite=Lax
</IfModule>
```

### Protección contra DDoS
```apache
# En .htaccess
<IfModule mod_evasive20.c>
    DOSHashTableSize 3097
    DOSPageCount 5
    DOSSiteCount 50
    DOSPageInterval 1
    DOSSiteInterval 1
    DOSBlockingPeriod 600
</IfModule>

# O usando mod_security
<IfModule mod_security2.c>
    SecRuleEngine On
    SecRequestBodyLimit 10485760
    SecRequestBodyNoFilesLimit 131072
    SecRequestBodyInMemoryLimit 131072
    SecRule REQUEST_URI "@gt 1024" "id:'999999',phase:1,t:none,log,deny,status:403,msg:'Request Too Long'"
</IfModule>
```

## Registro y Auditoría

### Configuración de Logs
```apache
# En configuración de VirtualHost
ErrorLog "/home/u123456789/domains/redmexsu.mx/logs/error.log"
CustomLog "/home/u123456789/domains/redmexsu.mx/logs/access.log" combined

# Nivel de log
LogLevel warn

# Formato de log personalizado
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined_custom
```

## Monitoreo del Sitio

### Uptime y Rendimiento
- **Uptime Robot**: Monitoreo de disponibilidad
- **Google PageSpeed Insights**: Rendimiento
- **Pingdom**: Tiempo de respuesta

### Seguridad
- **Let's Encrypt**: Estado de certificados SSL
- **Security Headers**: Configuración de cabeceras
- **Mozilla Observatory**: Evaluación de seguridad

### Fuentes de Información
- [CVE Details](https://www.cvedetails.com/)
- [US-CERT Alerts](https://www.cisa.gov/uscert/ncas)
- [OWASP Security Advisories](https://owasp.org/www-project-web-security-testing-guide/)

[Volver al índice](../00-index.md)
