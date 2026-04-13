# MediCall

Sistema de videoconsultas médicas construido con **Laravel + LiveKit + Next.js**. Permite agendar citas virtuales, gestionar médicos y pacientes, realizar videollamadas con sala de espera, chat en tiempo real y grabación de sesiones.

---

## Stack

| Capa              | Tecnología                                      |
| ----------------- | ----------------------------------------------- |
| Backend API       | Laravel 11                                      |
| Base de datos     | PostgreSQL                                      |
| Videoconferencias | LiveKit (self-hosted)                           |
| Grabación         | LiveKit Egress + Docker                         |
| Coordinación      | Redis                                           |
| Frontend          | Next.js 14 (App Router) + TypeScript + Tailwind |
| SDK de video      | `@livekit/components-react` + `livekit-client`  |

---

## Arquitectura general

```
medicall-frontend/          # Next.js — Feature-Driven Architecture
livekit-health-api/         # Laravel — API REST
livekit.yaml                # Config LiveKit server
egress.yaml                 # Config LiveKit Egress
```

El frontend se comunica con Laravel vía REST. LiveKit coordina el video/audio directamente entre clientes (WebRTC). El chat y la sala de espera funcionan mediante Data Channels de LiveKit sin pasar por el backend.

---

## Requisitos previos

- PHP 8.2+
- Composer
- PostgreSQL
- Redis
- Docker
- LiveKit Server binary
- Node.js 18+

---

## Backend — Laravel

### Instalación

```bash
cd livekit-health-api
composer install
cp .env.example .env
php artisan key:generate
```

### Variables de entorno (`.env`)

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

### Base de datos

```sql
CREATE DATABASE livekit_health;
CREATE USER health_user WITH PASSWORD 'secret123';
GRANT ALL PRIVILEGES ON DATABASE livekit_health TO health_user;
```

```bash
php artisan migrate
```

### Estructura del backend

```
app/
  Http/Controllers/
    AppointmentController.php     # CRUD + join + recording + endMeeting
    AppointmentChatController.php # Historial de chat persistente
    DoctorController.php
    PatientController.php
  Models/
    Appointment.php
    AppointmentChat.php
    Doctor.php
    Patient.php
  Services/
    LiveKitService.php            # Tokens JWT + salas + grabación (Egress)
config/
  livekit.php
```

---

## Frontend — Next.js

### Instalación

```bash
cd medicall-frontend
npm install
```

### Variables de entorno (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
```

### Arquitectura Feature-Driven

```
src/
├── app/                          # Solo rutas — sin lógica de negocio
│   ├── page.tsx                  → AuthShell
│   ├── dashboard/page.tsx        → DashboardShell
│   └── room/[id]/page.tsx        → RoomShell
│
├── features/
│   ├── auth/                     # Login, selección de rol
│   │   ├── components/
│   │   │   ├── AuthShell.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/useAuth.ts
│   │   ├── services/authService.ts
│   │   └── index.ts
│   │
│   ├── appointments/             # Dashboard, agendamiento, lista de citas
│   │   ├── components/
│   │   │   ├── DashboardShell.tsx
│   │   │   ├── AppointmentCard.tsx
│   │   │   ├── AppointmentList.tsx
│   │   │   ├── AppointmentBadge.tsx
│   │   │   └── ScheduleForm.tsx
│   │   ├── hooks/useAppointments.ts
│   │   ├── services/appointmentsApi.ts
│   │   └── index.ts
│   │
│   ├── room/                     # Sala de video, sala de espera, pre-lobby
│   │   ├── components/
│   │   │   ├── RoomShell.tsx
│   │   │   ├── VideoRoom.tsx         # Orquestador principal
│   │   │   ├── PreLobby.tsx          # Configurar cam/mic antes de entrar
│   │   │   ├── WaitingRoom.tsx       # Sala de espera (pacientes/terceros)
│   │   │   ├── HostWaitingPanel.tsx  # Panel del médico para admitir/rechazar
│   │   │   ├── VideoGrid.tsx
│   │   │   ├── VideoTile.tsx         # Con iluminado al hablar
│   │   │   └── Controls.tsx
│   │   ├── hooks/
│   │   │   ├── useRoom.ts            # Orquestador de fases
│   │   │   ├── useWaitingRoom.ts     # Lógica Data Channel sala de espera
│   │   │   └── useSpeakingDetection.ts
│   │   ├── services/livekitApi.ts
│   │   ├── types/index.ts
│   │   └── index.ts
│   │
│   └── chat/                     # Chat en tiempo real + historial
│       ├── components/
│       │   ├── ChatPanel.tsx
│       │   └── ChatMessage.tsx
│       ├── hooks/useChat.ts
│       ├── services/chatApi.ts
│       ├── types/index.ts
│       └── index.ts
│
├── components/
│   ├── ui/                       # Button, Input, Badge
│   └── layout/Sidebar.tsx
│
└── shared/
    ├── lib/api.ts                # Cliente HTTP base
    ├── types/index.ts            # Doctor, Patient, Appointment, Role...
    └── utils/formatDate.ts
```

---

## Levantar el sistema completo

Necesitas **5 terminales**:

### Terminal 1 — Redis

```bash
redis-server
```

### Terminal 2 — LiveKit Server

Crea `livekit.yaml`:

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

### Terminal 3 — LiveKit Egress (grabación)

Crea `egress.yaml`:

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

Las grabaciones se guardan en `~/grabaciones/` como archivos `.mp4`.

### Terminal 4 — Laravel

```bash
cd livekit-health-api
php artisan serve
# http://localhost:8000
```

### Terminal 5 — Next.js

```bash
cd medicall-frontend
npm run dev
# http://localhost:3000
```

---

## Endpoints del API

### Médicos

| Método | Endpoint            | Descripción |
| ------ | ------------------- | ----------- |
| GET    | `/api/doctors`      | Listar      |
| POST   | `/api/doctors`      | Crear       |
| GET    | `/api/doctors/{id}` | Ver         |
| PUT    | `/api/doctors/{id}` | Actualizar  |
| DELETE | `/api/doctors/{id}` | Eliminar    |

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

| Método | Endpoint             | Descripción |
| ------ | -------------------- | ----------- |
| GET    | `/api/patients`      | Listar      |
| POST   | `/api/patients`      | Crear       |
| GET    | `/api/patients/{id}` | Ver         |
| PUT    | `/api/patients/{id}` | Actualizar  |
| DELETE | `/api/patients/{id}` | Eliminar    |

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

| Método | Endpoint                                 | Descripción                  |
| ------ | ---------------------------------------- | ---------------------------- |
| GET    | `/api/appointments`                      | Listar con doctor y paciente |
| POST   | `/api/appointments`                      | Agendar                      |
| GET    | `/api/appointments/{id}`                 | Ver detalle                  |
| PUT    | `/api/appointments/{id}`                 | Actualizar                   |
| DELETE | `/api/appointments/{id}`                 | Cancelar (soft delete)       |
| GET    | `/api/appointments/{id}/join`            | Obtener tokens LiveKit       |
| POST   | `/api/appointments/{id}/recording/start` | Iniciar grabación            |
| POST   | `/api/appointments/{id}/recording/stop`  | Detener grabación            |
| POST   | `/api/appointments/{id}/end`             | Finalizar reunión            |
| GET    | `/api/appointments/{id}/chat`            | Historial de chat            |
| POST   | `/api/appointments/{id}/chat`            | Guardar mensaje              |

```json
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
  scheduled_at, duration
  status: scheduled | in_progress | completed | cancelled
  livekit_room_name, egress_id
  started_at, ended_at, notes
  timestamps, soft_deletes

appointment_chats
  id, appointment_id (FK)
  sender_id, sender_type (polimórfico), sender_role
  message
  timestamps
```

---

## Flujo de una consulta

```
1. Login          → correo + cédula (paciente) o correo + licencia (médico)
2. Dashboard      → ver citas propias, agendar nueva cita
3. Pre-lobby      → configurar cámara y micrófono con preview en vivo
4. Sala de espera → paciente espera hasta que el médico lo admita
5. Reunión activa → video, audio, chat, grabación
6. Fin            → médico cierra la reunión para todos
```

### Sala de espera — coordinación por Data Channels

Toda la lógica de sala de espera funciona sin backend adicional, usando los Data Channels nativos de LiveKit:

| Mensaje           | Emisor           | Efecto                                    |
| ----------------- | ---------------- | ----------------------------------------- |
| `meeting_started` | Médico           | Pacientes en espera pasan a la reunión    |
| `knock`           | Paciente/tercero | Aparece en el panel del médico            |
| `admit`           | Médico           | El destinatario entra a la reunión        |
| `reject`          | Médico           | El destinatario ve mensaje de rechazo     |
| `waiting_message` | Médico           | Mensaje visible en sala de espera         |
| `meeting_ended`   | Médico           | Todos los participantes son desconectados |

### Speaking detection

El iluminado del video al hablar usa el evento `ActiveSpeakersChanged` de LiveKit, nativo y sin polling. El borde del tile se ilumina en verde con una animación de barras de audio.

---

## Funcionalidades

**Autenticación** — verificación por correo + documento contra la API de Laravel. Sin JWT propio, la sesión vive en `sessionStorage`.

**Dashboard** — lista de citas filtrada por usuario, agendamiento con selector de contraparte, fecha, duración y notas.

**Pre-lobby** — preview en vivo de cámara y micrófono antes de entrar. El médico ve la advertencia de que al entrar activa la reunión para todos.

**Sala de espera** — animación de espera, mensajes del médico en tiempo real, notificación de rechazo con motivo opcional.

**Panel del médico** — lista de participantes esperando con nombre y rol, botones de admitir/rechazar, campo de motivo para rechazo, envío de mensaje a todos los que esperan.

**Chat** — mensajes en tiempo real por Data Channel + persistencia en PostgreSQL. Historial cargado al entrar a la sala. Badge de mensajes no leídos cuando el panel está cerrado.

**Grabación** — LiveKit Egress vía API HTTP. El médico inicia y detiene. El archivo `.mp4` se guarda localmente en el servidor.

**Controles de sala** — mic, cámara, grabar, salir (paciente/tercero) y cerrar reunión (solo médico host).

---

## Patrón de hidratación Next.js

Las páginas en `src/app/` son Server Components puros. Los Shells son Client Components que usan el patrón `mounted` para evitar hydration mismatch con `sessionStorage`:

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  // leer sessionStorage aquí — solo en cliente
}, []);

// Mismo HTML en servidor y cliente durante el primer render
if (!mounted) return <Spinner />;
```

---

## Seguridad — pendiente para producción

- Autenticación con Laravel Sanctum en todos los endpoints
- Validar que el médico/paciente pertenece a la cita antes de generar tokens
- HTTPS obligatorio (los navegadores bloquean cámara/mic sin TLS fuera de localhost)
- Nunca exponer `LIVEKIT_API_SECRET` al frontend
- Ventana de tiempo para `join` (solo N minutos antes de la cita)
- Rate limiting en endpoints de join y recording
- Tokens LiveKit con expiración ajustada a la duración de la cita

---

## Roadmap

- [ ] Autenticación con Sanctum
- [ ] Notificaciones en tiempo real (cita próxima, admisión pendiente)
- [ ] App del médico en PHP independiente
- [ ] Webhooks de LiveKit para auditoría de eventos
- [ ] Tests de integración backend y frontend
- [ ] Deploy con Docker Compose
- [ ] Soporte móvil (PWA o React Native)
