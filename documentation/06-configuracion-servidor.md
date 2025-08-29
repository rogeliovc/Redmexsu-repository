# Configuración del Servidor

## Configuración de Supabase

### Detalles de la Base de Datos
- **Tipo**: PostgreSQL 14+
- **Alojamiento**: Supabase Cloud
- **Región**: Más cercana a la ubicación de los usuarios
- **Plan**: Gratuito

### Características Principales
- **Autenticación**: Integrada con múltiples proveedores
- **Almacenamiento**: Buckets para archivos estáticos
- **API REST**: Generada automáticamente
- **Suscripciones en Tiempo Real**: Para actualizaciones en vivo
- **Seguridad**: Row Level Security (RLS) habilitado

### Configuración de Seguridad
```sql
-- Ejemplo de política RLS para una tabla de perfiles
CREATE POLICY "Los usuarios solo pueden ver sus propios perfiles"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);
```

### Copia de Seguridad
- **Automática**: Realizada por Supabase (copias diarias)
- **Manual**: Exportación desde el panel de control
- **Restauración**: Disponible a través de la interfaz de Supabase


[Volver al índice](../00-index.md)
