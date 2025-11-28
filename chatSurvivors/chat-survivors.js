// ===================== ChatSurvivors =====================
let unityInstance = null;
let currentVolume = 1.0;

// -----------------------------
// Cargar Unity
// -----------------------------
createUnityInstance(document.querySelector("#unityCanvas"), {
  dataUrl: "chat-survivors.data",
  frameworkUrl: "chat-survivors.framework.js",
  codeUrl: "chat-survivors.wasm",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "Interactive",
  productName: "Chat Survivors",
  productVersion: "1.0",
})
  .then((instance) => {
    unityInstance = instance;
    console.log("[chatSurvivors] Unity cargado correctamente.");
  })
  .catch((err) => {
    console.error("[chatSurvivors] Error cargando Unity:", err);
  });

function sendEvent(jsonObj) {
  if (!unityInstance) {
    console.warn("Unity no está listo.");
    return;
  }

  const payload = JSON.stringify(jsonObj);

  unityInstance.SendMessage("_GameManagers", "OnTikTokEvent", payload);
}

// -----------------------------
// Disparar interacción real
// -----------------------------
function triggerInteraction(interactionKey, times = 1, forcedUser) {
  console.log("[ChatSurvivors] TriggerInteraction:", interactionKey, "x", times);

  if (!unityInstance) {
    console.warn("Unity no está listo.");
    return;
  }

  const names = ["Laura", "Max", "Nina", "Kai", "Liam", "Emma"];
  const user = forcedUser || names[Math.floor(Math.random() * names.length)];

  for (let i = 0; i < times; i++) {
    sendEvent({
      interaction: interactionKey,
      user,
      count: 1,
      eventType: "simulation",
      timestamp: Date.now(),
    });
  }
}

// -----------------------------
// Ajustes
// -----------------------------
function applySettings(settings = {}) {
  if (typeof settings.volume === "number") {
    currentVolume = Math.min(1, Math.max(0, settings.volume));

    sendEvent({
      type: "set-volume",
      volume: currentVolume,
      eventType: "settings",
      timestamp: Date.now(),
    });
  }
}

// -----------------------------
// Interacciones
// -----------------------------
if (window.chatSurvivors && typeof window.chatSurvivors.onMessage === "function") {
  window.chatSurvivors.onMessage((msg) => {
    if (!msg || typeof msg !== "object") return;

    switch (msg.type) {
      case "trigger-interaction": {
        const key = msg.key;
        const times = Number(msg.times) || 1;
        const user = msg.user || null;
        if (key) {
          triggerInteraction(key, times, user);
        }
        break;
      }

      case "settings": {
        applySettings(msg.settings || {});
        break;
      }

      default:
        console.log("[ChatSurvivors] Mensaje desconocido desde main:", msg);
    }
  });
}

window.triggerInteraction = triggerInteraction;
window.sendEvent = sendEvent;
window.applySettings = applySettings;
