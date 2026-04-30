const words = [
  "apple",
  "banana",
  "orange",
  "grape",
  "lemon",
  "peach",
  "melon",
  "cherry",
  "typing",
  "game",
  "score",
  "start",
  "clear",
  "speed",
  "keyboard"
];

const timeElement = document.getElementById("time");
const scoreElement = document.getElementById("score");
const wordElement = document.getElementById("word");
const inputElement = document.getElementById("input");
const startButton = document.getElementById("start-button");
const messageElement = document.getElementById("message");

let currentWord = "";
let score = 0;
let time = 60;
let timerId = null;
let isPlaying = false;

function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

function setNewWord() {
  currentWord = getRandomWord();
  wordElement.textContent = currentWord;
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

  setNewWord();

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

inputElement.addEventListener("input", () => {
  if (!isPlaying) {
    return;
  }

  if (inputElement.value === currentWord) {
    score++;
    scoreElement.textContent = score;
    setNewWord();
  }
});

startButton.addEventListener("click", startGame);