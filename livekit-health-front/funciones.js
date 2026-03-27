const API_BASE = "http://localhost:8000/api";

let room = null;
let currentRole = null;
let currentUser = null;
let currentApptId = null;
let isRecording = false;
let micEnabled = true;
let camEnabled = true;
let timerInterval = null;
let seconds = 0;
let chatOpen = false;
let unreadCount = 0;

// ──────────────────────────────────────────
// NAVEGACIÓN
// ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  const target = document.getElementById(id);
  target.style.display = "flex";
  requestAnimationFrame(() => target.classList.add("active"));
}

// ──────────────────────────────────────────
// PASO 1 — elegir rol
// ──────────────────────────────────────────
function selectRole(role) {
  currentRole = role;

  const badge = document.getElementById("form-role-badge");
  const title = document.getElementById("form-title");
  const subtitle = document.getElementById("form-subtitle");
  const docLabel = document.getElementById("label-document");

  if (role === "patient") {
    badge.textContent = "Paciente";
    badge.className = "form-role-badge patient";
    title.textContent = "Ingresa tus datos";
    subtitle.textContent = "Verificaremos tu identidad antes de la consulta";
    docLabel.textContent = "Número de cédula";
    document.getElementById("input-document").placeholder = "1234567890";
  } else {
    badge.textContent = "Médico";
    badge.className = "form-role-badge doctor";
    title.textContent = "Acceso médico";
    subtitle.textContent = "Ingresa tus credenciales profesionales";
    docLabel.textContent = "Número de licencia médica";
    document.getElementById("input-document").placeholder = "MED-001";
  }

  document.getElementById("input-email").value = "";
  document.getElementById("input-document").value = "";
  hideError("form-error");
  showScreen("screen-form");
  setTimeout(() => document.getElementById("input-email").focus(), 300);
}

function goBack() {
  showScreen("screen-role");
}

// ──────────────────────────────────────────
// PASO 2 — login
// ──────────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById("input-email").value.trim();
  const docNumber = document.getElementById("input-document").value.trim();

  if (!email || !email.includes("@"))
    return showError("form-error", "Ingresa un correo válido");
  if (!docNumber) {
    const label = currentRole === "patient" ? "cédula" : "número de licencia";
    return showError("form-error", `Ingresa tu ${label}`);
  }

  setStatus("Verificando identidad...", "active");
  setSubmitLoading(true);
  hideError("form-error");

  try {
    currentUser = await verifyIdentity(email, docNumber);
    setStatus("Identidad verificada", "active");
    await loadDashboard();
  } catch (err) {
    setStatus("Error al verificar", "error");
    showError("form-error", err.message);
  } finally {
    setSubmitLoading(false);
  }
}

async function verifyIdentity(email, docNumber) {
  const endpoint = currentRole === "patient" ? "patients" : "doctors";
  const res = await fetch(`${API_BASE}/${endpoint}`);
  if (!res.ok) throw new Error("No se pudo conectar con la API");

  const list = await res.json();
  const field =
    currentRole === "patient" ? "document_number" : "license_number";
  const found = list.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u[field] === docNumber,
  );

  if (!found)
    throw new Error(
      "Credenciales incorrectas. Verifica tu correo y documento.",
    );
  return found;
}

// ──────────────────────────────────────────
// PASO 3 — dashboard
// ──────────────────────────────────────────
async function loadDashboard() {
  document.getElementById("sidebar-name").textContent = currentUser.name;
  document.getElementById("sidebar-role").textContent =
    currentRole === "patient" ? "Paciente" : "Médico";

  const avatarEl = document.getElementById("sidebar-avatar");
  avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
  avatarEl.className =
    currentRole === "patient" ? "sidebar-avatar patient-av" : "sidebar-avatar";

  showScreen("screen-dashboard");
  showTab("appointments");
  await loadAppointments();
  await loadOtherParty();
}

function showTab(tab) {
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");
  document.getElementById(`nav-${tab}`).classList.add("active");
}

async function loadAppointments() {
  const listEl = document.getElementById("appointments-list");
  listEl.innerHTML = `<div class="list-loading"><div class="connecting-ring"></div><span>Cargando citas...</span></div>`;

  try {
    const res = await fetch(`${API_BASE}/appointments`);
    const all = await res.json();
    const field = currentRole === "patient" ? "patient_id" : "doctor_id";
    const mine = all.filter((a) => a[field] === currentUser.id);

    if (mine.length === 0) {
      listEl.innerHTML = `
        <div class="empty-appointments">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>No tienes citas aún</span>
        </div>`;
      return;
    }

    mine.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

    listEl.innerHTML = mine
      .map((appt) => {
        const other = currentRole === "patient" ? appt.doctor : appt.patient;
        const otherLabel = currentRole === "patient" ? "Dr." : "Paciente";
        const otherName = other ? `${otherLabel} ${other.name}` : "—";
        const date = new Date(appt.scheduled_at);
        const dateStr = date.toLocaleDateString("es-CO", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const timeStr = date.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const canJoin =
          appt.status === "scheduled" || appt.status === "in_progress";

        return `
        <div class="appt-card">
          <div class="appt-status-bar status-${appt.status}"></div>
          <div class="appt-info">
            <div class="appt-title">${otherName}</div>
            <div class="appt-meta">${dateStr} · ${timeStr} · ${appt.duration} min</div>
          </div>
          <span class="appt-badge badge-${appt.status}">${statusLabel(appt.status)}</span>
          <div class="appt-actions">
            ${
              canJoin
                ? `
              <button class="btn-join" type="button" onclick="enterRoom(${appt.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                Entrar
              </button>`
                : ""
            }
          </div>
        </div>`;
      })
      .join("");
  } catch {
    listEl.innerHTML = `<div class="list-loading"><span style="color:var(--danger)">Error al cargar citas</span></div>`;
  }
}

function statusLabel(s) {
  return (
    {
      scheduled: "Programada",
      in_progress: "En curso",
      completed: "Completada",
      cancelled: "Cancelada",
    }[s] || s
  );
}

async function loadOtherParty() {
  const endpoint = currentRole === "patient" ? "doctors" : "patients";
  const label = currentRole === "patient" ? "Médico" : "Paciente";

  document.getElementById("label-other-party").textContent = label;

  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    const list = await res.json();
    const sel = document.getElementById("select-other-party");
    sel.innerHTML =
      `<option value="">Selecciona un ${label.toLowerCase()}...</option>` +
      list.map((u) => `<option value="${u.id}">${u.name}</option>`).join("");
  } catch {
    document.getElementById("select-other-party").innerHTML =
      `<option value="">Error al cargar</option>`;
  }

  const min = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const minStr = `${min.getFullYear()}-${pad(min.getMonth() + 1)}-${pad(min.getDate())}T${pad(min.getHours())}:${pad(min.getMinutes())}`;
  const dtInput = document.getElementById("input-datetime");
  dtInput.min = minStr;
  dtInput.value = minStr;
}

// ──────────────────────────────────────────
// AGENDAR CITA
// ──────────────────────────────────────────
async function scheduleAppointment() {
  const otherId = document.getElementById("select-other-party").value;
  const datetime = document.getElementById("input-datetime").value;
  const duration = document.getElementById("select-duration").value;
  const notes = document.getElementById("input-notes").value.trim();

  hideError("schedule-error");

  if (!otherId)
    return showError(
      "schedule-error",
      `Selecciona un ${currentRole === "patient" ? "médico" : "paciente"}`,
    );
  if (!datetime) return showError("schedule-error", "Selecciona fecha y hora");

  const doctorId = currentRole === "patient" ? otherId : currentUser.id;
  const patientId = currentRole === "patient" ? currentUser.id : otherId;

  document.getElementById("schedule-btn").disabled = true;
  document.getElementById("schedule-label").textContent = "Agendando...";

  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: parseInt(doctorId),
        patient_id: parseInt(patientId),
        scheduled_at: datetime.replace("T", " ") + ":00",
        duration: parseInt(duration),
        notes: notes || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(
        Object.values(err.errors || {})
          .flat()
          .join(", ") || "Error al agendar",
      );
    }

    showToast("Cita agendada correctamente");
    document.getElementById("input-notes").value = "";
    showTab("appointments");
    await loadAppointments();
  } catch (err) {
    showError("schedule-error", err.message);
  } finally {
    document.getElementById("schedule-btn").disabled = false;
    document.getElementById("schedule-label").textContent = "Confirmar cita";
  }
}

function logout() {
  currentUser = null;
  currentRole = null;
  currentApptId = null;
  showScreen("screen-role");
}

// ──────────────────────────────────────────
// ENTRAR A SALA
// ──────────────────────────────────────────
async function enterRoom(apptId) {
  currentApptId = apptId;

  try {
    const res = await fetch(`${API_BASE}/appointments/${apptId}/join`);
    if (!res.ok) throw new Error("No se pudo obtener el token");
    const data = await res.json();

    const token =
      currentRole === "patient" ? data.patient_token : data.doctor_token;

    room = new LivekitClient.Room({ adaptiveStream: true, dynacast: true });

    // Eventos de participantes
    room.on(LivekitClient.RoomEvent.ParticipantConnected, (participant) => {
      updateParticipants();
      appendSystemMsg(`${participant.identity} se unió a la consulta`);
    });

    room.on(LivekitClient.RoomEvent.ParticipantDisconnected, (participant) => {
      updateParticipants();
      appendSystemMsg(`${participant.identity} salió de la consulta`);
    });

    // Video/audio remoto
    room.on(
      LivekitClient.RoomEvent.TrackSubscribed,
      (track, _pub, participant) => {
        if (track.kind === "video")
          addVideo(track, participant.identity, false);
      },
    );

    room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track) => {
      track.detach().forEach((el) => {
        el.closest(".video-wrapper")?.remove();
        updateParticipants();
      });
    });

    // ── CHAT: recibir mensajes vía Data Channel ──
    room.on(LivekitClient.RoomEvent.DataReceived, (payload, participant) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "chat") {
          appendMessage(msg.text, msg.sender, false);
          if (!chatOpen) {
            unreadCount++;
            updateUnreadBadge();
          }
        }
      } catch {
        /* ignorar payloads no-chat */
      }
    });

    room.on(LivekitClient.RoomEvent.Disconnected, () => {
      stopTimer();
      loadDashboard();
    });

    await room.connect(data.livekit_url, token);

    // Cargar historial de mensajes persistentes
    await loadChatHistory(apptId);

    // Mostrar sala
    showScreen("screen-room");

    // Mostrar sala
    showScreen("screen-room");
    document.getElementById("room-tag").textContent = data.room_name;
    document.getElementById("video-grid").innerHTML = "";
    document.getElementById("chat-messages").innerHTML = `
      <div class="chat-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>El chat está vacío.<br/>Sé el primero en escribir.</span>
      </div>`;

    // Resetear chat state
    chatOpen = false;
    unreadCount = 0;
    document.getElementById("chat-panel").classList.remove("open");
    document.getElementById("chat-toggle-btn").classList.remove("active");
    updateUnreadBadge();

    document.getElementById("user-info-bar").innerHTML = `
      <div class="user-chip">
        <div class="user-chip-dot ${currentRole}"></div>
        ${currentUser.name} · <span style="color:var(--muted)">${currentRole === "patient" ? "Paciente" : "Médico"}</span>
      </div>`;

    startTimer();
    updateParticipants();

    // Publicar tracks locales
    let localTracks = [];
    try {
      localTracks = await LivekitClient.createLocalTracks({
        audio: true,
        video: true,
      });
    } catch {
      try {
        localTracks = await LivekitClient.createLocalTracks({
          audio: true,
          video: false,
        });
        showToast("Sin cámara — conectado con audio");
      } catch {
        showToast("Conectado sin audio ni video");
      }
    }

    for (const track of localTracks) {
      await room.localParticipant.publishTrack(track);
      if (track.kind === "video")
        addVideo(track, `${currentUser.name} (tú)`, true);
    }
  } catch (err) {
    showToast("Error: " + err.message);
  }
}

// ──────────────────────────────────────────
// CHAT
// ──────────────────────────────────────────
function toggleChat() {
  chatOpen = !chatOpen;
  const panel = document.getElementById("chat-panel");
  const btn = document.getElementById("chat-toggle-btn");

  panel.classList.toggle("open", chatOpen);
  btn.classList.toggle("active", chatOpen);

  if (chatOpen) {
    unreadCount = 0;
    updateUnreadBadge();
    // scroll al final
    setTimeout(() => {
      const msgs = document.getElementById("chat-messages");
      msgs.scrollTop = msgs.scrollHeight;
      document.getElementById("chat-input").focus();
    }, 320);
  }
}

async function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || !room || !currentApptId || !currentUser) return;

  const messagePayload = {
    type: "chat",
    text: text,
    sender: currentUser.name,
    sender_id: currentUser.id,
    sender_role: currentRole,
  };

  try {
    // 1. Guardar el mensaje en la base de datos (persistencia)
    await fetch(`${API_BASE}/appointments/${currentApptId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        sender_id: currentUser.id,
        sender_role: currentRole,
      }),
    });

    // 2. Enviar por LiveKit (tiempo real)
    const encoded = new TextEncoder().encode(JSON.stringify(messagePayload));
    await room.localParticipant.publishData(encoded, { reliable: true });

    // 3. Mostrar en pantalla
    appendMessage(text, currentUser.name, true);

    input.value = "";
  } catch (err) {
    console.error("Error enviando mensaje:", err);
    showToast("Error al enviar el mensaje");
  }
}

// Cargar historial de mensajes desde el backend
async function loadChatHistory(apptId) {
  if (!apptId) return;

  try {
    const res = await fetch(`${API_BASE}/appointments/${apptId}/chat`);

    if (!res.ok) {
      console.warn("No se pudo cargar el historial de chat");
      return;
    }

    const messages = await res.json();
    const container = document.getElementById("chat-messages");

    // Limpiar el empty state
    const empty = container.querySelector(".chat-empty");
    if (empty) empty.remove();

    messages.forEach((msg) => {
      const isMine = parseInt(msg.sender_id) === parseInt(currentUser.id);
      appendMessage(msg.message, msg.sender_name || "Participante", isMine);
    });

    container.scrollTop = container.scrollHeight;
  } catch (e) {
    console.warn("Error cargando historial de chat:", e);
  }
}

function appendMessage(text, sender, isMine) {
  const msgs = document.getElementById("chat-messages");

  // Quitar el empty state si existe
  const empty = msgs.querySelector(".chat-empty");
  if (empty) empty.remove();

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const div = document.createElement("div");
  div.className = `chat-msg ${isMine ? "mine" : "theirs"}`;
  div.innerHTML = `
    <div class="chat-msg-meta">${isMine ? "Tú" : sender}</div>
    <div class="chat-msg-bubble">${escapeHtml(text)}</div>
    <div class="chat-msg-time">${timeStr}</div>`;

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function appendSystemMsg(text) {
  const msgs = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = "chat-system";
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function updateUnreadBadge() {
  const badge = document.getElementById("chat-unread");
  if (unreadCount > 0 && !chatOpen) {
    badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ──────────────────────────────────────────
// CONTROLES DE SALA
// ──────────────────────────────────────────
function addVideo(track, identity, muted) {
  const grid = document.getElementById("video-grid");
  const wrapper = document.createElement("div");
  wrapper.className = "video-wrapper";
  wrapper.id = "vid-" + identity.replace(/\W/g, "-");

  const videoEl = track.attach();
  videoEl.muted = muted;

  const label = document.createElement("div");
  label.className = "video-label";
  label.textContent = identity;

  wrapper.appendChild(videoEl);
  wrapper.appendChild(label);
  grid.appendChild(wrapper);
  updateParticipants();
}

function toggleMic() {
  if (!room) return;
  micEnabled = !micEnabled;
  room.localParticipant.setMicrophoneEnabled(micEnabled);
  const btn = document.getElementById("btn-mic");
  btn.classList.toggle("active", !micEnabled);
  btn.querySelector("svg").innerHTML = micEnabled
    ? `<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>`
    : `<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8"/>`;
  showToast(micEnabled ? "Micrófono activado" : "Micrófono silenciado");
}

function toggleCam() {
  if (!room) return;
  camEnabled = !camEnabled;
  room.localParticipant.setCameraEnabled(camEnabled);
  document.getElementById("btn-cam").classList.toggle("active", !camEnabled);
  showToast(camEnabled ? "Cámara activada" : "Cámara desactivada");
}

async function toggleRecording() {
  const btn = document.getElementById("btn-record");
  const rec = document.getElementById("rec-indicator");

  if (!isRecording) {
    try {
      const res = await fetch(
        `${API_BASE}/appointments/${currentApptId}/recording/start`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar");
      isRecording = true;
      btn.classList.add("recording");
      btn.childNodes[btn.childNodes.length - 1].textContent = " Detener";
      rec.style.display = "flex";
      showToast("Grabación iniciada");
    } catch (e) {
      showToast("Error: " + e.message);
    }
  } else {
    try {
      await fetch(`${API_BASE}/appointments/${currentApptId}/recording/stop`, {
        method: "POST",
      });
      isRecording = false;
      btn.classList.remove("recording");
      btn.childNodes[btn.childNodes.length - 1].textContent = " Grabar";
      rec.style.display = "none";
      showToast("Grabación guardada");
    } catch (e) {
      showToast("Error al detener: " + e.message);
    }
  }
}

async function leaveRoom() {
  if (isRecording) await toggleRecording();
  await room?.disconnect();
  document.getElementById("video-grid").innerHTML = "";
  stopTimer();
  chatOpen = false;
  unreadCount = 0;
  await loadDashboard();
}

// ──────────────────────────────────────────
// TIMER / PARTICIPANTS
// ──────────────────────────────────────────
function startTimer() {
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "00:00";
}

function updateParticipants() {
  if (!room) return;
  const count = room.remoteParticipants.size + 1;
  const el = document.getElementById("participant-count");
  el.childNodes[el.childNodes.length - 1].textContent =
    ` ${count} participante${count !== 1 ? "s" : ""}`;
}

// ──────────────────────────────────────────
// UI HELPERS
// ──────────────────────────────────────────
function setStatus(msg, type) {
  const el = document.getElementById("status-text");
  const dot = document.getElementById("status-dot");
  if (el) el.textContent = msg;
  if (dot) dot.className = "status-dot" + (type ? " " + type : "");
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add("visible");
}

function hideError(id) {
  document.getElementById(id)?.classList.remove("visible");
}

function setSubmitLoading(loading) {
  document.getElementById("submit-btn").disabled = loading;
  document.getElementById("submit-label").textContent = loading
    ? "Verificando..."
    : "Continuar";
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

// ──────────────────────────────────────────
// INIT
// ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  showScreen("screen-role");

  ["input-email", "input-document"].forEach((id) => {
    document.getElementById(id)?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  });

  document.getElementById("chat-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
});
