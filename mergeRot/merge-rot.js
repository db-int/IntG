// ===================== Merge Rot =====================
let unityInstance = null;
let currentVolume = 1.0;

window.lastRewardSource = null;

const HAMMER_BOUNDS = {
  xMin: 0.2239,
  xMax: 0.3331,
  yMin: 0.2100,
  yMax: 0.3480,
};

const SHAKE_BOUNDS = {
  xMin: 0.6756,
  xMax: 0.7714,
  yMin: 0.1953,
  yMax: 0.3333,
};

let rewardOverlaysInitialized = false;

// -----------------------------
// Cargar Unity
// -----------------------------
createUnityInstance(document.querySelector('#unityCanvas'), {
  dataUrl: 'merge-rot.data',
  frameworkUrl: 'merge-rot.framework.js',
  codeUrl: 'merge-rot.wasm',
  streamingAssetsUrl: 'StreamingAssets',
  companyName: 'Interactive',
  productName: 'Merge Rot',
  productVersion: '1.0',
})
  .then((instance) => {
    unityInstance = instance;
    window.unityGame = instance;
  })
  .catch((err) => {
    console.error('[MergeRot] Error cargando Unity:', err);
  });

function sendEvent(jsonObj) {
  if (!unityInstance) {
    console.warn('[MergeRot] Unity no está listo.');
    return;
  }

  const payload = JSON.stringify(jsonObj);
  unityInstance.SendMessage('_GameManagers', 'OnTikTokEvent', payload);
}

// -----------------------------
// Disparar interacción real
// -----------------------------
function triggerInteraction(interactionKey, times = 1, forcedUser) {

  if (!unityInstance) {
    console.warn('[MergeRot] Unity no está listo.');
    return;
  }

  const names = ['Laura', 'Max', 'Nina', 'Kai', 'Liam', 'Emma'];
  const user = forcedUser || names[Math.floor(Math.random() * names.length)];

  for (let i = 0; i < times; i++) {
    sendEvent({
      interaction: interactionKey,
      user,
      count: 1,
      eventType: 'simulation',
      timestamp: Date.now(),
    });
  }
}

// -----------------------------
// Ajustes
// -----------------------------
function applySettings(settings = {}) {
  if (typeof settings.volume === 'number') {
    currentVolume = Math.min(1, Math.max(0, settings.volume));

    sendEvent({
      type: 'set-volume',
      volume: currentVolume,
      eventType: 'settings',
      timestamp: Date.now(),
    });
  }
}

// -----------------------------
// Utilidades de clicks simulados
// -----------------------------
function enableClickDebugger() {
  const canvas = document.getElementById('unityCanvas');
  if (!canvas) {
    console.warn('[MergeRot] No se encontró #unityCanvas para debug de clicks');
    return;
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    console.log(
      `[ClickDebugger] Click en canvas: nx=${nx.toFixed(4)}, ny=${ny.toFixed(
        4
      )}`
    );
  });
}

window.enableClickDebugger = enableClickDebugger;

function simulatePressAt(nx, ny, delayMs = 0, holdMs = 0) {
  const canvas = document.getElementById('unityCanvas');
  if (!canvas) {
    console.warn('[MergeRot] No se encontró #unityCanvas');
    return;
  }

  const doPress = () => {
    const rect = canvas.getBoundingClientRect();

    const clientX = rect.left + rect.width * nx;
    const clientY = rect.top + rect.height * ny;

    const eventBase = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX,
      clientY,
      button: 0,
      buttons: 1,
      which: 1,
    };

    console.log('[MergeRot] simulatePressAt ->', { nx, ny, clientX, clientY, holdMs });

    // 1) MOUSEMOVE para actualizar Input.mousePosition de Unity
    const mouseMove = new MouseEvent('mousemove', {
      ...eventBase,
      buttons: 0,
    });

    canvas.dispatchEvent(mouseMove);
    window.dispatchEvent(mouseMove);
    document.dispatchEvent(mouseMove);

    // 2) MOUSEDOWN
    const mouseDown = new MouseEvent('mousedown', {
      ...eventBase,
      buttons: 1,
    });

    canvas.dispatchEvent(mouseDown);
    window.dispatchEvent(mouseDown);
    document.dispatchEvent(mouseDown);

    // 3) Esperar holdMs y hacer mouseup + click
    setTimeout(() => {
      const mouseUp = new MouseEvent('mouseup', {
        ...eventBase,
        buttons: 0,
      });

      canvas.dispatchEvent(mouseUp);
      window.dispatchEvent(mouseUp);
      document.dispatchEvent(mouseUp);

      const clickEv = new MouseEvent('click', {
        ...eventBase,
        buttons: 0,
        detail: 1,
      });

      canvas.dispatchEvent(clickEv);
      window.dispatchEvent(clickEv);
      document.dispatchEvent(clickEv);
    }, holdMs);
  };

  if (delayMs > 0) {
    setTimeout(doPress, delayMs);
  } else {
    doPress();
  }
}

window.simulatePressAt = simulatePressAt;

// ==============================
// Overlay de recompensas Poki
// ==============================

function isInBounds(nx, ny, bounds) {
  return (
    nx >= bounds.xMin &&
    nx <= bounds.xMax &&
    ny >= bounds.yMin &&
    ny <= bounds.yMax
  );
}

function createRewardOverlay(id, nx, ny) {
  const container = document.getElementById('unityContainer');
  if (!container) {
    console.warn('[MergeRot] No se encontró #unityContainer para overlay');
    return null;
  }

  const currentPosition = window.getComputedStyle(container).position;
  if (currentPosition === 'static' || !currentPosition) {
    container.style.position = 'relative';
  }

  let overlay = document.getElementById(id);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'reward-overlay';

    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    overlay.style.color = '#ffffff';
    overlay.style.fontFamily =
      'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    overlay.style.fontWeight = '900';
    overlay.style.fontSize = '48px';
    overlay.style.lineHeight = '1';
    overlay.style.letterSpacing = '1px';

    overlay.style.background = 'transparent';
    overlay.style.padding = '0';

    // Contorno tipo botones del juego
    overlay.style.textShadow = [
      '-2px  0px 0 #05b6f3',
      ' 2px  0px 0 #05b6f3',
      ' 0px -2px 0 #05b6f3',
      ' 0px  2px 0 #05b6f3',
      '-3px  2px 4px rgba(0, 0, 0, 0.45)',
    ].join(',');

    overlay.style.transform = 'translate(-50%, 0)';
    overlay.style.zIndex = '10';

    overlay.style.left = (nx * 100).toFixed(2) + '%';
    overlay.style.top = (ny * 100).toFixed(2) + '%';

    overlay.textContent = '';
    overlay.style.display = 'none'; // 👈 ocultos por defecto

    container.appendChild(overlay);
  }

  return overlay;
}

function showRewardOverlays() {
  const overlays = document.querySelectorAll('.reward-overlay');
  overlays.forEach((el) => {
    el.style.display = 'block';
  });
}
window.showRewardOverlays = showRewardOverlays;

function hideRewardOverlays() {
  const overlays = document.querySelectorAll('.reward-overlay');
  overlays.forEach((el) => {
    el.style.display = 'none';
  });
}
window.hideRewardOverlays = hideRewardOverlays;

function initRewardOverlays() {
  if (rewardOverlaysInitialized) return;
  rewardOverlaysInitialized = true;

  // Centro X de cada botón de recompensa
  const hammerCenterX = (HAMMER_BOUNDS.xMin + HAMMER_BOUNDS.xMax) / 2;
  const shakeCenterX = (SHAKE_BOUNDS.xMin + SHAKE_BOUNDS.xMax) / 2;

  // Altura de cada botón
  const hammerHeight = HAMMER_BOUNDS.yMax - HAMMER_BOUNDS.yMin;
  const shakeHeight = SHAKE_BOUNDS.yMax - SHAKE_BOUNDS.yMin;

  // Un poquito por debajo del borde inferior del botón
  const hammerTextY = HAMMER_BOUNDS.yMax + hammerHeight * 0.1;
  const shakeTextY = SHAKE_BOUNDS.yMax + shakeHeight * 0.1;

  const shakeOverlay = createRewardOverlay(
    'reward-overlay-shake',
    shakeCenterX,
    shakeTextY
  );

  const hammerOverlay = createRewardOverlay(
    'reward-overlay-hammer',
    hammerCenterX,
    hammerTextY
  );

  window.updateRewardOverlay = function (state) {
    const s = state || window.pokiRewardState;
    if (!s) return;

    const hammerRemaining = Number(s.hammer.limit || 0) - Number(s.hammer.used || 0);
    const shakeRemaining  = Number(s.shake.limit  || 0) - Number(s.shake.used  || 0);

    if (hammerOverlay) hammerOverlay.textContent = String(hammerRemaining);
    if (shakeOverlay) shakeOverlay.textContent = String(shakeRemaining);
  };

  if (window.pokiRewardState) {
    window.updateRewardOverlay(window.pokiRewardState);
  }

  const canvas = document.getElementById('unityCanvas');
  if (canvas) {
    canvas.addEventListener('click', (e) => {
      if (!e.isTrusted) return;

      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      if (isInBounds(nx, ny, HAMMER_BOUNDS)) {
        window.lastRewardSource = 'hammer';
        return;
      }

      if (isInBounds(nx, ny, SHAKE_BOUNDS)) {
        window.lastRewardSource = 'shake';
        return;
      }
    });
  }

  notifyMergeRotReady();
}

window.addEventListener('load', initRewardOverlays);


// ==============================
// Helpers para Poki rewards & simulaciones
// ==============================

function getRewardBucket(name) {
  const state = window.pokiRewardState;
  if (!state) {
    console.warn('[MergeRot] pokiRewardState no definido todavía');
    return null;
  }
  const bucket = state[name];
  if (!bucket) {
    console.warn('[MergeRot] pokiRewardState no tiene bucket para', name);
    return null;
  }
  return bucket;
}

function getRemainingUses(bucket) {
  if (!bucket) return 0;
  const used  = Number(bucket.used  || 0);
  const limit = Number(bucket.limit || 0);
  return limit - used;
}

function setRemainingUses(name, newRemaining) {
  const bucket = getRewardBucket(name);
  if (!bucket) return;

  const used = Number(bucket.used || 0);
  const rem  = Number(newRemaining) || 0;

  bucket.limit = used + rem;

  if (typeof window.updateRewardOverlay === 'function') {
    window.updateRewardOverlay(window.pokiRewardState);
  }
}

function addRemainingUses(name, delta) {
  const bucket = getRewardBucket(name);
  if (!bucket) return;

  const currentRem = getRemainingUses(bucket);
  const nextRem    = currentRem + Number(delta || 0);

  bucket.limit = Number(bucket.used || 0) + nextRem;

  if (typeof window.updateRewardOverlay === 'function') {
    window.updateRewardOverlay(window.pokiRewardState);
  }
}

// ─────────────────────────────

function addShake(amount = 1) {
  addRemainingUses('shake', amount);
}

function removeShake(amount = 1) {
  addRemainingUses('shake', -amount);
}

function setShake(amount = 0) {
  setRemainingUses('shake', amount);
}

function addHammer(amount = 1) {
  addRemainingUses('hammer', amount);
}

function removeHammer(amount = 1) {
  addRemainingUses('hammer', -amount);
}

function setHammer(amount = 0) {
  setRemainingUses('hammer', amount);
}

// ==============================
// Simulaciones de clicks
// ==============================
function simularRot(cantidad = 1) {
  const times = Math.max(1, Number(cantidad) || 1);

  const nx = 0.5;
  const ny = 0.5;

  const intervaloMs    = 700;
  const holdMs         = 10;

  for (let i = 0; i < times; i++) {
    const delayParaEsta = i * intervaloMs;
    simulatePressAt(nx, ny, delayParaEsta, holdMs);
  }
}

function simularShake(cantidad = 1) {
  const times = Math.max(1, Number(cantidad) || 1);

  const nx = 0.7413;
  const ny = 0.2555;

  const intervaloMs = 700;
  const holdMs      = 10;

  for (let i = 0; i < times; i++) {
    const delayParaEsta = i * intervaloMs;
    simulatePressAt(nx, ny, delayParaEsta, holdMs);
  }
}

function simularMaso(cantidad = 1) {
  const times = Math.max(1, Number(cantidad) || 1);

  const nx = 0.2777;
  const ny = 0.2731;

  const intervaloMs = 700;
  const holdMs      = 10;

  for (let i = 0; i < times; i++) {
    const delayParaEsta = i * intervaloMs;
    simulatePressAt(nx, ny, delayParaEsta, holdMs);
  }
}

function notifyMergeRotReady() {
  if (window.mergeRot && typeof window.mergeRot.sendToMain === 'function') {
    window.mergeRot.sendToMain({ type: 'ready' });
  }
}

window.addShake     = addShake;
window.removeShake  = removeShake;
window.setShake     = setShake;
window.addHammer    = addHammer;
window.removeHammer = removeHammer;
window.setHammer    = setHammer;

window.simularRot   = simularRot;
window.simularShake = simularShake;
window.simularMaso  = simularMaso;

// -----------------------------
// Interacciones desde main
// -----------------------------
if (window.mergeRot && typeof window.mergeRot.onMessage === 'function') {
  window.mergeRot.onMessage((msg) => {
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'trigger-interaction': {
        const key   = msg.key;
        const times = Number(msg.times) || 1;
        const user  = msg.user || null;

        if (!key) return;

        switch (key) {
          // ───── Shake (botón derecho de anuncios)
          case 'addShake':
            addShake(Number(msg.amount ?? 1) || 1);
            break;

          case 'removeShake':
            removeShake(Number(msg.amount ?? 1) || 1);
            break;

          case 'setShake':
            setShake(Number(msg.amount ?? msg.value ?? times) || 0);
            break;

          // ───── Mazo (hammer)
          case 'addMaso':
            addHammer(Number(msg.amount ?? 1) || 1);
            break;

          case 'removeMaso':
            removeHammer(Number(msg.amount ?? 1) || 1);
            break;

          case 'setMaso':
            setHammer(Number(msg.amount ?? msg.value ?? times) || 0);
            break;

          // ───── Simulaciones de clicks
          case 'simularRot':
            simularRot(times);
            break;

          case 'simularShake':
            simularShake(times);
            break;

          case 'simularMaso':
            simularMaso(times);
            break;

          // ───── Cualquier otra key: va como evento normal a Unity
          default:
            triggerInteraction(key, times, user);
            break;
        }

        break;
      }

      case 'settings': {
        applySettings(msg.settings || {});
        break;
      }
    }
  });
}

window.triggerInteraction = triggerInteraction;
window.sendEvent = sendEvent;
window.applySettings = applySettings;
