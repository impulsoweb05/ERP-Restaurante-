#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
# Carga schema y datos de prueba para el sistema ERP Restaurante
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "🔧 Inicializando base de datos con datos de prueba..."
echo ""

# Configuración de PostgreSQL
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-directus}"
DB_PASSWORD="${DB_PASSWORD:-directus_password_123}"
DB_NAME="${DB_NAME:-restaurante_erp}"

# Directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$SCRIPT_DIR/../../database"

# Crear archivo temporal de credenciales para evitar exponer password en process list
PGPASS_FILE=$(mktemp)
echo "$DB_HOST:$DB_PORT:$DB_NAME:$DB_USER:$DB_PASSWORD" > "$PGPASS_FILE"
chmod 600 "$PGPASS_FILE"
export PGPASSFILE="$PGPASS_FILE"

# Limpiar archivo de credenciales al salir
cleanup() {
  rm -f "$PGPASS_FILE"
}
trap cleanup EXIT

# Verificar que los archivos SQL existen
if [ ! -f "$DATABASE_DIR/schema.sql" ]; then
    echo "❌ Error: No se encontró el archivo schema.sql en $DATABASE_DIR"
    exit 1
fi

if [ ! -f "$DATABASE_DIR/seed-menu-complete.sql" ]; then
    echo "❌ Error: No se encontró el archivo seed-menu-complete.sql en $DATABASE_DIR"
    exit 1
fi

if [ ! -f "$DATABASE_DIR/seed-test-data.sql" ]; then
    echo "❌ Error: No se encontró el archivo seed-test-data.sql en $DATABASE_DIR"
    exit 1
fi

# Verificar que PostgreSQL esté disponible
echo "⏳ Esperando a que PostgreSQL esté disponible..."
until psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "⏳ PostgreSQL no está disponible aún - reintentando en 2 segundos..."
  sleep 2
done

echo "✅ PostgreSQL está disponible"
echo ""

# Cargar schema
echo "📋 Cargando schema..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DATABASE_DIR/schema.sql" > /dev/null 2>&1
echo "✅ Schema cargado"

# Cargar datos del menú
echo "🍽️ Cargando datos del menú (10 categorías, 50 subcategorías, 150 productos)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DATABASE_DIR/seed-menu-complete.sql" > /dev/null 2>&1
echo "✅ Menú cargado"

# Cargar datos de prueba
echo "👥 Cargando datos de prueba (meseros, mesas, clientes, horarios)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DATABASE_DIR/seed-test-data.sql" > /dev/null 2>&1
echo "✅ Datos de prueba cargados"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "✅ BASE DE DATOS INICIALIZADA CORRECTAMENTE"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Resumen de datos cargados:"
echo "  • Meseros:       10"
echo "  • Mesas:         20"
echo "  • Clientes:      15"
echo "  • Categorías:    10"
echo "  • Subcategorías: 50"
echo "  • Productos:     150"
echo "  • Horarios:      7 días"
echo ""
echo "🔑 Credenciales de prueba:"
echo "  • Mesero:  MES-001"
echo "  • PIN:     1234"
echo ""
echo "📍 Para probar el login:"
echo "  curl -X POST http://localhost:4000/api/auth/login/waiter \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"waiter_code\": \"MES-001\", \"pin_code\": \"1234\"}'"
echo ""
