// poki-bridge.js
(function () {
  // ============================
  // Contadores para rewardedBreak
  // ============================
  window.pokiRewardState = {
    hammer: { used: 0, limit: 5 },
    shake:  { used: 0, limit: 5 },
  };

  window.pokiInGameplay = false;

  function notifyRewardStateChanged() {
    if (typeof window.updateRewardOverlay === 'function') {
      window.updateRewardOverlay(window.pokiRewardState);
    }
  }

  // ============================
  // 1) Stub básico de PokiSDK
  // ============================
  const PokiSDKStub = {
    init() {
      notifyRewardStateChanged();
      return Promise.resolve();
    },

    gameplayStart() {
      window.pokiInGameplay = true;

      if (typeof window.showRewardOverlays === 'function') {
        window.showRewardOverlays();
      }
    },

    gameplayStop() {
      window.pokiInGameplay = false;
      window.lastRewardSource = null;

      if (typeof window.hideRewardOverlays === 'function') {
        window.hideRewardOverlays();
      }
    },

    commercialBreak() {
      return Promise.resolve();
    },

    rewardedBreak(...args) {
      const src = window.lastRewardSource || null;
      const inGameplay = !!window.pokiInGameplay;

      if (inGameplay && (src === 'hammer' || src === 'shake')) {
        const bucket = window.pokiRewardState[src];

        if (bucket.used >= bucket.limit) {
          notifyRewardStateChanged();
          return Promise.resolve(false);
        }

        bucket.used++;
        notifyRewardStateChanged();
        return Promise.resolve(true);
      }
      return Promise.resolve(true);
    },

    shareableURL(opts) {
      console.log('[PokiStub] shareableURL()', opts);
      return Promise.resolve('https://example.com');
    },
  };

  window.PokiSDK = PokiSDKStub;

  // ============================
  // 2) Bridge initPokiBridge
  // ============================
  let pokiBridgeObjectName = null;

  window.initPokiBridge = function (unityGameObjectName) {
    pokiBridgeObjectName = unityGameObjectName;

    if (window.unityGame) {
      try {
        window.unityGame.SendMessage(unityGameObjectName, 'ready');
      } catch (err) {
        console.warn('[PokiBridge] Error enviando "ready":', err);
      }
    }

    return {};
  };

  // ============================
  // 3) Helpers globales opcionales
  // ============================
  window.commercialBreak = function () {
    return window.PokiSDK
      .commercialBreak()
      .then(() => {
        if (window.unityGame && pokiBridgeObjectName) {
          window.unityGame.SendMessage(
            pokiBridgeObjectName,
            'commercialBreakCompleted'
          );
        }
      });
  };

  window.rewardedBreak = function (...args) {
    return window.PokiSDK
      .rewardedBreak(...args)
      .then((result) => {
        if (window.unityGame && pokiBridgeObjectName) {
          window.unityGame.SendMessage(
            pokiBridgeObjectName,
            'rewardedBreakCompleted',
            String(result)
          );
        }
      });
  };

  window.shareableURL = function (opts) {
    return window.PokiSDK
      .shareableURL(opts)
      .then((url) => {
        if (window.unityGame && pokiBridgeObjectName) {
          window.unityGame.SendMessage(
            pokiBridgeObjectName,
            'shareableURLResolved',
            url
          );
        }
      })
      .catch(() => {
        if (window.unityGame && pokiBridgeObjectName) {
          window.unityGame.SendMessage(
            pokiBridgeObjectName,
            'shareableURLRejected'
          );
        }
      });
  };
})();
