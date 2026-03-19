const API_BASE = "http://localhost:8000/api";

let room = null;
let myRole = null;
let isRecording = false;
let micEnabled = true;
let camEnabled = true;
let timerInterval = null;
let seconds = 0;
let participants = 0;

// ── CONNECT ──
async function connect(role) {
  const apptId = document.getElementById("appointment-id").value;
  if (!apptId) return showToast("Ingresa un ID de cita");

  myRole = role;
  setStatus("Obteniendo token...", "active");

  try {
    const res = await fetch(`${API_BASE}/appointments/${apptId}/join`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();

    const token = role === "patient" ? data.patient_token : data.doctor_token;

    room = new LivekitClient.Room({
      adaptiveStream: true,
      dynacast: true,
    });

    room.on(LivekitClient.RoomEvent.ParticipantConnected, updateParticipants);
    room.on(
      LivekitClient.RoomEvent.ParticipantDisconnected,
      updateParticipants,
    );

    room.on(
      LivekitClient.RoomEvent.TrackSubscribed,
      (track, _pub, participant) => {
        if (track.kind === "video") {
          addVideo(track, participant.identity, false);
        }
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
      showLobby();
      setStatus("Desconectado", "");
    });

    await room.connect(data.livekit_url, token);

    // Mostrar sala
    document.getElementById("lobby").style.display = "none";
    document.getElementById("room").style.display = "flex";
    document.getElementById("room-tag").textContent = data.room_name;
    document.getElementById("video-grid").innerHTML = "";

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
      if (track.kind === "video") {
        addVideo(track, `tú (${role})`, true);
      }
    }
  } catch (e) {
    setStatus("Error al conectar", "error");
    showToast("No se pudo conectar: " + e.message);
  }
}

// ── VIDEO ──
function addVideo(track, identity, muted) {
  const grid = document.getElementById("video-grid");

  const wrapper = document.createElement("div");
  wrapper.className = "video-wrapper";
  wrapper.id = "vid-" + identity.replace(/\s/g, "-");

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
  const btn = document.getElementById("btn-cam");
  btn.classList.toggle("active", !camEnabled);
  showToast(camEnabled ? "Cámara activada" : "Cámara desactivada");
}

// ── RECORDING ──
async function toggleRecording() {
  const apptId = document.getElementById("appointment-id").value;
  const btn = document.getElementById("btn-record");
  const rec = document.getElementById("rec-indicator");

  if (!isRecording) {
    try {
      const res = await fetch(
        `${API_BASE}/appointments/${apptId}/recording/start`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar");

      isRecording = true;
      btn.classList.add("recording");
      btn.querySelector("svg").style.color = "var(--danger)";
      btn.childNodes[btn.childNodes.length - 1].textContent = " Detener";
      rec.style.display = "flex";
      showToast("Grabación iniciada");
    } catch (e) {
      showToast("Error: " + e.message);
    }
  } else {
    try {
      await fetch(`${API_BASE}/appointments/${apptId}/recording/stop`, {
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
  showLobby();
}

function showLobby() {
  document.getElementById("room").style.display = "none";
  document.getElementById("lobby").style.display = "flex";
  document.getElementById("rec-indicator").style.display = "none";
  isRecording = false;
  seconds = 0;
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

// ── STATUS ──
function setStatus(msg, type) {
  document.getElementById("status-text").textContent = msg;
  const dot = document.getElementById("status-dot");
  dot.className = "status-dot" + (type ? " " + type : "");
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}
