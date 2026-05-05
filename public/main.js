const nameScreen = document.getElementById("name-screen");
const modeScreen = document.getElementById("mode-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const gameScreen = document.getElementById("game-screen");

const nameInput = document.getElementById("name-input");
const nameSubmitButton = document.getElementById("name-submit-button");
const firebaseStatusElement = document.getElementById("firebase-status");

const modeTitleElement = document.getElementById("mode-title");
const modeDescriptionElement = document.getElementById("mode-description");
const difficultyButtonsElement = document.getElementById("difficulty-buttons");

const timeElement = document.getElementById("time");
const scoreElement = document.getElementById("score");
const wordElement = document.getElementById("word");
const inputElement = document.getElementById("input");
const startButton = document.getElementById("start-button");
const messageElement = document.getElementById("message");

const backButton = document.getElementById("back-button");
const modeSelectButton = document.getElementById("mode-select-button");
const selectedModeLabel = document.getElementById("selected-mode-label");
const playerLabel = document.getElementById("player-label");

const challengeStatus = document.getElementById("challenge-status");
const levelNameElement = document.getElementById("level-name");
const levelScoreElement = document.getElementById("level-score");
const levelTimeElement = document.getElementById("level-time");

const rankingTitle = document.getElementById("ranking-title");
const rankingList = document.getElementById("ranking-list");

const CHALLENGE_TARGET = 5;
const CHALLENGE_LIMIT_TIME = 10;

const LEVEL_ORDER = ["easy", "normal", "hard"];

const LEVEL_LABELS = {
  easy: "EASY",
  normal: "NORMAL",
  hard: "HARD"
};

const RANKING_LABELS = {
  normal_easy: "通常モード / easy",
  normal_normal: "通常モード / normal",
  normal_hard: "通常モード / hard",
  challenge_challenge: "チャレンジモード",
  food_easy: "早食いモード / 食べ物",
  food_normal: "早食いモード / 和洋中華",
  food_hard: "早食いモード / 世界グルメ"
};

const MODE_CONFIGS = {
  normal: {
    title: "通常モード",
    description: "選んだ難易度の単語だけが出題されます。",
    type: "fixed",
    difficulties: [
      {
        key: "easy",
        label: "easy",
        description: "2〜3文字くらいの短い言葉",
        group: "normalEasy"
      },
      {
        key: "normal",
        label: "normal",
        description: "3〜7文字くらいの言葉",
        group: "normalNormal"
      },
      {
        key: "hard",
        label: "hard",
        description: "四字熟語・慣用句など",
        group: "normalHard"
      }
    ]
  },

  challenge: {
    title: "チャレンジモード",
    description: "EASYから開始。10秒以内に5単語正解で難易度アップ。失敗すると難易度ダウン。",
    type: "challenge",
    challengeGroups: {
      easy: "normalEasy",
      normal: "normalNormal",
      hard: "normalHard"
    },
    difficulties: [
      {
        key: "challenge",
        label: "チャレンジ開始",
        description: "EASYから自動で難易度が変わります"
      }
    ]
  },

  food: {
    title: "早食いモード",
    description: "食べ物・料理名だけが出題されます。",
    type: "fixed",
    difficulties: [
      {
        key: "easy",
        label: "食べ物",
        description: "イージー：身近な食べ物",
        group: "foodEasy"
      },
      {
        key: "normal",
        label: "和洋中華",
        description: "ノーマル：いろいろな料理名",
        group: "foodNormal"
      },
      {
        key: "hard",
        label: "世界グルメ",
        description: "ハード：世界の料理名",
        group: "foodHard"
      }
    ]
  }
};

let db = null;
let currentUser = null;

let currentText = "";
let score = 0;
let time = 60;
let timerId = null;
let isPlaying = false;
let isComposing = false;

let playerName = "";
let selectedModeKey = "";
let selectedDifficultyKey = "";
let selectedDifficultyLabel = "";
let selectedTextGroupKey = "";

let challengeLevelIndex = 0;
let challengeCorrectCount = 0;
let challengeTimeLeft = CHALLENGE_LIMIT_TIME;

function initFirebase() {
  if (typeof firebase === "undefined") {
    firebaseStatusElement.textContent = "Firebase SDKが読み込めていません";
    return;
  }

  if (typeof firebaseConfig === "undefined") {
    firebaseStatusElement.textContent = "firebase-config.jsが見つかりません";
    return;
  }

  firebase.initializeApp(firebaseConfig);

  db = firebase.firestore();

  firebase.auth().signInAnonymously()
    .then((result) => {
      currentUser = result.user;
      firebaseStatusElement.textContent = "Firebase接続OK";
    })
    .catch((error) => {
      console.error(error);
      firebaseStatusElement.textContent = "Firebase接続エラー";
    });
}

function showScreen(screenName) {
  nameScreen.classList.add("hidden");
  modeScreen.classList.add("hidden");
  difficultyScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");

  if (screenName === "name") {
    nameScreen.classList.remove("hidden");
  }

  if (screenName === "mode") {
    modeScreen.classList.remove("hidden");
  }

  if (screenName === "difficulty") {
    difficultyScreen.classList.remove("hidden");
  }

  if (screenName === "game") {
    gameScreen.classList.remove("hidden");
  }
}

function registerPlayerName() {
  const inputName = nameInput.value.trim();

  if (inputName.length === 0) {
    firebaseStatusElement.textContent = "名前を入力してください";
    return;
  }

  if (inputName.length > 12) {
    firebaseStatusElement.textContent = "名前は12文字以内にしてください";
    return;
  }

  playerName = inputName;
  localStorage.setItem("typingGamePlayerName", playerName);

  playerLabel.textContent = `PLAYER: ${playerName}`;

  showScreen("mode");
}

function loadSavedPlayerName() {
  const savedName = localStorage.getItem("typingGamePlayerName");

  if (savedName) {
    nameInput.value = savedName;
  }
}

function showDifficultyScreen(modeKey) {
  selectedModeKey = modeKey;

  const modeConfig = MODE_CONFIGS[modeKey];

  modeTitleElement.textContent = modeConfig.title;
  modeDescriptionElement.textContent = modeConfig.description;
  difficultyButtonsElement.innerHTML = "";

  for (const difficulty of modeConfig.difficulties) {
    const button = document.createElement("button");
    button.className = "menu-button";
    button.dataset.difficulty = difficulty.key;

    button.innerHTML = `
      ${difficulty.label}
      <span>${difficulty.description}</span>
    `;

    button.addEventListener("click", () => {
      selectDifficulty(difficulty);
    });

    difficultyButtonsElement.appendChild(button);
  }

  showScreen("difficulty");
}

function selectDifficulty(difficulty) {
  const modeConfig = MODE_CONFIGS[selectedModeKey];

  selectedDifficultyKey = difficulty.key;
  selectedDifficultyLabel = difficulty.label;

  if (modeConfig.type === "challenge") {
    selectedTextGroupKey = modeConfig.challengeGroups.easy;
    selectedModeLabel.textContent = "チャレンジモード / EASYからスタート";
  } else {
    selectedTextGroupKey = difficulty.group;
    selectedModeLabel.textContent = `${modeConfig.title} / ${difficulty.label}`;
  }

  prepareGame();
  showScreen("game");
  loadRankingFromFirebase();
}

function prepareGame() {
  resetTimer();

  score = 0;
  time = 60;
  currentText = "";
  isPlaying = false;
  isComposing = false;

  scoreElement.textContent = score;
  timeElement.textContent = time;
  wordElement.textContent = "START";
  inputElement.value = "";
  inputElement.disabled = true;
  startButton.disabled = false;
  startButton.textContent = "START";
  messageElement.textContent = "";

  challengeLevelIndex = 0;
  challengeCorrectCount = 0;
  challengeTimeLeft = CHALLENGE_LIMIT_TIME;

  if (isChallengeMode()) {
    challengeStatus.classList.remove("hidden");
    updateChallengeStatus();
  } else {
    challengeStatus.classList.add("hidden");
  }
}

function resetTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function isChallengeMode() {
  const modeConfig = MODE_CONFIGS[selectedModeKey];
  return modeConfig.type === "challenge";
}

function getCurrentTextGroupKey() {
  if (isChallengeMode()) {
    const levelKey = LEVEL_ORDER[challengeLevelIndex];
    return MODE_CONFIGS.challenge.challengeGroups[levelKey];
  }

  return selectedTextGroupKey;
}

function getRandomText() {
  const groupKey = getCurrentTextGroupKey();
  const texts = typingTextGroups[groupKey];

  const randomIndex = Math.floor(Math.random() * texts.length);
  return texts[randomIndex];
}

function adjustWordSize(text) {
  if (text.length > 45) {
    wordElement.style.fontSize = "24px";
    wordElement.style.lineHeight = "1.5";
  } else if (text.length > 30) {
    wordElement.style.fontSize = "28px";
    wordElement.style.lineHeight = "1.5";
  } else if (text.length > 18) {
    wordElement.style.fontSize = "32px";
    wordElement.style.lineHeight = "1.5";
  } else {
    wordElement.style.fontSize = "38px";
    wordElement.style.lineHeight = "1.5";
  }
}

function setNewText() {
  currentText = getRandomText();
  wordElement.textContent = currentText;
  adjustWordSize(currentText);
  inputElement.value = "";
}

function startGame() {
  resetTimer();

  score = 0;
  time = 60;
  isPlaying = true;

  scoreElement.textContent = score;
  timeElement.textContent = time;
  messageElement.textContent = "";

  inputElement.disabled = false;
  inputElement.focus();

  startButton.disabled = true;
  startButton.textContent = "PLAYING";

  if (isChallengeMode()) {
    challengeLevelIndex = 0;
    challengeCorrectCount = 0;
    challengeTimeLeft = CHALLENGE_LIMIT_TIME;
    updateChallengeStatus();
  }

  setNewText();

  timerId = setInterval(() => {
    if (!isPlaying) {
      return;
    }

    time--;
    timeElement.textContent = time;

    if (time <= 0) {
      endGame();
      return;
    }

    if (isChallengeMode()) {
      updateChallengeTimer();
    }
  }, 1000);
}

async function endGame() {
  if (!isPlaying) {
    return;
  }

  isPlaying = false;
  resetTimer();

  inputElement.disabled = true;
  wordElement.textContent = "FINISH";
  messageElement.textContent = `ゲーム終了！ スコア：${score}`;

  startButton.disabled = false;
  startButton.textContent = "RESTART";

  await saveScoreToFirebase();
  await loadRankingFromFirebase();
}

function updateChallengeTimer() {
  challengeTimeLeft--;

  if (challengeTimeLeft <= 0) {
    changeChallengeLevel(-1);
    return;
  }

  updateChallengeStatus();
}

function changeChallengeLevel(direction) {
  const oldLevelIndex = challengeLevelIndex;

  challengeLevelIndex += direction;

  if (challengeLevelIndex < 0) {
    challengeLevelIndex = 0;
  }

  if (challengeLevelIndex > LEVEL_ORDER.length - 1) {
    challengeLevelIndex = LEVEL_ORDER.length - 1;
  }

  challengeCorrectCount = 0;
  challengeTimeLeft = CHALLENGE_LIMIT_TIME;

  const currentLevelKey = LEVEL_ORDER[challengeLevelIndex];
  const currentLevelName = LEVEL_LABELS[currentLevelKey];

  if (direction > 0 && challengeLevelIndex > oldLevelIndex) {
    messageElement.textContent = `難易度アップ！ ${currentLevelName}`;
  } else if (direction < 0 && challengeLevelIndex < oldLevelIndex) {
    messageElement.textContent = `難易度ダウン！ ${currentLevelName}`;
  } else {
    messageElement.textContent = `${currentLevelName} キープ！`;
  }

  updateChallengeStatus();
}

function updateChallengeStatus() {
  const levelKey = LEVEL_ORDER[challengeLevelIndex];

  levelNameElement.textContent = LEVEL_LABELS[levelKey];
  levelScoreElement.textContent = challengeCorrectCount;
  levelTimeElement.textContent = challengeTimeLeft;
}

function checkInput() {
  if (!isPlaying) {
    return;
  }

  if (isComposing) {
    return;
  }

  if (inputElement.value === currentText) {
    score++;
    scoreElement.textContent = score;

    if (isChallengeMode()) {
      challengeCorrectCount++;
      updateChallengeStatus();

      if (challengeCorrectCount >= CHALLENGE_TARGET) {
        changeChallengeLevel(1);
      }
    }

    setNewText();
  }
}

function returnToModeSelect() {
  prepareGame();
  showScreen("mode");
}

function getRankingKey() {
  if (selectedModeKey === "challenge") {
    return "challenge_challenge";
  }

  return `${selectedModeKey}_${selectedDifficultyKey}`;
}

async function saveScoreToFirebase() {
  if (!db || !currentUser) {
    messageElement.textContent = `ゲーム終了！ スコア：${score} / Firebase未接続のため保存できませんでした`;
    return;
  }

  const rankingKey = getRankingKey();

  try {
    await db
      .collection("rankings")
      .doc(rankingKey)
      .collection("scores")
      .add({
        name: playerName,
        score: score,
        mode: selectedModeKey,
        difficulty: selectedDifficultyKey,
        rankingKey: rankingKey,
        uid: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    messageElement.textContent = `ゲーム終了！ スコア：${score} / ランキングに保存しました`;
  } catch (error) {
    console.error(error);
    messageElement.textContent = `ゲーム終了！ スコア：${score} / 保存エラー`;
  }
}

async function loadRankingFromFirebase() {
  if (!db) {
    rankingTitle.textContent = "ランキング";
    rankingList.innerHTML = "<li>Firebase未接続です</li>";
    return;
  }

  const rankingKey = getRankingKey();
  const rankingLabel = RANKING_LABELS[rankingKey] || "ランキング";

  rankingTitle.textContent = `${rankingLabel} ランキング`;
  rankingList.innerHTML = "<li>読み込み中...</li>";

  try {
    const snapshot = await db
      .collection("rankings")
      .doc(rankingKey)
      .collection("scores")
      .orderBy("score", "desc")
      //ランキング表示数
      .limit(10)
      .get();

    const ranking = [];

    snapshot.forEach((doc) => {
      ranking.push(doc.data());
    });

    renderRanking(ranking);
  } catch (error) {
    console.error(error);
    rankingList.innerHTML = "<li>ランキングの読み込みに失敗しました</li>";
  }
}

function renderRanking(ranking) {
  rankingList.innerHTML = "";

  if (ranking.length === 0) {
    rankingList.innerHTML = "<li>まだ記録がありません</li>";
    return;
  }

  ranking.forEach((record, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="rank-number">${index + 1}位</span>
      <span class="rank-name">${escapeHtml(record.name)}</span>
      <span class="rank-score">${record.score}点</span>
    `;

    rankingList.appendChild(li);
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    showDifficultyScreen(button.dataset.mode);
  });
});

nameSubmitButton.addEventListener("click", registerPlayerName);

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    registerPlayerName();
  }
});

backButton.addEventListener("click", () => {
  showScreen("mode");
});

modeSelectButton.addEventListener("click", returnToModeSelect);

inputElement.addEventListener("compositionstart", () => {
  isComposing = true;
});

inputElement.addEventListener("compositionend", () => {
  isComposing = false;
  checkInput();
});

inputElement.addEventListener("input", checkInput);

startButton.addEventListener("click", startGame);

loadSavedPlayerName();
initFirebase();
showScreen("name");