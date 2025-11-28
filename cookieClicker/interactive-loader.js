let api = undefined;

const runInteractiveEffect = async ({ effectID, quantity, extra } = {}) => {
  if (!api || typeof api.getEffects !== "function") {
    console.error("[Interactive] api no está listo todavía o no expone getEffects");
    return;
  }

  const effects = api.getEffects() || [];
  const effect = effects.find(
    (item) => item.effectID.toLowerCase() === String(effectID).toLowerCase()
  );

  if (!effect) {
    console.warn("[Interactive] effectID no encontrado en api.getEffects():", effectID);
    return;
  }

  const fakeEvent = {
    domain: "interactive",
    type: "effect-request",
    payload: {
      requestID: "interactive-" + Date.now(),
      effect: {
        type: "game",
        effectID,
      },
      extra: {
        quantity,
        ...(extra || {}),
      },
      viewer: {
        name: "Interactive",
      },
    },
  };

  try {
    const result = await effect.execute(fakeEvent);
  } catch (err) {
    console.error("[Interactive] Error ejecutando efecto", effectID, err);
  }
};

function attachCookieBridge() {
  if (!window.cookieClicker || typeof window.cookieClicker.onMessage !== "function") {
    console.error("[Interactive] window.cookieClicker.onMessage no disponible");
    return;
  }

  window.cookieClicker.onMessage((payload) => {
    if (!payload || typeof payload !== "object") return;
    if (payload.type === "settings") return;

    const { effectID, quantity, extra } = payload;

    if (!effectID) return;

    runInteractiveEffect({ effectID, quantity, extra });
  });
}

const init = () => {
  try {
    const newApi = window.ccCookieApi;
    if (!newApi || typeof newApi.getEffects !== "function") {
      console.error(
        "[Interactive] window.ccCookieApi no está definido o no tiene getEffects"
      );
      return;
    }

    api = newApi;
    attachCookieBridge();
  } catch (e) {
    console.error("Interactive init error:", e);
  }
};

init();

window.interactiveRunner = {
  runInteractiveEffect,
};
