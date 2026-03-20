const API_BASE = "http://localhost:8000/api";

let room = null;
let currentRole = null;
let currentUser = null;
let isRecording = false;
let micEnabled = true;
let camEnabled = true;
let timerInterval = null;
let seconds = 0;
let appointmentId = null;

// ── NAVEGACIÓN ENTRE PANTALLAS ──
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active", "exit");
    s.style.display = "none";
  });
  const target = document.getElementById(id);
  target.style.display = "flex";
  requestAnimationFrame(() => target.classList.add("active"));
}

// ── PASO 1: elegir rol ──
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

  // limpiar campos y errores al cambiar de rol
  document.getElementById("input-email").value = "";
  document.getElementById("input-document").value = "";
  document.getElementById("input-appointment").value = "";
  hideError();

  showScreen("screen-form");
  setTimeout(() => document.getElementById("input-email").focus(), 300);
}

function goBack() {
  showScreen("screen-role");
}

// ── PASO 2: login y validación ──
async function handleLogin() {
  const email = document.getElementById("input-email").value.trim();
  const docNumber = document.getElementById("input-document").value.trim(); // <- cambiar 'document' por 'docNumber'
  const apptId = document.getElementById("input-appointment").value.trim();

  if (!email || !email.includes("@")) {
    return showError("Ingresa un correo válido");
  }
  if (!docNumber) {
    // <- aquí también
    const label = currentRole === "patient" ? "cédula" : "número de licencia";
    return showError(`Ingresa tu ${label}`);
  }
  if (!apptId) {
    return showError("Ingresa el ID de la cita");
  }

  setStatus("Verificando identidad...", "active");
  setSubmitLoading(true);
  hideError();

  try {
    const user = await verifyIdentity(email, docNumber, apptId); // <- y aquí
    currentUser = user;
    appointmentId = apptId;

    setStatus("Conectando a la sala...", "active");
    await connectToRoom(apptId);
  } catch (err) {
    setStatus("Error al verificar", "error");
    showError(err.message);
  } finally {
    setSubmitLoading(false);
  }
}

async function verifyIdentity(email, docNumber, apptId) {
  // Verificar cita y que el usuario pertenezca a ella
  const res = await fetch(`${API_BASE}/appointments/${apptId}`);
  if (!res.ok) throw new Error("Cita no encontrada");

  const appt = await res.json();

  if (currentRole === "patient") {
    const p = appt.patient;
    if (!p) throw new Error("Esta cita no tiene paciente asignado");
    if (p.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("El correo no coincide con el paciente de esta cita");
    }
    if (p.document_number !== docNumber) {
      throw new Error("La cédula no coincide");
    }
    return { name: p.name, id: p.id };
  } else {
    const d = appt.doctor;
    if (!d) throw new Error("Esta cita no tiene médico asignado");
    if (d.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("El correo no coincide con el médico de esta cita");
    }
    if (d.license_number !== docNumber) {
      throw new Error("El número de licencia no coincide");
    }
    return { name: d.name, id: d.id };
  }
}

// ── CONEXIÓN A LIVEKIT ──
async function connectToRoom(apptId) {
  const res = await fetch(`${API_BASE}/appointments/${apptId}/join`);
  if (!res.ok) throw new Error(`Error al obtener token (${res.status})`);
  const data = await res.json();

  const token =
    currentRole === "patient" ? data.patient_token : data.doctor_token;

  room = new LivekitClient.Room({ adaptiveStream: true, dynacast: true });

  room.on(LivekitClient.RoomEvent.ParticipantConnected, updateParticipants);
  room.on(LivekitClient.RoomEvent.ParticipantDisconnected, updateParticipants);

  room.on(
    LivekitClient.RoomEvent.TrackSubscribed,
    (track, _pub, participant) => {
      if (track.kind === "video") addVideo(track, participant.identity, false);
    },
  );

  room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track) => {
    track.detach().forEach((el) => {
      el.closest(".video-wrapper")?.remove();
      updateParticipants();
    });
  });

  room.on(LivekitClient.RoomEvent.Disconnected, () => {
    stopTimer();
    showScreen("screen-role");
    setStatus("Desconectado", "");
  });

  await room.connect(data.livekit_url, token);

  // Mostrar sala
  showScreen("screen-room");
  document.getElementById("room-tag").textContent = data.room_name;
  document.getElementById("video-grid").innerHTML = "";

  // Chip de usuario en topbar
  document.getElementById("user-info-bar").innerHTML = `
    <div class="user-chip">
      <div class="user-chip-dot ${currentRole}"></div>
      ${currentUser.name} · <span style="color:var(--muted)">${currentRole === "patient" ? "Paciente" : "Médico"}</span>
    </div>
  `;

  startTimer();
  updateParticipants();

  // Publicar tracks
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
    if (track.kind === "video") {
      addVideo(track, `${currentUser.name} (tú)`, true);
    }
  }
}

// ── VIDEO ──
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

// ── MIC ──
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

// ── CAMERA ──
function toggleCam() {
  if (!room) return;
  camEnabled = !camEnabled;
  room.localParticipant.setCameraEnabled(camEnabled);
  document.getElementById("btn-cam").classList.toggle("active", !camEnabled);
  showToast(camEnabled ? "Cámara activada" : "Cámara desactivada");
}

// ── RECORDING ──
async function toggleRecording() {
  const btn = document.getElementById("btn-record");
  const rec = document.getElementById("rec-indicator");

  if (!isRecording) {
    try {
      const res = await fetch(
        `${API_BASE}/appointments/${appointmentId}/recording/start`,
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
      await fetch(`${API_BASE}/appointments/${appointmentId}/recording/stop`, {
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

// ── LEAVE ──
async function leave() {
  if (isRecording) await toggleRecording();
  await room?.disconnect();
  document.getElementById("video-grid").innerHTML = "";
  stopTimer();
  currentUser = null;
  currentRole = null;
  showScreen("screen-role");
}

// ── TIMER ──
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

// ── PARTICIPANTS ──
function updateParticipants() {
  if (!room) return;
  const count = room.remoteParticipants.size + 1;
  const el = document.getElementById("participant-count");
  el.childNodes[el.childNodes.length - 1].textContent =
    ` ${count} participante${count !== 1 ? "s" : ""}`;
}

// ── UI HELPERS ──
function setStatus(msg, type) {
  const el = document.getElementById("status-text");
  const dot = document.getElementById("status-dot");
  if (el) el.textContent = msg;
  if (dot) dot.className = "status-dot" + (type ? " " + type : "");
}

function showError(msg) {
  const el = document.getElementById("form-error");
  el.textContent = msg;
  el.classList.add("visible");
}

function hideError() {
  const el = document.getElementById("form-error");
  el.classList.remove("visible");
}

function setSubmitLoading(loading) {
  const btn = document.getElementById("submit-btn");
  const label = document.getElementById("submit-label");
  btn.disabled = loading;
  label.textContent = loading ? "Verificando..." : "Ingresar a la consulta";
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  showScreen("screen-role");

  // Enter en cualquier campo dispara el login
  ["input-email", "input-document", "input-appointment"].forEach((id) => {
    document.getElementById(id)?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  });
});
