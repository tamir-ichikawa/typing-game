const loadingScreen = document.getElementById("loading-screen");
const loadingBarFill = document.getElementById("loading-bar-fill");
const loadingPercent = document.getElementById("loading-percent");
const loadingDetail = document.getElementById("loading-detail");
const app = document.getElementById("app");
const menuCharacterImg = document.getElementById("menu-character-img");

const nameScreen = document.getElementById("name-screen");
const modeScreen = document.getElementById("mode-screen");
const allRankingScreen = document.getElementById("all-ranking-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const gameScreen = document.getElementById("game-screen");

const menuCharacter = document.getElementById("menu-character");
const gameCharacter = document.getElementById("game-character");
const gameCharacterImg = document.getElementById("game-character-img");
const gameCharacterSprite = document.getElementById("game-character-sprite");

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

const countdownOverlay = document.getElementById("countdown-overlay");
const countdownText = document.getElementById("countdown-text");

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
const rankingArea = document.getElementById("ranking-area");

const allRankingButton = document.getElementById("all-ranking-button");
const allRankingBackButton = document.getElementById("all-ranking-back-button");
const allRankingList = document.getElementById("all-ranking-list");

const gameSoundToggleButton = document.getElementById("sound-toggle-button");
const modeSoundToggleButton = document.getElementById("mode-sound-toggle-button");

const CHALLENGE_TARGET = 5;
const CHALLENGE_LIMIT_TIME = 10;

const LEVEL_ORDER = ["easy", "normal", "hard"];

const LEVEL_LABELS = {
  easy: "EASY",
  normal: "NORMAL",
  hard: "HARD"
};

const RANKING_LABELS = {
  normal_easy: "通常モード / イージー",
  normal_normal: "通常モード / ノーマル",
  normal_hard: "通常モード / ハード",
  challenge_challenge: "チャレンジモード",
  food_easy: "早食いモード / 食べ物",
  food_normal: "早食いモード / 和洋中華",
  food_hard: "早食いモード / 世界グルメ"
};

const MODE_CONFIGS = {
  normal: {
    title: "通常モード",
    description: "一定の難易度でプレイ！",
    type: "fixed",
    difficulties: [
      {
        key: "easy",
        label: "イージー",
        description: "2〜3文字くらいの短い言葉",
        group: "normalEasy"
      },
      {
        key: "normal",
        label: "ノーマル",
        description: "3〜7文字くらいの言葉",
        group: "normalNormal"
      },
      {
        key: "hard",
        label: "ハード",
        description: "四字熟語・慣用句など",
        group: "normalHard"
      }
    ]
  },

  challenge: {
    title: "チャレンジモード",
    description: "難易度が変化するよ！",
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
        description: "難易度が変化するよ"
      }
    ]
  },

  food: {
    title: "早食いモード",
    description: "食べ物・料理名",
    type: "fixed",
    difficulties: [
      {
        key: "easy",
        label: "食べ物",
        description: "イージー",
        group: "foodEasy"
      },
      {
        key: "normal",
        label: "和洋中華",
        description: "ノーマル",
        group: "foodNormal"
      },
      {
        key: "hard",
        label: "世界グルメ",
        description: "ハード",
        group: "foodHard"
      }
    ]
  }
};

const sounds = {
  bgmMenu: new Audio("./assets/audio/menu-bgm.mp3"),
  bgmNormal: new Audio("./assets/audio/normal-bgm.mp3"),
  bgmChallenge: new Audio("./assets/audio/challenge-bgm.mp3"),
  bgmChallengeHard: new Audio("./assets/audio/challenge-hard-bgm.mp3"),
  bgmFood: new Audio("./assets/audio/food-bgm.mp3"),

  correct: new Audio("./assets/audio/correct.mp3"),
  start: new Audio("./assets/audio/start.mp3"),
  finish: new Audio("./assets/audio/finish.mp3"),
  levelUp: new Audio("./assets/audio/level-up.mp3"),
  levelDown: new Audio("./assets/audio/level-down.mp3"),
  button: new Audio("./assets/audio/button.mp3")
};

const BGM_KEYS = [
  "bgmMenu",
  "bgmNormal",
  "bgmChallenge",
  "bgmChallengeHard",
  "bgmFood"
];

const PRELOAD_IMAGES = [
  {
    label: "メニューキャラクター",
    src: "./assets/images/character/menu-character.png",
    element: menuCharacterImg
  },
  {
    label: "待機スプライト",
    src: "./assets/images/character/game-idle-sheet.png"
  },
  {
    label: "正解スプライト",
    src: "./assets/images/character/game-correct-sheet.png"
  },
  {
    label: "終了スプライト",
    src: "./assets/images/character/game-finish-sheet.png"
  }
];

const PRELOAD_AUDIO_KEYS = [
  ...BGM_KEYS,
  "correct",
  "start",
  "finish",
  "levelUp",
  "levelDown",
  "button"
];

function updateLoadingProgress(loadedCount, totalCount, detailText) {
  const percent = Math.floor((loadedCount / totalCount) * 100);

  loadingBarFill.style.width = `${percent}%`;
  loadingPercent.textContent = `${percent}%`;
  loadingDetail.textContent = detailText;
}

async function preloadImage(asset) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = async () => {
      if (asset.element) {
        asset.element.src = asset.src;

        if (asset.element.decode) {
          await asset.element.decode().catch(() => {});
        }
      }

      resolve();
    };

    image.onerror = () => {
      reject(new Error(`${asset.src} が読み込めません`));
    };

    image.src = asset.src;
  });
}

async function preloadAudioByKey(soundKey) {
  const sound = sounds[soundKey];

  if (!sound) {
    throw new Error(`${soundKey} が見つかりません`);
  }

  const response = await fetch(sound.src);

  if (!response.ok) {
    throw new Error(`${sound.src} が読み込めません`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  sound.src = objectUrl;
  sound.load();
}

async function preloadAssets() {
  const tasks = [];

  for (const imageAsset of PRELOAD_IMAGES) {
    tasks.push({
      label: imageAsset.label,
      load: () => preloadImage(imageAsset)
    });
  }

  for (const soundKey of PRELOAD_AUDIO_KEYS) {
    tasks.push({
      label: soundKey,
      load: () => preloadAudioByKey(soundKey)
    });
  }

  let loadedCount = 0;
  const totalCount = tasks.length;

  updateLoadingProgress(0, totalCount, "ゲームを読み込み中...");

  for (const task of tasks) {
    await task.load();

    loadedCount++;
    updateLoadingProgress(
      loadedCount,
      totalCount,
      `${task.label} 読み込み完了`
    );
  }
}

function updateSoundButtonLabels() {
  const label = isSoundEnabled ? "SOUND ON" : "SOUND OFF";

  if (gameSoundToggleButton) {
    gameSoundToggleButton.textContent = label;
  }

  if (modeSoundToggleButton) {
    modeSoundToggleButton.textContent = label;
  }
}

function toggleSound() {
  isSoundEnabled = !isSoundEnabled;

  if (isSoundEnabled) {
    playBgm(requestedBgmKey);
  } else {
    stopCurrentBgm();
  }

  updateSoundButtonLabels();
}


let isSoundEnabled = true;
let currentBgmKey = "";
let requestedBgmKey = "bgmMenu";

function setupSounds() {
  for (const bgmKey of BGM_KEYS) {
    sounds[bgmKey].loop = true;
    sounds[bgmKey].volume = 0.25;
  }

  sounds.correct.volume = 0.6;
  sounds.start.volume = 0.6;
  sounds.finish.volume = 0.7;
  sounds.levelUp.volume = 0.7;
  sounds.levelDown.volume = 0.7;
  sounds.button.volume = 0.4;
}

function playSound(soundName) {
  if (!isSoundEnabled) {
    return;
  }

  const sound = sounds[soundName];

  if (!sound) {
    return;
  }

  sound.currentTime = 0;

  sound.play().catch(() => {
    // ブラウザ側で再生が止められた場合は何もしない
  });
}

function playBgm(bgmKey) {
  requestedBgmKey = bgmKey;

  if (!isSoundEnabled) {
    return;
  }

  const nextBgm = sounds[bgmKey];

  if (!nextBgm) {
    return;
  }

  if (currentBgmKey === bgmKey && !nextBgm.paused) {
    return;
  }

  stopCurrentBgm();

  currentBgmKey = bgmKey;
  nextBgm.currentTime = 0;

  nextBgm.play().catch(() => {
    currentBgmKey = "";
  });
}

function stopCurrentBgm() {
  if (!currentBgmKey) {
    return;
  }

  const currentBgm = sounds[currentBgmKey];

  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
  }

  currentBgmKey = "";
}

function stopBgm() {
  stopCurrentBgm();
}

function startBgm() {
  playBgm(requestedBgmKey);
}

setupSounds();

let db = null;
let currentUser = null;

let currentText = "";
let score = 0;
let time = 60;
let timerId = null;
let isPlaying = false;
let isComposing = false;
let isCountingDown = false;
let countdownToken = 0;

let playerName = "";
let selectedModeKey = "";
let selectedDifficultyKey = "";
let selectedDifficultyLabel = "";
let selectedTextGroupKey = "";

let latestScoreDocId = "";
let latestRankingKey = "";

let challengeLevelIndex = 0;
let challengeCorrectCount = 0;
let challengeTimeLeft = CHALLENGE_LIMIT_TIME;

function initFirebase() {
  return new Promise((resolve) => {
    if (typeof firebase === "undefined") {
      firebaseStatusElement.textContent = "Firebase SDKが読み込めていません";
      resolve(false);
      return;
    }

    if (typeof firebaseConfig === "undefined") {
      firebaseStatusElement.textContent = "firebase-config.jsが見つかりません";
      resolve(false);
      return;
    }

    firebase.initializeApp(firebaseConfig);

    db = firebase.firestore();

    firebase.auth().signInAnonymously()
      .then((result) => {
        currentUser = result.user;
        //firebaseStatusElement.textContent = "Firebase接続OK";
        firebaseStatusElement.textContent = "ランキング表示が利用できます";
        resolve(true);
      })
      .catch((error) => {
        console.error(error);
        firebaseStatusElement.textContent = "Firebase接続エラー";
        resolve(false);
      });
  });
}

function showScreen(screenName) {
  nameScreen.classList.add("hidden");
  modeScreen.classList.add("hidden");
  allRankingScreen.classList.add("hidden");
  difficultyScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");

  if (screenName === "name") {
    nameScreen.classList.remove("hidden");
  }

  if (screenName === "mode") {
    modeScreen.classList.remove("hidden");
  }

  if (screenName === "allRanking") {
    allRankingScreen.classList.remove("hidden");
  }

  if (screenName === "difficulty") {
    difficultyScreen.classList.remove("hidden");
  }

  if (screenName === "game") {
    gameScreen.classList.remove("hidden");
  }

  updateMenuCharacterVisibility(screenName);
  updateGameCharacterVisibility(screenName);
  updateBodyLayout(screenName);
}

function updateBodyLayout(screenName) {
  if (screenName === "game") {
    document.body.classList.add("is-game-screen");
  } else {
    document.body.classList.remove("is-game-screen");

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }
}

function updateMenuCharacterVisibility(screenName) {
  if (!menuCharacter) {
    return;
  }

  if (screenName === "game") {
    menuCharacter.classList.add("hidden");
  } else {
    menuCharacter.classList.remove("hidden");
  }
}

function updateGameCharacterVisibility(screenName) {
  if (!gameCharacter) {
    return;
  }

  if (screenName === "game") {
    gameCharacter.classList.remove("hidden");
  } else {
    gameCharacter.classList.add("hidden");
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

  playerLabel.textContent = `プレイヤー: ${playerName}`;
  
  //SE
  playSound("button");
  playBgm("bgmMenu");
  
  showScreen("mode");
}

function loadSavedPlayerName() {
  const savedName = localStorage.getItem("typingGamePlayerName");

  if (savedName) {
    nameInput.value = savedName;
  }
}

function showDifficultyScreen(modeKey) {
  //SE
  playSound("button");

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
  //SE
  playSound("button");

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
  inputElement.readOnly = false;
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

  wordElement.classList.remove("word-correct-animation");
}

function playCorrectAnimation() {
  wordElement.classList.remove("word-correct-animation");
  scoreElement.classList.remove("score-pop-animation");

  // アニメーションを連続で発火させるためのおまじない
  void wordElement.offsetWidth;
  void scoreElement.offsetWidth;

  wordElement.classList.add("word-correct-animation");
  scoreElement.classList.add("score-pop-animation");

  setTimeout(() => {
    wordElement.classList.remove("word-correct-animation");
    //scoreElement.classList.remove("score-pop-animation");
  }, 250);
}

function setCharacterState(stateName) {
  if (!gameCharacterSprite) {
    return;
  }

  gameCharacterSprite.classList.remove(
    "character-idle",
    "character-correct",
    "character-finish"
  );

  // アニメーションを確実に再発火させる
  void gameCharacterSprite.offsetWidth;

  if (stateName === "correct") {
    gameCharacterSprite.classList.add("character-correct");
    return;
  }

  if (stateName === "finish") {
    gameCharacterSprite.classList.add("character-finish");
    return;
  }

  gameCharacterSprite.classList.add("character-idle");
}

function playScoreAnimation() {
  scoreElement.classList.remove("score-pop-animation");

  // Braveでも再発火しやすくするための再描画
  void scoreElement.offsetWidth;

  scoreElement.classList.add("score-pop-animation");

  setTimeout(() => {
    scoreElement.classList.remove("score-pop-animation");
  }, 250);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runCountdown(myToken) {
  const countdownItems = ["3", "2", "1", "GO!"];

  countdownOverlay.classList.remove("hidden");

  for (const item of countdownItems) {
    if (myToken !== countdownToken) {
      countdownOverlay.classList.add("hidden");
      return false;
    }

    countdownText.textContent = item;

    countdownText.classList.remove("countdown-pop");
    void countdownText.offsetWidth;
    countdownText.classList.add("countdown-pop");

    if (item === "GO!") {
      playSound("start");
      await sleep(500);
    } else {
      playSound("button");
      await sleep(700);
    }
  }

  countdownOverlay.classList.add("hidden");
  countdownText.classList.remove("countdown-pop");

  return true;
}

function cancelCountdown() {
  countdownToken++;
  isCountingDown = false;

  if (countdownOverlay) {
    countdownOverlay.classList.add("hidden");
  }
}

async function startGame() {
  if (isPlaying || isCountingDown) {
    return;
  }

  resetTimer();

  score = 0;
  time = 60;
  isPlaying = false;
  isCountingDown = true;

  scoreElement.textContent = score;
  timeElement.textContent = time;
  messageElement.textContent = "準備中...";

  inputElement.disabled = true;
  inputElement.value = "";

  startButton.disabled = true;
  startButton.textContent = "READY";

  if (isChallengeMode()) {
    challengeLevelIndex = 0;
    challengeCorrectCount = 0;
    challengeTimeLeft = CHALLENGE_LIMIT_TIME;
    updateChallengeStatus();
  }

  countdownToken++;
  const myToken = countdownToken;

  const completed = await runCountdown(myToken);

  if (!completed) {
    return;
  }

  isCountingDown = false;
  beginGame();
}

function isMobileScreen() {
  return window.matchMedia("(max-width: 600px)").matches;
}

function focusInputSafely() {
  if (!inputElement) {
    return;
  }

  if (isMobileScreen()) {
    // スマホでは、入力欄フォーカス時の自動スクロールをなるべく抑える
    try {
      inputElement.focus({
        preventScroll: true
      });
    } catch (error) {
      inputElement.focus();
    }

    // キーボード表示後に、ゲーム画面の上部へ戻す
    setTimeout(() => {
      gameScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 250);

    return;
  }

  inputElement.focus();
}


function beginGame() {
  isPlaying = true;

  messageElement.textContent = "";

  inputElement.disabled = false;
  inputElement.readOnly = false;
  //inputElement.focus();
  focusInputSafely();

  startButton.disabled = true;
  startButton.textContent = "PLAYING";

  playBgm(getGameBgmKey());

  setCharacterState("idle");

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

function scrollToRankingArea() {
  if (!rankingArea) {
    return;
  }

  rankingArea.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function endGame() {
  if (!isPlaying) {
    return;
  }

  isPlaying = false;
  resetTimer();

  playSound("finish");
  playBgm("bgmMenu");

  // ここでは入力欄を消さない・フォーカスも外さない
  // スマホで画面が急に動くのを防ぐため、まずは入力だけ止める
  inputElement.readOnly = true;

  wordElement.textContent = "FINISH";
  messageElement.textContent = `ゲーム終了！ スコア：${score}`;

  setCharacterState("finish");

  startButton.disabled = true;
  startButton.textContent = "RESULT";

  // 終了スプライトを先に見せる
  await sleep(1000);

  // ここで初めて入力欄を無効化・フォーカス解除する
  inputElement.blur();
  inputElement.disabled = true;
  inputElement.readOnly = false;

  messageElement.textContent = `ゲーム終了！ スコア：${score} / ランキング更新中...`;

  await saveScoreToFirebase();
  await loadRankingFromFirebase();

  startButton.disabled = false;
  startButton.textContent = "RESTART";

  await sleep(150);
  scrollToRankingArea();
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

  //if (direction > 0 && challengeLevelIndex > oldLevelIndex) {
  //  messageElement.textContent = `難易度アップ！ ${currentLevelName}`;
  //} else if (direction < 0 && challengeLevelIndex < oldLevelIndex) {
  //  messageElement.textContent = `難易度ダウン！ ${currentLevelName}`;
  //} else {
  //  messageElement.textContent = `${currentLevelName} キープ！`;
  //}

  if (direction > 0 && challengeLevelIndex > oldLevelIndex) {
    playSound("levelUp");
  messageElement.textContent = `難易度アップ！ ${currentLevelName}`;
  } else if (direction < 0 && challengeLevelIndex < oldLevelIndex) {
    playSound("levelDown");
    messageElement.textContent = `難易度ダウン！ ${currentLevelName}`;
  } else {
    messageElement.textContent = `${currentLevelName} キープ！`;
  }

  if (isPlaying && isChallengeMode()) {
   playBgm(getGameBgmKey());
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
    playSound("correct");
    playCorrectAnimation();
    setCharacterState("correct");

    score++;
    scoreElement.textContent = score;
    playScoreAnimation();

    if (isChallengeMode()) {
      challengeCorrectCount++;
      updateChallengeStatus();

      if (challengeCorrectCount >= CHALLENGE_TARGET) {
        changeChallengeLevel(1);
      }
    }

    //setTimeout(() => {
    //  setNewText();
    //}, 160);

    setTimeout(() => {
      setNewText();
    }, 180);

    setTimeout(() => {
      setCharacterState("idle");
    }, 500);
  }
}

function returnToModeSelect() {
  cancelCountdown();
  prepareGame();
  setCharacterState("idle");
  playBgm("bgmMenu");
  showScreen("mode");
}

function getRankingKey() {
  if (selectedModeKey === "challenge") {
    return "challenge_challenge";
  }

  return `${selectedModeKey}_${selectedDifficultyKey}`;
}

function getGameBgmKey() {
  if (selectedModeKey === "normal") {
    return "bgmNormal";
  }

  if (selectedModeKey === "challenge") {
    const levelKey = LEVEL_ORDER[challengeLevelIndex];

    if (levelKey === "hard") {
      return "bgmChallengeHard";
    }

    return "bgmChallenge";
  }

  if (selectedModeKey === "food") {
    return "bgmFood";
  }

  return "bgmMenu";
}

async function saveScoreToFirebase() {
  if (!db || !currentUser) {
    messageElement.textContent = `ゲーム終了！ スコア：${score} / Firebase未接続のため保存できませんでした`;
    return;
  }

  const rankingKey = getRankingKey();

  try {
    const docRef = await db
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

    latestScoreDocId = docRef.id;
    latestRankingKey = rankingKey;

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
      ranking.push({
        id: doc.id,
        ...doc.data()
      });
    });

    renderRanking(ranking);
  } catch (error) {
    console.error(error);
    rankingList.innerHTML = "<li>ランキングの読み込みに失敗しました</li>";
  }
}

async function loadRankingByKey(rankingKey) {
  const snapshot = await db
    .collection("rankings")
    .doc(rankingKey)
    .collection("scores")
    .orderBy("score", "desc")
    .limit(10)
    .get();

  const ranking = [];

  snapshot.forEach((doc) => {
    ranking.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return ranking;
}

async function loadAllRankingsFromFirebase() {
  if (!db) {
    allRankingList.innerHTML = "<p>Firebase未接続です</p>";
    return;
  }

  allRankingList.innerHTML = "<p>ランキング読み込み中...</p>";

  try {
    allRankingList.innerHTML = "";

    const rankingKeys = Object.keys(RANKING_LABELS);

    for (const rankingKey of rankingKeys) {
      const ranking = await loadRankingByKey(rankingKey);
      const rankingBlock = createAllRankingBlock(rankingKey, ranking);
      allRankingList.appendChild(rankingBlock);
    }
  } catch (error) {
    console.error(error);
    allRankingList.innerHTML = "<p>ランキングの読み込みに失敗しました</p>";
  }
}

function createAllRankingBlock(rankingKey, ranking) {
  const section = document.createElement("section");
  section.className = "ranking-block";

  const title = document.createElement("h3");
  title.textContent = RANKING_LABELS[rankingKey] || rankingKey;
  section.appendChild(title);

  const list = document.createElement("ol");

  if (ranking.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "まだ記録がありません";
    list.appendChild(emptyItem);
  } else {
    ranking.forEach((record, index) => {
      const li = document.createElement("li");

      if (
        record.id === latestScoreDocId &&
        rankingKey === latestRankingKey
      ) {
        li.classList.add("current-record");
      }

      li.innerHTML = `
        <span class="rank-number">${index + 1}位</span>
        <span class="rank-name">${escapeHtml(record.name)}</span>
        <span class="rank-score">${record.score}点</span>
        ${
          record.id === latestScoreDocId && rankingKey === latestRankingKey
            ? '<span class="rank-current-label">今回</span>'
            : ""
        }
      `;

      list.appendChild(li);
    });
  }

  section.appendChild(list);

  return section;
}

function renderRanking(ranking) {
  rankingList.innerHTML = "";

  if (ranking.length === 0) {
    rankingList.innerHTML = "<li>まだ記録がありません</li>";
    return;
  }

  const currentRankingKey = getRankingKey();

  ranking.forEach((record, index) => {
    const li = document.createElement("li");

    if (
      record.id === latestScoreDocId &&
      currentRankingKey === latestRankingKey
    ) {
      li.classList.add("current-record");
    }

    li.innerHTML = `
      <span class="rank-number">${index + 1}位</span>
      <span class="rank-name">${escapeHtml(record.name)}</span>
      <span class="rank-score">${record.score}点</span>
      ${
        record.id === latestScoreDocId && currentRankingKey === latestRankingKey
          ? '<span class="rank-current-label">今回</span>'
          : ""
      }
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


allRankingButton.addEventListener("click", () => {
  playSound("button");
  playBgm("bgmMenu");
  showScreen("allRanking");
  loadAllRankingsFromFirebase();
});

allRankingBackButton.addEventListener("click", () => {
  playSound("button");
  playBgm("bgmMenu");
  showScreen("mode");
});

//if (gameSoundToggleButton) {
//  gameSoundToggleButton.addEventListener("click", () => {
//    toggleSound();
//  });
//}

if (gameSoundToggleButton) {
  gameSoundToggleButton.addEventListener("click", toggleSound);
}

if (modeSoundToggleButton) {
  modeSoundToggleButton.addEventListener("click", toggleSound);
}

startButton.addEventListener("click", startGame);


async function bootGame() {
  try {
    app.classList.add("hidden");
    loadingScreen.classList.remove("hidden");

    const minimumLoadingTime = sleep(1500);

    await preloadAssets();

    loadingDetail.textContent = "Firebaseに接続中...";
    await initFirebase();

    await minimumLoadingTime;

    loadingBarFill.style.width = "100%";
    loadingPercent.textContent = "100%";
    loadingDetail.textContent = "読み込み完了！";

    warmUpCharacterSprites();

    await sleep(300);

    loadingScreen.classList.add("hidden");
    app.classList.remove("hidden");

    loadSavedPlayerName();
    updateSoundButtonLabels();
    setCharacterState("idle");

    await warmUpCharacterSprites();

    showScreen("name");
  } catch (error) {
    console.error(error);
    loadingDetail.textContent = "読み込みに失敗しました。責任者に問い合わせてください。";
  }
}

async function warmUpCharacterSprites() {
  if (!gameCharacterSprite) {
    return;
  }

  setCharacterState("correct");
  await sleep(80);

  setCharacterState("finish");
  await sleep(80);

  setCharacterState("idle");
}

bootGame();