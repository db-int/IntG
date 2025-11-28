let wordLists = {};
let currentLanguage = 'en';

const savedLanguageOnLoad = localStorage.getItem('wordleLanguage');
if (savedLanguageOnLoad) currentLanguage = savedLanguageOnLoad;

const languageConfigs = {
    en: { file: 'wordle.json', label: 'English' },
    es: { file: 'wordle_es.json', label: 'Español' },
    pl: { file: 'wordle_po.json', label: 'Polski' }
};

function getLanguageConfig(lang) {
    return languageConfigs[lang] || languageConfigs.en;
}

function getLanguageLabel(lang) {
    return getLanguageConfig(lang).label;
}

const _cacheByLang = new Map();

async function loadWordLists() {
    try {
        // Determine which JSON file to load based on language
        const { file: jsonFile } = getLanguageConfig(currentLanguage);
        const response = await fetch(`https://www.runchatcapture.com/${jsonFile}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Convert string keys to numbers and assign to wordLists
        wordLists = {};
        for (const [key, value] of Object.entries(data)) {
            wordLists[parseInt(key)] = value;
        }
        
        console.log(`Word lists loaded successfully for ${currentLanguage}:`, Object.keys(wordLists).map(k => `${k}: ${wordLists[k].length} words`));
        return true;
    } catch (error) {
        console.error('Failed to load word lists:', error);
        // Fallback to minimal word lists if API fails
        wordLists = {
            4: ["that","this","with","from","your","have","more","will","home","page","free","time","they","site","what","news","only","when","here","also","help","view","been","were","some","like","than","find","date","back","list","name","just","over","year","into","next","used","work","last","most","data","make","them","post","city","such","best","then","good","well","high","each","very","book","read","need","many","user","said","does","mail","full","life","know","days","part","real","item","must","made","line","send","type","take","area","want","long","code","show","even","much","sign","file","link","open","case","same","both","game","care","down","size","shop","text","rate","form","love","main","call","save","card","jobs","food","sale","room","join","west","look","left","team","week","note","live","plan","cost"],
            5: ["about","other","which","their","there","first","would","these","state","world","after","where","books","years","order","items","group","under","games","could","great","store","right","local","those","using","check","being","women","today","south","found","house","photo","power","while","three","total","place","think","since","guide","board","white","small","times","sites","level","hours","image","class","still","money","every","visit","tools","reply","value","press","learn","print","stock","point","sales","large","table","start","model","human","movie","going","study","staff","again","never","users","topic","below","party","legal","quote","story","young","field","paper","girls","night","issue","range","court","audio","light","write","offer","given","files","event","needs","might","month","major","areas","space","cards","child","enter","share","radio","until","color","track","least","trade","green","close","drive","short","means","daily","beach","costs","style","front","parts","early","miles","sound","works","rules","final","adult","thing","cheap","third","gifts","cover","often","watch","deals","words","heart","error","clear","makes","taken","known","cases","quick","whole","later","basic","shows","along","among","death","speed","brand","stuff","doing","loans","shoes","entry","notes","force","river","views","plans","build","types","lines","apply","asked","cross","weeks","lower","union","names","leave","teens","woman","cable","score","shown"],
            6: ["search", "online", "people", "health", "should", "system", "policy", "number", "please", "rights", "public", "school", "review", "united", "center", "travel", "report", "member", "before", "hotels", "office", "design", "posted", "within", "states", "family", "prices", "sports", "county", "access", "change", "rating", "during", "return", "events", "little", "movies", "source", "author", "around", "course", "canada", "credit", "estate", "select", "photos", "thread", "market", "really", "action", "series", "second", "forums", "better", "friend", "server", "issues", "street", "things", "person", "mobile", "offers", "recent", "stores", "memory", "social", "august", "create", "single", "latest", "status", "browse", "seller", "always", "result", "groups", "making", "future", "london", "become", "garden", "listed", "energy", "images", "notice", "others", "format", "months", "safety", "having", "common", "living", "called", "period", "window", "france", "region", "island", "record", "direct", "update", "either", "centre", "europe", "topics", "videos", "global", "player", "lyrics", "submit", "amount", "though", "thanks", "weight", "choose", "points", "camera", "domain", "beauty", "models", "simple", "friday", "annual", "google", "church"],
            7: ["contact", "service", "product", "support", "message", "through", "privacy", "company", "general", "january", "reviews", "program", "details", "because", "results", "address", "subject", "between", "special", "website", "project", "version", "section", "related", "members", "network", "systems", "without", "current", "control", "history", "account", "digital", "profile", "another", "quality", "listing", "content", "country", "private", "compare", "include", "college", "article", "provide", "process", "science", "english", "windows", "gallery", "however", "october", "library", "medical", "looking", "comment", "working", "against", "payment", "student", "problem", "options", "america", "example", "changes", "release", "request", "picture", "meeting", "similar", "schools", "million", "popular", "stories", "journal", "reports", "welcome", "central", "council", "archive", "society", "friends", "edition", "further", "updated", "already", "studies", "several", "display", "limited", "powered", "natural", "whether", "weather", "average", "records", "present", "written", "federal", "hosting", "tickets", "finance", "minutes", "reading", "usually", "percent", "getting", "germany", "various", "receive", "methods", "chapter", "manager", "michael", "florida"],
            8: ["business", "services", "products", "software", "research", "comments", "national", "internet", "shipping", "reserved", "security", "american", "computer", "download", "pictures", "personal", "location", "children", "students", "shopping", "previous", "property", "customer", "december", "training", "advanced", "category", "register", "november", "features", "industry", "provided", "required", "articles", "feedback", "complete", "standard", "programs", "language", "password", "question", "building", "february", "analysis", "possible", "problems", "interest", "learning", "delivery", "original", "includes", "messages", "provides", "specific", "director", "planning", "database", "official", "district", "calendar", "resource", "document", "material", "together", "function", "economic", "projects", "included", "received", "archives", "magazine", "policies", "position", "listings", "wireless", "purchase", "response", "practice", "hardware", "designed", "discount", "remember", "increase", "european", "activity", "although", "contents", "regional", "supplies", "exchange", "continue", "benefits", "anything", "mortgage", "solution", "addition", "clothing", "homepage", "military", "decision", "division", "actually", "saturday", "starting", "thursday", "consumer", "contract", "releases"],
            9: ["available", "copyright", "education", "community", "following", "resources", "including", "directory", "insurance", "different", "september", "questions", "financial", "equipment", "important", "something", "committee", "reference", "companies", "computers", "president", "australia", "agreement", "marketing", "solutions", "technical", "microsoft", "statement", "downloads", "subscribe", "treatment", "knowledge", "currently", "published", "corporate", "customers", "materials", "countries", "standards", "political", "advertise", "institute", "sponsored", "condition", "effective", "selection", "executive", "necessary", "according", "christmas", "furniture", "wednesday", "structure", "potential", "documents", "operating", "developed", "telephone", "therefore", "christian", "worldwide", "publisher", "excellent", "interface", "operation", "beautiful", "locations", "providing", "authority", "programme", "employees", "relations", "completed", "otherwise", "character", "functions", "submitted", "regarding", "increased", "beginning"],
            10: ["university", "management", "technology", "government", "department", "categories", "conditions", "experience", "activities", "additional", "washington", "california", "discussion", "collection", "conference", "individual", "everything", "production", "commercial", "newsletter", "registered", "protection", "employment", "commission", "electronic", "particular", "facilities", "statistics", "investment", "industrial", "associated", "foundation", "population", "navigation", "operations", "understand", "connection", "properties", "assessment", "especially", "considered", "enterprise", "processing", "resolution", "components", "assistance", "disclaimer", "membership", "background", "trademarks", "television", "interested", "throughout", "associates", "businesses", "restaurant", "procedures", "themselves", "evaluation", "references", "literature", "respective", "definition", "networking", "australian", "guidelines", "difference", "directions", "automotive", "successful", "publishing", "developing", "historical", "scientific", "functional", "monitoring", "dictionary", "accounting", "techniques", "permission", "generation", "characters", "apartments", "designated", "integrated", "compliance", "acceptance", "strategies", "affiliates", "multimedia", "leadership", "comparison", "determined", "statements", "completely", "electrical"]
        };
        return false;
    }
}

const autoBoardWidths = {
    4: 350,
    5: 350,
    6: 350,
    7: 410,
    8: 460,
    9: 500,
    10: 560
};

const UI_STRINGS = {
    en: {
        settings: "Settings",
        profileSettings: "Profile Settings",
        uploadProfileImg: "Upload Profile Image",
        removeProfileImg: "Remove",
        usernameLabel: "Username:",
        usernamePlaceholder: "Enter your username",

        gameSettings: "Game Settings",
        currentAnswer: "➤ Current Answer:",
        language: "Language:",
        playMode: "Play Mode:",
        individual: "Individual",
        group: "Group",
        requiredAgreedGuesses: "(Group) Required Agreed Guesses:",
        wordLength: "Word Length:",
        numberOfRows: "Number of Rows:",
        boardWidth: "Board Width:",
        keyboardVisibilityOff: "Keyboard Visibility Off:",
        streakVisibility: "Streak Visibility:",

        simulateActivity: "Simulate Activity",
        simulateAudienceGuesses: "Simulate Audience Guesses:",
        simulateGroupGuesses: "Simulate Group Guesses:",
        simulateGroupLoss: "Simulate Group Loss:",

        winningPopupSettings: "Winning Popup Settings",
        winningSoundUrl: "Winning Sound URL:",
        modalDuration: "Modal Duration (seconds):",
        testSound: "Test Sound",

        instructionPopupSettings: "Instruction Popup Settings",
        showAtRoundStart: "Show at Round Start:",
        displayDuration: "Display Duration (seconds):",
        instructionTextLabel: "Instruction Text:",
        gifUrlOptional: "GIF URL (optional):",
        testPopup: "Test Popup",

        ttsSettings: "Text-to-Speech Settings",
        ttsEnable: "Enable Text-to-Speech:",
        ttsVoice: "Voice:",
        ttsVolume: "Volume:",
        ttsRate: "Speech Rate:",
        ttsReadEveryWord: "Read Every Word Entered:",
        ttsRoundStartEnabled: "Round Start Announcements:",
        ttsRoundStartMessages: "Round Start Messages (separate with ;):",
        ttsGameWonEnabled: "Victory Announcements:",
        ttsGameWonMessages: "Victory Messages (separate with ;):",
        ttsGameplayEnabled: "Gameplay Announcements:",
        ttsGameplayInterval: "Announcement Interval (seconds):",
        ttsGameplayMessages: "Gameplay Messages (separate with ;):",
        testTTS: "Test TTS",

        newGame: "New Game",
        congrats: "Congratulations!",
        statisticsTitle: "STATISTICS",
        played: "Played",
        winPercent: "Win %",
        currentStreak: "Current Streak",
        maxStreak: "Max Streak",
        clearStats: "Clear",

        instructionDefault: `Guess the word to win! This is wordle with endless guesses.`,
    },

    es: {
        settings: "Configuración",
        profileSettings: "Perfil",
        uploadProfileImg: "Subir imagen de perfil",
        removeProfileImg: "Quitar",
        usernameLabel: "Usuario:",
        usernamePlaceholder: "Ingresa tu nombre",
        
        gameSettings: "Ajustes de Juego",
        currentAnswer: "➤ Respuesta actual:",
        language: "Idioma:",
        playMode: "Modo de juego:",
        individual: "Individual",
        group: "Grupo",
        requiredAgreedGuesses: "Aciertos requeridos (grupo):",
        wordLength: "Largo de la palabra:",
        numberOfRows: "Número de filas:",
        boardWidth: "Ancho del tablero:",
        keyboardVisibilityOff: "Ocultar teclado:",
        streakVisibility: "Mostrar racha:",

        simulateActivity: "Simular Actividad",
        simulateAudienceGuesses: "Simular intentos del chat:",
        simulateGroupGuesses: "Simular barra grupal:",
        simulateGroupLoss: "Simular derrota grupal:",

        winningPopupSettings: "Popup de Victoria",
        winningSoundUrl: "URL de sonido de victoria:",
        modalDuration: "Duración del popup (segundos):",
        testSound: "Probar sonido",

        instructionPopupSettings: "Popup de Instrucciones",
        showAtRoundStart: "Mostrar al iniciar ronda:",
        displayDuration: "Duración en pantalla (segundos):",
        instructionTextLabel: "Texto de instrucciones:",
        gifUrlOptional: "URL de GIF (opcional):",
        testPopup: "Probar popup",

        ttsSettings: "Texto a Voz",
        ttsEnable: "Activar Texto a Voz:",
        ttsVoice: "Voz:",
        ttsVolume: "Volumen:",
        ttsRate: "Velocidad de habla:",
        ttsReadEveryWord: "Leer cada palabra ingresada:",
        ttsRoundStartEnabled: "Anuncios de inicio de ronda:",
        ttsRoundStartMessages: "Mensajes de inicio (separar con ;):",
        ttsGameWonEnabled: "Anuncios de victoria:",
        ttsGameWonMessages: "Mensajes de victoria (separar con ;):",
        ttsGameplayEnabled: "Anuncios durante el juego:",
        ttsGameplayInterval: "Intervalo de anuncio (segundos):",
        ttsGameplayMessages: "Mensajes de juego (separar con ;):",
        testTTS: "Probar TTS",

        newGame: "Nueva Partida",
        congrats: "¡Felicidades!",
        statisticsTitle: "ESTADÍSTICAS",
        played: "Jugadas",
        winPercent: "% Victorias",
        currentStreak: "Racha actual",
        maxStreak: "Racha máxima",
        clearStats: "Borrar",

        instructionDefault: `¡Adivina la palabra para ganar! Esto es Wordle con intentos infinitos.`,
    },

    pl: {
        settings: "Ustawienia",
        profileSettings: "Profil",
        uploadProfileImg: "Prześlij obraz profilu",
        removeProfileImg: "Usuń",
        usernameLabel: "Nazwa użytkownika:",
        usernamePlaceholder: "Wpisz swoją nazwę",

        gameSettings: "Ustawienia Gry",
        currentAnswer: "➤ Aktualna odpowiedź:",
        language: "Język:",
        playMode: "Tryb gry:",
        individual: "Indywidualny",
        group: "Grupowy",
        requiredAgreedGuesses: "Wymagane trafienia (grupa):",
        wordLength: "Długość słowa:",
        numberOfRows: "Liczba rzędów:",
        boardWidth: "Szerokość planszy:",
        keyboardVisibilityOff: "Ukryj klawiaturę:",
        streakVisibility: "Pokaż serię:",

        simulateActivity: "Symulacja aktywności",
        simulateAudienceGuesses: "Symuluj zgadywanie czatu:",
        simulateGroupGuesses: "Pokaż pasek grupy:",
        simulateGroupLoss: "Symuluj przegraną grupy:",

        winningPopupSettings: "Okno wygranej",
        winningSoundUrl: "URL dźwięku wygranej:",
        modalDuration: "Czas trwania okna (sekundy):",
        testSound: "Test dźwięku",

        instructionPopupSettings: "Okno instrukcji",
        showAtRoundStart: "Pokaż na początku rundy:",
        displayDuration: "Czas wyświetlania (sekundy):",
        instructionTextLabel: "Instrukcja:",
        gifUrlOptional: "URL GIF (opcjonalnie):",
        testPopup: "Testuj okno",

        ttsSettings: "Text-to-Speech",
        ttsEnable: "Włącz syntezę mowy:",
        ttsVoice: "Głos:",
        ttsVolume: "Głośność:",
        ttsRate: "Tempo mowy:",
        ttsReadEveryWord: "Czytaj każde wpisane słowo:",
        ttsRoundStartEnabled: "Ogłoszenia startu rundy:",
        ttsRoundStartMessages: "Komunikaty startowe (oddziel.;):",
        ttsGameWonEnabled: "Ogłoszenia zwycięstwa:",
        ttsGameWonMessages: "Komunikaty zwycięstwa (oddziel.;):",
        ttsGameplayEnabled: "Ogłoszenia w trakcie gry:",
        ttsGameplayInterval: "Interwał ogłoszeń (sekundy):",
        ttsGameplayMessages: "Komunikaty gry (oddziel.;):",
        testTTS: "Testuj TTS",

        newGame: "Nowa gra",
        congrats: "Gratulacje!",
        statisticsTitle: "STATYSTYKI",
        played: "Rozegrane",
        winPercent: "Wygrane %",
        currentStreak: "Obecna passa",
        maxStreak: "Maks. passa",
        clearStats: "Wyczyść",

        instructionDefault: `Zgadnij słowo, aby wygrać! To jest Wordle z nieskończonymi próbami.`,
    },
};

// Game state
let targetWord = '';
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;
let usedSingleWords = new Set();
let hintRevealIndex = 0;
let autoStartRounds = false;
let overlayBackgroundUrl = null;
let maxRows = 6;
let wordLength = parseInt(localStorage.getItem('wordleWordLength') || '5', 10);
let boardWidth = 350; // Default board width
let guessFlow = 'down'; // Default guess flow (simplified - only down flow now)
let simulateGuessesInterval = null;
let simulateGuessesActive = false;
let simulateTyping = false;
let groupGuessBarActive = false;
let groupGuessStacks = {};
let groupGuessInterval = null;
let lastBarOrder = [];
let lastBarRects = {};
let requiredGuesses = 5; // Default value for required agreed guesses
let stackHeight = 220; // Default stack height in pixels
let playingUsers = [];
let currentGuessingUser = null; // Track the current user making a guess
let singlePlayerGuessCount = 0; // Track guesses in single player simulation
let groupModeGuessCount = 0; // Track guesses in group mode
let winningSoundUrl = 'https://www.myinstants.com/media/sounds/victory_6.mp3'; // URL for winning sound
let winningModalDuration = 5; // Duration in seconds for winning modal
let instructionPopupActive = false; // Whether to show instruction popup at round start
let instructionPopupDuration = 3; // Duration in seconds for instruction popup
let instructionPopupText = 'Guess the word to win!\nThis is wordle with endless guesses.'; // Instruction text
let instructionPopupGif = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHBlcWdrYjFvYW1hZWt3ZGg2eGw1YWlmZm80NHZ4ZWZ4OHpub3RxdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/62HRHz7zZZYThhTwEI/giphy.gif'; // URL for instruction GIF
let roundTransitioning = false;

let customWordBankEnabled = false;
let customWordBank = { 4:[], 5:[], 6:[], 7:[], 8:[], 9:[], 10:[] };

try {
  const savedEnabled = localStorage.getItem('wordleUseCustomWords');
  if (savedEnabled !== null) customWordBankEnabled = savedEnabled === '1';

  const savedBank = localStorage.getItem('wordleCustomWordsBank');
  if (savedBank) {
    const parsed = JSON.parse(savedBank);
    if (parsed && typeof parsed === 'object') {
      customWordBank = { ...customWordBank, ...parsed };
    }
  }
} catch {}

// === Round timer ===
let roundTimerSeconds = Number(localStorage.getItem('wordleRoundTimerSeconds') || '120'); // default 120s
let roundDeadlineTs = null;
let roundCountdownInterval = null;
let modalCloseTimeout = null; 

// TTS Settings
let ttsEnabled = false; // Whether TTS is enabled
let ttsVoice = ''; // Selected voice name
let ttsVolume = 50; // Volume (0-100)
let ttsRate = 10; // Speech rate (5-12, where 10 = 1.0 rate)
let ttsRoundStartEnabled = false; // Whether to announce round start
let ttsRoundStartTexts = ['Welcome to Wordle! Let\'s begin.', 'New round starting! Good luck!', 'Time to guess the word!']; // Round start messages
let ttsReadWords = false; // Whether to read every word entered
let ttsGameWonEnabled = false; // Whether to announce game won
let ttsGameWonTexts = ['Congratulations! You won!', 'Excellent work! Victory achieved!', 'Well done! You guessed it!']; // Game won messages
let ttsGameplayEnabled = false; // Whether to announce during gameplay
let ttsGameplayInterval = 30; // Interval in seconds for gameplay announcements
let ttsGameplayTexts = ['Keep going! You can do it!', 'Think carefully about your next guess.', 'You\'re doing great!']; // Gameplay messages
let ttsGameplayIntervalId = null; // Store interval ID for gameplay announcements
let availableVoices = []; // Store available voices

// TikTok Integration Settings
let tiktokPlayMode = 'individual'; // 'individual' or 'group'
let winningUser = null; // Track the user who guessed the winning word
// Individual mode best guess tracking
let individualBestGuess = null; // Store the best guess data for individual mode

// Group mode submitted guesses counter
let groupModeSubmittedGuesses = 0; // Track submitted guesses in group mode for loss condition

// DOM elements
const board = document.getElementById('board');
const messageDisplay = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');

// Track the last submitted word to prevent duplicates
let lastSubmittedWord = '';
let lastSubmittedUser = null;

// Track last username-comment pair to prevent consecutive duplicates
let lastUserComment = '';

// Function to update the current answer display in settings
function updateCurrentAnswerDisplay() {
    const answerDisplay = document.getElementById('current-answer-display');
    if (answerDisplay && targetWord) {
        answerDisplay.textContent = targetWord.toUpperCase();
    }
}

// Create a complete row with embedded HTML for profile image and letters
function createRowWithGuess(guess, photoUrl, username, result, rowIndex = null) {
  const row = document.createElement('div');
  row.classList.add('row');
  if (rowIndex !== null) {
    row.dataset.row = String(rowIndex);
  }

  let rowHTML = `
    <div class="tile profile-img-tile">
      <img class="profile-img-in-tile" src="${photoUrl}" alt="Profile">
      <div class="profile-username-overlay">${username}</div>
    </div>
  `;

  for (let i = 0; i < wordLength; i++) {
    const letter = guess[i] ? guess[i].toUpperCase() : '';
    const tileClass = result && result[i] ? `tile ${result[i]}` : 'tile';
    rowHTML += `<div class="${tileClass}">${letter}</div>`;
  }

  row.innerHTML = rowHTML;
  return row;
}

// Add a new guess row to the bottom and remove the top row
function addGuessRow(guess, photoUrl, username, result) {
    // Remove the top row
    const topRow = board.firstChild;
    if (topRow) {
        board.removeChild(topRow);
    }
    
    // Create and add new row at the bottom
    const newRow = createRowWithGuess(guess, photoUrl, username, result);
    board.appendChild(newRow);
}

// ============= LEADERBOARD STATE =============
const LB_STORAGE_KEY = 'wordleLeaderboardWins';
const LB_SHOW_KEY = 'wordleShowLeaderboard';
const AUTO_START_KEY = 'wordleAutoStart';

const winMap = new Map();
const leaderboardEntries = [];

function registerWinForUser(userObj, skipSave = false) {
    if (!userObj || !userObj.username) return;
    const uname = userObj.username;

    let agg = winMap.get(uname);
    if (!agg) {
        // <li class="vscore-item">
        const li = document.createElement('li');
        li.classList.add('vscore-item');

        // avatar
        const ava = document.createElement('img');
        ava.classList.add('vscore-ava');
        ava.src = userObj.photoUrl ||
            'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';

        // bloque de texto
        const metaWrap = document.createElement('div');
        metaWrap.classList.add('vscore-meta');

        const nameLine = document.createElement('div');
        nameLine.classList.add('vscore-name');
        nameLine.textContent = uname;

        const userLine = document.createElement('div');
        userLine.classList.add('vscore-user');
        userLine.textContent = ''; // si querés @usuario, ponelo acá

        metaWrap.appendChild(nameLine);
        metaWrap.appendChild(userLine);

        // wins chip
        const winsBox = document.createElement('div');
        winsBox.classList.add('vscore-wins');
        winsBox.textContent = '🏆 1';

        // montar
        li.appendChild(ava);
        li.appendChild(metaWrap);
        li.appendChild(winsBox);

        agg = {
            username: uname,
            wins: 1,
            rootEl: li,
            avaEl: ava,
            nameEl: nameLine,
            userEl: userLine,
            winsEl: winsBox,
        };

        winMap.set(uname, agg);
        leaderboardEntries.push(agg);
    } else {
        // sumar win
        agg.wins += 1;
        agg.winsEl.textContent = '🏆 ' + agg.wins;

        // refrescar avatar si hay una mejor url
        if (userObj.photoUrl) {
            agg.avaEl.src = userObj.photoUrl;
        }
    }

    updateLeaderboardRanks();

    if (!skipSave) {
        saveLeaderboardToStorage();
    }
}

function updateLeaderboardRanks() {
    // ordenar por cantidad de wins desc
    leaderboardEntries.sort((a, b) => b.wins - a.wins);

    const leaderboardGrid = document.querySelector('.leaderboard-grid');
    if (!leaderboardGrid) return;
    leaderboardGrid.innerHTML = '';

    // mostramos top 5
    const topEntries = leaderboardEntries.slice(0, 5);

    topEntries.forEach((agg, index) => {
        // limpiar clases rank previas
        agg.rootEl.classList.remove('rank-1','rank-2','rank-3');

        // según posición, agregamos clase visual
        const place = index + 1;
        if (place === 1) {
            agg.rootEl.classList.add('rank-1');
        } else if (place === 2) {
            agg.rootEl.classList.add('rank-2');
        } else if (place === 3) {
            agg.rootEl.classList.add('rank-3');
        }

        // asegurar texto del chip
        agg.winsEl.textContent = '🏆 ' + agg.wins;

        leaderboardGrid.appendChild(agg.rootEl);
    });
}

function resetLeaderboardAllTime() {
    const leaderboardGrid = document.querySelector('.leaderboard-grid');
    if (leaderboardGrid) leaderboardGrid.innerHTML = '';

    winMap.clear();
    leaderboardEntries.length = 0;
    localStorage.removeItem(LB_STORAGE_KEY);
}

function saveLeaderboardToStorage() {
    const arr = leaderboardEntries.map(agg => ({
        username: agg.username,
        photoUrl: agg.avaEl ? agg.avaEl.src : '',
        wins: agg.wins
    }));
    localStorage.setItem(LB_STORAGE_KEY, JSON.stringify(arr));
}

function loadLeaderboardFromStorage() {
    const raw = localStorage.getItem(LB_STORAGE_KEY);
    if (!raw) return;

    let arr;
    try {
        arr = JSON.parse(raw);
    } catch (e) {
        console.warn('bad leaderboard JSON', e);
        return;
    }

    if (!Array.isArray(arr)) return;

    // recrear cada usuario en memoria/DOM usando registerWinForUser
    arr.forEach(obj => {
        registerWinForUser(obj, /*skipSave*/ true);
    });

    updateLeaderboardRanks();
}

function applyLeaderboardVisibility(show) {
    const layoutWrapper = document.getElementById('layout-wrapper');
    if (!layoutWrapper) return;

    if (show) {
        layoutWrapper.classList.remove('hide-leaderboard');
    } else {
        layoutWrapper.classList.add('hide-leaderboard');
    }

    localStorage.setItem(LB_SHOW_KEY, show ? '1' : '0');
}

function loadAutoStartSetting() {
    const raw = localStorage.getItem(AUTO_START_KEY);
    if (raw === '0') {
        autoStartRounds = false;
    } else {
        autoStartRounds = true; // default
    }
}

function saveAutoStartSetting(val) {
    autoStartRounds = !!val;
    localStorage.setItem(AUTO_START_KEY, autoStartRounds ? '1' : '0');
}

function formatSeconds(total) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    const mm = m < 10 ? '0'+m : String(m);
    const ss = s < 10 ? '0'+s : String(s);
    return mm + ':' + ss;
}

function prepareEmptyBoard() {
    // bloquear guesses hasta que dé "Nueva Partida"
    isGameOver = true;

    // parar cualquier countdown viejo
    if (roundCountdownInterval) {
        clearInterval(roundCountdownInterval);
        roundCountdownInterval = null;
    }

    // limpiar tablero visual
    board.innerHTML = '';
    document.getElementById('game-container').style.maxWidth = `${boardWidth}px`;

    for (let i = 0; i < maxRows; i++) {
        const emptyRow = createRowWithGuess(
            '',
            'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg',
            '',
            null
        );
        board.appendChild(emptyRow);
    }

    // mensaje de “listo para arrancar”
    messageDisplay.textContent = 'Click "New Game" to start';

    // timer UI “estático”
    const rt = document.getElementById('round-timer-time');
    if (rt) {
        rt.textContent = formatSeconds(roundTimerSeconds || 0);
    }

    // resetear clases del teclado
    document.querySelectorAll('.key').forEach(key => {
        key.className = 'key';
        if (
            key.getAttribute('data-key') === 'enter' ||
            key.getAttribute('data-key') === 'backspace'
        ) {
            key.classList.add('key-wide');
        }
    });

    // no escogemos targetWord todavía
    // no startRoundCountdown()
}

function applyBackgroundImage(url) {
    if (url && url.trim() !== "") {
        document.body.style.backgroundImage = `url("${url}")`;
    } else {
        document.body.style.backgroundImage = "none";
    }
}

function wipeBoardAndKeyboardAndUnlockGuesses(opts = {}) {
    const { unlock = true } = opts; // unlock=true = comportamiento anterior; false = solo UI

    if (!board) return;

    // 1) limpiar tablero VISUAL
    board.innerHTML = '';

    document.documentElement.style.setProperty('--word-length', wordLength);
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.maxWidth = `${boardWidth}px`;
    }

    // reconstruir filas vacías con data-row correcto
    for (let i = 0; i < maxRows; i++) {
        const emptyRow = createRowWithGuess(
            '',
            'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg',
            '',
            null,
            i
        );
        board.appendChild(emptyRow);
    }

    // fila activa = última fila
    currentRow = maxRows - 1;
    currentTile = 0;

    // 2) limpiar teclado (quitar colores)
    document.querySelectorAll('.key').forEach(keyBtn => {
        const k = keyBtn.getAttribute('data-key');
        keyBtn.className = 'key';
        if (k === 'enter' || k === 'backspace') keyBtn.classList.add('key-wide');
        keyBtn.classList.remove('correct', 'present', 'absent');
    });

    // 3) ocultar avatar inicial en la fila activa
    const activeRow = board.querySelector(`.row[data-row="${currentRow}"]`);
    if (activeRow) {
        const imgTile = activeRow.querySelector('.profile-img-tile');
        const img = imgTile ? imgTile.querySelector('.profile-img-in-tile') : null;
        if (img) img.style.display = 'none';
    }

    if (unlock) {
        // 4) desbloquear duplicados y estado SOLO si pedimos unlock
        if (usedSingleWords && typeof usedSingleWords.clear === 'function') {
            usedSingleWords.clear();
        }
        lastSubmittedWord = '';
        lastSubmittedUser = null;

        // 5) reset hint progress
        hintRevealIndex = 0;

        // 6) limpiar jugadores activos de la ronda
        playingUsers = [];
        currentGuessingUser = null;
        winningUser = null;

        // permitir seguir jugando
        isGameOver = false;
    }

    // 7) limpiar mensaje UI
    if (messageDisplay) {
        messageDisplay.textContent = '';
    }

    console.log(`[wordle] Board/keyboard wiped. unlock=${unlock ? 'yes' : 'no'}; hint reset ${unlock ? 'applied' : 'skipped'}.`);
}

function proceedAfterModal() {
    // Respeta autoStartRounds
    if (autoStartRounds) {
        initializeGame();
    } else {
        prepareEmptyBoard();
    }
    roundTransitioning = false;
}

function forceCloseModalAndProceed() {
    const overlay = document.getElementById('winning-overlay');
    if (!overlay) return;

    overlay.classList.remove('show');
    if (modalCloseTimeout) {
        clearTimeout(modalCloseTimeout);
        modalCloseTimeout = null;
    }
    setTimeout(() => {
        proceedAfterModal();
    }, 300);
}

function setWordLengthPersist(len) {
  wordLength = Number(len);
  localStorage.setItem('wordleWordLength', String(wordLength));
  document.documentElement.style.setProperty('--word-length', wordLength);
}

// ============= Initialize the game =============
async function initializeGame() {
  stopGameplayAnnouncements?.();
  roundTransitioning = false;

  // reset reveal hints / bloqueo duplicados
  hintRevealIndex = 0;
  if (typeof usedSingleWords?.clear === 'function') usedSingleWords.clear();
  lastSubmittedWord = '';
  lastSubmittedUser = null;

  // reset estado de ronda
  board.innerHTML = '';
  playingUsers = [];
  currentGuessingUser = null;
  winningUser = null;
  singlePlayerGuessCount = 0;
  groupModeGuessCount = 0;
  groupModeSubmittedGuesses = 0;
  individualBestGuess = null;
  lastUserComment = '';
  isGameOver = false;

  // parar timer viejo si había
  if (roundCountdownInterval) {
    clearInterval(roundCountdownInterval);
    roundCountdownInterval = null;
  }

  // preparar layout visual base
  document.documentElement.style.setProperty('--word-length', wordLength);
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.style.maxWidth = `${boardWidth}px`;
  }

  // crear filas vacías
  for (let i = 0; i < maxRows; i++) {
    const emptyRow = createRowWithGuess(
        '',
        'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg',
        '',
        null,
        i // <<- añade el índice
    );
    board.appendChild(emptyRow);
  }


  // fila activa = la de abajo del todo en tu lógica endless
  currentRow = maxRows - 1;
  currentTile = 0;

  // limpiar mensaje
  messageDisplay.textContent = '';

  // ====== (1) decidir de dónde cargar palabras ======
  // Si el banco custom está habilitado y tiene palabras para la longitud actual,
  // no necesitamos cargar las listas por idioma.
  let mustLoadDefaultLists =
    !customWordBankEnabled ||
    !Array.isArray(customWordBank[wordLength]) ||
    customWordBank[wordLength].length === 0;

  // cargar listas por idioma sólo si las necesitamos
  if (mustLoadDefaultLists && (!wordLists[wordLength] || wordLists[wordLength].length === 0)) {
    messageDisplay.textContent = `Loading word lists for ${getLanguageLabel(currentLanguage)}...`;
    await loadWordLists();
    messageDisplay.textContent = '';
  }

  // ====== (2) elegir la pool y la targetWord ======
  const customPool = (customWordBankEnabled && Array.isArray(customWordBank[wordLength]))
    ? customWordBank[wordLength]
    : [];

  const pool = (customPool && customPool.length > 0)
    ? customPool
    : (wordLists[wordLength] || []); // fallback a tus listas por idioma

  if (pool.length > 0) {
    targetWord = pool[Math.floor(Math.random() * pool.length)];
    updateCurrentAnswerDisplay();
  } else {
    console.error('No words available for length:', wordLength);
    messageDisplay.textContent = `No words available for length ${wordLength}`;
    return;
  }

  // popup instrucciones + TTS inicio ronda
  if (instructionPopupActive) {
    setTimeout(() => {
      showInstructionPopup();
    }, 500);
  }

  setTimeout(() => {
    speakRoundStart?.();
    if (ttsEnabled && ttsGameplayEnabled) {
      startGameplayAnnouncements?.();
    }
  }, 1000);

  // resetear teclado visual
  document.querySelectorAll('.key').forEach(key => {
    key.className = 'key';
    const k = key.getAttribute('data-key');
    if (k === 'enter' || k === 'backspace') key.classList.add('key-wide');
  });

  startRoundCountdown();
  updateHeaderMargin?.();
}

function renderRoundTimerDisplay(totalSecondsLeft) {
    const rtWrapper = document.getElementById('round-timer');
    const rtTimeEl = document.getElementById('round-timer-time');
    if (!rtWrapper || !rtTimeEl) return;

    if (totalSecondsLeft <= 0) {
        rtTimeEl.textContent = "00:00";
        return;
    }

    const mins = Math.floor(totalSecondsLeft / 60);
    const secs = totalSecondsLeft % 60;
    const minsStr = mins < 10 ? '0' + mins : '' + mins;
    const secsStr = secs < 10 ? '0' + secs : '' + secs;

    rtTimeEl.textContent = `${minsStr}:${secsStr}`;
}

// === Helpers para el timer desde mensajes ===
function startRoundCountdown() {
  const timerWrapper = document.getElementById('round-timer');

  // matar cualquier intervalo previo
  if (roundCountdownInterval) {
    clearInterval(roundCountdownInterval);
    roundCountdownInterval = null;
  }

  // si no hay límite o es 0 → ocultar timer y listo
  if (!roundTimerSeconds || roundTimerSeconds <= 0) {
    if (timerWrapper) timerWrapper.classList.add('hidden');
    roundDeadlineTs = null;
    return;
  }

  // sí hay timer → mostrarlo
  if (timerWrapper) timerWrapper.classList.remove('hidden');

  // fijar deadline real en función del total configurado
  roundDeadlineTs = Date.now() + (roundTimerSeconds * 1000);

  // pinto el valor inicial calculado desde el deadline
  const initLeft = Math.max(0, Math.ceil((roundDeadlineTs - Date.now()) / 1000));
  renderRoundTimerDisplay(initLeft);

  // tick leyendo SIEMPRE desde roundDeadlineTs
  roundCountdownInterval = setInterval(() => {
    if (isGameOver) {
      clearInterval(roundCountdownInterval);
      roundCountdownInterval = null;
      return;
    }

    const left = Math.max(0, Math.ceil((roundDeadlineTs - Date.now()) / 1000));

    if (left <= 0) {
      renderRoundTimerDisplay(0);
      clearInterval(roundCountdownInterval);
      roundCountdownInterval = null;
      if (!isGameOver) endRoundAsLoss();
      return;
    }

    renderRoundTimerDisplay(left);
  }, 1000);
}

function adjustRoundTimer(deltaSecs) {
  const delta = Number(deltaSecs) || 0;

  // Si hay un contador activo, ajusta el tiempo restante
  if (roundCountdownInterval && roundDeadlineTs) {
    const now = Date.now();
    let left = Math.max(0, Math.ceil((roundDeadlineTs - now) / 1000));
    let newLeft = Math.max(0, left + delta);

    console.log('[timer] adjustRoundTimer: left=%s, delta=%s, newLeft=%s', left, delta, newLeft);

    if (newLeft <= 0) {
      renderRoundTimerDisplay(0);
      clearInterval(roundCountdownInterval);
      roundCountdownInterval = null;
      endRoundAsLoss?.();
      return;
    }

    // asegurar que el wrapper esté visible si hay tiempo > 0
    const timerWrapper = document.getElementById('round-timer');
    if (timerWrapper) timerWrapper.classList.remove('hidden');

    // recalcular deadline y refrescar display inmediato
    roundDeadlineTs = now + (newLeft * 1000);
    renderRoundTimerDisplay(newLeft);
  } else {
    // No hay contador activo: ajustar el total base para próximas rondas (sin arrancar ahora)
    const newBase = Math.max(0, (Number(roundTimerSeconds) || 0) + delta);
    roundTimerSeconds = newBase;
    localStorage.setItem('wordleRoundTimerSeconds', String(newBase));
    console.log('[timer] adjustRoundTimer (sin contador): newBase=%s', newBase);
  }
}

function endRoundAsLoss() {
    // marcamos fin de juego para bloquear guesses nuevos
    isGameOver = true;

    // paramos el interval del timer
    if (roundCountdownInterval) {
        clearInterval(roundCountdownInterval);
        roundCountdownInterval = null;
    }

    // mostramos modal de derrota
    showLosingModal();
}

function applyLanguageToUI(lang) {
  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  // --- Títulos y headers ---
  const mainHeader = document.querySelector(".settings-header h2");
  if (mainHeader) mainHeader.textContent = t.settings;

  const sectionHeaders = document.querySelectorAll(
    ".settings-section-header h3"
  );
  if (sectionHeaders[0]) sectionHeaders[0].textContent = t.profileSettings;
  if (sectionHeaders[1]) sectionHeaders[1].textContent = t.gameSettings;
  if (sectionHeaders[2]) sectionHeaders[2].textContent = t.simulateActivity;
  if (sectionHeaders[3]) sectionHeaders[3].textContent = t.winningPopupSettings;
  if (sectionHeaders[4])
    sectionHeaders[4].textContent = t.instructionPopupSettings;
  if (sectionHeaders[5]) sectionHeaders[5].textContent = t.ttsSettings;

  // --- Profile Settings ---
  const uploadBtn = document.querySelector(".upload-btn");
  if (uploadBtn) uploadBtn.textContent = t.uploadProfileImg;

  const removeBtn = document.getElementById("remove-profile");
  if (removeBtn) removeBtn.textContent = t.removeProfileImg;

  const usernameLbl = document.querySelector('label[for="profile-username"]');
  if (usernameLbl) usernameLbl.textContent = t.usernameLabel;

  const usernameInput = document.getElementById("profile-username");
  if (usernameInput) {
    usernameInput.placeholder = t.usernamePlaceholder;
  }

  // --- Game Settings ---
  // current answer label: está justo ANTES del div#current-answer-display
  const currentAnswerDisplay = document.getElementById(
    "current-answer-display"
  );
  if (currentAnswerDisplay) {
    const labelEl = currentAnswerDisplay.previousElementSibling;
    if (labelEl && labelEl.tagName === "LABEL") {
      labelEl.textContent = t.currentAnswer;
    }
  }

  const langLabel = document.querySelector('label[for="language-select"]');
  if (langLabel) langLabel.textContent = t.language;

  const wordLengthLbl = document.querySelector('label[for="word-length"]');
  if (wordLengthLbl) wordLengthLbl.textContent = t.wordLength;

  const rowCountLbl = document.querySelector('label[for="row-count"]');
  if (rowCountLbl) rowCountLbl.textContent = t.numberOfRows;

  const boardWidthLbl = document.querySelector('label[for="board-width"]');
  if (boardWidthLbl) boardWidthLbl.textContent = t.boardWidth;

  const kbVisLbl = document.querySelector(
    'label[for="keyboard-visibility-off"]'
  );
  if (kbVisLbl) kbVisLbl.textContent = t.keyboardVisibilityOff;

  const streakLbl = document.querySelector('label[for="streak-visibility"]');
  if (streakLbl) streakLbl.textContent = t.streakVisibility;

  // Play mode (aunque lo tengas oculto con display:none)
  const playModeLbl = document.querySelector('label[for="tiktok-play-mode"]');
  if (playModeLbl) playModeLbl.textContent = t.playModeLabel;

  const playModeSel = document.getElementById("tiktok-play-mode");
  if (playModeSel && playModeSel.options) {
    if (playModeSel.options[0])
      playModeSel.options[0].textContent = t.individualMode;
    if (playModeSel.options[1])
      playModeSel.options[1].textContent = t.groupMode;
  }

  // --- Simulate Activity ---
  const simGuessLbl = document.querySelector('label[for="simulate-guesses"]');
  if (simGuessLbl) simGuessLbl.textContent = t.simulateAudienceGuesses;

  const groupGuessBarLbl = document.querySelector(
    'label[for="group-guess-bar"]'
  );
  if (groupGuessBarLbl)
    groupGuessBarLbl.textContent = t.simulateGroupGuesses;

  const groupGuessLossLbl = document.querySelector(
    'label[for="group-guess-loss"]'
  );
  if (groupGuessLossLbl) groupGuessLossLbl.textContent = t.simulateGroupLoss;

  // --- Winning Popup Settings ---
  const winSoundLbl = document.querySelector(
    'label[for="winning-sound-url"]'
  );
  if (winSoundLbl) winSoundLbl.textContent = t.winningSoundUrl;

  const modalDurLbl = document.querySelector(
    'label[for="winning-modal-duration"]'
  );
  if (modalDurLbl) modalDurLbl.textContent = t.modalDuration;

  const testWinBtn = document.getElementById("test-winning-sound");
  if (testWinBtn) testWinBtn.textContent = t.testSound;

  // --- Instruction Popup Settings ---
  const instrActiveLbl = document.querySelector(
    'label[for="instruction-popup-active"]'
  );
  if (instrActiveLbl) instrActiveLbl.textContent = t.showAtRoundStart;

  const instrDurLbl = document.querySelector(
    'label[for="instruction-popup-duration"]'
  );
  if (instrDurLbl) instrDurLbl.textContent = t.displayDuration;

  const instrTextLbl = document.querySelector(
    'label[for="instruction-popup-text"]'
  );
  if (instrTextLbl) instrTextLbl.textContent = t.instructionTextLabel;

  const gifUrlLbl = document.querySelector(
    'label[for="instruction-popup-gif"]'
  );
  if (gifUrlLbl) gifUrlLbl.textContent = t.gifUrlOptional;

  const testPopupBtn = document.getElementById("test-instruction-popup");
  if (testPopupBtn) testPopupBtn.textContent = t.testPopup;

  // --- TTS Settings ---
  const ttsEnableLbl = document.querySelector('label[for="tts-enabled"]');
  if (ttsEnableLbl) ttsEnableLbl.textContent = t.ttsEnable;

  const ttsVoiceLbl = document.querySelector('label[for="tts-voice"]');
  if (ttsVoiceLbl) ttsVoiceLbl.textContent = t.ttsVoice;

  const ttsVolumeLbl = document.querySelector('label[for="tts-volume"]');
  if (ttsVolumeLbl) ttsVolumeLbl.textContent = t.ttsVolume;

  const ttsRateLbl = document.querySelector('label[for="tts-rate"]');
  if (ttsRateLbl) ttsRateLbl.textContent = t.ttsRate;

  const ttsReadWordsLbl = document.querySelector(
    'label[for="tts-read-words"]'
  );
  if (ttsReadWordsLbl)
    ttsReadWordsLbl.textContent = t.ttsReadEveryWord;

  const ttsRoundStartLbl = document.querySelector(
    'label[for="tts-round-start-enabled"]'
  );
  if (ttsRoundStartLbl)
    ttsRoundStartLbl.textContent = t.ttsRoundStartEnabled;

  const ttsRoundStartTextsLbl = document.querySelector(
    'label[for="tts-round-start-texts"]'
  );
  if (ttsRoundStartTextsLbl)
    ttsRoundStartTextsLbl.textContent = t.ttsRoundStartMessages;

  const ttsGameWonLbl = document.querySelector(
    'label[for="tts-game-won-enabled"]'
  );
  if (ttsGameWonLbl)
    ttsGameWonLbl.textContent = t.ttsGameWonEnabled;

  const ttsGameWonTextsLbl = document.querySelector(
    'label[for="tts-game-won-texts"]'
  );
  if (ttsGameWonTextsLbl)
    ttsGameWonTextsLbl.textContent = t.ttsGameWonMessages;

  const ttsGameplayLbl = document.querySelector(
    'label[for="tts-gameplay-enabled"]'
  );
  if (ttsGameplayLbl)
    ttsGameplayLbl.textContent = t.ttsGameplayEnabled;

  const ttsGameplayIntervalLbl = document.querySelector(
    'label[for="tts-gameplay-interval"]'
  );
  if (ttsGameplayIntervalLbl)
    ttsGameplayIntervalLbl.textContent = t.ttsGameplayInterval;

  const ttsGameplayTextsLbl = document.querySelector(
    'label[for="tts-gameplay-texts"]'
  );
  if (ttsGameplayTextsLbl)
    ttsGameplayTextsLbl.textContent = t.ttsGameplayMessages;

  const testTTSBtn = document.getElementById("test-tts");
  if (testTTSBtn) testTTSBtn.textContent = t.testTTS;

  // --- Botones / overlays / estadísticas ---
  const newGameBtn = document.getElementById("new-game-btn");
  if (newGameBtn) newGameBtn.textContent = t.newGame;

  const winningTitle = document.getElementById("winning-title");
  if (winningTitle) winningTitle.textContent = t.congrats;

  const statsHeaderTitle = document.querySelector(
    "#statistics-card .statistics-header h3"
  );
  if (statsHeaderTitle) statsHeaderTitle.textContent = t.statisticsTitle;

  const playedLabel = document.querySelector("#played-count + .stat-label");
  if (playedLabel) playedLabel.textContent = t.played;

  const winPctLabel = document.querySelector(
    "#win-percentage + .stat-label"
  );
  if (winPctLabel) winPctLabel.textContent = t.winPercent;

  const currStreakLabel = document.querySelector(
    "#current-streak + .stat-label"
  );
  if (currStreakLabel) currStreakLabel.textContent = t.currentStreak;

  const maxStreakLabel = document.querySelector(
    "#max-streak + .stat-label"
  );
  if (maxStreakLabel) maxStreakLabel.textContent = t.maxStreak;

  const clearStatsBtn = document.getElementById("clear-statistics");
  if (clearStatsBtn) clearStatsBtn.textContent = t.clearStats;

  // --- Textareas con defaults solo si el user NO tocó el texto ---
  const instrTA = document.getElementById("instruction-popup-text");
  if (instrTA && !instrTA._userEdited) {
    instrTA.value = t.instructionDefault;
  }
}

function applyLeaderboardVisibility(show) {
    const layoutWrapper = document.getElementById('layout-wrapper');
    if (!layoutWrapper) return;

    if (show) {
        layoutWrapper.classList.remove('hide-leaderboard');
    } else {
        layoutWrapper.classList.add('hide-leaderboard');
    }

    localStorage.setItem(LB_SHOW_KEY, show ? '1' : '0');
}

// Unified guess processing function
function processGuess(guess, photoUrl, username) {
    if (isGameOver) {
        console.log("Guess ignored, round is over.");
        return;
    }
    if (!guess || guess.length !== wordLength || isGameOver) {
        return;
    }
    
    guess = guess.toLowerCase();
    
    // Speak the word if TTS is enabled for reading words
    speakWord(guess);
    
    // Check the guess against the target word
    const result = checkGuess(guess);
    
    // Add the guess row to the board with embedded data
    addGuessRow(guess, photoUrl, username, result);
    
    // Update keyboard colors
    updateKeyboard(guess, result);
    
    // Check if the game is won
    if (guess === targetWord) {
        // Set the winning user data for the modal
        winningUser = {
            username: username,
            photoUrl: photoUrl,
            guessedWord: guess
        };
        
        showMessage("Wonderful!");
        isGameOver = true;
        
        // Stop gameplay announcements and speak victory message
        stopGameplayAnnouncements();
        setTimeout(() => {
            speakGameWon();
        }, 500); // Small delay after "Wonderful!" message
        
        showWinningModal(targetWord);
        
        // Clear the group guess bar on win
        groupGuessStacks = {};
        lastBarOrder = [];
        lastBarRects = {};
        renderGroupGuessBarChart();
        
        // Clear the individual best guess on win
        individualBestGuess = null;
    } else {
        // Increment group mode submitted guesses counter
        const isGroupMode = document.getElementById('group-guess-bar-chart').style.display !== 'none';
        if (isGroupMode) {
            groupModeSubmittedGuesses++;
        }
        
        // Check for group mode loss condition
        if (isGroupMode && (groupModeSubmittedGuesses >= maxRows)) {
            // Clear all group guess stacks on loss
            groupGuessStacks = {};
            lastBarOrder = [];
            lastBarRects = {};
            renderGroupGuessBarChart();
            showLossModal(targetWord);
            return;
        }
    }
}

// Handle host guess from input field
function handleHostGuess() {
    const hostInput = document.getElementById('host-guess-input');
    if (!hostInput) return;
    
    const guess = hostInput.value.trim();
    if (guess.length !== wordLength) {
        showMessage(`Guess must be ${wordLength} letters`);
        return;
    }
    
    // Clear the input
    hostInput.value = '';
    
    // Get host profile data
    const hostPhotoUrl = localStorage.getItem('wordleProfileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
    const hostUsername = getCurrentUsername();
    
    // Process the guess
    processGuess(guess, hostPhotoUrl, hostUsername);
}

// Update keyboard colors based on guess result
function updateKeyboard(guess, result) {
    for (let i = 0; i < wordLength; i++) {
        const letter = guess[i].toLowerCase();
        const key = document.querySelector(`.key[data-key="${letter}"]`);
        
        if (key) {
            // Only upgrade the key status (absent -> present -> correct)
            if (result[i] === 'correct') {
                key.className = 'key correct';
            } else if (result[i] === 'present' && !key.classList.contains('correct')) {
                key.className = 'key present';
            } else if (!key.classList.contains('correct') && !key.classList.contains('present')) {
                key.className = 'key absent';
            }
        }
    }
}

// Window function for external guess processing
window.submitExternalGuess = function(guess, photoUrl, username) {
    // Process the guess directly with embedded data
    processGuess(guess, photoUrl, username);
};

// Add event listener for winning modal
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('winning-overlay');
    if (overlay && e.target === overlay && overlay.classList.contains('show')) {
        forceCloseModalAndProceed();
    }
});

// Cerrar modal con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('winning-overlay');
        if (overlay && overlay.classList.contains('show')) {
            forceCloseModalAndProceed();
        }
    }
});

// Add escape key listener for winning modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('winning-overlay');
        if (overlay && overlay.classList.contains('show')) {
            overlay.classList.remove('show');
            setTimeout(() => {
                initializeGame();
            }, 300);
        }
    }
});

// Settings Panel Functionality
document.addEventListener('DOMContentLoaded', function() {
    // 1. cargar leaderboard de localStorage
    loadLeaderboardFromStorage();

    // 2. cargar preferencia de auto start (antes de init settings, para que el checkbox salga bien)
    loadAutoStartSetting();

    // 3. inicializar settings (esto también aplica visibilidad del leaderboard)
    //    ojo: ya NO necesitamos tu setInterval checkSettingsPanel raro,
    //    porque en este punto el DOM ya está montado.
    initializeSettingsPanel();

    // 4. enganchar el botón "Nueva Partida"
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            initializeGame();
        });
    }

    // 5. decidir qué mostrar al cargar:
    //    - si autoStartRounds está ON => arrancamos partida normal
    //    - si está OFF => solo preparamos el tablero vacío bloqueado
    if (autoStartRounds) {
        initializeGame();
    } else {
        prepareEmptyBoard();
    }
});


function initializeSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    const settingsToggle = document.getElementById('settings-toggle');
    const closeSettings = document.getElementById('close-settings');
    const sectionHeaders = document.querySelectorAll('.settings-section-header');
    const languageSelect = document.getElementById('language-select');
    const wordLengthSelect = document.getElementById('word-length');
    if (wordLengthSelect) wordLengthSelect.value = String(wordLength);
    const rowCountInput = document.getElementById('row-count');
    const decreaseRowsBtn = document.getElementById('decrease-rows');
    const increaseRowsBtn = document.getElementById('increase-rows');
    const boardWidthInput = document.getElementById('board-width');
    const decreaseWidthBtn = document.getElementById('decrease-width');
    const increaseWidthBtn = document.getElementById('increase-width');
    const guessFlowSelect = document.getElementById('guess-flow');
    const requiredGuessesInput = document.getElementById('required-guesses');
    const decreaseGuessesBtn = document.getElementById('decrease-guesses');
    const increaseGuessesBtn = document.getElementById('increase-guesses');
    const stackHeightInput = document.getElementById('stack-height');
    const decreaseHeightBtn = document.getElementById('decrease-height');
    const increaseHeightBtn = document.getElementById('increase-height');
    const roundTimerInput = document.getElementById('round-timer-seconds');
    const decreaseRoundTimerBtn = document.getElementById('decrease-round-timer');
    const increaseRoundTimerBtn = document.getElementById('increase-round-timer');
    const showLeaderboardCheckbox = document.getElementById('show-leaderboard');
    const autoStartCheckbox       = document.getElementById('auto-start-rounds');

    if (showLeaderboardCheckbox) {
        const savedShow = localStorage.getItem(LB_SHOW_KEY);
        if (savedShow === '0') {
            showLeaderboardCheckbox.checked = false;
        } else {
            showLeaderboardCheckbox.checked = true;
        }

        applyLeaderboardVisibility(showLeaderboardCheckbox.checked);

        showLeaderboardCheckbox.addEventListener('change', () => {
            applyLeaderboardVisibility(showLeaderboardCheckbox.checked);
        });
    }

    loadAutoStartSetting();
    if (autoStartCheckbox) {
        autoStartCheckbox.checked = autoStartRounds;
        autoStartCheckbox.addEventListener('change', () => {
            saveAutoStartSetting(autoStartCheckbox.checked);
        });
    }

    // Load saved language setting
    const savedLanguage = localStorage.getItem('wordleLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        if (languageSelect) {
            languageSelect.value = currentLanguage;
        }
    }
    applyLanguageToUI(currentLanguage);

    if (roundTimerInput) {
        roundTimerInput.value = roundTimerSeconds; // usar global

        function applyRoundTimer(newVal) {
            if (newVal < 0) newVal = 0;
            if (newVal > 600) newVal = 600;

            roundTimerSeconds = newVal;
            roundTimerInput.value = newVal;

            localStorage.setItem('wordleRoundTimerSeconds', String(newVal));
        }

        roundTimerInput.addEventListener('change', () => {
            applyRoundTimer(parseInt(roundTimerInput.value, 10) || 0);
        });

        decreaseRoundTimerBtn.addEventListener('click', () => {
            applyRoundTimer((parseInt(roundTimerInput.value, 10) || 0) - 1);
        });

        increaseRoundTimerBtn.addEventListener('click', () => {
            applyRoundTimer((parseInt(roundTimerInput.value, 10) || 0) + 1);
        });
    }

    const instructionTA = document.getElementById("instruction-popup-text");
    if (instructionTA) {
        instructionTA.addEventListener("input", (e) => {
            e.target._userEdited = true;
        });
    }
    const rsTA = document.getElementById("tts-round-start-texts");
    if (rsTA) {
        rsTA.addEventListener("input", (e) => {
            e.target._userEdited = true;
        });
    }
    const vicTA = document.getElementById("tts-game-won-texts");
    if (vicTA) {
        vicTA.addEventListener("input", (e) => {
            e.target._userEdited = true;
        });
    }
    const gpTA = document.getElementById("tts-gameplay-texts");
    if (gpTA) {
        gpTA.addEventListener("input", (e) => {
            e.target._userEdited = true;
        });
    }

    // Handle language change
    if (languageSelect) {
        languageSelect.addEventListener('change', async () => {
            const newLanguage = languageSelect.value;
            if (newLanguage !== currentLanguage) {
                currentLanguage = newLanguage;
                localStorage.setItem('wordleLanguage', currentLanguage);
                
                // Show loading message
                messageDisplay.textContent = 'Loading new language...';
                
                await loadWordLists();
                initializeGame();
                applyLanguageToUI(currentLanguage);

                const t = UI_STRINGS[currentLanguage] || UI_STRINGS.en;

                const textArea = document.getElementById('instruction-popup-text');
                if (textArea && !textArea._userEdited) {
                    instructionPopupText = t.instructionDefault;
                    textArea.value = t.instructionDefault;
                    localStorage.setItem('wordleInstructionPopupText', instructionPopupText);
                }
                
                showMessage(`Language changed to ${currentLanguage === 'es' ? 'Español' : 'English'}`);
            }
        });
    }

    // Toggle settings panel
    settingsToggle.addEventListener('click', () => {
        let turnedOff = false;
        if (simulateGuessesActive) {
            simulateGuessesStop();
            const simulateGuessesCheckbox = document.getElementById('simulate-guesses');
            if (simulateGuessesCheckbox) simulateGuessesCheckbox.checked = false;
            turnedOff = true;
        }
        if (groupGuessBarActive) {
            // Check if this is TikTok group mode (don't turn it off)
            const tiktokPlayModeSelect = document.getElementById('tiktok-play-mode');
            const isTikTokGroupMode = tiktokPlayModeSelect && tiktokPlayModeSelect.value === 'group';
            
            if (!isTikTokGroupMode) {
                // This is simulation group mode, turn it off
                stopGroupGuessBar();
                const groupGuessBarCheckbox = document.getElementById('group-guess-bar');
                if (groupGuessBarCheckbox) groupGuessBarCheckbox.checked = false;
                const groupLossCheckbox = document.getElementById('group-guess-loss');
                if (groupLossCheckbox) groupLossCheckbox.checked = false;
                turnedOff = true;
            }
        }
        if (turnedOff) unsetCogSimulateActive();
        settingsPanel.classList.toggle('open');
        
        // Update current answer display when opening settings
        if (settingsPanel.classList.contains('open')) {
            updateCurrentAnswerDisplay();
            
            // Ensure keyboard visibility is maintained if TikTok group mode is active
            const keyboard = document.querySelector('.keyboard');
            if (keyboard && keyboard.hasAttribute('data-group-mode-hidden')) {
                keyboard.style.visibility = 'hidden';
            }
        }
    });

    // Close settings panel
    closeSettings.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
    });

    // Initialize all sections as collapsed
    sectionHeaders.forEach(header => {
        header.classList.add('collapsed');
        
        // Toggle section content
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
        });
    });

    // Handle word length change
    wordLengthSelect.addEventListener('change', () => {
        const newLen = parseInt(wordLengthSelect.value, 10);

        // <<< guarda en localStorage y actualiza CSS var
        setWordLengthPersist(newLen);

        // ajustar board width auto si aplica
        if (autoBoardWidths[wordLength]) {
            boardWidth = autoBoardWidths[wordLength];
            boardWidthInput.value = boardWidth;
            const gc = document.getElementById('game-container');
            if (gc) gc.style.maxWidth = `${boardWidth}px`;
        }

        // reiniciar juego con la nueva longitud
        initializeGame();
    });


    // Handle row count changes
    function updateRowCount(newCount) {
        if (newCount >= 3) {
            maxRows = newCount;
            rowCountInput.value = newCount;
            initializeGame();
        }
    }

    rowCountInput.addEventListener('change', () => {
        const newCount = parseInt(rowCountInput.value);
        updateRowCount(newCount);
    });

    decreaseRowsBtn.addEventListener('click', () => {
        const newCount = parseInt(rowCountInput.value) - 1;
        updateRowCount(newCount);
    });

    increaseRowsBtn.addEventListener('click', () => {
        const newCount = parseInt(rowCountInput.value) + 1;
        updateRowCount(newCount);
    });

    // Handle board width changes
    function updateBoardWidth(newWidth) {
        if (newWidth >= 250) {
            boardWidth = newWidth;
            boardWidthInput.value = newWidth;
            document.getElementById('game-container').style.maxWidth = `${newWidth}px`;
        }
    }

    boardWidthInput.addEventListener('change', () => {
        const newWidth = parseInt(boardWidthInput.value);
        updateBoardWidth(newWidth);
    });

    decreaseWidthBtn.addEventListener('click', () => {
        const newWidth = parseInt(boardWidthInput.value) - 10;
        updateBoardWidth(newWidth);
    });

    increaseWidthBtn.addEventListener('click', () => {
        const newWidth = parseInt(boardWidthInput.value) + 10;
        updateBoardWidth(newWidth);
    });

    // // Handle guess flow change
    // guessFlowSelect.addEventListener('change', () => {
    //     guessFlow = guessFlowSelect.value;
    //     initializeGame();
    // });

    // Handle required guesses changes
    function updateRequiredGuesses(newCount) {
        if (newCount >= 3 && newCount <= 7) {
            requiredGuesses = newCount;
            requiredGuessesInput.value = newCount;
            // Save to localStorage
            localStorage.setItem('wordleRequiredGuesses', newCount);
            // Automated stack height scale
            const heightScale = {3: 120, 4: 160, 5: 220, 6: 248, 7: 288};
            stackHeight = heightScale[newCount] || 220;
            stackHeightInput.value = stackHeight;
            const barChart = document.getElementById('group-guess-bar-chart');
            if (barChart) {
                barChart.style.height = `${stackHeight}px`;
                barChart.style.minHeight = `${stackHeight}px`;
            }
        }
    }

    // Load saved required guesses setting
    const savedRequiredGuesses = localStorage.getItem('wordleRequiredGuesses');
    if (savedRequiredGuesses) {
        updateRequiredGuesses(parseInt(savedRequiredGuesses));
    }

    requiredGuessesInput.addEventListener('change', () => {
        const newCount = parseInt(requiredGuessesInput.value);
        updateRequiredGuesses(newCount);
    });

    decreaseGuessesBtn.addEventListener('click', () => {
        const newCount = parseInt(requiredGuessesInput.value) - 1;
        updateRequiredGuesses(newCount);
    });

    increaseGuessesBtn.addEventListener('click', () => {
        const newCount = parseInt(requiredGuessesInput.value) + 1;
        updateRequiredGuesses(newCount);
    });

    // Disable manual editing of stack height
    stackHeightInput.readOnly = true;
    decreaseHeightBtn.disabled = true;
    increaseHeightBtn.disabled = true;

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && 
            !settingsToggle.contains(e.target) && 
            settingsPanel.classList.contains('open')) {
            settingsPanel.classList.remove('open');
        }
    });

    // Initialize profile settings
    initializeProfileSettings();

    // Initialize winning popup settings
    initializeWinningPopupSettings();

    // Initialize instruction popup settings
    initializeInstructionPopupSettings();

    // Initialize TTS settings
    initializeTTSSettings();

    // Initialize TikTok settings
    initializeTikTokSettings();

    // Initialize statistics manager
    statisticsManager = new StatisticsManager();

    // Check initial group mode state and update header margin
    updateHeaderMargin();

    // After other settings panel logic:
    const simulateGuessesCheckbox = document.getElementById('simulate-guesses');
    if (simulateGuessesCheckbox) {
        simulateGuessesCheckbox.addEventListener('change', function() {
            if (this.checked) {
                simulateGuessesStart();
            } else {
                simulateGuessesStop();
            }
        });
    }

    // Hide/show keyboard logic
    const hideKeyboardCheckbox = document.getElementById('hide-keyboard');
    const keyboard = document.querySelector('.keyboard');
    if (hideKeyboardCheckbox && keyboard) {
        hideKeyboardCheckbox.addEventListener('change', function() {
            // Don't change keyboard visibility if group mode is active
            if (!keyboard.hasAttribute('data-group-mode-hidden')) {
                keyboard.style.visibility = this.checked ? 'hidden' : 'visible';
            }
        });
        // On load, respect the checkbox state only if group mode isn't controlling it
        if (!keyboard.hasAttribute('data-group-mode-hidden')) {
            keyboard.style.visibility = hideKeyboardCheckbox.checked ? 'hidden' : 'visible';
        }
    }

    // Keyboard visibility (visibility: hidden)
    const keyboardVisibilityOffCheckbox = document.getElementById('keyboard-visibility-off');
    if (keyboardVisibilityOffCheckbox && keyboard) {
        keyboardVisibilityOffCheckbox.addEventListener('change', function() {
            // Don't change keyboard visibility if group mode is active
            if (!keyboard.hasAttribute('data-group-mode-hidden')) {
                keyboard.style.visibility = this.checked ? 'hidden' : 'visible';
            }
        });
        // On load, respect the checkbox state only if group mode isn't controlling it
        if (!keyboard.hasAttribute('data-group-mode-hidden')) {
            keyboard.style.visibility = keyboardVisibilityOffCheckbox.checked ? 'hidden' : 'visible';
        }
    }

    // Group guess bar chart logic
    const groupGuessBarCheckbox = document.getElementById('group-guess-bar');
    if (groupGuessBarCheckbox) {
        groupGuessBarCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck group loss if it's checked
                const groupLossCheckbox = document.getElementById('group-guess-loss');
                if (groupLossCheckbox && groupLossCheckbox.checked) {
                    groupLossCheckbox.checked = false;
                }
                startGroupGuessBarSimulating(false); // Normal mode - can win
            } else {
                stopGroupGuessBar();
            }
        });
    }

    // Group guess loss logic
    const groupGuessLossCheckbox = document.getElementById('group-guess-loss');
    if (groupGuessLossCheckbox) {
        groupGuessLossCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck group guess bar if it's checked
                const groupGuessBarCheckbox = document.getElementById('group-guess-bar');
                if (groupGuessBarCheckbox && groupGuessBarCheckbox.checked) {
                    groupGuessBarCheckbox.checked = false;
                    stopGroupGuessBar();
                }
                startGroupGuessBarSimulating(true); // Loss mode - prevent win
            } else {
                stopGroupGuessBar();
            }
        });
    }
}

// Profile Image Functions
function initializeProfileSettings() {
    const profileUpload = document.getElementById('profile-upload');
    const profilePreview = document.getElementById('profile-preview-img');
    const removeProfile = document.getElementById('remove-profile');
    const usernameInput = document.getElementById('profile-username');

    // Load saved profile image if it exists
    const savedProfile = localStorage.getItem('wordleProfileImage');
    if (savedProfile) {
        profilePreview.src = savedProfile;
    }

    // Load saved username if it exists
    const savedUsername = localStorage.getItem('wordleProfileUsername');
    if (savedUsername && usernameInput) {
        usernameInput.value = savedUsername;
    }

    // Handle username changes
    if (usernameInput) {
        usernameInput.addEventListener('input', (e) => {
            const username = e.target.value.trim();
            if (username.length <= 20) {
                localStorage.setItem('wordleProfileUsername', username);
            }
        });

        usernameInput.addEventListener('blur', (e) => {
            const username = e.target.value.trim();
            localStorage.setItem('wordleProfileUsername', username);
        });
    }

    // Handle file upload
    profileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                showMessage('Please upload an image file');
                return;
            }

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showMessage('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                profilePreview.src = imageUrl;
                localStorage.setItem('wordleProfileImage', imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle remove profile
    removeProfile.addEventListener('click', () => {
        profilePreview.src = 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
        localStorage.removeItem('wordleProfileImage');
    });
}

// Helper function to get current username
function getCurrentUsername() {
    const savedUsername = localStorage.getItem('wordleProfileUsername');
    return savedUsername && savedUsername.trim() ? savedUsername.trim() : 'Host';
}

//How profile image tile is added to the row
function ensureProfileImageTile(row, imgSrc, username = '') {
    if (!row) return;
    // If the first child is already a profile image tile, update the image source and username
    if (row.firstChild && row.firstChild.classList.contains('profile-img-tile')) {
        const existingImg = row.firstChild.querySelector('.profile-img-in-tile');
        if (existingImg) {
            existingImg.src = imgSrc;
        }
        
        // Update or create username overlay
        let usernameOverlay = row.firstChild.querySelector('.profile-username-overlay');
        if (!usernameOverlay) {
            usernameOverlay = document.createElement('div');
            usernameOverlay.className = 'profile-username-overlay';
            row.firstChild.appendChild(usernameOverlay);
        }
        usernameOverlay.textContent = username || getCurrentUsername();
        return;
    }
    // Otherwise, insert a new profile image tile at the start
    const imgTile = document.createElement('div');
    imgTile.className = 'tile profile-img-tile';
    const img = document.createElement('img');
    img.className = 'profile-img-in-tile';
    img.src = imgSrc;
    img.alt = 'Profile';
    imgTile.appendChild(img);
    
    // Add username overlay
    const usernameOverlay = document.createElement('div');
    usernameOverlay.className = 'profile-username-overlay';
    usernameOverlay.textContent = username || getCurrentUsername();
    imgTile.appendChild(usernameOverlay);
    
    row.insertBefore(imgTile, row.firstChild);
}

//How profile image tile is removed from the row
function removeProfileImageTile(row) {
    if (!row) return;
    if (row.firstChild && row.firstChild.classList.contains('profile-img-tile')) {
        row.removeChild(row.firstChild);
    }
}

//How profile image tile is added to the row
function addProfileImageToRow(rowIndex) {
    const row = document.querySelector(`.row[data-row="${rowIndex}"]`);
    // Use the current guessing user's image, or fallback to logged-in user's image
    const userImage = getUserProfileImage(currentGuessingUser ? currentGuessingUser.username : null);
    ensureProfileImageTile(row, userImage, currentGuessingUser ? currentGuessingUser.username : getCurrentUsername());
}

//How rows are moved during gameplay if flow is up
// This function has been removed - now using simple DOM operations instead

//How rows are moved during gameplay if flow is down
// This function has been removed - now using simple DOM operations instead

//How cog is set to active when simulate guesses is active
function setCogSimulateActive() {
    const cog = document.getElementById('settings-toggle');
    if (cog) cog.classList.add('simulate-active');
}

//How cog is set to inactive when simulate guesses is inactive
function unsetCogSimulateActive() {
    const cog = document.getElementById('settings-toggle');
    if (cog) cog.classList.remove('simulate-active');
}

//How simulate guesses is started
function simulateGuessesStart() {
    if (simulateGuessesInterval) return;
    simulateGuessesActive = true;
    const indicator = document.getElementById('simulate-indicator');
    if (indicator) indicator.style.display = 'block';
    setCogSimulateActive();
    simulateGuessesInterval = setInterval(() => {
        if (!simulateGuessesActive || isGameOver || simulateTyping) return;
        
        // Increment guess count
        singlePlayerGuessCount++;
        
        let guessWord;
        if (singlePlayerGuessCount >= 10) {
            // After 10 guesses, always guess the winning word
            guessWord = targetWord;
        } else {
            // Pick a random word that is NOT the target word
            const possibleWords = wordLists[wordLength].filter(w => w !== targetWord);
            if (possibleWords.length === 0) return;
            guessWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
        }
        
        // Simulate a random user
        const randomNumber = Math.floor(Math.random() * 1000);
        const user = {
            username: 'user' + randomNumber,
            photoUrl: 'https://picsum.photos/40?' + Math.random(),
            gift_name: '',
            comment: 'candy'
        };
        simulateAudienceTyping(guessWord, user);
    }, 1000);
}

function simulateGuessesStop() {
    simulateGuessesActive = false;
    const indicator = document.getElementById('simulate-indicator');
    if (indicator) indicator.style.display = 'none';
    if (!groupGuessBarActive) unsetCogSimulateActive();
    if (simulateGuessesInterval) {
        clearInterval(simulateGuessesInterval);
        simulateGuessesInterval = null;
    }
}

function simulateAudienceTyping(word, user) {
    // Store the user in the playingUsers array
    playingUsers.push(user);
    
    // Set the current guessing user
    currentGuessingUser = user;
    
    // Use fastSubmitWord to avoid duplicate processing
    fastSubmitWord(word, user, () => {
        currentGuessingUser = null;
    });
}

function fastSubmitWord(word, user, callback) {
    if (isGameOver) {
        console.log("Guess ignored, round is over.");
        return;
    }
    if (!word || word.length !== wordLength) return;
    
    // Prevent duplicate word submissions from the same user
    if (word.toLowerCase() === lastSubmittedWord && 
        user && lastSubmittedUser && 
        user.username === lastSubmittedUser.username) {
        console.log('Duplicate word from same user detected, skipping:', word, user.username);
        return;
    }
    lastSubmittedWord = word.toLowerCase();
    lastSubmittedUser = user;
    
    // Process the guess using the new unified function
    processGuess(word, user.photoUrl, user.username);
    
    // Execute callback after a short delay
    setTimeout(() => {
        if (callback) callback();
    }, 100);
}

function renderGroupGuessBarChart() {
    const barChart = document.getElementById('group-guess-bar-chart');
    if (!barChart) return;
    // Convert stacks to array and sort by stack height desc, then by word
    const stacksArr = Object.entries(groupGuessStacks)
        .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
        .slice(0, 7);
    // FLIP: measure old positions
    const prevRects = {};
    if (barChart.children.length) {
        for (let i = 0; i < barChart.children.length; i++) {
            const el = barChart.children[i];
            const word = el.getAttribute('data-word');
            if (word) prevRects[word] = el.getBoundingClientRect();
        }
    }
    // Render new order
    barChart.innerHTML = '';
    stacksArr.forEach(([word, users], idx) => {
        const stackDiv = document.createElement('div');
        stackDiv.className = 'bar-stack';
        stackDiv.setAttribute('data-word', word);
        stackDiv.style.zIndex = (stacksArr.length - idx + 1).toString();
        // Word label
        const label = document.createElement('div');
        label.className = 'bar-word-label';
        label.textContent = word.toUpperCase();
        stackDiv.appendChild(label);
        // User images (stacked)
        users.forEach(user => {
            //May need to change this for displaying winner's images #change
            const img = document.createElement('img');
            img.className = 'bar-user-img';
            img.src = user.photoUrl;
            img.title = user.username;
            stackDiv.appendChild(img);
        });
        barChart.appendChild(stackDiv);
    });
    // FLIP: animate position changes
    setTimeout(() => {
        for (let i = 0; i < barChart.children.length; i++) {
            const el = barChart.children[i];
            const word = el.getAttribute('data-word');
            if (word && prevRects[word]) {
                const newRect = el.getBoundingClientRect();
                const dx = prevRects[word].left - newRect.left;
                if (dx !== 0) {
                    el.style.transform = `translateX(${dx}px)`;
                    el.style.transition = 'none';
                    // Force reflow
                    void el.offsetWidth;
                    el.style.transition = '';
                    el.style.transform = '';
                }
            }
        }
    }, 0);
    lastBarOrder = stacksArr.map(([word]) => word);
}

function openGroupGuessBarUI() {
    groupGuessBarActive = true;
    groupGuessStacks = {};
    lastBarOrder = [];
    groupModeSubmittedGuesses = 0;

    // mostrar barra de votos del grupo
    const barChart = document.getElementById('group-guess-bar-chart');
    if (barChart) {
        barChart.style.display = 'flex';
        barChart.style.height = `${stackHeight}px`;
        barChart.style.minHeight = `${stackHeight}px`;
    }

    // reposicionar el teclado existente (#main-keyboard)
    const keyboard = document.getElementById('main-keyboard');
    if (keyboard) {
        // sacamos el layout "normal debajo del board"
        keyboard.classList.remove('group-inline');
        // activamos layout flotante fijo abajo-izq
        keyboard.classList.add('group-floating');
        // aseguramos que esté visible
        keyboard.style.visibility = 'visible';
    }

    // iconitos / animación de "simulando actividad" si lo usas
    if (typeof setCogSimulateActive === "function") {
        setCogSimulateActive();
    }

    // ya no queremos que cambie el margin raro del header, asígnale
    // un margen fijo dentro de updateHeaderMargin() o hazla no-op.
    if (typeof updateHeaderMargin === "function") {
        updateHeaderMargin();
    }

    // MUY IMPORTANTE:
    // no arrancamos ningún intervalo de autospam aquí
    if (groupGuessInterval) {
        clearInterval(groupGuessInterval);
        groupGuessInterval = null;
    }
}

function startGroupGuessBarSimulating(preventWin = false) {
    // primero abrimos la UI en modo grupo (teclado flotante + barra visible)
    openGroupGuessBarUI();

    // ahora sí: arrancar el loop automático que inventa usuarios/palabras cada segundo
    if (groupGuessInterval) clearInterval(groupGuessInterval);

    groupGuessInterval = setInterval(() => {
        if (!groupGuessBarActive || isGameOver) return;

        groupModeGuessCount++;

        // elegir palabra simulada
        let guessWord;
        const pool = wordLists[wordLength].filter(w => w !== targetWord);
        if (pool.length === 0) return;

        if (preventWin) {
            // nunca uses la palabra correcta
            guessWord = pool[Math.floor(Math.random() * pool.length)];
        } else {
            // después de X intentos, deja que ganen metiendo targetWord
            if (groupModeGuessCount >= 10) {
                guessWord = targetWord;
            } else {
                guessWord = pool[Math.floor(Math.random() * pool.length)];
            }
        }

        const lower = guessWord.toLowerCase();

        // usuario random fake
        const randomNumber = Math.floor(Math.random() * 1000);
        const user = {
            username: 'user' + randomNumber,
            photoUrl: 'https://picsum.photos/40?' + Math.random(),
        };

        // guardar voto en esa palabra
        if (!groupGuessStacks[lower]) {
            groupGuessStacks[lower] = [];
        }

        // --- IMPORTANTE ANTI-CHEAT GRUPAL ---
        // si este usuario ya votó ESA palabra, no lo metas de nuevo
        const alreadyVoted = groupGuessStacks[lower].some(
            u => u.username === user.username
        );
        if (!alreadyVoted) {
            groupGuessStacks[lower].push(user);
        }

        // guardar en playingUsers para el modal final
        playingUsers.push(user);

        // si ya llegaron a requiredGuesses => mandarla al tablero
        if (groupGuessStacks[lower].length >= requiredGuesses) {
            if (typeof simulateGroupAudienceTyping === "function") {
                // último usuario que votó dispara
                const lastUser = groupGuessStacks[lower][groupGuessStacks[lower].length - 1];
                simulateGroupAudienceTyping(lower, lastUser);
            }
            delete groupGuessStacks[lower];
        }

        // limitar a 7 palabras visibles en la barra
        const stackWords = Object.keys(groupGuessStacks);
        if (stackWords.length > 7) {
            let minWord = stackWords[0];
            for (const w of stackWords) {
                if (groupGuessStacks[w].length < groupGuessStacks[minWord].length) {
                    minWord = w;
                }
            }
            delete groupGuessStacks[minWord];
        }

        // volver a dibujar la barra
        renderGroupGuessBarChart();
    }, 1000);
}

function stopGroupGuessBar() {
    groupGuessBarActive = false;

    // cortar cualquier loop de simulación si hubiera
    if (groupGuessInterval) {
        clearInterval(groupGuessInterval);
        groupGuessInterval = null;
    }

    // apagar icono/estado de "simulación" si corresponde
    if (!simulateGuessesActive && typeof unsetCogSimulateActive === "function") {
        unsetCogSimulateActive();
    }

    // ocultar la barra de votos del grupo
    const barChart = document.getElementById('group-guess-bar-chart');
    if (barChart) {
        barChart.style.display = 'none';
    }

    // devolver el teclado a posición normal debajo del tablero
    const keyboard = document.getElementById('main-keyboard');
    if (keyboard) {
        keyboard.classList.remove('group-floating');
        keyboard.classList.add('group-inline');
        keyboard.style.visibility = 'visible'; // por si acaso
    }

    // limpiar pilas de votos
    groupGuessStacks = {};

    if (typeof updateHeaderMargin === "function") {
        updateHeaderMargin();
    }
}

//How group guess word is entered
function simulateGroupAudienceTyping(word, user) {
    // Set the current guessing user
    currentGuessingUser = user;
    
    // Process the guess using the new unified function
    processGuess(word, user.photoUrl, user.username);
    
    // Clear the current guessing user after the guess is complete
    setTimeout(() => {
        currentGuessingUser = null;
    }, 100);
}

// Helper function to get user profile image by username
function getUserProfileImage(username) {
    if (!username) {
        // No username provided, use logged-in user's image from localStorage
        return localStorage.getItem('wordleProfileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
    }
    
    // Find user in playingUsers array
    const user = playingUsers.find(u => u.username === username);
    if (user && user.photoUrl) {
        return user.photoUrl;
    }
    
    // Fallback to logged-in user's image from localStorage
    return localStorage.getItem('wordleProfileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
}

function getSavedProfileImage() {
    const saved = localStorage.getItem('wordleProfileImage');
    if (saved && typeof saved === 'string' && saved.trim() !== '') {
        // saved es un data URL base64 tipo "data:image/png;base64,...."
        return saved;
    }
    // fallback si no hay imagen custom
    return 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
}

function getSavedUsername() {
    const saved = localStorage.getItem('wordleProfileUsername');
    if (saved && saved.trim() !== '') {
        return saved.trim();
    }
    return ''; // default
}

function showWinningModal(winningWord) {
    const overlay = document.getElementById('winning-overlay');
    const title = document.getElementById('winning-title');
    const wordDisplay = document.getElementById('winning-word');
    const singleWinner = document.getElementById('single-winner');
    const groupWinners = document.getElementById('group-winners');
    
    if (!overlay) return;

    roundTransitioning = true;
    isGameOver = true;

    // detener el timer visual si estaba corriendo
    if (roundCountdownInterval) {
        clearInterval(roundCountdownInterval);
        roundCountdownInterval = null;
    }
    
    // streaks / estadísticas globales
    if (statisticsManager) {
        statisticsManager.recordWin();
    }
    
    // estilos sonido etc
    title.style.color = '';
    const lossGif = document.getElementById('loss-gif');
    if (lossGif) lossGif.style.display = 'none';
    
    if (winningSoundUrl) {
        try {
            const audio = new Audio(winningSoundUrl);
            audio.volume = 0.5;
            audio.play().catch(err => {
                console.log("Could not play winning sound:", err);
            });
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, winningModalDuration * 1000);
        } catch (error) {
            console.log("Invalid winning sound URL:", error);
        }
    }
    
    // ¿estamos en modo grupo?
    const isGroupMode = document.getElementById('group-guess-bar-chart').style.display !== 'none';
    
    if (isGroupMode) {
        // showGroupWinners:
        // - pinta el modal grupal
        // - da +1 win a cada ganador interno
        showGroupWinners(winningWord, title, wordDisplay, singleWinner, groupWinners);
    } else {
        // showSingleWinner:
        // - pinta el modal individual
        // - da +1 win al usuario ganador
        showSingleWinner(winningWord, title, wordDisplay, singleWinner, groupWinners);
    }
    
    // streak metrics en el modal
    if (statisticsManager) {
        const currentStreakElement = document.getElementById('modal-current-streak');
        const maxStreakElement = document.getElementById('modal-max-streak');
        
        if (currentStreakElement) {
            currentStreakElement.textContent = statisticsManager.stats.currentStreak;
        }
        if (maxStreakElement) {
            maxStreakElement.textContent = statisticsManager.stats.maxStreak;
        }
    }
    
    // mostrar el modal de victoria
    overlay.classList.add('show');

    // Si había un timeout viejo (por si acaso), lo limpiamos
    if (modalCloseTimeout) {
        clearTimeout(modalCloseTimeout);
    }

    modalCloseTimeout = setTimeout(() => {
        overlay.classList.remove('show');

        // después de la animación de cierre
        setTimeout(() => {
            proceedAfterModal(); // usa la misma lógica central
        }, 300);

        // ya usamos este timeout
        modalCloseTimeout = null;
    }, winningModalDuration * 1000);

}

function showLosingModal() {
    const overlay = document.getElementById('winning-overlay');
    const title = document.getElementById('winning-title');
    const wordDisplay = document.getElementById('winning-word');
    const singleWinner = document.getElementById('single-winner');
    const groupWinners = document.getElementById('group-winners');

    if (!overlay) return;

    roundTransitioning = true;

    // marcar derrota en estadísticas
    if (statisticsManager) {
        statisticsManager.recordLoss();
    }

    // marcar fin de ronda (para bloquear guesses nuevos)
    isGameOver = true;

    // parar el contador si seguía corriendo
    if (roundCountdownInterval) {
        clearInterval(roundCountdownInterval);
        roundCountdownInterval = null;
    }

    // estilo derrota
    title.textContent = "¡Se acabó el tiempo!";
    title.style.color = '#ff4d4d';

    wordDisplay.textContent = `La palabra era "${targetWord.toUpperCase()}"`;

    // ocultar layout de ganadores
    singleWinner.style.display = 'none';
    groupWinners.style.display = 'none';

    overlay.classList.add('show');

    // Si había un timeout viejo (por si acaso), lo limpiamos
    if (modalCloseTimeout) {
        clearTimeout(modalCloseTimeout);
    }

    modalCloseTimeout = setTimeout(() => {
        overlay.classList.remove('show');

        // después de la animación de cierre
        setTimeout(() => {
            proceedAfterModal(); // usa la misma lógica central
        }, 300);

        // ya usamos este timeout
        modalCloseTimeout = null;
    }, winningModalDuration * 1000);
}

function showSingleWinner(winningWord, title, wordDisplay, singleWinner, groupWinners) {
  // elegir ganador
  let winner = null;

  if (winningUser) {
    winner = winningUser;
  } else if (currentGuessingUser) {
    winner = currentGuessingUser;
  } else if (playingUsers.length > 0) {
    winner = playingUsers[playingUsers.length - 1];
  } else {
    // fallback: jugador local/manual
    winner = {
      username: getCurrentUsername(),
      photoUrl:
        localStorage.getItem("wordleProfileImage") ||
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
    };
  }

  // normalizar datos
  const winnerData = {
    username: winner.username,
    photoUrl:
      winner.photoUrl ||
      "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
  };

  // pintar modal
  title.textContent = `${winnerData.username} Wins!`;
  wordDisplay.textContent = `The winning word was "${String(winningWord || "").toUpperCase()}"`;

  singleWinner.style.display = "flex";
  groupWinners.style.display = "none";

  const winnerPhoto = document.getElementById("winner-photo");
  const winnerName = document.getElementById("winner-name");

  if (winnerPhoto && winnerName) {
    winnerPhoto.src = winnerData.photoUrl;
    winnerPhoto.alt = winnerData.username;
    winnerName.textContent = winnerData.username;
  }

  // leaderboard
  registerWinForUser(winnerData);

  // notificar renderer
  sendRoundWinner({
    mode: "single",
    word: String(winningWord || "").toLowerCase(),
    winner: {
      username: winnerData.username,
      photoUrl: winnerData.photoUrl,
    },
    timestamp: Date.now(),
  });
}

function showGroupWinners(winningWord, title, wordDisplay, singleWinner, groupWinners) {
  // candidatos que aportaron la palabra
  const usersWhoGuessedWinningWord = playingUsers.filter((user) => {
    return (
      user.guessedWord === winningWord ||
      (groupGuessStacks[winningWord] &&
        groupGuessStacks[winningWord].some((u) => u.username === user.username))
    );
  });

  const candidateUsers =
    usersWhoGuessedWinningWord.length > 0 ? usersWhoGuessedWinningWord : playingUsers;

  // normalizar "need"
  const need = Number(typeof requiredGuesses !== "undefined" ? requiredGuesses : 5) || 5;

  // tomar usuarios únicos recientes hasta "need"
  const seenUsernames = new Set();
  const distinctRecentUsers = [];

  for (let i = candidateUsers.length - 1; i >= 0 && distinctRecentUsers.length < need; i--) {
    const user = candidateUsers[i];
    if (!seenUsernames.has(user.username)) {
      seenUsernames.add(user.username);
      // unshift para mantener orden cronológico natural
      distinctRecentUsers.unshift(user);
    }
  }

  // asegurar que no esté vacío
  let winners = distinctRecentUsers.slice(0, need);
  if (winners.length === 0 && playingUsers.length > 0) {
    winners = [playingUsers[playingUsers.length - 1]];
  }

  // pintar modal
  title.textContent = "Group Victory!";
  wordDisplay.textContent = `The winning word was "${String(winningWord || "").toUpperCase()}"`;

  singleWinner.style.display = "none";
  groupWinners.style.display = "flex";

  groupWinners.innerHTML = "";

  winners.forEach((user) => {
    const winnerDiv = document.createElement("div");
    winnerDiv.className = "group-winner";

    const photoDiv = document.createElement("img");
    photoDiv.className = "group-winner-photo";
    photoDiv.src =
      user.photoUrl ||
      "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";
    photoDiv.alt = user.username;

    const nameDiv = document.createElement("div");
    nameDiv.className = "group-winner-name";
    nameDiv.textContent = user.username;

    winnerDiv.appendChild(photoDiv);
    winnerDiv.appendChild(nameDiv);
    groupWinners.appendChild(winnerDiv);
  });

  // leaderboard (todos suman +1)
  winners.forEach((user) => {
    registerWinForUser({
      username: user.username,
      photoUrl:
        user.photoUrl ||
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
    });
  });

  // notificar renderer
  sendRoundWinner({
    mode: "group",
    word: String(winningWord || "").toLowerCase(),
    winners: winners.map((u) => ({
      username: u.username,
      photoUrl:
        u.photoUrl ||
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
    })),
    timestamp: Date.now(),
  });
}

// Initialize winning popup settings
function initializeWinningPopupSettings() {
    const soundUrlInput = document.getElementById('winning-sound-url');
    const durationInput = document.getElementById('winning-modal-duration');
    const decreaseDurationBtn = document.getElementById('decrease-duration');
    const increaseDurationBtn = document.getElementById('increase-duration');
    const testButton = document.getElementById('test-winning-sound');

    // Load saved winning sound URL and duration if they exist
    const savedSoundUrl = localStorage.getItem('wordleWinningSoundUrl');
    const savedDuration = localStorage.getItem('wordleWinningDuration');
    if (savedSoundUrl) {
        winningSoundUrl = savedSoundUrl;
        soundUrlInput.value = savedSoundUrl;
    }
    if (savedDuration) {
        winningModalDuration = parseInt(savedDuration);
        durationInput.value = savedDuration;
    }

    // Handle sound URL change
    soundUrlInput.addEventListener('change', () => {
        winningSoundUrl = soundUrlInput.value;
        localStorage.setItem('wordleWinningSoundUrl', winningSoundUrl);
    });

    // Handle duration changes
    function updateDuration(newDuration) {
        if (newDuration >= 1 && newDuration <= 10) {
            winningModalDuration = newDuration;
            durationInput.value = newDuration;
            localStorage.setItem('wordleWinningDuration', newDuration);
        }
    }

    durationInput.addEventListener('change', () => {
        const newDuration = parseInt(durationInput.value);
        updateDuration(newDuration);
    });

    decreaseDurationBtn.addEventListener('click', () => {
        const newDuration = parseInt(durationInput.value) - 1;
        updateDuration(newDuration);
    });

    increaseDurationBtn.addEventListener('click', () => {
        const newDuration = parseInt(durationInput.value) + 1;
        updateDuration(newDuration);
    });

    // Handle test button click
    testButton.addEventListener('click', () => {
        testWinningSound(winningSoundUrl, winningModalDuration);
    });
}

// Test winning sound
function testWinningSound(soundUrl, duration) {
    if (!soundUrl) {
        showMessage("Please enter a sound URL first");
        return;
    }
    
    try {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5; // Set volume to 50%
        audio.play().catch(error => {
            showMessage("Error playing sound: " + error.message);
        });
        
        // Stop the sound after the specified duration
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, duration * 1000);
        
        showMessage(`Testing sound for ${duration} seconds...`);
    } catch (error) {
        showMessage("Invalid sound URL");
    }
}

// Initialize instruction popup settings
function initializeInstructionPopupSettings() {
    const activeCheckbox = document.getElementById('instruction-popup-active');
    const textArea = document.getElementById('instruction-popup-text');
    const gifInput = document.getElementById('instruction-popup-gif');
    const durationInput = document.getElementById('instruction-popup-duration');
    const decreaseDurationBtn = document.getElementById('decrease-instruction-duration');
    const increaseDurationBtn = document.getElementById('increase-instruction-duration');
    const testButton = document.getElementById('test-instruction-popup');

    // Load saved settings
    const savedActive = localStorage.getItem('wordleInstructionPopupActive');
    const savedText = localStorage.getItem('wordleInstructionPopupText');
    const savedGif = localStorage.getItem('wordleInstructionPopupGif');
    const savedDuration = localStorage.getItem('wordleInstructionPopupDuration');
    
    if (savedActive !== null) {
        instructionPopupActive = savedActive === 'true';
    } else {
        // Default to false if no saved setting exists and save it
        instructionPopupActive = false;
        localStorage.setItem('wordleInstructionPopupActive', 'false');
    }
    activeCheckbox.checked = instructionPopupActive;
    
    if (savedText) {
        instructionPopupText = savedText;
        textArea.value = savedText;
    }
    if (savedGif) {
        instructionPopupGif = savedGif;
        gifInput.value = savedGif;
    }
    if (savedDuration) {
        instructionPopupDuration = parseInt(savedDuration);
        durationInput.value = instructionPopupDuration;
    }

    // Handle active checkbox change
    activeCheckbox.addEventListener('change', () => {
        instructionPopupActive = activeCheckbox.checked;
        localStorage.setItem('wordleInstructionPopupActive', instructionPopupActive);
    });

    // Handle text change
    textArea.addEventListener('change', () => {
        instructionPopupText = textArea.value;
        localStorage.setItem('wordleInstructionPopupText', instructionPopupText);
    });

    // Handle GIF change
    gifInput.addEventListener('change', () => {
        instructionPopupGif = gifInput.value;
        localStorage.setItem('wordleInstructionPopupGif', instructionPopupGif);
    });

    // Handle duration changes
    function updateDuration(newDuration) {
        if (newDuration >= 1 && newDuration <= 10) {
            instructionPopupDuration = newDuration;
            durationInput.value = instructionPopupDuration;
            localStorage.setItem('wordleInstructionPopupDuration', instructionPopupDuration);
        }
    }

    durationInput.addEventListener('change', () => {
        const newDuration = parseInt(durationInput.value);
        updateDuration(newDuration);
    });

    decreaseDurationBtn.addEventListener('click', () => {
        const newDuration = parseInt(durationInput.value) - 1;
        updateDuration(newDuration);
    });

    increaseDurationBtn.addEventListener('click', () => {
        const newDuration = parseInt(durationInput.value) + 1;
        updateDuration(newDuration);
    });

    // Handle test button click
    testButton.addEventListener('click', () => {
        showInstructionPopup();
    });
}

// Show instruction popup
function showInstructionPopup() {
    const popup = document.getElementById('instruction-popup');
    const textDisplay = document.getElementById('instruction-popup-text-display');
    const gifDisplay = document.getElementById('instruction-popup-gif-display');
    
    // Set the text content with new line support
    textDisplay.innerHTML = instructionPopupText.replace(/\n/g, '<br>');
    
    // Handle GIF display
    if (instructionPopupGif && instructionPopupGif.trim() !== '') {
        gifDisplay.src = instructionPopupGif;
        gifDisplay.style.display = 'block';
    } else {
        gifDisplay.style.display = 'none';
    }
    
    // Show the popup with slide-in animation
    popup.classList.add('show');
    
    // Auto-hide after the specified duration
    setTimeout(() => {
        popup.classList.remove('show');
    }, instructionPopupDuration * 1000);
}

// TTS Functions
function loadAvailableVoices() {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            availableVoices = voices;
            resolve(voices);
        } else {
            // Some browsers load voices asynchronously
            speechSynthesis.addEventListener('voiceschanged', () => {
                availableVoices = speechSynthesis.getVoices();
                resolve(availableVoices);
            }, { once: true });
        }
    });
}

function populateVoiceDropdown() {
    const voiceSelect = document.getElementById('tts-voice');
    if (!voiceSelect) return;
    
    // Clear existing options except default
    voiceSelect.innerHTML = '<option value="">Default Voice</option>';
    
    availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.default) {
            option.textContent += ' - Default';
        }
        voiceSelect.appendChild(option);
    });
}

function getRandomMessage(messages) {
    if (!messages || messages.length === 0) return '';
    return messages[Math.floor(Math.random() * messages.length)];
}

function speakText(text) {
    if (!ttsEnabled || !text || text.trim() === '') return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if specified
    if (ttsVoice) {
        const selectedVoice = availableVoices.find(voice => voice.name === ttsVoice);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }
    
    // Set volume (0-1)
    utterance.volume = ttsVolume / 100;
    
    // Set rate (0.1-10, where 1 is normal)
    utterance.rate = ttsRate / 10;
    
    // Speak the text
    speechSynthesis.speak(utterance);
}

function speakRoundStart() {
    if (!ttsRoundStartEnabled) return;
    const message = getRandomMessage(ttsRoundStartTexts);
    speakText(message);
}

function speakGameWon() {
    if (!ttsGameWonEnabled) return;
    const message = getRandomMessage(ttsGameWonTexts);
    speakText(message);
}

function speakGameplay() {
    if (!ttsGameplayEnabled) return;
    const message = getRandomMessage(ttsGameplayTexts);
    speakText(message);
}

function speakWord(word) {
    if (!ttsReadWords || !word) return;
    
    // Check if speech synthesis is currently speaking
    // If it is, don't interrupt with word reading
    if (speechSynthesis.speaking) {
        return;
    }
    
    speakText(word);
}

function startGameplayAnnouncements() {
    stopGameplayAnnouncements(); // Clear any existing interval
    
    if (!ttsGameplayEnabled || ttsGameplayInterval <= 0) return;
    
    ttsGameplayIntervalId = setInterval(() => {
        if (!isGameOver && ttsGameplayEnabled) {
            speakGameplay();
        }
    }, ttsGameplayInterval * 1000);
}

function stopGameplayAnnouncements() {
    if (ttsGameplayIntervalId) {
        clearInterval(ttsGameplayIntervalId);
        ttsGameplayIntervalId = null;
    }
}

// Initialize info button
document.addEventListener('DOMContentLoaded', () => {
    const infoButton = document.getElementById('info-toggle');
    if (infoButton) {
        infoButton.addEventListener('click', () => {
            showInstructionPopup();
        });
    }
});

// Initialize TTS settings
async function initializeTTSSettings() {
    // Load available voices
    await loadAvailableVoices();
    populateVoiceDropdown();
    
    // Get all TTS elements
    const ttsEnabledCheckbox = document.getElementById('tts-enabled');
    const ttsVoiceSelect = document.getElementById('tts-voice');
    const ttsVolumeInput = document.getElementById('tts-volume');
    const decreaseVolumeBtn = document.getElementById('decrease-tts-volume');
    const increaseVolumeBtn = document.getElementById('increase-tts-volume');
    const ttsRateInput = document.getElementById('tts-rate');
    const decreaseRateBtn = document.getElementById('decrease-tts-rate');
    const increaseRateBtn = document.getElementById('increase-tts-rate');
    
    const ttsRoundStartEnabledCheckbox = document.getElementById('tts-round-start-enabled');
    const ttsRoundStartTextsTextarea = document.getElementById('tts-round-start-texts');
    
    const ttsReadWordsCheckbox = document.getElementById('tts-read-words');
    
    const ttsGameWonEnabledCheckbox = document.getElementById('tts-game-won-enabled');
    const ttsGameWonTextsTextarea = document.getElementById('tts-game-won-texts');
    
    const ttsGameplayEnabledCheckbox = document.getElementById('tts-gameplay-enabled');
    const ttsGameplayIntervalInput = document.getElementById('tts-gameplay-interval');
    const decreaseIntervalBtn = document.getElementById('decrease-tts-interval');
    const increaseIntervalBtn = document.getElementById('increase-tts-interval');
    const ttsGameplayTextsTextarea = document.getElementById('tts-gameplay-texts');
    
    const testTTSBtn = document.getElementById('test-tts');

    // Load saved settings
    const savedEnabled = localStorage.getItem('wordleTTSEnabled');
    const savedVoice = localStorage.getItem('wordleTTSVoice');
    const savedVolume = localStorage.getItem('wordleTTSVolume');
    const savedRate = localStorage.getItem('wordleTTSRate');
    const savedRoundStartEnabled = localStorage.getItem('wordleTTSRoundStartEnabled');
    const savedRoundStartTexts = localStorage.getItem('wordleTTSRoundStartTexts');
    const savedReadWords = localStorage.getItem('wordleTTSReadWords');
    const savedGameWonEnabled = localStorage.getItem('wordleTTSGameWonEnabled');
    const savedGameWonTexts = localStorage.getItem('wordleTTSGameWonTexts');
    const savedGameplayEnabled = localStorage.getItem('wordleTTSGameplayEnabled');
    const savedGameplayInterval = localStorage.getItem('wordleTTSGameplayInterval');
    const savedGameplayTexts = localStorage.getItem('wordleTTSGameplayTexts');

    // Apply saved settings
    if (savedEnabled !== null) {
        ttsEnabled = savedEnabled === 'true';
        ttsEnabledCheckbox.checked = ttsEnabled;
    }
    if (savedVoice) {
        ttsVoice = savedVoice;
        ttsVoiceSelect.value = savedVoice;
    }
    if (savedVolume) {
        ttsVolume = parseInt(savedVolume);
        ttsVolumeInput.value = ttsVolume;
    }
    if (savedRate) {
        ttsRate = parseInt(savedRate);
        ttsRateInput.value = ttsRate;
    }
    if (savedRoundStartEnabled !== null) {
        ttsRoundStartEnabled = savedRoundStartEnabled === 'true';
        ttsRoundStartEnabledCheckbox.checked = ttsRoundStartEnabled;
    }
    if (savedRoundStartTexts) {
        ttsRoundStartTexts = savedRoundStartTexts.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsRoundStartTextsTextarea.value = savedRoundStartTexts;
    }
    if (savedReadWords !== null) {
        ttsReadWords = savedReadWords === 'true';
        ttsReadWordsCheckbox.checked = ttsReadWords;
    }
    if (savedGameWonEnabled !== null) {
        ttsGameWonEnabled = savedGameWonEnabled === 'true';
        ttsGameWonEnabledCheckbox.checked = ttsGameWonEnabled;
    }
    if (savedGameWonTexts) {
        ttsGameWonTexts = savedGameWonTexts.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsGameWonTextsTextarea.value = savedGameWonTexts;
    }
    if (savedGameplayEnabled !== null) {
        ttsGameplayEnabled = savedGameplayEnabled === 'true';
        ttsGameplayEnabledCheckbox.checked = ttsGameplayEnabled;
    }
    if (savedGameplayInterval) {
        ttsGameplayInterval = parseInt(savedGameplayInterval);
        ttsGameplayIntervalInput.value = ttsGameplayInterval;
    }
    if (savedGameplayTexts) {
        ttsGameplayTexts = savedGameplayTexts.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsGameplayTextsTextarea.value = savedGameplayTexts;
    }

    // Event listeners
    ttsEnabledCheckbox.addEventListener('change', () => {
        ttsEnabled = ttsEnabledCheckbox.checked;
        localStorage.setItem('wordleTTSEnabled', ttsEnabled);
        
        // Stop gameplay announcements if TTS is disabled
        if (!ttsEnabled) {
            stopGameplayAnnouncements();
        } else if (ttsGameplayEnabled && !isGameOver) {
            startGameplayAnnouncements();
        }
    });

    ttsVoiceSelect.addEventListener('change', () => {
        ttsVoice = ttsVoiceSelect.value;
        localStorage.setItem('wordleTTSVoice', ttsVoice);
    });

    // Volume controls
    function updateVolume(newVolume) {
        if (newVolume >= 0 && newVolume <= 100) {
            ttsVolume = newVolume;
            ttsVolumeInput.value = newVolume;
            localStorage.setItem('wordleTTSVolume', newVolume);
        }
    }

    ttsVolumeInput.addEventListener('change', () => {
        const newVolume = parseInt(ttsVolumeInput.value);
        updateVolume(newVolume);
    });

    decreaseVolumeBtn.addEventListener('click', () => {
        const newVolume = parseInt(ttsVolumeInput.value) - 10;
        updateVolume(newVolume);
    });

    increaseVolumeBtn.addEventListener('click', () => {
        const newVolume = parseInt(ttsVolumeInput.value) + 10;
        updateVolume(newVolume);
    });

    // Rate controls
    function updateRate(newRate) {
        if (newRate >= 5 && newRate <= 12) {
            ttsRate = newRate;
            ttsRateInput.value = newRate;
            localStorage.setItem('wordleTTSRate', newRate);
        }
    }

    ttsRateInput.addEventListener('change', () => {
        const newRate = parseInt(ttsRateInput.value);
        updateRate(newRate);
    });

    decreaseRateBtn.addEventListener('click', () => {
        const newRate = parseInt(ttsRateInput.value) - 1;
        updateRate(newRate);
    });

    increaseRateBtn.addEventListener('click', () => {
        const newRate = parseInt(ttsRateInput.value) + 1;
        updateRate(newRate);
    });

    // Round start settings
    ttsRoundStartEnabledCheckbox.addEventListener('change', () => {
        ttsRoundStartEnabled = ttsRoundStartEnabledCheckbox.checked;
        localStorage.setItem('wordleTTSRoundStartEnabled', ttsRoundStartEnabled);
    });

    ttsRoundStartTextsTextarea.addEventListener('change', () => {
        const texts = ttsRoundStartTextsTextarea.value.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsRoundStartTexts = texts;
        localStorage.setItem('wordleTTSRoundStartTexts', ttsRoundStartTextsTextarea.value);
    });

    // Read words settings
    ttsReadWordsCheckbox.addEventListener('change', () => {
        ttsReadWords = ttsReadWordsCheckbox.checked;
        localStorage.setItem('wordleTTSReadWords', ttsReadWords);
    });

    // Game won settings
    ttsGameWonEnabledCheckbox.addEventListener('change', () => {
        ttsGameWonEnabled = ttsGameWonEnabledCheckbox.checked;
        localStorage.setItem('wordleTTSGameWonEnabled', ttsGameWonEnabled);
    });

    ttsGameWonTextsTextarea.addEventListener('change', () => {
        const texts = ttsGameWonTextsTextarea.value.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsGameWonTexts = texts;
        localStorage.setItem('wordleTTSGameWonTexts', ttsGameWonTextsTextarea.value);
    });

    // Gameplay settings
    ttsGameplayEnabledCheckbox.addEventListener('change', () => {
        ttsGameplayEnabled = ttsGameplayEnabledCheckbox.checked;
        localStorage.setItem('wordleTTSGameplayEnabled', ttsGameplayEnabled);
        
        // Start or stop gameplay announcements
        if (ttsEnabled && ttsGameplayEnabled && !isGameOver) {
            startGameplayAnnouncements();
        } else {
            stopGameplayAnnouncements();
        }
    });

    // Interval controls
    function updateInterval(newInterval) {
        if (newInterval >= 10 && newInterval <= 300) {
            ttsGameplayInterval = newInterval;
            ttsGameplayIntervalInput.value = newInterval;
            localStorage.setItem('wordleTTSGameplayInterval', newInterval);
            
            // Restart gameplay announcements with new interval
            if (ttsEnabled && ttsGameplayEnabled && !isGameOver) {
                startGameplayAnnouncements();
            }
        }
    }

    ttsGameplayIntervalInput.addEventListener('change', () => {
        const newInterval = parseInt(ttsGameplayIntervalInput.value);
        updateInterval(newInterval);
    });

    decreaseIntervalBtn.addEventListener('click', () => {
        const newInterval = parseInt(ttsGameplayIntervalInput.value) - 10;
        updateInterval(newInterval);
    });

    increaseIntervalBtn.addEventListener('click', () => {
        const newInterval = parseInt(ttsGameplayIntervalInput.value) + 10;
        updateInterval(newInterval);
    });

    ttsGameplayTextsTextarea.addEventListener('change', () => {
        const texts = ttsGameplayTextsTextarea.value.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsGameplayTexts = texts;
        localStorage.setItem('wordleTTSGameplayTexts', ttsGameplayTextsTextarea.value);
    });

    // Test button
    testTTSBtn.addEventListener('click', () => {
        const testMessage = "This is a test of the text to speech system. Hello from Wordle!";
        speakText(testMessage);
    });
}

// Initialize TikTok settings
function initializeTikTokSettings() {
    const tiktokPlayModeSelect = document.getElementById('tiktok-play-mode');
    
    // Load saved settings
    const savedPlayMode = localStorage.getItem('wordleTiktokPlayMode');
    
    if (savedPlayMode) {
        tiktokPlayMode = savedPlayMode;
        if (tiktokPlayModeSelect) {
            tiktokPlayModeSelect.value = tiktokPlayMode;
        }
    }
    
    // Set initial state based on loaded play mode
    if (tiktokPlayMode === 'group') {
        startTikTokGroupMode();
    } else {
        // Ensure header margin is set correctly for individual mode on page load
        updateHeaderMargin();
    }
    
    // Event listeners
    if (tiktokPlayModeSelect) {
        tiktokPlayModeSelect.addEventListener('change', () => {
            tiktokPlayMode = tiktokPlayModeSelect.value;
            localStorage.setItem('wordleTiktokPlayMode', tiktokPlayMode);
            
            // Handle UI changes based on play mode
            if (tiktokPlayMode === 'group') {
                // Start TikTok group mode (group guess bar without simulation)
                startTikTokGroupMode();
            } else {
                // Stop TikTok group mode (restore keyboard visibility and hide bar)
                stopTikTokGroupMode();
            }
            
            // Trigger new game when switching modes
            if (newGameBtn) {
                newGameBtn.click();
            }
        });
    }
}

// TikTok Integration Functions
function handleRealComment(user) {
    if (isGameOver) return;

    console.log('TikTok Comment Received:', user);
    
    // Extract the first word from comment and clean it
    const comment = user.comment.trim();
    let firstWord = comment.split(' ')[0];
    
    // Remove all non-letter characters
    firstWord = firstWord.replace(/[^a-zA-Z]/g, '');

    if (firstWord.length < wordLength) return;
    if (firstWord.length > wordLength) return;
    firstWord = firstWord.toLowerCase();
    
    // Check if this guess is the same as the last guess
    if (lastUserComment === firstWord) {
        console.log('Duplicate guess detected, skipping:', firstWord);
        return;
    }
    
    // Store this guess as the last one
    lastUserComment = firstWord;
    
    // Check if this word matches the target word (winning word)
    if (firstWord.toLowerCase() === targetWord.toLowerCase()) {
        console.log('WINNING WORD DETECTED:', firstWord, 'from user:', user.username);
        // Set this user as the winning user to prevent other comments from being processed
        winningUser = {
            username: user.username,
            photoUrl: user.photoUrl,
            gift_name: user.gift_name || '',
            comment: user.comment,
            guessedWord: firstWord
        };
        console.log('Winning user set:', winningUser);
    }

    // Process the guess directly with embedded photoUrl and username
    processGuess(firstWord, user.photoUrl, user.username);
}

// Helper function to find the first empty row
function findFirstEmptyRow() {
    // With the new approach, always use the bottom row (currentRow is always maxRows - 1)
    return currentRow;
}

function handleTikTokIndividualGuess(guessWord, user) {
    // Store the user in the playingUsers array
    playingUsers.push(user);
    
    // Set the current guessing user
    currentGuessingUser = user;
    
    // Process the guess using the new unified function
    processGuess(guessWord, user.photoUrl, user.username);
    
    // Clear the current guessing user after the guess is complete
    setTimeout(() => {
        currentGuessingUser = null;
    }, 100);
}

function handleTikTokGroupGuess(guessWord, user) {
    // Add to the existing group guess stacks (same as the simulate group guesses feature)
    if (!groupGuessStacks[guessWord]) {
        groupGuessStacks[guessWord] = [];
    }
    
    // Check if this user is already in this stack
    const userAlreadyInStack = groupGuessStacks[guessWord].some(existingUser => 
        existingUser.username === user.username
    );
    
    if (userAlreadyInStack) {
        console.log('User already in stack for word:', user.username, guessWord);
        return; // Don't add the same user to the same stack twice
    }
    
    groupGuessStacks[guessWord].push(user);
    
    // Store the user in the playingUsers array for the entire game
    playingUsers.push(user);
    
    // If stack reaches required number, enter the word
    if (groupGuessStacks[guessWord].length >= requiredGuesses) {
        // Use the most recent user's profile for the guess
        const topUser = groupGuessStacks[guessWord][groupGuessStacks[guessWord].length - 1];
        
        // Set the current guessing user
        currentGuessingUser = topUser;
        
        // Process the guess using the new unified function
        processGuess(guessWord, topUser.photoUrl, topUser.username);
        
        // Clear the current guessing user after the guess is complete
        setTimeout(() => {
            currentGuessingUser = null;
        }, 100);
        
        // Remove the word from the stacks after submission
        delete groupGuessStacks[guessWord];
    }
    
    // Only keep 7 stacks (same logic as existing group guess bar)
    const stackWords = Object.keys(groupGuessStacks);
    if (stackWords.length > 7) {
        // Remove the smallest stack (rightmost)
        let minWord = stackWords[0];
        for (const w of stackWords) {
            if (groupGuessStacks[w].length < groupGuessStacks[minWord].length) minWord = w;
        }
        delete groupGuessStacks[minWord];
    }
    
    // Render the group guess bar chart (this will show TikTok users in the existing bar)
    renderGroupGuessBarChart();
}

function simulateGroupAudienceTyping(word, user) {
    // Set the current guessing user
    currentGuessingUser = user;
    
    // Process the guess using the new unified function
    processGuess(word, user.photoUrl, user.username);
    
    // Clear the current guessing user after the guess is complete
    setTimeout(() => {
        currentGuessingUser = null;
    }, 100);
}

// Initialize TikTok event listener
window.addEventListener('handleRealCommmentEvent', function(event) {
    const user = {
        username: event.detail.username,
        photoUrl: event.detail.photoUrl,
        gift_name: event.detail.gift_name || '',
        comment: event.detail.comment
    };
    handleRealComment(user);
});

window.addEventListener('handleRealGiftEvent', function(event) {
    const user = {
        username: event.detail.username,
        photoUrl: event.detail.photoUrl,
        gift_name: event.detail.gift_name,
        comment: event.detail.comment || ''
    };
    handleRealGift(user);
});

function handleRealGift(user) {
    console.log('TikTok Gift Received:', user);
}

// Expose function to get current target word
window.getCurrentTargetWord = function() {
    return targetWord;
};

// Start TikTok group mode (group guess bar without simulation)
function startTikTokGroupMode() {
    groupGuessBarActive = true;
    groupGuessStacks = {};
    
    const groupGuessBarChart = document.getElementById('group-guess-bar-chart');
    if (groupGuessBarChart) {
        groupGuessBarChart.style.display = 'flex';
    }
    
    // Hide keyboard in group mode (takes precedence over other keyboard settings)
    const keyboard = document.querySelector('.keyboard');
    if (keyboard) {
        keyboard.style.visibility = 'hidden';
        // Mark that group mode is controlling keyboard visibility
        keyboard.setAttribute('data-group-mode-hidden', 'true');
    }
    
    // Update header margin for group mode
    updateHeaderMargin();
    
    renderGroupGuessBarChart();
}

// Stop TikTok group mode
function stopTikTokGroupMode() {
    groupGuessBarActive = false;
    groupGuessStacks = {};
    
    const groupGuessBarChart = document.getElementById('group-guess-bar-chart');
    if (groupGuessBarChart) {
        groupGuessBarChart.style.display = 'none';
    }
    
    // Restore keyboard visibility based on settings when exiting group mode
    const keyboard = document.querySelector('.keyboard');
    if (keyboard) {
        // Remove group mode marker
        keyboard.removeAttribute('data-group-mode-hidden');
        
        // Check current keyboard visibility settings
        const hideKeyboardCheckbox = document.getElementById('hide-keyboard');
        const keyboardVisibilityOffCheckbox = document.getElementById('keyboard-visibility-off');
        
        // Restore visibility based on current settings
        if (hideKeyboardCheckbox && hideKeyboardCheckbox.checked) {
            keyboard.style.visibility = 'hidden';
        } else if (keyboardVisibilityOffCheckbox && keyboardVisibilityOffCheckbox.checked) {
            keyboard.style.visibility = 'hidden';
        } else {
            keyboard.style.visibility = 'visible';
        }
    }
    
    // Update header margin for individual mode
    updateHeaderMargin();
    
    renderGroupGuessBarChart();
}

function countCorrectLetters(result) {
    return result.filter(r => r === 'correct').length;
}

function updateIndividualBestGuess(guess, user, result) {
    // Only track best guess in individual mode (not group mode)
    if (tiktokPlayMode === 'group' || groupGuessBarActive) return;
    
    const correctCount = countCorrectLetters(result);
    
    if (!individualBestGuess || correctCount > individualBestGuess.correctCount) {
        individualBestGuess = {
            word: guess,
            user: user,
            result: result,
            correctCount: correctCount
        };
        
        // Display the best guess in the bottom row
        // displayIndividualBestGuessInBottomRow();
    }
}

function displayIndividualBestGuessInBottomRow() {
    // Only display in individual mode
    if (tiktokPlayMode === 'group' || groupGuessBarActive || !individualBestGuess) return;
    
    const bottomRowIndex = maxRows - 1; // Changed from maxRows to maxRows - 1 since we removed the separate answer row
    const bottomRow = document.querySelector(`.row[data-row="${bottomRowIndex}"]`);
    if (!bottomRow) return;
    
    // Clear the bottom row first
    removeProfileImageTile(bottomRow);
    for (let i = 0; i < wordLength; i++) {
        const tile = bottomRow.children[i];
        if (tile) {
            tile.textContent = '';
            tile.className = 'tile';
        }
    }
    
    // Add profile image for the best guess user
    if (individualBestGuess.user) {
        const userImage = getUserProfileImage(individualBestGuess.user.username);
        ensureProfileImageTile(bottomRow, userImage, individualBestGuess.user.username);
    }
    
    // Display the best guess word with results
    for (let i = 0; i < wordLength; i++) {
        const tileIndex = bottomRow.children.length > wordLength ? i + 1 : i;
        const tile = bottomRow.children[tileIndex];
        if (tile) {
            tile.textContent = individualBestGuess.word[i].toUpperCase();
            tile.className = 'tile best-guess';
            
            // Add result classes
            if (individualBestGuess.result[i] === 'correct') {
                tile.classList.add('correct');
            } else if (individualBestGuess.result[i] === 'present') {
                tile.classList.add('present');
            } else {
                tile.classList.add('absent');
            }
            
            // Add star indicator for best guess
            if (!tile.querySelector('.best-guess-star')) {
                const star = document.createElement('span');
                star.className = 'best-guess-star';
                star.textContent = '⭐';
                tile.appendChild(star);
            }
        }
    }
}

function showLossModal(targetWord) {
    const overlay = document.getElementById('winning-overlay');
    const modal = document.getElementById('winning-modal');
    const title = document.getElementById('winning-title');
    const wordDisplay = document.getElementById('winning-word');
    const singleWinner = document.getElementById('single-winner');
    const groupWinners = document.getElementById('group-winners');
    
    if (!overlay || !modal) return;
    
    // Record loss in statistics
    if (statisticsManager) {
        statisticsManager.recordLoss();
    }
    
    // Configure modal for loss
    title.textContent = 'You Lost, Streak Is Reset';
    title.style.color = '#ff4444'; // Red color for loss
    
    // Show the target word
    wordDisplay.textContent = `The word was: ${targetWord.toUpperCase()}`;
    
    // Hide winner sections
    if (singleWinner) singleWinner.style.display = 'none';
    if (groupWinners) groupWinners.style.display = 'none';
    
    // Add loss GIF
    let lossGif = document.getElementById('loss-gif');
    if (!lossGif) {
        lossGif = document.createElement('img');
        lossGif.id = 'loss-gif';
        lossGif.className = 'loss-gif';
        modal.appendChild(lossGif);
    }
    lossGif.src = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExajY3eG1jcDJveHYxanl2bHQzd3V6cHBza29xajhhMnUxZmkybjBuMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NdieEAYwEZJot8ZA92/giphy.gif';
    lossGif.style.display = 'block';
    
    // Show the overlay
    overlay.classList.add('show');
    
    // Auto-hide after configured duration and start new game
    setTimeout(() => {
        overlay.classList.remove('show');
        // Reset title color and hide GIF
        title.style.color = '';
        if (lossGif) lossGif.style.display = 'none';
        setTimeout(() => {
            initializeGame();
        }, 300); // Wait for fade out
    }, winningModalDuration * 1000);
}

// Statistics Management
class StatisticsManager {
    constructor() {
        this.stats = this.loadStats();
        this.initializeElements();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateDisplay();
    }

    loadStats() {
        const defaultStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            position: { x: 50, y: 50 }, // percentage position
            visible: true // default visibility
        };
        
        const saved = localStorage.getItem('wordleStats');
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    }

    saveStats() {
        localStorage.setItem('wordleStats', JSON.stringify(this.stats));
    }

    initializeElements() {
        this.card = document.getElementById('statistics-card');
        this.playedElement = document.getElementById('played-count');
        this.winPercentElement = document.getElementById('win-percentage');
        this.currentStreakElement = document.getElementById('current-streak');
        this.maxStreakElement = document.getElementById('max-streak');
        this.closeBtn = document.getElementById('close-statistics');
        this.clearBtn = document.getElementById('clear-statistics');
        this.streakVisibilityCheckbox = document.getElementById('streak-visibility');
        
        // Set initial position
        this.setPosition(this.stats.position.x, this.stats.position.y);
        
        // Set initial visibility based on saved stats
        this.setVisibility(this.stats.visible);
        
        // Sync checkbox with saved visibility state
        if (this.streakVisibilityCheckbox) {
            this.streakVisibilityCheckbox.checked = this.stats.visible;
        }
    }

    setupEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.stats.visible = false;
                this.setVisibility(false);
                this.saveStats();
                if (this.streakVisibilityCheckbox) {
                    this.streakVisibilityCheckbox.checked = false;
                }
            });
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
                    this.resetStats();
                }
            });
        }

        if (this.streakVisibilityCheckbox) {
            this.streakVisibilityCheckbox.addEventListener('change', (e) => {
                this.stats.visible = e.target.checked;
                this.setVisibility(e.target.checked);
                this.saveStats();
            });
        }
    }

    setupDragAndDrop() {
        const header = this.card?.querySelector('.statistics-header');
        if (!header || !this.card) return;

        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.card.classList.add('dragging');
            
            const rect = this.card.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            initialX = rect.left;
            initialY = rect.top;

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const newX = e.clientX - startX;
            const newY = e.clientY - startY;
            
            // Keep card within viewport bounds
            const maxX = window.innerWidth - this.card.offsetWidth;
            const maxY = window.innerHeight - this.card.offsetHeight;
            
            const clampedX = Math.max(0, Math.min(newX, maxX));
            const clampedY = Math.max(0, Math.min(newY, maxY));
            
            this.card.style.left = clampedX + 'px';
            this.card.style.top = clampedY + 'px';
            this.card.style.transform = 'none';
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            this.card.classList.remove('dragging');
            
            // Save position as percentage
            const rect = this.card.getBoundingClientRect();
            const percentX = (rect.left / (window.innerWidth - this.card.offsetWidth)) * 100;
            const percentY = (rect.top / (window.innerHeight - this.card.offsetHeight)) * 100;
            
            this.stats.position = { 
                x: Math.max(0, Math.min(100, percentX)), 
                y: Math.max(0, Math.min(100, percentY))
            };
            this.saveStats();
        });
    }

    setPosition(percentX, percentY) {
        if (!this.card) return;
        
        // Convert percentage to pixels
        const maxX = window.innerWidth - 300; // card width
        const maxY = window.innerHeight - 200; // approximate card height
        
        const x = (percentX / 100) * Math.max(0, maxX);
        const y = (percentY / 100) * Math.max(0, maxY);
        
        this.card.style.left = x + 'px';
        this.card.style.top = y + 'px';
        this.card.style.transform = 'none';
    }

    setVisibility(visible) {
        if (!this.card) return;
        
        if (visible) {
            this.card.classList.remove('hidden');
        } else {
            this.card.classList.add('hidden');
        }
    }

    recordWin() {
        this.stats.gamesPlayed++;
        this.stats.gamesWon++;
        this.stats.currentStreak++;
        this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
        this.saveStats();
        this.updateDisplay();
    }

    recordLoss() {
        this.stats.gamesPlayed++;
        this.stats.currentStreak = 0;
        this.saveStats();
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.playedElement) return;
        
        const winPercentage = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100)
            : 0;

        this.playedElement.textContent = this.stats.gamesPlayed;
        this.winPercentElement.textContent = winPercentage;
        this.currentStreakElement.textContent = this.stats.currentStreak;
        this.maxStreakElement.textContent = this.stats.maxStreak;
    }

    resetStats() {
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            position: this.stats.position, // Keep position
            visible: this.stats.visible // Keep visibility setting
        };
        this.saveStats();
        this.updateDisplay();
    }
}

// Initialize statistics manager
let statisticsManager;

function updateHeaderMargin() {
    const headerContainer = document.getElementById('header-container');
    const isGroupMode = document.getElementById('group-guess-bar-chart').style.display !== 'none';
    
    if (headerContainer) {
        if (isGroupMode) {
            headerContainer.style.marginTop = '0px';
        } else {
            headerContainer.style.marginTop = '0px';
        }
    }
}

// Handle keyboard input
function handleKeyPress(key) {
    if (isGameOver) return;
    
    if (key === 'enter') {
        submitGuess();
    } else if (key === 'backspace') {
        deleteLetter();
    } else if (/^[a-z]$/.test(key) && currentTile < wordLength) {
        addLetter(key);
    }
}

// Add a letter to the current tile
function addLetter(letter) {
    if (currentTile < wordLength) {
        const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${currentTile}"]`);
        if (tile) {
            tile.textContent = letter.toUpperCase();
            // Show profile image when first letter is added
            if (currentTile === 0) {
                const row = document.querySelector(`.row[data-row="${currentRow}"]`);
                // Get the correct user image
                const userImage = getUserProfileImage(currentGuessingUser ? currentGuessingUser.username : null);
                // Ensure the profile image tile exists with the correct image
                ensureProfileImageTile(row, userImage, currentGuessingUser ? currentGuessingUser.username : 'Host');
                const imgTile = row.querySelector('.profile-img-tile');
                const img = imgTile ? imgTile.querySelector('.profile-img-in-tile') : null;
                if (img) {
                    img.style.display = 'block';
                }
            }
            // Remove bounce animation to avoid setTimeout
            currentTile++;
        }
    }
}

// Delete the last letter
function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${currentTile}"]`);
        if (tile) {
            tile.textContent = '';
            // Remove any state classes when deleting
            tile.classList.remove('correct', 'present', 'absent');
            
            // Hide profile image when all letters are deleted
            if (currentTile === 0) {
                const row = document.querySelector(`.row[data-row="${currentRow}"]`);
                const imgTile = row.querySelector('.profile-img-tile');
                const img = imgTile ? imgTile.querySelector('.profile-img-in-tile') : null;
                if (img) {
                    img.style.display = 'none';
                }
            }
        }
    }
}

// Add a new row to the bottom and remove the top row
function addNewRow() {
    // Remove the top row
    const topRow = board.firstChild;
    if (topRow) {
        board.removeChild(topRow);
    }
    
    // Add new empty row at the bottom
    const newRow = createRowWithGuess(maxRows - 1);
    board.appendChild(newRow);
    
    // Update all row data-row attributes to maintain sequential numbering
    const allRows = board.querySelectorAll('.row');
    allRows.forEach((row, index) => {
        row.setAttribute('data-row', index);
        // Update all tiles within this row
        const tiles = row.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.setAttribute('data-row', index);
        });
    });
    
    // Current row stays at the bottom
    currentRow = maxRows - 1;
}

// Check the guess against the target word
function checkGuess(guess) {
    const result = Array(wordLength).fill('absent');
    const targetLetters = targetWord.split('');
    
    // First pass: Mark correct letters
    for (let i = 0; i < wordLength; i++) {
        if (guess[i] === targetWord[i]) {
            result[i] = 'correct';
            targetLetters[i] = null; // Mark as used
        }
    }
    
    // Second pass: Mark present letters
    for (let i = 0; i < wordLength; i++) {
        if (result[i] === 'absent') {
            const index = targetLetters.indexOf(guess[i]);
            if (index !== -1) {
                result[i] = 'present';
                targetLetters[index] = null; // Mark as used
            }
        }
    }
    
    return result;
}

// Show a message
function showMessage(message) {
    messageDisplay.textContent = message;
    setTimeout(() => {
        messageDisplay.textContent = '';
    }, 3000);
}

// Update fastSubmitWord to use new approach
function fastSubmitWord(word, user, callback) {
    if (!word || word.length !== wordLength) return;
    
    // Prevent duplicate word submissions from the same user
    if (word.toLowerCase() === lastSubmittedWord && 
        user && lastSubmittedUser && 
        user.username === lastSubmittedUser.username) {
        console.log('Duplicate word from same user detected, skipping:', word, user.username);
        return;
    }
    lastSubmittedWord = word.toLowerCase();
    lastSubmittedUser = user;
    
    // Process the guess using the new unified function
    processGuess(word, user.photoUrl, user.username);
    
    // Execute callback after a short delay
    setTimeout(() => {
        if (callback) callback();
    }, 100);
}

// Add Enter key listener for host input
document.addEventListener('keydown', (e) => {
    const hostInput = document.getElementById('host-guess-input');
    if (document.activeElement === hostInput && e.key === 'Enter') {
        handleHostGuess();
        return;
    }
    
    // Check if settings panel is open
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel && settingsPanel.classList.contains('open')) {
        return; // Don't process game keys when settings panel is open
    }
    
    // Check if any input field is focused
    const activeElement = document.activeElement;
    if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
    )) {
        return; // Don't process game keys when input fields are focused
    }
});

function submitHintPrefix(hintUser) {
    // hintUser = { username, photoUrl }

    if (isGameOver) return;
    if (!targetWord || !targetWord.length) return;

    if (hintRevealIndex >= wordLength) {
        console.log("[wordle] all hint letters already revealed");
        return;
    }

    // Calcula el prefijo revelado
    const prefix = targetWord.slice(0, hintRevealIndex + 1).toLowerCase();
    const paddedGuess = prefix.padEnd(wordLength, " ");

    // Normalizamos el usuario que pidió la pista
    const effectiveUser = {
        username: (hintUser && hintUser.username) || "HOST",
        photoUrl:
            (hintUser && hintUser.photoUrl) ||
            localStorage.getItem("wordleProfileImage") ||
            "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
    };

    // Añadimos este user a la lista de jugadores activos de la ronda
    playingUsers.push({
        username: effectiveUser.username,
        photoUrl: effectiveUser.photoUrl,
    });

    // Marcamos que este usuario es el que está "adivinando" ahora mismo
    currentGuessingUser = effectiveUser;

    // Inyectamos el guess parcial al juego, como si fuera un intento
    if (typeof processGuess === "function") {
        // processGuess(palabra, foto, nombre)
        processGuess(paddedGuess, effectiveUser.photoUrl, effectiveUser.username);
    } else if (typeof fastSubmitWord === "function") {
        // fastSubmitWord(palabra, { username, photoUrl }, cb)
        fastSubmitWord(paddedGuess, effectiveUser, () => {});
    }

    // dejamos currentGuessingUser solo un ratito marcado
    setTimeout(() => {
        currentGuessingUser = null;
    }, 100);

    // avanzamos el índice de hint
    hintRevealIndex++;
}

function sendRoundWinner(payload) {
  try {
    if (!window.wordleOverlay || typeof window.wordleOverlay.sendToMain !== "function") {
      console.log("[wordle] round-winner skipped: no bridge available", payload);
      return;
    }
    window.wordleOverlay.sendToMain({
      type: "round-winner",
      data: payload,
    });
  } catch (e) {
    console.log("[wordle] Error sending round-winner:", e);
  }
}

// ===================== Electron Wordle bridge =====================
(function setupElectronWordleBridge() {
  if (!window.wordleOverlay || typeof window.wordleOverlay.onMessage !== "function") return;

  window.addEventListener("DOMContentLoaded", () => {
    window.wordleOverlay.sendToMain({ type: "ready", overlay: "wordle" });

    const savedBg = localStorage.getItem('wordleBgImageUrl');
    if (savedBg) {
      overlayBackgroundUrl = savedBg;
      applyBackgroundImage(savedBg);
    }
  });

  window.wordleOverlay.onMessage((msg) => {
    if (!msg || typeof msg !== "object") return;
    console.log("[wordle] message from main:", msg);

    switch (msg.type) {

      case "set-background": {
        const newUrl = msg.imageUrl || "";
        overlayBackgroundUrl = newUrl;
        applyBackgroundImage(newUrl);
        localStorage.setItem('wordleBgImageUrl', newUrl);
        break;
      }

      case "guess": {
        if (isGameOver) break;
        if (!msg.word || typeof msg.word !== "string") break;

        const guessWord = String(msg.word).trim();
        const lower = guessWord.toLowerCase();

        const username = msg.username || "Player";
        const photo =
          msg.photoUrl ||
          "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";

        const mode = msg.mode === "group" ? "group" : "single";

        if (mode === "group") {
          // === MODO GRUPO (votos únicos) ===
          if (!groupGuessBarActive && typeof openGroupGuessBarUI === "function") {
            openGroupGuessBarUI();
          }

          if (!groupGuessStacks[lower]) {
            groupGuessStacks[lower] = [];
          }

          const alreadyVoted = groupGuessStacks[lower].some(
            (u) => u.username === username
          );

          if (!alreadyVoted) {
            groupGuessStacks[lower].push({
              username,
              photoUrl: photo,
            });

            if (Array.isArray(playingUsers)) {
              playingUsers.push({
                username,
                photoUrl: photo,
              });
            }
          } else {
            console.log("[wordle] voto duplicado ignorado:", lower, username);
          }

          const need =
            Number(msg.requiredGuesses) ||
            (typeof requiredGuesses !== "undefined" ? requiredGuesses : 5);

          if (groupGuessStacks[lower].length >= need) {
            if (typeof simulateGroupAudienceTyping === "function") {
              const lastVoter =
                groupGuessStacks[lower][groupGuessStacks[lower].length - 1] || {
                  username,
                  photoUrl: photo,
                };

              simulateGroupAudienceTyping(lower, {
                username: lastVoter.username,
                photoUrl: lastVoter.photoUrl,
              });
            }

            delete groupGuessStacks[lower];
          }

          if (typeof renderGroupGuessBarChart === "function") {
            renderGroupGuessBarChart();
          }

        } else {
          // === MODO SINGLE (anti duplicado global) ===
          if (usedSingleWords.has(lower)) {
            console.log("[wordle] Ignorando palabra repetida en modo single:", lower);
            break;
          }
          usedSingleWords.add(lower);

          if (typeof fastSubmitWord === "function") {
            const fakeUserObj = { username, photoUrl: photo };
            fastSubmitWord(guessWord, fakeUserObj, () => {});
          } else if (typeof processGuess === "function") {
            processGuess(guessWord, photo, username);
          }
        }

        break;
      }

      case "clear-round": {
        // No permitir limpiar si la ronda ya terminó o estamos en transición post-modal
        if (isGameOver || roundTransitioning) {
            console.log("[wordle] clear-round ignorado: ronda finalizada o en transición.");
            break;
        }
        // si quieres solo limpiar UI pero NO desbloquear, llama con unlock:false
        wipeBoardAndKeyboardAndUnlockGuesses({ unlock: false });
        break;
      }

      case "hint-prefix": {
        const username = msg.username || "HOST";
        const photoUrl =
        msg.photoUrl ||
        localStorage.getItem("wordleProfileImage") ||
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";

        submitHintPrefix({ username, photoUrl });
        break;
      }

      case "reset-leaderboard": {
        resetLeaderboardAllTime();
        break;
      }

      case "adjust-round-timer": {
        const delta = Number(msg.delta) || 0;
        adjustRoundTimer(delta);
        break;
      }

      case "set-custom-word-bank": {
        customWordBankEnabled = !!msg.enabled;
        const next = msg.bank && typeof msg.bank === 'object' ? msg.bank : {};
        customWordBank = {
            4: Array.isArray(next[4]) ? next[4] : [],
            5: Array.isArray(next[5]) ? next[5] : [],
            6: Array.isArray(next[6]) ? next[6] : [],
            7: Array.isArray(next[7]) ? next[7] : [],
            8: Array.isArray(next[8]) ? next[8] : [],
            9: Array.isArray(next[9]) ? next[9] : [],
            10: Array.isArray(next[10]) ? next[10] : [],
        };

        // persistimos en la overlay por si se recarga
        try {
            localStorage.setItem('wordleUseCustomWords', customWordBankEnabled ? '1' : '0');
            localStorage.setItem('wordleCustomWordsBank', JSON.stringify(customWordBank));
        } catch {}

        console.log('[wordle] Custom bank updated. enabled=', customWordBankEnabled, customWordBank);
        break;
      }

      default:
        break;
    }
  });
})();