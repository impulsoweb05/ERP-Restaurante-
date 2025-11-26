# 🐳 SETUP CON DOCKER

## Requisitos Previos

- Docker >= 20.10
- Docker Compose >= 1.29

## Iniciar los Servicios

### Opción 1: Con Docker Compose (Recomendado)

```bash
cd /home/claude/restaurante-erp/database
docker-compose up -d
```

Esto inicia:
- PostgreSQL en puerto 5432
- Directus en puerto 8055

### Verificar que los servicios están corriendo

```bash
docker-compose ps
```

### Logs en tiempo real

```bash
docker-compose logs -f directus
docker-compose logs -f postgres
```

## Acceder a Directus

1. Abre http://localhost:8055 en tu navegador
2. Email: `admin@restaurante.com`
3. Contraseña: `Admin@12345`

## Variables de Entorno

Editar en `database/docker-compose.yml`:

```yaml
ADMIN_EMAIL: admin@restaurante.com
ADMIN_PASSWORD: Admin@12345
KEY: your-secret-key-change-in-production
SECRET: your-secret-value-change-in-production
```

## Base de Datos

- Nombre: `restaurante_erp`
- Usuario: `directus`
- Contraseña: `directus_password_123`
- Host: `postgres` (desde Docker) o `localhost` (desde host)
- Puerto: `5432`

## Volúmenes

Los datos se persisten en:
- `postgres_data` - Datos de PostgreSQL
- `directus_uploads` - Archivos subidos
- `directus_extensions` - Extensiones de Directus

## Detener Servicios

```bash
docker-compose down
```

## Detener y Borrar Datos

```bash
docker-compose down -v  # -v también borra volúmenes
```

## Troubleshooting

### Puerto ya en uso

```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "15432:5432"  # Usar 15432 en lugar de 5432
```

### Directus no inicia

```bash
# Ver logs
docker-compose logs directus

# Reintentar
docker-compose restart directus
```

### Errores de conexión a PostgreSQL

```bash
# Verificar salud de PostgreSQL
docker-compose exec postgres pg_isready -U directus
```

## Próximos Pasos

1. Verificar que Directus está accesible en http://localhost:8055
2. Crear Access Token en Directus para el backend
3. Iniciar Backend en puerto 4000
4. Iniciar Frontends

Ver `DEPLOY_GUIDE.md` para instrucciones completas.
