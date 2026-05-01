const timeElement = document.getElementById("time");
const scoreElement = document.getElementById("score");
const wordElement = document.getElementById("word");
const inputElement = document.getElementById("input");
const startButton = document.getElementById("start-button");
const messageElement = document.getElementById("message");

let currentText = "";
let score = 0;
let time = 60;
let timerId = null;
let isPlaying = false;

// 日本語入力中かどうか
let isComposing = false;

function getRandomText() {
  const randomIndex = Math.floor(Math.random() * typingTexts.length);
  return typingTexts[randomIndex];
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

  setNewText();

  timerId = setInterval(() => {
    time--;
    timeElement.textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  isPlaying = false;

  clearInterval(timerId);
  timerId = null;

  inputElement.disabled = true;
  wordElement.textContent = "FINISH";
  messageElement.textContent = `ゲーム終了！ スコア：${score}`;

  startButton.disabled = false;
  startButton.textContent = "RESTART";
}

function checkInput() {
  if (!isPlaying) {
    return;
  }

  // 日本語変換中は判定しない
  if (isComposing) {
    return;
  }

  if (inputElement.value === currentText) {
    score++;
    scoreElement.textContent = score;
    setNewText();
  }
}

// 日本語入力の変換開始
inputElement.addEventListener("compositionstart", () => {
  isComposing = true;
});

// 日本語入力の変換確定
inputElement.addEventListener("compositionend", () => {
  isComposing = false;
  checkInput();
});

inputElement.addEventListener("input", checkInput);

startButton.addEventListener("click", startGame);