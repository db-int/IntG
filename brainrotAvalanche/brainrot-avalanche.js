// ===================== Brainrot Avalanche =====================
let unityInstance = null;
let currentVolume = 1.0;

const PLAYERPREFS_KEY_BRAINROT = "/idbfs/9e471625592eb93af57f39219775a352/PlayerPrefs";
const RELOAD_FLAG_KEY = "InteractiveBrainrotAvalanchePendingReloadV2";

// -----------------------------
// Parchear PlayerPrefs
// -----------------------------
async function patchBrainrotAvalanchePlayerPrefs() {
  const DURATION_DEFAULTS = {
    InvertedControlsDuration: 1,
  };

  const AUDIO_KEYS = [
    "GameAudioVolume",
    "GameMusicVolume",
    "GameSoundVolume",
    "GameUIVolume",
  ];

  const INIT_MARKER_KEY = "InteractiveBrainrotAvalancheInitV1";

  function patchOneRecord(record) {
    const contents = record.contents;
    if (!(contents instanceof Uint8Array)) return { changed: false, value: record };

    const bytes = contents;
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const decoder = new TextDecoder("utf-8");
    const encoder = new TextEncoder();

    const existing = new Map();

    let pos = 16;
    while (pos < bytes.length) {
      const nameLen = bytes[pos];
      pos += 1;
      if (!nameLen || pos + nameLen > bytes.length) break;

      const nameBytes = bytes.slice(pos, pos + nameLen);
      pos += nameLen;
      const name = decoder.decode(nameBytes);

      const typeByte = bytes[pos];
      pos += 1;

      // 0xFD = float en PlayerPrefs
      if (typeByte === 0xFD) {
        if (pos + 4 > bytes.length) break;
        const value = dv.getFloat32(pos, true); // little-endian
        existing.set(name, { type: "float", offset: pos, value });
        pos += 4;
      } else {
        // Para no romper nada, si vemos un tipo desconocido salimos del bucle
        break;
      }
    }

    let changed = false;

    // 1) Duraciones: crear solo si NO existen
    const entriesToAppend = [];
    for (const [key, defVal] of Object.entries(DURATION_DEFAULTS)) {
      if (!existing.has(key)) {
        const nameBytes = encoder.encode(key);
        const entryLen = 1 + nameBytes.length + 1 + 4; // len + name + type + float
        entriesToAppend.push({ key, defVal, nameBytes, entryLen });
        console.log("[BrainrotAvalanche][IDBFS] Programado añadir duración", key, "=", defVal);
      }
    }

    // 2) Volúmenes: solo primera vez (si no hay marker y el valor actual es 1.0)
    const initMarker = existing.get(INIT_MARKER_KEY);
    const shouldInitAudio = !initMarker;

    if (shouldInitAudio) {
      for (const key of AUDIO_KEYS) {
        const info = existing.get(key);
        if (info && info.type === "float" && Math.abs(info.value - 1) < 1e-6) {
          dv.setFloat32(info.offset, 0.5, true);
          changed = true;
          console.log("[BrainrotAvalanche][IDBFS] Audio default", key, ": 1.0 -> 0.5");
        }
      }
    }

    // 3) Si es el primer init o hemos añadido duraciones, añadimos marker
    if (!initMarker && (shouldInitAudio || entriesToAppend.length > 0)) {
      const nameBytes = encoder.encode(INIT_MARKER_KEY);
      const entryLen = 1 + nameBytes.length + 1 + 4;
      entriesToAppend.push({ key: INIT_MARKER_KEY, defVal: 1, nameBytes, entryLen });
      console.log("[BrainrotAvalanche][IDBFS] Añadiendo marker", INIT_MARKER_KEY);
    }

    if (entriesToAppend.length > 0) {
      const extra = entriesToAppend.reduce((sum, e) => sum + e.entryLen, 0);
      const newBytes = new Uint8Array(bytes.length + extra);

      // Copiamos todo lo previo
      newBytes.set(bytes, 0);

      let p = bytes.length;
      const dv2 = new DataView(newBytes.buffer);

      for (const entry of entriesToAppend) {
        const { nameBytes, defVal, key } = entry;
        newBytes[p++] = nameBytes.length;
        newBytes.set(nameBytes, p);
        p += nameBytes.length;
        newBytes[p++] = 0xFD; // float
        dv2.setFloat32(p, defVal, true);
        p += 4;

        console.log("[BrainrotAvalanche][IDBFS] Escrito nuevo PlayerPref", key, "=", defVal);
      }

      record.contents = newBytes;
      changed = true;
    }

    return { changed, value: record };
  }

  if (!window.indexedDB) {
    console.warn("[BrainrotAvalanche][IDBFS] indexedDB no disponible.");
    return "no_idb";
  }

  return new Promise((resolve) => {
    const openReq = indexedDB.open("/idbfs");

    openReq.onerror = () => {
      console.warn("[BrainrotAvalanche][IDBFS] No se pudo abrir /idbfs:", openReq.error);
      resolve("no_idb");
    };

    openReq.onsuccess = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("FILE_DATA")) {
        console.warn("[BrainrotAvalanche][IDBFS] DB sin FILE_DATA todavía.");
        db.close();
        resolve("no_idb");
        return;
      }

      let patched = false;
      let sawPlayerPrefs = false; // de ESTE juego

      const tx = db.transaction(["FILE_DATA"], "readwrite");
      const store = tx.objectStore("FILE_DATA");
      const cursorReq = store.openCursor();

      cursorReq.onerror = () => {
        console.warn("[BrainrotAvalanche][IDBFS] Error recorriendo FILE_DATA:", cursorReq.error);
        resolve(patched ? "patched" : (sawPlayerPrefs ? "no_changes" : "no_playerprefs"));
      };

      cursorReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (!cursor) {
          console.log("[BrainrotAvalanche][IDBFS] Fin de FILE_DATA. ¿Cambios?", patched);
          resolve(patched ? "patched" : (sawPlayerPrefs ? "no_changes" : "no_playerprefs"));
          return;
        }

        const key = cursor.key;
        const value = cursor.value;

        if (key === PLAYERPREFS_KEY_BRAINROT) {
          sawPlayerPrefs = true;
          console.log("[BrainrotAvalanche][IDBFS] Revisando PlayerPrefs:", key);
          if (value && value.contents instanceof Uint8Array) {
            const { changed, value: newValue } = patchOneRecord(value);
            if (changed) {
              patched = true;
              cursor.update(newValue);
            }
          }
        }

        cursor.continue();
      };

      tx.oncomplete = () => {
        db.close();
      };
    };
  });
}

function waitForBrainrotPlayerPrefsInIdbfs(maxMs = 20000, intervalMs = 1000) {
  const start = Date.now();

  return new Promise((resolve) => {
    const tick = () => {
      if (!window.indexedDB) {
        resolve(false);
        return;
      }

      if (Date.now() - start > maxMs) {
        console.warn("[BrainrotAvalanche][IDBFS] Timeout esperando PlayerPrefs de Brainrot.");
        resolve(false);
        return;
      }

      const openReq = indexedDB.open("/idbfs");

      openReq.onerror = () => {
        setTimeout(tick, intervalMs);
      };

      openReq.onsuccess = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains("FILE_DATA")) {
          db.close();
          setTimeout(tick, intervalMs);
          return;
        }

        const tx = db.transaction(["FILE_DATA"], "readonly");
        const store = tx.objectStore("FILE_DATA");
        const cursorReq = store.openCursor();

        let found = false;

        cursorReq.onerror = () => {
          db.close();
          setTimeout(tick, intervalMs);
        };

        cursorReq.onsuccess = (e) => {
          const cursor = e.target.result;
          if (!cursor) {
            db.close();
            if (found) {
              console.log("[BrainrotAvalanche][IDBFS] Detectado PlayerPrefs de Brainrot.");
              resolve(true);
            } else {
              setTimeout(tick, intervalMs);
            }
            return;
          }

          const key = cursor.key;

          if (key === PLAYERPREFS_KEY_BRAINROT) {
            found = true;
          }
          cursor.continue();
        };
      };
    };

    tick();
  });
}

(async () => {
  let patchResult = "error";

  try {
    patchResult = await patchBrainrotAvalanchePlayerPrefs();
  } catch (e) {
    console.warn("[BrainrotAvalanche] Error parchando PlayerPrefs (se ignora):", e);
    patchResult = "error";
  }

  try {
    unityInstance = await createUnityInstance(document.querySelector("#unityCanvas"), {
      dataUrl: "brainrot-avalanche.data",
      frameworkUrl: "brainrot-avalanche.framework.js",
      codeUrl: "brainrot-avalanche.wasm",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "Interactive",
      productName: "Brainrot Avalanche",
      productVersion: "1.0",
    });

    console.log("[BrainrotAvalanche] Unity cargado correctamente.");

    // --- Lógica de recarga controlada ---
    if (patchResult === "no_idb" || patchResult === "no_playerprefs") {
      const yaRecargado = localStorage.getItem(RELOAD_FLAG_KEY) === "1";

      if (!yaRecargado) {
        console.log("[BrainrotAvalanche] Aún no hay PlayerPrefs. Esperando a que el juego cree PlayerPrefs para recargar una vez...");

        waitForBrainrotPlayerPrefsInIdbfs().then((ok) => {
          if (!ok) {
            console.warn("[BrainrotAvalanche] No se detectó PlayerPrefs de Brainrot a tiempo. No se recarga para evitar bucles raros.");
            return;
          }

          console.log("[BrainrotAvalanche] PlayerPrefs de Brainrot detectado. Marcando recarga pendiente y recargando la página.");
          localStorage.setItem(RELOAD_FLAG_KEY, "1");
          location.reload();
        });
      } else {
        console.warn("[BrainrotAvalanche] Ya se recargó una vez y aún así no se pudo parchear. No se vuelve a recargar.");
      }
    } else {
      // Si ya pudimos parchear (o al menos acceder decentemente), limpiamos el flag.
      localStorage.removeItem(RELOAD_FLAG_KEY);
    }
  } catch (err) {
    console.error("[BrainrotAvalanche] Error cargando Unity:", err);
  }
})();

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
  console.log("[BrainrotAvalanche] TriggerInteraction:", interactionKey, "x", times);

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
if (window.brainrotAvalanche && typeof window.brainrotAvalanche.onMessage === "function") {
  window.brainrotAvalanche.onMessage((msg) => {
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
        console.log("[BrainrotAvalanche] Mensaje desconocido desde main:", msg);
    }
  });
}

window.triggerInteraction = triggerInteraction;
window.sendEvent = sendEvent;
window.applySettings = applySettings;
