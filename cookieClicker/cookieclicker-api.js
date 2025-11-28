(function () {
  function getQuantityFromEvent(event, defaultValue = 1) {
    const extra = event?.payload?.extra || {};
    const q = Number(extra.quantity ?? extra.amount ?? defaultValue);
    return !isFinite(q) || q <= 0 ? defaultValue : q;
  }

  function getTickerText(event) {
    const extra = event?.payload?.extra || {};
    const viewer = getViewerName(event);

    // Prioridad: mensaje custom → texto → fallback con nombre
    return (
      extra.message ||
      extra.text ||
      `${viewer} just made the news!`
    );
  }

  function getBuffTimeInFrames(event, defaultSeconds = 60) {
    const seconds = getQuantityFromEvent(event, defaultSeconds);
    const fps = Game.fps || 30;
    return fps * seconds;
  }

  function getViewerName(event) {
    return event?.payload?.viewer?.name || "Viewer";
  }

  function safeGameCheck(effectID) {
    if (!window.Game) {
      console.warn(`[Interactive Cookie] Game no está listo para "${effectID}"`);
      throw new Error("Game not ready");
    }
  }

  function fmtNumber(n) {
    try {
      if (typeof Beautify === "function") return Beautify(n);
    } catch (e) {}
    return Math.floor(n).toLocaleString();
  }

  function applySeason(seasonKey, event, defaultMinutes, label) {
    safeGameCheck(`season_${seasonKey || 'none'}`);

    const minutes = getQuantityFromEvent(event, defaultMinutes);

    // Quitar season → vuelve a la base
    if (!seasonKey) {
      Game.season = Game.baseSeason || '';
      Game.seasonT = -1;
      Game.storeToRefresh = 1;
      Game.upgradesToRebuild = 1;
      try {
        if (Game.Objects && Game.Objects['Grandma'] && typeof Game.Objects['Grandma'].redraw === 'function') {
          Game.Objects['Grandma'].redraw();
        }
      } catch (e) {}

      const msg = 'Season set to none';
      Game.Notify('Interactive', msg, [16, 7]);
      return { status: 'success', message: msg };
    }

    // Activar season
    Game.season = seasonKey;

    if (typeof Game.fps === 'number' && minutes > 0) {
      // duration = quantity minutos
      Game.seasonT = Game.fps * 60 * minutes;
    } else if (typeof Game.getSeasonDuration === 'function') {
      // duración vanilla (24h)
      Game.seasonT = Game.getSeasonDuration();
    } else {
      // fallback: 1 hora
      Game.seasonT = Game.fps * 60 * 60;
    }

    Game.storeToRefresh = 1;
    Game.upgradesToRebuild = 1;
    try {
      if (Game.Objects && Game.Objects['Grandma'] && typeof Game.Objects['Grandma'].redraw === 'function') {
        Game.Objects['Grandma'].redraw();
      }
    } catch (e) {}

    const msg =
      (Game.seasons &&
        Game.seasons[seasonKey] &&
        Game.seasons[seasonKey].start) ||
      label ||
      'Season enabled';

    Game.Notify('Interactive', msg, [16, 7]);

    return { status: 'success', message: msg };
  }

  window.ccCookieApi = {
    getEffects() {
      return [
        {
          effectID: "cps_p1m",
          label: "Bake Cookies (X seconds of CPS)",
          execute: (event) => {
            try {
              safeGameCheck("cps_p1m");
              const seconds = getQuantityFromEvent(event, 60); // default 60s = 1 min
              const cps = Game.cookiesPs || 0;
              const gain = cps * seconds;
              Game.Earn(gain);
              const msg = `Baked ${fmtNumber(gain)} cookies (${seconds} sec of CPS)`;
              Game.Notify("Interactive", msg, [16, 5]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en cps_p1m:", e);
              return { status: "failTemporary", message: "Error in cps_p1m" };
            }
          },
        },
        {
          effectID: "cps_s1m",
          label: "Take Cookies (X seconds of CPS)",
          execute: (event) => {
            try {
              safeGameCheck("cps_s1m");
              const seconds = getQuantityFromEvent(event, 60); // default 60s
              const cps = Game.cookiesPs || 0;
              const loss = cps * seconds;
              const canTake = Math.min(Game.cookies, loss);
              Game.Spend(canTake);
              const msg = `Took ${fmtNumber(canTake)} cookies (${seconds} sec of CPS)`;
              Game.Notify("Interactive", msg, [16, 5]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en cps_s1m:", e);
              return { status: "failTemporary", message: "Error in cps_s1m" };
            }
          },
        },
        {
          effectID: "ticker",
          label: "Get on the News",
          execute: (event) => {
            try {
              safeGameCheck("ticker");

              const msg = getTickerText(event);

              Game.Notify("News Flash!", msg, [17, 5]);

              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en ticker:", e);
              return { status: "failTemporary", message: "Error in ticker" };
            }
          },
        },
        //<----------------------- Season
        {
          effectID: "season_",
          label: "Switch Season to None",
          execute: (event) => {
            try {
              return applySeason("", event, 0, "Season set to none");
            } catch (e) {
              console.error("[Interactive Cookie] Error en season_:", e);
              return { status: "failTemporary", message: "Error in season_" };
            }
          },
        },
        {
          effectID: "season_christmas",
          label: "Switch Season to Christmas",
          execute: (event) => {
            try {
              // default 10 minutos si no mandas quantity
              return applySeason("christmas", event, 10, "Christmas season enabled!");
            } catch (e) {
              console.error("[Interactive Cookie] Error en season_christmas:", e);
              return {
                status: "failTemporary",
                message: "Error in season_christmas",
              };
            }
          },
        },
        {
          effectID: "season_easter",
          label: "Switch Season to Easter",
          execute: (event) => {
            try {
              return applySeason("easter", event, 10, "Easter season enabled!");
            } catch (e) {
              console.error("[Interactive Cookie] Error en season_easter:", e);
              return {
                status: "failTemporary",
                message: "Error in season_easter",
              };
            }
          },
        },
        {
          effectID: "season_halloween",
          label: "Switch Season to Halloween",
          execute: (event) => {
            try {
              return applySeason("halloween", event, 10, "Halloween season enabled!");
            } catch (e) {
              console.error(
                "[Interactive Cookie] Error en season_halloween:",
                e
              );
              return {
                status: "failTemporary",
                message: "Error in season_halloween",
              };
            }
          },
        },
        {
          effectID: "season_fools",
          label: "Switch Season to April Fools",
          execute: (event) => {
            try {
              return applySeason("fools", event, 10, "April Fools season enabled!");
            } catch (e) {
              console.error("[Interactive Cookie] Error en season_fools:", e);
              return {
                status: "failTemporary",
                message: "Error in season_fools",
              };
            }
          },
        },
        {
          effectID: "season_valentines",
          label: "Switch Season to Valentine's Day",
          execute: (event) => {
            try {
              return applySeason("valentines", event, 10, "Valentine's season enabled!");
            } catch (e) {
              console.error(
                "[Interactive Cookie] Error en season_valentines:",
                e
              );
              return {
                status: "failTemporary",
                message: "Error in season_valentines",
              };
            }
          },
        },


        {
          effectID: "ascend",
          label: "Ascend",
          execute: () => {
            try {
              safeGameCheck("ascend");
              Game.Ascend(1);
              return { status: "success", message: "Ascension started" };
            } catch (e) {
              console.error("[Interactive Cookie] Error en ascend:", e);
              return { status: "failTemporary", message: "Error in ascend" };
            }
          },
        },

        {
          effectID: "buy_expensive",
          label: "Most Expensive Building +X (free, up to max affordable)",
          execute: (event) => {
            try {
              safeGameCheck("buy_expensive");

              const requestedQty = getQuantityFromEvent(event, 1);
              const objs = Game.ObjectsById || [];
              if (!objs.length) throw new Error("No buildings");

              const cookies = Game.cookies || 0;

              function getPrice(obj, qty) {
                if (!obj || qty <= 0) return Infinity;

                // 1) getSumPrice nativo
                if (typeof obj.getSumPrice === "function") {
                  try {
                    return obj.getSumPrice(qty);
                  } catch (e) {}
                }

                // 2) bulkPrice / getBulkPrice
                if (typeof obj.bulkPrice === "function") {
                  try {
                    return obj.bulkPrice(qty);
                  } catch (e) {}
                }

                // 3) fallback lineal
                const p = Number(obj.price || obj.basePrice || 0);
                if (!isFinite(p) || p <= 0) return Infinity;
                return p * qty;
              }

              // ─────────────────────────────
              // 1) Edificio más caro que PUEDES pagar (1 unidad)
              // ─────────────────────────────
              let target = null;
              let targetPrice1 = 0;

              for (const obj of objs) {
                if (!obj) continue;
                if (obj.name === "???") continue; // saltar los totalmente bloqueados

                const priceOne = getPrice(obj, 1);
                if (!isFinite(priceOne) || priceOne > cookies) continue;

                if (!target || priceOne > targetPrice1) {
                  target = obj;
                  targetPrice1 = priceOne;
                }
              }

              // ─────────────────────────────
              // 2) Fallback: si no puedes pagar ninguno,
              //    usar el edificio no-??? más barato
              // ─────────────────────────────
              if (!target) {
                console.warn(
                  "[Interactive Cookie] No affordable building; using cheapest non-??? as fallback"
                );

                let cheapest = null;
                let cheapestPrice = 0;

                for (const obj of objs) {
                  if (!obj) continue;
                  if (obj.name === "???") continue;

                  const p = getPrice(obj, 1);
                  if (!isFinite(p)) continue;

                  if (!cheapest || p < cheapestPrice) {
                    cheapest = obj;
                    cheapestPrice = p;
                  }
                }

                target = cheapest || objs[0] || null;
                targetPrice1 = cheapestPrice || 0;
              }

              if (!target) {
                throw new Error("No building target found");
              }

              // ─────────────────────────────
              // 3) Calcular cuántos podría pagar (hasta requestedQty)
              // ─────────────────────────────
              let maxQty = Math.max(1, requestedQty | 0);

              if (cookies > 0) {
                while (maxQty > 1 && getPrice(target, maxQty) > cookies) {
                  maxQty--;
                }
              }

              if (maxQty <= 0) maxQty = 1;

              // ─────────────────────────────
              // 4) COMPRA GRATIS
              // ─────────────────────────────
              if (typeof target.buyFree === "function") {
                try {
                  target.buyFree(maxQty);
                } catch (e) {
                  // por si solo acepta de a 1
                  for (let i = 0; i < maxQty; i++) {
                    target.buyFree(1);
                  }
                }
              } else {
                // Fallback manual
                target.amount += maxQty;

                if (typeof Game.BuildingsOwned === "number") {
                  Game.BuildingsOwned += maxQty;
                }

                if (typeof Game.rebuildStore === "function") Game.rebuildStore();
                if (typeof Game.recalculateGains === "function")
                  Game.recalculateGains();
                else if (typeof Game.CalculateGains === "function")
                  Game.CalculateGains();
              }

              const msg = `Bought ${maxQty} of ${target.name} (free, based on max affordable)`;
              Game.Notify("Interactive", msg, [target.icon, 0]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en buy_expensive:", e);
              return {
                status: "failTemporary",
                message: "Error in buy_expensive",
              };
            }
          },
        },

        {
          effectID: "sell_expensive",
          label: "Most Expensive Building -X",
          execute: (event) => {
            try {
              safeGameCheck("sell_expensive");
              const qty = getQuantityFromEvent(event, 1);
              const objs = Game.ObjectsById || [];
              if (!objs.length) throw new Error("No buildings");

              let target = null;
              for (const obj of objs) {
                if (obj.amount > 0 && (!target || obj.price > target.price)) {
                  target = obj;
                }
              }

              if (!target) throw new Error("No building with amount > 0");

              const toSell = Math.min(target.amount, qty);
              for (let i = 0; i < toSell; i++) {
                target.sell(1);
              }
              const msg = `Sold ${toSell} of ${target.name}`;
              Game.Notify("Interactive", msg, [target.icon, 0]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en sell_expensive:", e);
              return {
                status: "failTemporary",
                message: "Error in sell_expensive",
              };
            }
          },
        },
        {
          effectID: "click_storm",
          label: "Click Storm (auto-click big cookie)",
          execute: (event) => {
            try {
              safeGameCheck("click_storm");
              const clicks = getQuantityFromEvent(event, 50); // nº de clics
              if (!clicks || clicks <= 0) {
                return { status: "failTemporary", message: "No clicks requested" };
              }

              if (typeof Game.ClickCookie !== "function") {
                throw new Error("Game.ClickCookie no disponible");
              }

              // Hacemos los clics poco a poco para que se vea la animación
              let remaining = clicks;
              const delayMs = 30; // tiempo entre clics

              const intervalId = setInterval(() => {
                try {
                  if (remaining <= 0) {
                    clearInterval(intervalId);
                    return;
                  }

                  Game.ClickCookie();
                  // Aseguramos que el juego vea actividad de click
                  Game.lastClick = Date.now();
                  remaining--;
                } catch (err) {
                  console.error("[Interactive Cookie] Error dentro de click_storm loop:", err);
                  clearInterval(intervalId);
                }
              }, delayMs);

              const msg = `Click storm started: ${clicks} auto-clicks`;
              Game.Notify("Interactive", msg, [16, 5]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en click_storm:", e);
              return { status: "failTemporary", message: "Error in click_storm" };
            }
          },
        },
        {
          effectID: "random_upgrade",
          label: "Unlock random upgrade",
          execute: () => {
            try {
              safeGameCheck("random_upgrade");

              // Filtramos upgrades no comprados
              const candidates = [];
              for (let i in Game.Upgrades) {
                const upg = Game.Upgrades[i];
                if (!upg.bought && !upg.pool) {
                  candidates.push(upg);
                }
              }
              if (!candidates.length) {
                return {
                  status: "failTemporary",
                  message: "No upgrades available",
                };
              }

              const upg = candidates[Math.floor(Math.random() * candidates.length)];
              upg.unlocked = 1;
              upg.bought = 1;

              if (typeof Game.rebuildUpgrades === "function") Game.rebuildUpgrades();
              if (typeof Game.CalculateGains === "function") Game.CalculateGains();

              const msg = `Unlocked upgrade: ${upg.name}`;
              Game.Notify("Interactive", msg, [upg.icon, 0]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en random_upgrade:", e);
              return {
                status: "failTemporary",
                message: "Error in random_upgrade",
              };
            }
          },
        },
        {
          effectID: "garden_fill_plant",
          label: "Fill garden with plant",
          execute: (event) => {
            try {
              safeGameCheck("garden_fill_plant");

              const farm = Game.Objects && Game.Objects["Farm"];
              if (!farm || !farm.minigameLoaded || !farm.minigame) {
                throw new Error("Garden minigame not available");
              }

              const M = farm.minigame;
              const extra = (event && event.payload && event.payload.extra) || {};

              // 👇 Nombre interno de la planta, por ahora lo mandamos en extra.plantKey
              const plantKey = String(extra.plantKey || "bakerWheat"); // default

              if (!M.plants || !M.plants[plantKey]) {
                throw new Error('Plant "' + plantKey + '" not found in M.plants');
              }

              const plant = M.plants[plantKey];

              if (!Array.isArray(M.plot) || !M.plot.length) {
                throw new Error("Garden plot not available");
              }

              if (typeof M.useTool !== "function") {
                throw new Error("Garden.useTool no disponible");
              }

              // ⚠️ Hacemos que plantar cueste 0 mientras rellenamos el jardín
              const oldGetCost = M.getCost;
              if (typeof M.getCost === "function") {
                M.getCost = function () { return 0; };
              }

              // Rellenar TODAS las casillas con esa planta
              for (let y = 0; y < M.plot.length; y++) {
                const row = M.plot[y];
                if (!Array.isArray(row)) continue;

                for (let x = 0; x < row.length; x++) {
                  // useTool(plantId, x, y)
                  M.useTool(plant.id, x, y);
                }
              }

              // Restaurar coste original
              if (oldGetCost) {
                M.getCost = oldGetCost;
              }

              // Refrescar visual
              if (typeof M.computeMatures === "function") M.computeMatures();
              if (typeof M.refresh === "function") M.refresh();
              if (typeof M.draw === "function") M.draw();

              const msg = `Garden filled with "${plantKey}"`;
              Game.Notify("Interactive", msg, [farm.icon, 0]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en garden_fill_plant:", e);
              return {
                status: "failTemporary",
                message: "Error in garden_fill_plant",
              };
            }
          },
        },

        {
          effectID: "golden_cookie",
          label: "Spawn Golden Cookie",
          execute: (event) => {
            try {
              safeGameCheck("golden_cookie");

              // cuántas golden cookies quieres (por defecto 1)
              var qty = getQuantityFromEvent(event, 1);
              if (!isFinite(qty) || qty < 1) qty = 1;

              var spawnedCount = 0;

              for (var i = 0; i < qty; i++) {
                var spawned = false;

                // Opción A: constructor de shimmer (la más típica)
                if (typeof Game.shimmer === "function") {
                  new Game.shimmer("golden");
                  spawned = true;
                }
                // Opción B: shimmerTypes.golden.spawn()
                else if (
                  Game.shimmerTypes &&
                  Game.shimmerTypes.golden &&
                  typeof Game.shimmerTypes.golden.spawn === "function"
                ) {
                  Game.shimmerTypes.golden.spawn();
                  spawned = true;
                }
                // Opción C: Game.goldenCookie.spawn()
                else if (
                  Game.goldenCookie &&
                  typeof Game.goldenCookie.spawn === "function"
                ) {
                  Game.goldenCookie.spawn();
                  spawned = true;
                }

                if (spawned) spawnedCount++;
              }

              if (!spawnedCount) {
                console.warn(
                  "[Interactive Cookie] golden_cookie: no hay método spawn disponible"
                );
                return {
                  status: "failTemporary",
                  message: "Golden cookie no disponible en esta versión",
                };
              }

              var msg =
                spawnedCount === 1
                  ? "Golden cookie spawned"
                  : spawnedCount + " golden cookies spawned";

              Game.Notify("Interactive", msg, [17, 0]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en golden_cookie:", e);
              return {
                status: "failTemporary",
                message: "Error in golden_cookie",
              };
            }
          },
        },

        // ==========================
        // BUFFS REALES
        // ==========================
        {
          effectID: "buff_frenzy",
          label: 'Apply Buff "Frenzy"',
          execute: (event) => {
            try {
              safeGameCheck("buff_frenzy");

              const time = getBuffTimeInFrames(event, 60); // 60s por defecto

              if (typeof Game.gainBuff === "function") {
                // 7x es el multiplicador típico de Frenzy
                Game.gainBuff("frenzy", time, 7);
                const seconds = getQuantityFromEvent(event, 60);
                const msg = `Frenzy x7 for ${seconds} sec`;
                Game.Notify("Interactive", msg, [0, 0]);
                return { status: "success", message: msg };
              } else {
                Game.Notify("Interactive", "Frenzy placeholder (gainBuff no disponible)", [0, 0]);
                return { status: "success", message: "Frenzy placeholder triggered" };
              }
            } catch (e) {
              console.error("[Interactive Cookie] Error en buff_frenzy:", e);
              return { status: "failTemporary", message: "Error in buff_frenzy" };
            }
          },
        },
        {
          effectID: "buff_click frenzy",
          label: 'Apply Buff "Click Frenzy"',
          execute: (event) => {
            try {
              safeGameCheck("buff_click frenzy");

              const time = getBuffTimeInFrames(event, 30); // default 30s

              if (typeof Game.gainBuff === "function") {
                // multiplicador grande típico de Click Frenzy
                Game.gainBuff("click frenzy", time, 777);
                const seconds = getQuantityFromEvent(event, 30);
                const msg = `Click Frenzy x777 for ${seconds} sec`;
                Game.Notify("Interactive", msg, [0, 0]);
                return { status: "success", message: msg };
              } else {
                Game.Notify("Interactive", "Click Frenzy placeholder (gainBuff no disponible)", [0, 0]);
                return { status: "success", message: "Click Frenzy placeholder triggered" };
              }
            } catch (e) {
              console.error("[Interactive Cookie] Error en buff_click frenzy:", e);
              return { status: "failTemporary", message: "Error in buff_click frenzy" };
            }
          },
        },
        {
          effectID: "buff_cookie storm",
          label: 'Apply Buff "Cookie Storm"',
          execute: (event) => {
            try {
              safeGameCheck("buff_cookie storm");

              const time = getBuffTimeInFrames(event, 30); // 30s

              if (typeof Game.gainBuff === "function") {
                Game.gainBuff("cookie storm", time, 1);
                const seconds = getQuantityFromEvent(event, 30);
                const msg = `Cookie Storm for ${seconds} sec`;
                Game.Notify("Interactive", msg, [0, 0]);
                return { status: "success", message: msg };
              } else {
                Game.Notify("Interactive", "Cookie Storm placeholder (gainBuff no disponible)", [0, 0]);
                return { status: "success", message: "Cookie Storm placeholder triggered" };
              }
            } catch (e) {
              console.error("[Interactive Cookie] Error en buff_cookie storm:", e);
              return { status: "failTemporary", message: "Error in buff_cookie storm" };
            }
          },
        },
        {
          effectID: "buff_building special",
          label: 'Apply Buff "Building Special"',
          execute: (event) => {
            try {
              safeGameCheck("buff_building special");

              const time = getBuffTimeInFrames(event, 60); // 60s
              const seconds = getQuantityFromEvent(event, 60);

              // Elegimos el building más caro que tengas
              const objs = Game.ObjectsById || [];
              let target = null;
              for (const obj of objs) {
                if (!obj.unlocked) continue;
                if (obj.amount <= 0) continue;
                if (!target || obj.basePrice > target.basePrice) {
                  target = obj;
                }
              }

              if (!target) {
                Game.Notify("Interactive", "No building available for special buff", [0, 0]);
                return {
                  status: "failTemporary",
                  message: "No building available for buff_building special",
                };
              }

              if (typeof Game.gainBuff === "function") {
                // multiplicador fijo x10
                Game.gainBuff("building buff", time, 10, target);
                const msg = `Buff x10 for ${target.name} for ${seconds} sec`;
                Game.Notify("Interactive", msg, [target.icon, 0]);
                return { status: "success", message: msg };
              } else {
                const msg = `Placeholder building special for ${target.name}`;
                Game.Notify("Interactive", msg, [target.icon, 0]);
                return { status: "success", message: msg };
              }
            } catch (e) {
              console.error("[Interactive Cookie] Error en buff_building special:", e);
              return {
                status: "failTemporary",
                message: "Error in buff_building special",
              };
            }
          },
        },
        {
          effectID: "buff_cursed finger",
          label: 'Apply Buff "Cursed Finger"',
          execute: (event) => {
            try {
              safeGameCheck("buff_cursed finger");

              const time = getBuffTimeInFrames(event, 10); // 10s
              const seconds = getQuantityFromEvent(event, 10);

              if (typeof Game.gainBuff === "function") {
                Game.gainBuff("cursed finger", time, 1);
                const msg = `Cursed Finger for ${seconds} sec`;
                Game.Notify("Interactive", msg, [0, 0]);
                return { status: "success", message: msg };
              } else {
                Game.Notify("Interactive", "Cursed Finger placeholder (gainBuff no disponible)", [0, 0]);
                return { status: "success", message: "Cursed Finger placeholder triggered" };
              }
            } catch (e) {
              console.error("[Interactive Cookie] Error en buff_cursed finger:", e);
              return { status: "failTemporary", message: "Error in buff_cursed finger" };
            }
          },
        },
        {
          effectID: "buff_clot",
          label: 'Apply Debuff "Clot"',
          execute: (event) => {
            try {
              safeGameCheck("buff_clot");

              const time = getBuffTimeInFrames(event, 60); // 60s
              const seconds = getQuantityFromEvent(event, 60);

              if (typeof Game.gainBuff === "function") {
                Game.gainBuff("clot", time, 0.5);
                const msg = `Clot debuff (x0.5) for ${seconds} sec`;
                Game.Notify("Interactive", msg, [0, 0]);
                return { status: "success", message: msg };
              } else {
                Game.Notify("Interactive", "Clot placeholder (gainBuff no disponible)", [0, 0]);
                return { status: "success", message: "Clot placeholder triggered" };
              }
            } catch (e) {
              console.error("[Interactive Cookie] Error en buff_clot:", e);
              return { status: "failTemporary", message: "Error in buff_clot" };
            }
          },
        },


        {
          effectID: "sugar_add",
          label: "Sugar Lump +X",
          execute: (event) => {
            try {
              safeGameCheck("sugar_add");
              const qty = getQuantityFromEvent(event, 1);
              if (typeof Game.lumps !== "number") {
                throw new Error("No lumps in this version");
              }
              Game.lumps += qty;
              if (Game.lumps < 0) Game.lumps = 0;
              const msg = `+${qty} sugar lump(s)`;
              Game.Notify("Interactive", msg, [29, 14]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en sugar_add:", e);
              return { status: "failTemporary", message: "Error in sugar_add" };
            }
          },
        },

        {
          effectID: "sugar_sub",
          label: "Sugar Lump -X",
          execute: (event) => {
            try {
              safeGameCheck("sugar_sub");
              const qty = getQuantityFromEvent(event, 1);
              if (typeof Game.lumps !== "number") {
                throw new Error("No lumps in this version");
              }
              Game.lumps -= qty;
              if (Game.lumps < 0) Game.lumps = 0;
              const msg = `-${qty} sugar lump(s)`;
              Game.Notify("Interactive", msg, [29, 14]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en sugar_sub:", e);
              return { status: "failTemporary", message: "Error in sugar_sub" };
            }
          },
        },

        {
          effectID: "GiveCookies",
          label: "Give Cookies (local test)",
          execute: (event) => {
            try {
              safeGameCheck("GiveCookies");
              const amount = getQuantityFromEvent(event, 1000);
              if (typeof Game.Earn === "function") {
                Game.Earn(amount);
              } else {
                console.warn(
                  "[Interactive Cookie] Game.Earn no está disponible"
                );
              }
              const msg = `+${fmtNumber(amount)} cookies (GiveCookies)`;
              Game.Notify("Interactive", msg, [16, 5]);
              return { status: "success", message: msg };
            } catch (e) {
              console.error("[Interactive Cookie] Error en GiveCookies:", e);
              return {
                status: "failTemporary",
                message: "Error en GiveCookies",
              };
            }
          },
        },
      ];
    },
  };
})();
