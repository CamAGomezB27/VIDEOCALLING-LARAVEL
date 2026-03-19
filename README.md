# VIDEOCALLING-LARAVEL

Prueba para videollamadas con laravel

# LiveKit Health API

API REST para gestión de videoconsultas médicas usando **Laravel + LiveKit + PostgreSQL**. Permite agendar citas, gestionar médicos y pacientes, generar tokens de acceso a videollamadas y grabar sesiones.

---

## Stack

| Capa               | Tecnología              |
| ------------------ | ----------------------- |
| Backend API        | Laravel 11              |
| Base de datos      | PostgreSQL              |
| Videoconferencias  | LiveKit (self-hosted)   |
| Grabación          | LiveKit Egress + Docker |
| Coordinación       | Redis                   |
| Frontend de prueba | HTML + LiveKit JS SDK   |

---

## Requisitos previos

- PHP 8.2+
- Composer
- PostgreSQL
- Redis
- Docker
- LiveKit Server binary
- Node.js (para servir el HTML de prueba con `npx serve`)

---

## Instalación

### 1. Clonar e instalar dependencias

```bash
git clone <repo>
cd livekit-health-api
composer install
cp .env.example .env
php artisan key:generate
```

### 2. Configurar `.env`

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=livekit_health
DB_USERNAME=health_user
DB_PASSWORD=secret123

LIVEKIT_URL=ws://localhost:7880
LIVEKIT_HTTP_URL=http://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secretsecretsecretsecretsecret12
```

### 3. Crear base de datos

```sql
CREATE DATABASE livekit_health;
CREATE USER health_user WITH PASSWORD 'secret123';
GRANT ALL PRIVILEGES ON DATABASE livekit_health TO health_user;
```

### 4. Ejecutar migraciones

```bash
php artisan migrate
```

---

## Levantar servicios

Necesitas **4 terminales** corriendo en paralelo:

### Terminal 1 — Redis

```bash
redis-server
```

### Terminal 2 — LiveKit Server

Crea `livekit.yaml` en la raíz del proyecto:

```yaml
port: 7880
log_level: info

keys:
  devkey: secretsecretsecretsecretsecret12

redis:
  address: localhost:6379

rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 60000
```

```bash
livekit-server --config livekit.yaml
```

### Terminal 3 — LiveKit Egress

Crea `egress.yaml` (fuera del proyecto, ej: `~/livekit/egress.yaml`):

```yaml
api_key: devkey
api_secret: secretsecretsecretsecretsecret12
ws_url: ws://localhost:7880
redis:
  address: localhost:6379
insecure: true
```

```bash
docker run --rm \
  --name livekit-egress \
  --network host \
  -e EGRESS_CONFIG_FILE=/etc/egress.yaml \
  -v ~/livekit/egress.yaml:/etc/egress.yaml \
  -v ~/grabaciones:/output \
  --cap-add SYS_ADMIN \
  livekit/egress
```

> Las grabaciones se guardan en `~/grabaciones/` como archivos `.mp4`.

### Terminal 4 — Laravel

```bash
php artisan serve
# http://localhost:8000
```

---

## Endpoints

### Médicos

| Método | Endpoint            | Descripción       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/doctors`      | Listar médicos    |
| POST   | `/api/doctors`      | Crear médico      |
| GET    | `/api/doctors/{id}` | Ver médico        |
| PUT    | `/api/doctors/{id}` | Actualizar médico |
| DELETE | `/api/doctors/{id}` | Eliminar médico   |

```json
// POST /api/doctors
{
  "name": "Dr. Ana López",
  "email": "ana@hospital.com",
  "specialty": "Cardiología",
  "license_number": "MED-001",
  "phone": "+57 300 0000000"
}
```

### Pacientes

| Método | Endpoint             | Descripción         |
| ------ | -------------------- | ------------------- |
| GET    | `/api/patients`      | Listar pacientes    |
| POST   | `/api/patients`      | Crear paciente      |
| GET    | `/api/patients/{id}` | Ver paciente        |
| PUT    | `/api/patients/{id}` | Actualizar paciente |
| DELETE | `/api/patients/{id}` | Eliminar paciente   |

```json
// POST /api/patients
{
  "name": "Carlos Pérez",
  "email": "carlos@gmail.com",
  "document_number": "1234567890",
  "birth_date": "1990-05-15",
  "phone": "+57 310 0000000"
}
```

### Citas

| Método | Endpoint                                 | Descripción            |
| ------ | ---------------------------------------- | ---------------------- |
| GET    | `/api/appointments`                      | Listar citas           |
| POST   | `/api/appointments`                      | Agendar cita           |
| GET    | `/api/appointments/{id}`                 | Ver cita               |
| PUT    | `/api/appointments/{id}`                 | Actualizar cita        |
| DELETE | `/api/appointments/{id}`                 | Cancelar cita          |
| GET    | `/api/appointments/{id}/join`            | Obtener tokens LiveKit |
| POST   | `/api/appointments/{id}/recording/start` | Iniciar grabación      |
| POST   | `/api/appointments/{id}/recording/stop`  | Detener grabación      |

```json
// POST /api/appointments
{
  "doctor_id": 1,
  "patient_id": 1,
  "scheduled_at": "2026-03-20 10:00:00",
  "duration": 30
}

// GET /api/appointments/{id}/join — respuesta:
{
  "room_name": "appt-1-1773935491",
  "livekit_url": "ws://localhost:7880",
  "patient_token": "eyJhbGci...",
  "doctor_token": "eyJhbGci..."
}
```

---

## Modelo de datos

```
doctors
  id, name, email, specialty, phone, license_number, active
  timestamps, soft_deletes

patients
  id, name, email, phone, birth_date, document_number, notes
  timestamps, soft_deletes

appointments
  id, doctor_id (FK), patient_id (FK)
  scheduled_at, duration, status
  livekit_room_name, egress_id
  started_at, ended_at, notes
  timestamps, soft_deletes
```

**Estados de una cita:** `scheduled` → `in_progress` → `completed` | `cancelled`

---

## Frontend de prueba

Abre `test-videocall.html` con un servidor local:

```bash
# En la carpeta donde está el archivo
npx serve .
# Abrir http://localhost:3000/test-videocall en dos pestañas
```

Funcionalidades del cliente de prueba:

- Selección de rol (paciente / médico)
- Video y audio en tiempo real
- Silenciar micrófono y desactivar cámara
- Timer de duración de la consulta
- Iniciar y detener grabación (requiere Egress corriendo)
- Indicador REC visible durante la grabación
- Contador de participantes en sala

---

## Estructura del proyecto

```
app/
  Http/Controllers/
    AppointmentController.php   # CRUD + join + recording
    DoctorController.php        # CRUD médicos
    PatientController.php       # CRUD pacientes
  Models/
    Appointment.php
    Doctor.php
    Patient.php
  Services/
    LiveKitService.php          # Tokens + creación de salas + grabación
  config/
    livekit.php                 # Config LiveKit desde .env
database/
  migrations/
    create_doctors_table.php
    create_patients_table.php
    create_appointments_table.php
    add_egress_id_to_appointments_table.php
routes/
  api.php
test-videocall.html             # Cliente de prueba
livekit.yaml                    # Config del servidor LiveKit
```

---

## Seguridad (para producción)

Antes de llevar esto a producción hay que agregar:

- **Autenticación**: Laravel Sanctum para proteger todos los endpoints
- **Autorización**: Validar que el médico/paciente pertenece a la cita antes de generar tokens
- **HTTPS**: LiveKit y la API deben correr bajo TLS. Los navegadores bloquean cámara/micrófono sin HTTPS (excepto en localhost)
- **Variables de entorno**: Nunca exponer `LIVEKIT_API_SECRET` al frontend
- **Ventana de tiempo**: Solo permitir `join` N minutos antes de la cita
- **Rate limiting**: Limitar intentos en endpoints de join y recording
