const modeScreen = document.getElementById("mode-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const gameScreen = document.getElementById("game-screen");

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

const challengeStatus = document.getElementById("challenge-status");
const levelNameElement = document.getElementById("level-name");
const levelScoreElement = document.getElementById("level-score");
const levelTimeElement = document.getElementById("level-time");

const CHALLENGE_TARGET = 5;
const CHALLENGE_LIMIT_TIME = 10;

const LEVEL_ORDER = ["easy", "normal", "hard"];

const LEVEL_LABELS = {
  easy: "EASY",
  normal: "NORMAL",
  hard: "HARD"
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

let currentText = "";
let score = 0;
let time = 60;
let timerId = null;
let isPlaying = false;
let isComposing = false;

let selectedModeKey = "";
let selectedDifficultyKey = "";
let selectedTextGroupKey = "";

let challengeLevelIndex = 0;
let challengeCorrectCount = 0;
let challengeTimeLeft = CHALLENGE_LIMIT_TIME;

function showScreen(screenName) {
  modeScreen.classList.add("hidden");
  difficultyScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");

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

  if (modeConfig.type === "challenge") {
    selectedTextGroupKey = modeConfig.challengeGroups.easy;
    selectedModeLabel.textContent = "チャレンジモード / EASYからスタート";
  } else {
    selectedTextGroupKey = difficulty.group;
    selectedModeLabel.textContent = `${modeConfig.title} / ${difficulty.label}`;
  }

  prepareGame();
  showScreen("game");
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

function endGame() {
  isPlaying = false;
  resetTimer();

  inputElement.disabled = true;
  wordElement.textContent = "FINISH";
  messageElement.textContent = `ゲーム終了！ スコア：${score}`;

  startButton.disabled = false;
  startButton.textContent = "RESTART";
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

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    showDifficultyScreen(button.dataset.mode);
  });
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