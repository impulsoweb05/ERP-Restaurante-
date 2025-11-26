# 📧 CONFIGURAR INTEGRACIONES EXTERNAS

El código de notificaciones ya está implementado en `NotificationService.ts`.
Solo necesitas configurar las credenciales en `.env`

---

## 1. EMAIL - GMAIL (Nodemailer)

### Paso 1: Crear App Password en Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a **Seguridad**
3. Activa **Verificación en 2 pasos** (si no está activada)
4. Busca **Contraseñas de aplicaciones**
5. Selecciona **Correo** y **Otro (nombre personalizado)**: "ERP Restaurante"
6. Copia la contraseña generada (16 caracteres)

### Paso 2: Actualizar .env

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASS=xxxx-xxxx-xxxx-xxxx  # La contraseña de aplicación
MAIL_FROM=noreply@restaurante.com
```

### Probar

```bash
# Desde el backend
curl -X POST http://localhost:4000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "destino@example.com",
    "subject": "Prueba",
    "body": "Test desde ERP"
  }'
```

---

## 2. WHATSAPP - EVOLUTION API

### Opción A: Instalar Evolution API Local (Docker)

```bash
# Crear docker-compose.yml para Evolution
mkdir -p ~/evolution-api
cd ~/evolution-api

cat > docker-compose.yml <<'EOF'
version: '3'
services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://localhost:8080
      - AUTHENTICATION_API_KEY=change-me-to-strong-password
    volumes:
      - ./evolution_instances:/evolution/instances
    restart: always
EOF

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Paso 2: Conectar WhatsApp

1. Abre http://localhost:8080/manager
2. Crea una instancia: "restaurante"
3. Escanea el QR con WhatsApp
4. Copia el API Key

### Paso 3: Actualizar .env

```env
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=tu-api-key-generada
WHATSAPP_INSTANCE=restaurante
```

### Probar

```bash
curl -X POST http://localhost:4000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "573012345678",
    "message": "Prueba desde ERP"
  }'
```

### Opción B: Usar Servicio en la Nube

Alternativamente, usa servicios como:
- **Twilio WhatsApp API**: https://www.twilio.com/whatsapp
- **MessageBird**: https://messagebird.com/
- **Meta WhatsApp Business API**: https://business.whatsapp.com/

---

## 3. TELEGRAM BOT

### Paso 1: Crear Bot

1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot`
3. Sigue instrucciones:
   - Nombre: "Restaurante ERP Bot"
   - Username: "restaurante_erp_bot" (debe terminar en _bot)
4. Copia el **Token** (ej: `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Paso 2: Obtener Chat ID

```bash
# Envía un mensaje a tu bot en Telegram
# Luego ejecuta:
curl https://api.telegram.org/bot<TU_TOKEN>/getUpdates

# Busca "chat":{"id":123456789}
# Ese es tu CHAT_ID
```

Para grupo:
1. Agrega el bot al grupo
2. Haz que sea admin
3. Ejecuta el comando arriba
4. El ID será negativo: `-100123456789`

### Paso 3: Actualizar .env

```env
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789  # O -100123456789 para grupo
```

### Probar

```bash
curl -X POST http://localhost:4000/api/test/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Prueba desde ERP"
  }'
```

---

## 4. VERIFICAR QUE FUNCIONA

### Script de Prueba Completa

Guarda como `test-notifications.sh`:

```bash
#!/bin/bash

echo "🧪 Probando Email..."
curl -X POST http://localhost:4000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "tu-email@gmail.com", "subject": "Test", "body": "OK"}' \
  && echo "✅ Email OK" || echo "❌ Email FALLÓ"

echo ""
echo "🧪 Probando WhatsApp..."
curl -X POST http://localhost:4000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "573012345678", "message": "Test"}' \
  && echo "✅ WhatsApp OK" || echo "❌ WhatsApp FALLÓ"

echo ""
echo "🧪 Probando Telegram..."
curl -X POST http://localhost:4000/api/test/telegram \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' \
  && echo "✅ Telegram OK" || echo "❌ Telegram FALLÓ"
```

```bash
chmod +x test-notifications.sh
./test-notifications.sh
```

---

## 5. MODO DESARROLLO (SIN CONFIGURAR)

Si no quieres configurar ahora, el sistema seguirá funcionando.
Los logs mostrarán:

```
⚠️  Email not configured, skipping notification
⚠️  WhatsApp not configured, skipping notification
⚠️  Telegram not configured, skipping notification
```

Pero el resto del sistema funcionará normalmente.

---

## 6. PRODUCCIÓN

Para producción, usa variables de entorno del sistema:

```bash
# NO uses .env en producción
# Configura variables en tu servidor:

export MAIL_USER=prod-email@gmail.com
export MAIL_PASS=prod-app-password
export WHATSAPP_API_KEY=prod-api-key
export TELEGRAM_BOT_TOKEN=prod-bot-token
```

---

## RESUMEN

| Integración | Tiempo Setup | Costo | Dificultad |
|-------------|--------------|-------|------------|
| Email (Gmail) | 5 min | Gratis | Fácil ⭐ |
| Telegram | 5 min | Gratis | Fácil ⭐ |
| WhatsApp (Evolution) | 15 min | Gratis (self-hosted) | Media ⭐⭐ |
| WhatsApp (Twilio) | 10 min | ~$0.005/msg | Fácil ⭐ |

**Recomendación:** Empieza con Telegram (más rápido) y luego agrega Email.
