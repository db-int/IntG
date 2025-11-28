const numSquares = 15; // Number of squares
const squares = [];
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f'];
const main = document.getElementById('main');
let currentShape = 'square';
let startTime = null;
let lastTimestamp = null;
const duration = 10000; // Animation duration in milliseconds

let currentSpeed = 1; // Default speed multiplier
let shotPause = 2000; // Default shot pause in milliseconds
let lastShotTime = 0;
const balls = [];
let shooting = false; 
let shotLocation = 1; 
let shotLocationRandom = false;
let lastRandomLocation = null;
const usersMap = new Map();

const SQUARE_SIZE = 46;
const HALF_SQUARE = SQUARE_SIZE / 2;

const shatterPieces = [];
const particles = [];
const leaderboardEntries = [];
const queueUsers = [];
let visibleQueueUsers = [];

const BALL_SPEED = 5;
const BALL_SIZE = 15;
const BALL_MAX_AGE_MS = 15000;

const DEFAULT_GOAL_MS = 3 * 60_000;

let goalMs = loadGoalMs();
let goalTriggered = false;
let goalWinnerUsername = null;

let victoryPhase = false;
let prevShooting = false;
let victoryTimer = null;
let countdownInterval = null;
const VICTORY_BANNER_MS = 1000;
const RESUME_COUNTDOWN_S = 5;
let victoryScores = loadVictoryScores();

let collisionSoundUrl = localStorage.getItem('figureflowOverlay.collisionSoundUrl') || '';

const RANK_ICONS = {
  1: 'https://i.imgur.com/5vPmLnC.png',
  2: 'https://i.imgur.com/TUwyGKJ.png',
  3: 'https://i.imgur.com/cCc38ra.png'
};

function loadGoalMs() {
  try {
    const v = Number(localStorage.getItem('figureflowOverlay.goalMs'));
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : DEFAULT_GOAL_MS;
  } catch {
    return DEFAULT_GOAL_MS;
  }
}
function saveGoalMs(ms) {
  try { localStorage.setItem('figureflowOverlay.goalMs', String(Math.max(1, Math.floor(ms)))) } catch {}
}
function clearGoalPersisted() {
  try { localStorage.removeItem('figureflowOverlay.goalMs'); } catch {}
}

function setCollisionSoundUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  collisionSoundUrl = url.trim();
  try { localStorage.setItem('figureflowOverlay.collisionSoundUrl', collisionSoundUrl); } catch {}
  return true;
}

function playSound() {
  if (!collisionSoundUrl) return;
  const audio = new Audio(collisionSoundUrl);
  audio.play().catch(err => console.error('Error playing sound:', err));
}

document.body.classList.add('dark-mode');

const notificationCard = document.getElementById('notificationCard');
const notificationText = document.getElementById('notificationText');
const notificationImage = notificationCard.querySelector('img');
const milestoneSoundUrl = new URL('./sounds/shape_minute.mp3', window.location.href).toString();


let notificationQueue = [];
let notificationInProgress = false;

for (let i = 0; i < numSquares; i++) {
  const squareElem = document.createElement('div');
  squareElem.classList.add('square');
  squareElem.style.backgroundColor = colors[i % colors.length];

  // nuevo: tamaño consistente con HALF_SQUARE
  squareElem.style.width = SQUARE_SIZE + 'px';
  squareElem.style.height = SQUARE_SIZE + 'px';
  squareElem.style.borderRadius = '12px';

  main.appendChild(squareElem);
  squares.push({
    element: squareElem,
    offset: i / numSquares,
    x: 0,
    y: 0,
    assignedUser: null,
    timeOnSquare: 0,
    lastMilestone: 0
  });
}

function simulateGift(override = {}) {
  const randomNumber = Math.floor(Math.random() * 1000);
  const uname = override.username || ('user' + randomNumber);
  const qtyToAdd = Number(override.cantidad) || 1;

  const user = {
    username: uname,
    nickname: override.nickname || uname,
    photoUrl: override.photoUrl || ('https://picsum.photos/40?' + randomNumber),
    gift_name: override.gift_name || 'rose'
  };

  assignUserToSquare(user, qtyToAdd);
}

window.addEventListener('assignUserEvent', function(event) {
  const user = {
    username: event.detail.username,
    nickname: event.detail.nickname || event.detail.username,
    photoUrl: event.detail.photoUrl,
    gift_name: 'rose'
  };
  assignUserToSquare(user);
});

// Helper function to count how many times a username currently exists in squares or queue
function countUserEntries(username) {
    let count = 0;
    // Count in assigned squares
    for (const sq of squares) {
        if (sq.assignedUser && sq.assignedUser.username === username) {
            count++;
        }
    }
    // Count in the queue
    for (const qUser of queueUsers) {
        if (qUser.username === username) {
            count++;
        }
    }
    return count;
}

function styleHitsBadge(badgeEl, hits) {
  if (!badgeEl) return;
  badgeEl.textContent = '×' + hits;
  badgeEl.classList.remove('low', 'mid', 'high');

  if (hits <= 3) {
    badgeEl.classList.add('low');
  } else if (hits <= 10) {
    badgeEl.classList.add('mid');
  } else {
    badgeEl.classList.add('high');
  }
}

function assignUserToSquare(user, qtyToAdd = 1) {
  // Si estamos en notificación de victoria, todo entra a la cola
  if (victoryPhase) {
    const qIdx = queueUsers.findIndex(u => u.username === user.username);
    if (qIdx !== -1) {
      queueUsers[qIdx].queuedQty = (queueUsers[qIdx].queuedQty || 0) + (Number(qtyToAdd) || 1);
    } else {
      queueUsers.push({ ...user, queuedQty: Math.max(1, Number(qtyToAdd) || 1) });
    }
    updateQueueDisplay();
    return;
  }

  const existingSquare = squares.find(sq => sq.assignedUser && sq.assignedUser.username === user.username);
  if (existingSquare) {
    existingSquare.remainingHits = (existingSquare.remainingHits || 0) + (Number(qtyToAdd) || 1);
    if (!existingSquare.hitsBadge && existingSquare.userImgWrap) {
      const badge = document.createElement('span');
      badge.className = 'hits-badge';
      existingSquare.userImgWrap.appendChild(badge);
      existingSquare.hitsBadge = badge;
    }
    styleHitsBadge(existingSquare.hitsBadge, existingSquare.remainingHits);
    return;
  }

  const availableSquare = squares.find(sq => !sq.assignedUser);
  if (availableSquare) {
    assignUserToSpecificSquare(user, availableSquare, qtyToAdd);
    return;
  }

  // Cola normal (acumula cantidad)
  const qIdx = queueUsers.findIndex(u => u.username === user.username);
  if (qIdx !== -1) {
    queueUsers[qIdx].queuedQty = (queueUsers[qIdx].queuedQty || 0) + (Number(qtyToAdd) || 1);
  } else {
    queueUsers.push({ ...user, queuedQty: Number(qtyToAdd) || 1 });
  }
  updateQueueDisplay();
}

function drainQueueToSquares() {
  for (const sq of squares) {
    if (!sq.assignedUser && queueUsers.length > 0) {
      const nextUser = queueUsers.shift();
      const qty = Math.max(1, Number(nextUser.queuedQty) || 1);
      assignUserToSpecificSquare(nextUser, sq, qty);
    }
  }
  updateQueueDisplay();
}


function assignUserToSpecificSquare(user, square, qty = 1) {
  square.element.classList.remove('hit');
  createParticleBurst(square);

  square.assignedUser = user;
  user.square = square;

  square.timeOnSquare = 0;
  square.lastMilestone = 0;

  // Vidas iniciales
  square.remainingHits = Math.max(1, Number(qty) || 1);

  // --- Envoltura de imagen (ocupa todo el square)
  const imgWrap = document.createElement('div');
  imgWrap.className = 'user-img-wrap';

  const img = document.createElement('img');
  img.src = user.photoUrl;
  img.alt = user.nickname || user.username;
  img.draggable = false;
  img.classList.add('user-image');

  imgWrap.appendChild(img);
  square.element.appendChild(imgWrap);

  // Guardar refs
  square.userImgWrap = imgWrap;
  square.userImage   = img;

  // --- Badge ×N (chip redondo, número centrado)
  const hitsBadge = document.createElement('span');
  hitsBadge.className = 'hits-badge';
  imgWrap.appendChild(hitsBadge);
  square.hitsBadge = hitsBadge;

  // <-- usar helper para texto y color:
  styleHitsBadge(hitsBadge, square.remainingHits);
  // --- Texto (nombre/tiempo)
  const textContainer = document.createElement('div');
  textContainer.classList.add('user-text-container');

  const nameText = document.createElement('div');
  nameText.textContent = user.nickname || user.username;

  const timeText = document.createElement('div');
  timeText.textContent = '0s';

  textContainer.appendChild(nameText);
  textContainer.appendChild(timeText);
  square.element.appendChild(textContainer);

  // Refs para actualizar luego
  square.userTextContainer = textContainer;
  square.userTimeText      = timeText;
  square.userNameEl        = nameText;

  addUserToLeaderboard(user);
}

function updateQueueDisplay() {
    if (queueUsers.length > 0) {
        document.getElementById("nextHeader").style.display = "block";
    } else {
        document.getElementById("nextHeader").style.display = "none";
    }

    const queueGrid = document.querySelector('.queue-grid');
    const previousVisibleUsers = visibleQueueUsers.slice();
    visibleQueueUsers = [];
    queueGrid.innerHTML = '';

    const maxVisibleUsers = 5;
    const visibleUsers = queueUsers.slice(0, maxVisibleUsers);

    visibleUsers.forEach((user) => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('queue-user');

        const img = document.createElement('img');
        img.src = user.photoUrl;

        // badge ×N en cola
        const badge = document.createElement('div');
        badge.className = 'queue-badge';
        const qty = Math.max(1, Number(user.queuedQty) || 1);
        badge.textContent = '×' + qty;

        userDiv.appendChild(img);
        userDiv.appendChild(badge); // ⬅️

        queueGrid.appendChild(userDiv);
        visibleQueueUsers.push(user);

        if (!previousVisibleUsers.includes(user)) {
            createParticleBurstForQueueUser(userDiv);
        }
    });


    if (queueUsers.length > maxVisibleUsers) {
        const remainingCount = queueUsers.length - maxVisibleUsers;
        const plusDiv = document.createElement('div');
        plusDiv.classList.add('plus-count-circle');
        plusDiv.textContent = '+' + remainingCount;

        queueGrid.appendChild(plusDiv);
    }
}

function assignNextUserFromQueue(square) {
  if (queueUsers.length > 0) {
    const nextUser = queueUsers.shift();
    updateQueueDisplay();
    const qty = Math.max(1, Number(nextUser.queuedQty) || 1);
    assignUserToSpecificSquare(nextUser, square, qty);
  }
}

function addUserToLeaderboard(user) {
  let agg = usersMap.get(user.username);
  if (!agg) {
    // Crear DOM UNA sola vez por username
    const entry = document.createElement('div');
    entry.classList.add('leaderboard-entry');

    const img = document.createElement('img');
    img.src = user.photoUrl;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.borderRadius = '50%';
    img.style.pointerEvents = 'none';

    const name = document.createElement('div');
    name.textContent = user.nickname || user.username;
    name.style.whiteSpace = 'nowrap';
    name.style.textOverflow = 'clip';
    name.style.width = "75px";
    name.style.fontSize = "14px";

    const time = document.createElement('div');
    time.textContent = '0s';
    time.style.fontSize = '15px';

    const rankLabel = document.createElement('div');
    rankLabel.textContent = '';
    rankLabel.classList.add('rank-label');
    rankLabel.style.fontWeight = "600";
    rankLabel.style.fontSize = '14px';

    entry.appendChild(img);
    entry.appendChild(name);
    entry.appendChild(time);
    entry.appendChild(rankLabel);

    agg = {
      username: user.username,
      nickname: user.nickname || user.username,
      photoUrl: user.photoUrl,
      leaderboardEntry: entry,
      leaderboardTime: time,
      rankLabel: rankLabel,
      imgEl: img,
      nameEl: name,
    };

    usersMap.set(user.username, agg);
    leaderboardEntries.push(agg); // 👈 array de agregados
  } else {
    // Actualiza datos visibles si llegan más gifts con otro nickname/foto
    agg.nickname = user.nickname || agg.nickname || user.username;
    agg.photoUrl = user.photoUrl || agg.photoUrl;
    if (agg.imgEl) agg.imgEl.src = agg.photoUrl;
    if (agg.nameEl) agg.nameEl.textContent = agg.nickname;
  }
}

function removeUserFromLeaderboard(user) {
  const stillActive = squares.some(
    sq => sq.assignedUser && sq.assignedUser.username === user.username
  );
  if (stillActive) return;

  const agg = usersMap.get(user.username);
  if (agg && agg.leaderboardEntry) {
    agg.leaderboardEntry.remove();
  }
  usersMap.delete(user.username);

  const idx = leaderboardEntries.indexOf(agg);
  if (idx !== -1) leaderboardEntries.splice(idx, 1);

  updateLeaderboardRanks();
}

function updateLeaderboardRanks() {
  // Calcula tiempo total por usuario sumando TODAS sus casillas activas
  for (const agg of leaderboardEntries) {
    let totalMs = 0;
    for (const sq of squares) {
      if (sq.assignedUser && sq.assignedUser.username === agg.username) {
        totalMs += sq.timeOnSquare;
      }
    }
    const secs = Math.floor(totalMs / 1000);
    agg.leaderboardTime.textContent = secs + 's';
    // Guarda para ordenar sin recalcular
    agg._totalMs = totalMs;
  }

  // Orden por tiempo total
  leaderboardEntries.sort((a, b) => b._totalMs - a._totalMs);

  // Render top 5
  const leaderboardGrid = document.querySelector('.leaderboard-grid');
  leaderboardGrid.innerHTML = '';
  const topEntries = leaderboardEntries.slice(0, 5);

  topEntries.forEach((agg, index) => {
    const rankLabel = agg.rankLabel;
    if (index === 0) {
      rankLabel.textContent = '1st';
      rankLabel.style.color = '#2ecc71';
    } else if (index === 1) {
      rankLabel.textContent = '2nd';
      rankLabel.style.color = '#3498db';
    } else if (index === 2) {
      rankLabel.textContent = '3rd';
      rankLabel.style.color = '';
    } else {
      rankLabel.textContent = `${index + 1}th`;
      rankLabel.style.color = '';
    }
    leaderboardGrid.appendChild(agg.leaderboardEntry);
  });
}

function createShatterEffect(ball) {
    const numPieces = 10;
    const ballColor = getComputedStyle(ball.element).backgroundColor;
    for (let i = 0; i < numPieces; i++) {
        const piece = document.createElement('div');
        piece.classList.add('shatter-piece');
        piece.style.backgroundColor = ballColor;
        main.appendChild(piece);

        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 2 + 1;

        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;

        const shatter = {
            element: piece,
            x: ball.x,
            y: ball.y,
            dx: dx,
            dy: dy,
            life: 1000,
            createdAt: performance.now()
        };

        shatterPieces.push(shatter);
    }
}

function createParticleBurst(square) {
    const numParticles = 15;
    const squareRect = square.element.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const centerX = squareRect.left + squareRect.width / 2 - mainRect.left;
    const centerY = squareRect.top + squareRect.height / 2 - mainRect.top;

    for (let i = 0; i < numParticles; i++) {
        const particleElem = document.createElement('div');
        particleElem.classList.add('particle');
        particleElem.style.backgroundColor = square.element.style.backgroundColor;
        main.appendChild(particleElem);

        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 2 + 1;

        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;

        const particle = {
            element: particleElem,
            x: centerX,
            y: centerY,
            dx: dx,
            dy: dy,
            life: 1000,
            createdAt: performance.now()
        };

        particleElem.style.left = particle.x + 'px';
        particleElem.style.top = particle.y + 'px';

        particles.push(particle);
    }
}

function createParticleBurstForQueueUser(userDiv) {
    const numParticles = 10;
    const userRect = userDiv.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const centerX = userRect.left + userRect.width / 2 - mainRect.left;
    const centerY = userRect.top + userRect.height / 2 - mainRect.top;

    for (let i = 0; i < numParticles; i++) {
        const particleElem = document.createElement('div');
        particleElem.classList.add('particle');
        particleElem.style.backgroundColor = '#3498db';
        main.appendChild(particleElem);

        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 2 + 1;

        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;

        const particle = {
            element: particleElem,
            x: centerX,
            y: centerY,
            dx: dx,
            dy: dy,
            life: 1000,
            createdAt: performance.now()
        };

        particleElem.style.left = particle.x + 'px';
        particleElem.style.top = particle.y + 'px';

        particles.push(particle);
    }
}

function removeUserFromSquare(square) {
  if (square.userImgWrap) { square.userImgWrap.remove(); square.userImgWrap = null; }
  if (square.userImage)   { square.userImage = null; }
  if (square.userTextContainer) { square.userTextContainer.remove(); square.userTextContainer = null; }

  square.hitsBadge = null;
  square.remainingHits = 0;

  if (square.assignedUser) {
    removeUserFromLeaderboard(square.assignedUser);
    square.assignedUser = null;
  }
}

function showNotification(user, minutes) {
  notificationQueue.push({ user, minutes });
  if (!notificationInProgress) {
    displayNextNotification();
  }
}

function displayNextNotification() {
  if (notificationQueue.length === 0) {
    notificationInProgress = false;
    return;
  }

  notificationInProgress = true;

  // 💡 Recupera el siguiente item de la cola
  const { user, minutes } = notificationQueue.shift();

  notificationImage.src = user.photoUrl;
  notificationText.innerHTML = `<b>${user.username}</b> has reached <b>${minutes}</b> minute${minutes > 1 ? 's' : ''}!`;

  notificationCard.classList.add('show');

  setTimeout(() => {
    notificationCard.classList.remove('show');
    setTimeout(() => {
      notificationInProgress = false;
      displayNextNotification();
    }, 500);
  }, 2000);
}

function clearGoal() {
  goalMs = null;
  goalTriggered = false;
  goalWinnerUsername = null;
}

function fmtMs(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2,'0')}`;
}

function ensureVictoryUI() {
  if (!document.getElementById('victoryStyles')) {
    const css = document.createElement('style');
    css.id = 'victoryStyles';
    css.textContent = `
#victoryCard {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none; z-index: 99999; opacity: 0; transition: opacity .2s ease;
}
#victoryCard.show { opacity: 1; }

#victoryCard .v-card {
  display:flex; align-items:center; gap:18px;
  padding:28px 32px; border-radius:18px;
  background:rgba(10,12,17,0.65);
  backdrop-filter: blur(12px) saturate(125%);
  border:1px solid rgba(255,255,255,0.08);
  box-shadow:0 24px 60px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.04);
  max-width:720px; width:min(720px,94vw); color:#e9f0ff;
  transform:translateY(8px) scale(.98); animation:v-pop .32s ease-out forwards;
}
#victoryCard .v-left{
  width:96px;height:96px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg, rgba(18,216,250,.16), rgba(124,58,237,.16));
  outline:1px solid rgba(255,255,255,.12);
}
#victoryCard .v-icon{ font-size:48px; filter: drop-shadow(0 3px 8px rgba(18,216,250,.45)); }
#victoryCard .v-right{ flex:1; display:flex; flex-direction:column; min-width:0; }
#victoryCard .v-title{ font-size:12px; letter-spacing:.22em; text-transform:uppercase; opacity:.85; margin-bottom:8px; color:#c9d2e1; }
#victoryCard .v-row{ display:flex; align-items:center; gap:14px; }
#victoryCard .v-avatar{
  width:72px;height:72px;border-radius:14px;object-fit:cover;
  border:1px solid rgba(255,255,255,.18); box-shadow:0 6px 22px rgba(0,0,0,.5);
}
#victoryCard .v-name{ font-size:28px;font-weight:800;line-height:1.15;color:#eef5ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:0 0 12px rgba(18,216,250,.18); }
#victoryCard .v-sub{ margin-top:4px;font-size:14px;opacity:.92;color:#c9d2e1; }

#victoryCard .v-count{
  margin-top:10px; display:inline-flex; align-items:center; gap:10px;
  padding:8px 12px; border-radius:999px; background:rgba(255,255,255,0.07);
  border:1px solid rgba(255,255,255,0.12);
}
#victoryCard .v-count-label{ font-size:13px; opacity:.85; }
#victoryCard .v-count-num{
  min-width:38px; text-align:center; font-weight:900; font-size:22px;
  background:rgba(0,0,0,0.3); border-radius:10px; padding:2px 8px;
}

@keyframes v-pop{
  0%{ transform:translateY(10px) scale(.96); opacity:.2; }
  70%{ transform:translateY(0) scale(1.02); opacity:1; }
  100%{ transform:translateY(0) scale(1); opacity:1; }
}
    `;
    document.head.appendChild(css);
  }
  if (!document.getElementById('victoryCard')) {
    const card = document.createElement('div');
    card.id = 'victoryCard';
    card.innerHTML = `
      <div class="v-card">
        <div class="v-left"><div class="v-icon">🏆</div></div>
        <div class="v-right">
          <div class="v-title">Winner</div>
          <div class="v-row">
            <img class="v-avatar" src="" alt="">
            <div class="v-text">
              <div class="v-name"></div>
              <div class="v-sub"></div>
            </div>
          </div>
          <div class="v-count" style="display:none">
            <div class="v-count-label">Resuming in</div>
            <div class="v-count-num">5</div>
            <div class="v-count-label">seconds…</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(card);
  }
}

function showVictorySequence(user, targetMs, seconds, onResume) {
  ensureVictoryUI();
  const card = document.getElementById('victoryCard');
  const avatar = card.querySelector('.v-avatar');
  const name   = card.querySelector('.v-name');
  const sub    = card.querySelector('.v-sub');
  const countWrap = card.querySelector('.v-count');
  const countNum  = card.querySelector('.v-count-num');

  avatar.src = user?.photoUrl || '';
  name.textContent = `${user?.nickname || user?.username || 'Player'} won`;
  const mm = Math.floor((targetMs||0)/60000);
  const ss = String(Math.floor(((targetMs||0)%60000)/1000)).padStart(2,'0');
  sub.textContent = `Reached target ${mm}:${ss}`;
  countWrap.style.display = 'none';

  // sonido
  const winUrl = milestoneSoundUrl || collisionSoundUrl;
  if (winUrl) { try { new Audio(winUrl).play().catch(()=>{}); } catch {} }

  card.classList.add('show');

  clearTimeout(victoryTimer);
  victoryTimer = setTimeout(() => {
    // inicia countdown dentro del mismo card
    let left = Math.max(1, Number(seconds) || RESUME_COUNTDOWN_S);
    countNum.textContent = left;
    countWrap.style.display = 'inline-flex';

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      left -= 1;
      countNum.textContent = left;
      if (left <= 0) {
        clearInterval(countdownInterval);
        card.classList.remove('show');
        if (typeof onResume === 'function') onResume();
      }
    }, 1000);
  }, VICTORY_BANNER_MS);
}

function removeAllUsersAndResetSquares() {
  for (const sq of squares) {
    removeUserFromSquare(sq);
    sq.timeOnSquare = 0;
    sq.lastMilestone = 0;
  }
}

function clearLeaderboard() {
  const grid = document.querySelector('.leaderboard-grid');
  if (grid) grid.innerHTML = '';
  leaderboardEntries.length = 0;
  usersMap.clear();
}

function loadVictoryScores() {
  try { return JSON.parse(localStorage.getItem('victoryScoreboardV1')) || {}; }
  catch { return {}; }
}
function saveVictoryScores() {
  try { localStorage.setItem('victoryScoreboardV1', JSON.stringify(victoryScores)); } catch {}
}
function incrementVictoryScore(username, nickname, photoUrl) {
  const key = username;
  const entry = victoryScores[key] || {
    username, nickname: nickname || username, photoUrl: photoUrl || '', wins: 0
  };
  entry.nickname = nickname || entry.nickname;
  entry.photoUrl = photoUrl || entry.photoUrl;
  entry.wins += 1;
  victoryScores[key] = entry;
  saveVictoryScores();
  renderVictorySidebar();
}
function resetVictoryScoreboard() {
  victoryScores = {};
  saveVictoryScores();
  renderVictorySidebar();
}

function renderVictorySidebar() {
  const list = document.getElementById('victoryScoreList');
  if (!list) return;

  list.innerHTML = '';
  const top = Object.values(victoryScores)
    .sort((a,b)=> (b.wins - a.wins) || a.nickname.localeCompare(b.nickname))
    .slice(0,10);

  top.forEach((e, idx) => {
    const rank = idx + 1;
    const li = document.createElement('li');
    li.className = `vscore-item rank-${rank}`;

    const iconUrl = RANK_ICONS[rank];
    const rankDiv = iconUrl
    ? `<div class="vscore-rank with-img">
        <img class="vscore-rank-img" src="${iconUrl}" alt="#${rank}">
      </div>`
    : `<div class="vscore-rank">${rank}</div>`;

    li.innerHTML = `
      ${rankDiv}
      <img src="${e.photoUrl||''}" alt="" class="vscore-ava"/>
      <div class="vscore-meta">
        <div class="vscore-name">${e.nickname || e.username}</div>
        <div class="vscore-user">@${e.username}</div>
      </div>
      <div class="vscore-wins" title="Wins">${e.wins}</div>
    `;
    list.appendChild(li);
  });

  const btn = document.getElementById('resetVictoryScoreBtn');
  if (btn) btn.onclick = resetVictoryScoreboard;
}

document.addEventListener('DOMContentLoaded', renderVictorySidebar);

// Llama a esto cuando haya ganador
function cleanupAfterVictory(userForBanner) {
  prevShooting = shooting;
  shooting = false;
  clearBalls();
  clearLeaderboard();
  removeAllUsersAndResetSquares();

  victoryPhase = true;

  showVictorySequence(userForBanner, goalMs, RESUME_COUNTDOWN_S, () => {
    goalTriggered = false;
    goalWinnerUsername = null;

    victoryPhase = false;
    drainQueueToSquares();
    shooting = prevShooting;
  });
}

function checkGoalAndNotify() {
  if (goalMs == null || goalTriggered) return;
  if (!leaderboardEntries.length) return;

  // Ganador = cualquiera que haya alcanzado o superado la meta, con mayor tiempo total
  let candidate = null;
  for (const agg of leaderboardEntries) {
    if (agg._totalMs >= goalMs) {
      if (!candidate || agg._totalMs > candidate._totalMs) candidate = agg;
    }
  }
  if (!candidate) return;

  goalTriggered = true;
  goalWinnerUsername = candidate.username;

  // snapshot de datos del usuario antes de limpiar
  let userObj = null;
  for (const sq of squares) {
    if (sq.assignedUser && sq.assignedUser.username === candidate.username) {
      userObj = sq.assignedUser; break;
    }
  }
  if (!userObj) {
    userObj = { username: candidate.username, nickname: candidate.nickname || candidate.username, photoUrl: candidate.photoUrl || '' };
  }

  incrementVictoryScore(userObj.username, userObj.nickname, userObj.photoUrl);
  cleanupAfterVictory(userObj);

  // notifica al main/Electron
  try {
    window.figureflowOverlay?.sendToMain?.({ type: 'goal-won', value: { username: candidate.username, ms: goalMs } });
  } catch {}
}


function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  let progress = (timestamp - startTime);
  let t = ((progress * currentSpeed) % duration) / duration;

  squares.forEach(function(sq) {
    let tOffset = (t + sq.offset) % 1;
    let position = getPosition(currentShape, tOffset);
    sq.x = position.x;
    sq.y = position.y;
    sq.element.style.left = position.x + 'px';
    sq.element.style.top = position.y + 'px';

    if (sq.assignedUser) {
      sq.timeOnSquare += deltaTime;
      const totalTimeInSeconds = Math.floor(sq.timeOnSquare / 1000);
      sq.userTimeText.textContent = totalTimeInSeconds + 's';

      if (
        totalTimeInSeconds % 60 === 0 &&
        totalTimeInSeconds !== 0 &&
        sq.lastMilestone !== totalTimeInSeconds
      ) {
        const minutes = totalTimeInSeconds / 60;
        showNotification(sq.assignedUser, minutes);
        sq.lastMilestone = totalTimeInSeconds;
      }
    }
  });

  updateLeaderboardRanks();
  checkGoalAndNotify();

  if (shooting) {
    if (timestamp - lastShotTime > shotPause) {
      shootBall();
      lastShotTime = timestamp;
    }

    const mainRect = main.getBoundingClientRect();

    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];

      const prevX = ball.x, prevY = ball.y;
      ball.x += ball.dx * BALL_SPEED;
      ball.y += ball.dy * BALL_SPEED;

      // NaN/Infinity guard
      if (!Number.isFinite(ball.x) || !Number.isFinite(ball.y)) {
        removeBallAtIndex(i);
        continue;
      }

      ball.element.style.left = `${ball.x}px`;
      ball.element.style.top  = `${ball.y}px`;

      // TTL (bola viejita = fuera)
      if (timestamp - ball.createdAt > BALL_MAX_AGE_MS) {
        removeBallAtIndex(i);
        continue;
      }

      // Detección de bola "congelada"
      if (Math.abs(ball.x - prevX) < 0.01 && Math.abs(ball.y - prevY) < 0.01) {
        ball.stuckFrames = (ball.stuckFrames || 0) + 1;
        if (ball.stuckFrames > 30) { // ~0.5s a 60fps
          removeBallAtIndex(i);
          continue;
        }
      } else {
        ball.stuckFrames = 0;
      }

      // ======== COLISIONES ========
      let removedThisBall = false;

      for (let j = 0; j < squares.length; j++) {
        const sq = squares[j];
        if (isColliding(ball, sq)) {
          sq.element.classList.add('hit');
          playSound();

          sq.remainingHits = (sq.remainingHits || 1) - 1;

          if (sq.remainingHits <= 0) {
            createShatterEffect(ball);
            removeBallAtIndex(i);

            removeUserFromSquare(sq);
            assignNextUserFromQueue(sq);
          } else {
            // actualizar badge (texto + color)
            if (sq.hitsBadge) {
              styleHitsBadge(sq.hitsBadge, sq.remainingHits);
            } else if (sq.userImgWrap) {
              const badge = document.createElement('span');
              badge.className = 'hits-badge';
              sq.userImgWrap.appendChild(badge);
              sq.hitsBadge = badge;
              styleHitsBadge(badge, sq.remainingHits);
            }

            createParticleBurst(sq);
            removeBallAtIndex(i);
          }

          removedThisBall = true;
          break; // ¡sal del loop de squares! la bola ya no existe
        }
      }

      if (removedThisBall) continue;

      // ======== fuera de límites ========
      if (
        ball.x < -BALL_SIZE || ball.x > mainRect.width ||
        ball.y < -BALL_SIZE || ball.y > mainRect.height
      ) {
        removeBallAtIndex(i);
      }
    }
  }

  // ======== efectos ========
  for (let i = shatterPieces.length - 1; i >= 0; i--) {
    const piece = shatterPieces[i];
    const timeElapsed = timestamp - piece.createdAt;

    if (timeElapsed > piece.life) {
      piece.element.remove();
      shatterPieces.splice(i, 1);
      continue;
    }

    piece.x += piece.dx;
    piece.y += piece.dy;
    piece.element.style.left = piece.x + 'px';
    piece.element.style.top = piece.y + 'px';
    const opacity = 1 - timeElapsed / piece.life;
    piece.element.style.opacity = opacity;
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    const timeElapsed = timestamp - particle.createdAt;

    if (timeElapsed > particle.life) {
      particle.element.remove();
      particles.splice(i, 1);
      continue;
    }

    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.element.style.left = particle.x + 'px';
    particle.element.style.top = particle.y + 'px';

    const opacity = 1 - timeElapsed / particle.life;
    particle.element.style.opacity = opacity;
  }

  requestAnimationFrame(animate);
}

function removeBallAtIndex(i) {
  const b = balls[i];
  if (!b) return;
  if (b.element?.parentNode) b.element.remove();
  balls.splice(i, 1);
}

function getPosition(shape, t) {
    const width = main.clientWidth;
    const height = main.clientHeight;
    const playArea = {
        width: width * 0.5,
        height: height * 0.5,
        x: (width * 0.25) + 20,
        y: (height * 0.25) + 100
    };

    switch(shape) {
        case 'square':
            return getPolygonPosition(4, t, playArea);
        case 'diamond':
            return getPolygonPosition(4, t, playArea, Math.PI / 4);
        case 'triangle':
            return getPolygonPosition(3, t, playArea, -Math.PI / 2);
        case 'hexagon':
            return getPolygonPosition(6, t, playArea);
        case 'octagon':
            return getPolygonPosition(8, t, playArea);
        case 'circle':
            return getCirclePosition(t, playArea);
        case 'number8':
            return getFigure8Position(t, playArea);
        case 'infinity':
            return getInfinityPosition(t, playArea);
        case 'quatrefoil':
            return getQuatrefoilPosition(t, playArea);
        case 'curvilinearTriangle':
            return getCurvilinearTrianglePosition(t, playArea);
        case 'spirograph':
            return getSpirographPosition(t, playArea);
        case 'swirl':
            return getSwirlPosition(t, playArea);
        case 'plusSign':
            return getPlusPosition(t, playArea);
        case 'heart':
            return getHeartPosition(t, playArea);
    }
}

function getPolygonPosition(sides, t, playArea, rotationAngle = 0) {
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;
    const radius = Math.min(playArea.width, playArea.height) / 2;
    const angleStep = (2 * Math.PI) / sides;

    const totalLength = sides;
    const currentLength = t * totalLength;
    const sideIndex = Math.floor(currentLength);
    const sideT = currentLength - sideIndex;

    const angle1 = angleStep * sideIndex + rotationAngle;
    const angle2 = angleStep * (sideIndex + 1) + rotationAngle;

    const x1 = centerX + radius * Math.cos(angle1);
    const y1 = centerY + radius * Math.sin(angle1);
    const x2 = centerX + radius * Math.cos(angle2);
    const y2 = centerY + radius * Math.sin(angle2);

    return { x: x1 + (x2 - x1) * sideT - HALF_SQUARE, y: y1 + (y2 - y1) * sideT - HALF_SQUARE };
}

function getCirclePosition(t, playArea) {
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;
    const radius = Math.min(playArea.width, playArea.height) / 2;

    const angle = 2 * Math.PI * t - Math.PI / 2;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return { x: x - HALF_SQUARE, y: y - HALF_SQUARE };
}

function getFigure8Position(t, playArea) {
    const a = (Math.min(playArea.width, playArea.height) / 4) * 1.5;
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;

    const angle = 2 * Math.PI * t;
    const x = centerX + a * Math.sin(angle) * Math.cos(angle);
    const y = centerY + a * Math.sin(angle);

    return { x: x - HALF_SQUARE, y: y - HALF_SQUARE };
}

function getInfinityPosition(t, playArea) {
    const a = (Math.min(playArea.width, playArea.height) / 4) * 1.5;
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;
    const angle = 2 * Math.PI * t - Math.PI / 2;
    const denom = 1 + Math.cos(angle) * Math.cos(angle);
    const x = centerX + (a * Math.sin(angle)) / denom;
    const y = centerY + (a * Math.sin(angle) * Math.cos(angle)) / denom;

    return { x: x - HALF_SQUARE, y: y - HALF_SQUARE };
}

function getQuatrefoilPosition(t, playArea) {
    const a = (Math.min(playArea.width, playArea.height) / 4) * 1.5;
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;
    const angle = 2 * Math.PI * t;
    const x = centerX + a * Math.cos(2 * angle) * Math.cos(angle);
    const y = centerY + a * Math.cos(2 * angle) * Math.sin(angle);
    return { x: x - HALF_SQUARE, y: y - HALF_SQUARE };
}

function getCurvilinearTrianglePosition(t, playArea) {
    const a = (Math.min(playArea.width, playArea.height) / 6) * 1.5;
    const b = a / 2;
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;
    const angle = 2 * Math.PI * t;
    const x = centerX + a * Math.sin(angle) + b * Math.sin(3 * angle);
    const y = centerY + a * Math.cos(angle) + b * Math.cos(3 * angle);

    return { x: x - HALF_SQUARE, y: y - HALF_SQUARE };
}

function getSpirographPosition(t, playArea) {
    const R = 100;
    const r = 30;
    const d = 60;
    const centerX = playArea.x + playArea.width / 2;
    const centerY = (playArea.y + playArea.height / 2) - 100;
    const angle = 2 * Math.PI * t * 0.5;
    const x = centerX + (R + r) * Math.cos(angle) - d * Math.cos(((R + r) / r) * angle);
    const y = centerY + (R + r) * Math.sin(angle) - d * Math.sin(((R + r) / r) * angle);
    return { x: x - HALF_SQUARE, y: y - HALF_SQUARE };
}

function getSwirlPosition(t, playArea) {
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;
    const maxRadius = Math.min(playArea.width, playArea.height) / 2;
    const maxTurns = 2;
    const angle = maxTurns * 2 * Math.PI * t;
    const radius = (maxRadius / (maxTurns * 2 * Math.PI)) * angle;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return { x: x - HALF_SQUARE, y: y - HALF_SQUARE };
}

function getPlusPosition(t, playArea) {
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;

    // Previously: R = Math.min(playArea.width, playArea.height) / 4
    // Increase R by ~40%
    const R = (Math.min(playArea.width, playArea.height) / 4) * 1.4; 
    const w = R / 3; // half-thickness of the plus arms

    // Define vertices of the plus sign shape
    const vertices = [
        [centerX - w, centerY - R],
        [centerX + w, centerY - R],
        [centerX + w, centerY - w],
        [centerX + R, centerY - w],
        [centerX + R, centerY + w],
        [centerX + w, centerY + w],
        [centerX + w, centerY + R],
        [centerX - w, centerY + R],
        [centerX - w, centerY + w],
        [centerX - R, centerY + w],
        [centerX - R, centerY - w],
        [centerX - w, centerY - w],
    ];

    // Calculate perimeter
    let perimeter = 0;
    for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        const dx = vertices[j][0] - vertices[i][0];
        const dy = vertices[j][1] - vertices[i][1];
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    // Find position along perimeter
    const distance = t * perimeter;
    let accumulated = 0;
    for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        const x1 = vertices[i][0];
        const y1 = vertices[i][1];
        const x2 = vertices[j][0];
        const y2 = vertices[j][1];
        const segLength = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);

        if (accumulated + segLength >= distance) {
            const ratio = (distance - accumulated) / segLength;
            const x = x1 + (x2 - x1) * ratio;
            const y = y1 + (y2 - y1) * ratio;
            return { x: x - HALF_SQUARE, y: y - HALF_SQUARE };
        }
        accumulated += segLength;
    }

    // Fallback
    return { x: centerX - HALF_SQUARE, y: centerY - HALF_SQUARE };
}

function getHeartPosition(t, playArea) {
    const centerX = playArea.x + playArea.width / 2;
    const centerY = playArea.y + playArea.height / 2;
    const scale = (Math.min(playArea.width, playArea.height) / 30) * 0.9; 
    const angle = 2 * Math.PI * t;
    const x = centerX + scale * 16 * Math.pow(Math.sin(angle), 3);
    const y = centerY - scale * (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
    return { x: x - HALF_SQUARE, y: y - 60 };
}

function pickLocationForShot() {
  if (!shotLocationRandom) return shotLocation;
  let loc;
  do {
    loc = 1 + Math.floor(Math.random() * 8);    // 1..8
  } while (loc === lastRandomLocation && 8 > 1); // evita repetir el último
  lastRandomLocation = loc;
  return loc;
}

function getPlayArea() {
  const width = main.clientWidth;
  const height = main.clientHeight;
  return {
    width:  width * 0.5,
    height: height * 0.5,
    x: (width * 0.25) + 20,
    y: (height * 0.25) + 100
  };
}

function shootBall() {
  const ballElem = document.createElement('div');
  ballElem.classList.add('ball');
  main.appendChild(ballElem);

  const mainRect = main.getBoundingClientRect();
  let startX, startY;

  const loc = pickLocationForShot();
  switch (loc) {
    case 1: startX = mainRect.width / 2 - 7.5; startY = mainRect.height - 20; break;
    case 2: startX = mainRect.width - 20;      startY = mainRect.height - 20; break;
    case 3: startX = mainRect.width - 20;      startY = mainRect.height / 2 - 7.5; break;
    case 4: startX = mainRect.width - 20;      startY = 5;  break; // top-right
    case 5: startX = mainRect.width / 2 - 7.5; startY = 5;  break; // top-center
    case 6: startX = 5;                        startY = 5;  break; // top-left
    case 7: startX = 5;                        startY = mainRect.height / 2 - 7.5; break;
    case 8: startX = 5;                        startY = mainRect.height - 20; break;
  }

  // Apuntar al centro del playArea (con un pelín de jitter opcional)
  const pa = getPlayArea();
  const aimX = pa.x + pa.width / 2;
  const aimY = pa.y + pa.height / 2;
  let dx = (aimX - startX);
  let dy = (aimY - startY);

  // jitter suave para que no todos vayan exactamente al mismo punto
  const J = 0.12;
  dx += (Math.random()*2 - 1) * J * Math.abs(dx);
  dy += (Math.random()*2 - 1) * J * Math.abs(dy);

  const len = Math.hypot(dx, dy);
  if (!Number.isFinite(len) || len === 0) { dx = 0; dy = 1; } else { dx /= len; dy /= len; }

  const ball = { element: ballElem, x: startX, y: startY, dx, dy, createdAt: performance.now(), stuckFrames: 0 };
  ballElem.style.left = `${ball.x}px`;
  ballElem.style.top  = `${ball.y}px`;
  balls.push(ball);
}


function clearBalls() {
  for (let i = balls.length - 1; i >= 0; i--) {
    balls[i].element.remove();
  }
  balls.length = 0;
}

function isColliding(ball, square) {
    const ballRect = {
        x: ball.x,
        y: ball.y,
        width: 15,
        height: 15
    };

    const squareRect = square.element.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();

    const adjustedSquareRect = {
        x: squareRect.left - mainRect.left,
        y: squareRect.top - mainRect.top,
        width: squareRect.width,
        height: squareRect.height
    };

    return !(
        ballRect.x > adjustedSquareRect.x + adjustedSquareRect.width ||
        ballRect.x + ballRect.width < adjustedSquareRect.x ||
        ballRect.y > adjustedSquareRect.y + adjustedSquareRect.height ||
        ballRect.y + ballRect.height < adjustedSquareRect.y
    );
}

requestAnimationFrame(animate);

function applyShape(value, { resetSpeed = false } = {}) {
  currentShape = value;
  startTime = null;

  if (resetSpeed) {
    currentSpeed = 1;
  }

  const sel = document.getElementById('shapeSelector');
  if (sel && sel.value !== value) sel.value = value;
}

function applyTheme(value) {
  const isDark =
    value === true || value === 'dark' || value === '1' || value === 1;
  document.body.classList.toggle('dark-mode', isDark);
}

// ===================== Electron figureflowOverlay bridge =====================
(function setupElectronOverlayBridge() {
  if (!window.figureflowOverlay || typeof window.figureflowOverlay.onMessage !== 'function') return;

  window.addEventListener('DOMContentLoaded', () => {
    window.figureflowOverlay.sendToMain({ type: 'ready' });
  });

  window.figureflowOverlay.onMessage((msg) => {
    switch (msg?.type) {
      case 'set-theme':
        applyTheme(msg.value);
        break;

      case 'set-shape':
        applyShape(msg.value, { resetSpeed: false });
        break;

      case 'set-speed': {
        const v = Number(msg.value) || 1;
        currentSpeed = v;
        break;
      }

      case 'set-shot-pause': {
        const secs = Number(msg.value) || 2;
        shotPause = Math.max(0, secs * 1000);
        break;
      }

      case 'set-location': {
        if (msg.value === 'random') {
          shotLocationRandom = true;
        } else {
          const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
          shotLocationRandom = false;
          shotLocation = clamp(Number(msg.value) || 1, 1, 8);
        }
        break;
      }
      case 'set-sound-url': {
        const url = typeof msg.value === 'string' ? msg.value : msg?.value?.url;
        const ok = setCollisionSoundUrl(url);
        if (!ok) console.warn('[figureflowOverlay] set-sound-url inválido:', msg?.value);
        break;
      }
      case 'simulate':
        simulateGift(msg.value || {});
        break;

      case 'start':
        shooting = true;
        lastShotTime = performance.now();
        break;

      case 'stop':
        shooting = false;
        clearBalls();
        break;
      case 'set-goal-ms': {
        const v = Number(msg?.value);
        if (Number.isFinite(v) && v > 0) {
          goalMs = Math.floor(v);
          goalTriggered = false;
          goalWinnerUsername = null;
          saveGoalMs(goalMs);
        } else {
          console.warn('[figureflowOverlay] set-goal-ms inválido:', msg?.value);
        }
        break;
      }
      case 'clear-goal': {
        goalMs = null;
        goalTriggered = false;
        goalWinnerUsername = null;
        clearGoalPersisted();
        break;
      }
    }
  });
})();