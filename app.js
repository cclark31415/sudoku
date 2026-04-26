// SIZE and BOX are defined in sudoku.js

// Google OAuth 2.0 client ID for sudoku.chrisclark.net
const GOOGLE_CLIENT_ID = "871360095724-0pavif4b533o6jgqjk5gu8sppv0gogmn.apps.googleusercontent.com";

const state = {
  puzzle: null,        // initial board (zeros for blanks)
  solution: null,      // completed solution
  board: null,         // player's current values (0 if empty)
  notes: null,         // 9x9 array of Sets of pencil marks
  givens: null,        // boolean per cell
  errors: null,        // boolean per cell (only used for shown feedback)
  selected: null,      // {row, col}
  selectedNumber: 0,   // sticky number; 0 = none
  notesMode: false,
  hardMode: false,
  difficulty: "intermediate",
  mistakes: 0,
  hintsLeft: 3,
  startTime: 0,
  timerId: null,
  finished: false,
  user: null,          // { name, email, sub }
};

const els = {
  board: document.getElementById("board"),
  difficulty: document.getElementById("difficulty"),
  hardMode: document.getElementById("hardMode"),
  newGameBtn: document.getElementById("newGameBtn"),
  notesBtn: document.getElementById("notesBtn"),
  hintBtn: document.getElementById("hintBtn"),
  eraseBtn: document.getElementById("eraseBtn"),
  submitBtn: document.getElementById("submitBtn"),
  numpad: document.getElementById("numpad"),
  timer: document.getElementById("timer"),
  mistakes: document.getElementById("mistakes"),
  hintsLeft: document.getElementById("hintsLeft"),
  score: document.getElementById("score"),
  message: document.getElementById("message"),
  signInBtn: document.getElementById("signInBtn"),
  userInfo: document.getElementById("userInfo"),
  scoreList: document.getElementById("scoreList"),
  scoreHeading: document.getElementById("scoreHeading"),
  scoreNote: document.getElementById("scoreNote"),
  themeBtn: document.getElementById("themeBtn"),
};

// ----- Board rendering -----

function buildBoard() {
  els.board.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => onCellClick(r, c));
      els.board.appendChild(cell);
    }
  }
}

function cellEl(r, c) {
  return els.board.children[r * SIZE + c];
}

function renderCell(r, c) {
  const el = cellEl(r, c);
  const val = state.board[r][c];
  const given = state.givens[r][c];
  const error = state.errors[r][c];

  el.classList.toggle("given", given);
  el.classList.toggle("error", !!error);

  if (val !== 0) {
    el.textContent = val;
  } else if (state.notes[r][c].size > 0) {
    el.textContent = "";
    const notes = document.createElement("div");
    notes.className = "notes";
    for (let n = 1; n <= 9; n++) {
      const s = document.createElement("span");
      s.textContent = state.notes[r][c].has(n) ? n : "";
      notes.appendChild(s);
    }
    el.appendChild(notes);
  } else {
    el.textContent = "";
  }
}

function renderAll() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      renderCell(r, c);
    }
  }
  refreshHighlights();
  updateNumpad();
}

function refreshHighlights() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const el = cellEl(r, c);
      el.classList.remove("selected", "peer", "same-num");
    }
  }

  // Highlight all tiles with the selected number from numpad
  if (state.selectedNumber !== 0) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (state.board[r][c] === state.selectedNumber) {
          cellEl(r, c).classList.add("same-num");
        }
      }
    }
  }

  if (!state.selected) return;
  const { row, col } = state.selected;
  const selVal = state.board[row][col];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const el = cellEl(r, c);
      const sameRow = r === row;
      const sameCol = c === col;
      const sameBox =
        Math.floor(r / BOX) === Math.floor(row / BOX) &&
        Math.floor(c / BOX) === Math.floor(col / BOX);
      if (sameRow || sameCol || sameBox) el.classList.add("peer");
      if (selVal && state.board[r][c] === selVal) el.classList.add("same-num");
    }
  }
  cellEl(row, col).classList.add("selected");
}

function updateNumpad() {
  const counts = Array(10).fill(0);
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (state.board[r][c]) counts[state.board[r][c]]++;
  for (const btn of els.numpad.querySelectorAll(".num")) {
    const n = +btn.dataset.num;
    btn.classList.toggle("active", state.selectedNumber === n);
    btn.classList.toggle("exhausted", counts[n] >= 9);
  }
}

// ----- Game lifecycle -----

function newGame() {
  const difficulty = els.difficulty.value;
  state.difficulty = difficulty;
  state.hardMode = els.hardMode.checked;

  showMessage("Generating puzzle…");
  setTimeout(() => {
    const { puzzle, solution } = Sudoku.generatePuzzle(difficulty);
    state.puzzle = puzzle;
    state.solution = solution;
    state.board = puzzle.map(row => row.slice());
    state.givens = puzzle.map(row => row.map(v => v !== 0));
    state.notes = Array.from({ length: SIZE }, () =>
      Array.from({ length: SIZE }, () => new Set())
    );
    state.errors = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    state.selected = null;
    state.selectedNumber = 0;
    state.mistakes = 0;
    state.hintsLeft = 3;
    state.finished = false;
    state.startTime = Date.now();

    els.submitBtn.hidden = !state.hardMode;
    els.mistakes.textContent = "0";
    els.hintsLeft.textContent = "3";
    els.score.textContent = "—";
    hideMessage();
    startTimer();
    renderAll();
  }, 30);
}

function startTimer() {
  stopTimer();
  state.timerId = setInterval(() => {
    const s = Math.floor((Date.now() - state.startTime) / 1000);
    const m = Math.floor(s / 60);
    els.timer.textContent = `${m}:${String(s % 60).padStart(2, "0")}`;
  }, 250);
}

function stopTimer() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}

// ----- Input handling -----

function onCellClick(r, c) {
  if (state.finished) return;
  if (state.givens[r][c] && state.selectedNumber === 0) {
    state.selected = { row: r, col: c };
    refreshHighlights();
    return;
  }
  if (state.selectedNumber !== 0) {
    applyNumber(r, c, state.selectedNumber);
  } else {
    state.selected = { row: r, col: c };
  }
  refreshHighlights();
}

function applyNumber(r, c, num) {
  if (state.givens[r][c]) return;
  state.selected = { row: r, col: c };

  if (state.notesMode) {
    if (state.board[r][c] !== 0) return; // can't add notes to filled cell
    // Count how many of this number are already placed
    let count = 0;
    for (let rr = 0; rr < SIZE; rr++)
      for (let cc = 0; cc < SIZE; cc++)
        if (state.board[rr][cc] === num) count++;
    // Can't add note if number is exhausted (9 already placed)
    if (count >= 9) return;
    if (state.notes[r][c].has(num)) state.notes[r][c].delete(num);
    else state.notes[r][c].add(num);
    renderCell(r, c);
    refreshHighlights();
    return;
  }

  // Count how many of this number are already placed (before placing)
  let numCount = 0;
  for (let rr = 0; rr < SIZE; rr++)
    for (let cc = 0; cc < SIZE; cc++)
      if (state.board[rr][cc] === num) numCount++;
  // Can't place number if already exhausted (9 already placed)
  if (numCount >= 9) return;

  state.board[r][c] = num;
  state.notes[r][c].clear();
  state.errors[r][c] = false;

  if (!state.hardMode) {
    if (num !== state.solution[r][c]) {
      state.errors[r][c] = true;
      state.mistakes++;
      els.mistakes.textContent = state.mistakes;
    }
  }

  removeNotePeers(r, c, num);
  renderCell(r, c);

  if (!state.hardMode && num === state.solution[r][c]) {
    checkCompletions(r, c);
  }

  refreshHighlights();
  updateNumpad();

  if (boardFilled() && !state.hardMode && solvedCorrectly()) {
    finishGame();
  }
}

function removeNotePeers(r, c, num) {
  for (let i = 0; i < SIZE; i++) {
    state.notes[r][i].delete(num);
    state.notes[i][c].delete(num);
  }
  const br = Math.floor(r / BOX) * BOX;
  const bc = Math.floor(c / BOX) * BOX;
  for (let rr = br; rr < br + BOX; rr++)
    for (let cc = bc; cc < bc + BOX; cc++)
      state.notes[rr][cc].delete(num);
  for (let rr = 0; rr < SIZE; rr++)
    for (let cc = 0; cc < SIZE; cc++)
      if (state.board[rr][cc] === 0) renderCell(rr, cc);
}

function eraseSelected() {
  if (!state.selected) return;
  const { row, col } = state.selected;
  if (state.givens[row][col]) return;
  state.board[row][col] = 0;
  state.notes[row][col].clear();
  state.errors[row][col] = false;
  renderCell(row, col);
  refreshHighlights();
  updateNumpad();
}

// ----- Completion detection / animations -----

function boardFilled() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (state.board[r][c] === 0) return false;
  return true;
}

function solvedCorrectly() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (state.board[r][c] !== state.solution[r][c]) return false;
  return true;
}

function unitComplete(cells) {
  return cells.every(({ r, c }) => state.board[r][c] === state.solution[r][c]);
}

function checkCompletions(r, c) {
  const row = Array.from({ length: SIZE }, (_, i) => ({ r, c: i }));
  const col = Array.from({ length: SIZE }, (_, i) => ({ r: i, c }));
  const br = Math.floor(r / BOX) * BOX;
  const bc = Math.floor(c / BOX) * BOX;
  const box = [];
  for (let rr = br; rr < br + BOX; rr++)
    for (let cc = bc; cc < bc + BOX; cc++) box.push({ r: rr, c: cc });

  const flashes = [];
  if (unitComplete(row)) flashes.push(row);
  if (unitComplete(col)) flashes.push(col);
  if (unitComplete(box)) flashes.push(box);
  if (flashes.length) {
    flashUnits(flashes);
  }
}

function flashUnits(units) {
  // Flash each cell with a color gradient back to normal
  units.forEach(unit => {
    unit.forEach(({ r, c }, idx) => {
      const el = cellEl(r, c);
      setTimeout(() => {
        el.classList.add("flash");
        setTimeout(() => el.classList.remove("flash"), 1000);
      }, idx * 80);
    });
  });
}

function dissolveBoard() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const el = cellEl(r, c);
      const delay = (r + c) * 60;
      setTimeout(() => el.classList.add("dissolve"), delay);
    }
  }
}

// ----- Hints -----

function useHint() {
  if (state.hintsLeft <= 0 || !state.selected || state.finished) return;
  const { row, col } = state.selected;
  if (state.board[row][col] !== 0) return;
  const noteSet = state.notes[row][col];
  const correct = state.solution[row][col];
  const wrongNotes = [...noteSet].filter(n => n !== correct);
  if (wrongNotes.length === 0) return;
  const toRemove = wrongNotes[Math.floor(Math.random() * wrongNotes.length)];
  noteSet.delete(toRemove);
  state.hintsLeft--;
  els.hintsLeft.textContent = state.hintsLeft;
  renderCell(row, col);
}

// ----- Submit (hard mode) -----

function submitGame() {
  let mistakes = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (state.givens[r][c]) continue;
      const v = state.board[r][c];
      if (v === 0 || v !== state.solution[r][c]) {
        state.errors[r][c] = true;
        if (v !== 0) mistakes++;
      } else {
        state.errors[r][c] = false;
      }
      renderCell(r, c);
    }
  }
  state.mistakes += mistakes;
  els.mistakes.textContent = state.mistakes;
  if (boardFilled() && solvedCorrectly()) {
    finishGame();
  } else {
    showMessage(mistakes === 0 ? "Keep going!" : `${mistakes} wrong cell${mistakes > 1 ? "s" : ""}`, 1500);
  }
}

// ----- Win / scoring -----

function computeScore(seconds, mistakes, hintsUsed, difficulty) {
  const base = { beginner: 1000, intermediate: 2500, expert: 5000 }[difficulty] || 1000;
  const timeBonus = Math.max(0, 1800 - seconds);
  const mistakePenalty = mistakes * 75;
  const hintPenalty = hintsUsed * 100;
  return Math.max(0, base + timeBonus - mistakePenalty - hintPenalty);
}

function finishGame() {
  if (state.finished) return;
  state.finished = true;
  stopTimer();
  const seconds = Math.floor((Date.now() - state.startTime) / 1000);
  const hintsUsed = 3 - state.hintsLeft;
  const score = computeScore(seconds, state.mistakes, hintsUsed, state.difficulty);
  els.score.textContent = score;

  saveScore({
    score,
    seconds,
    mistakes: state.mistakes,
    hintsUsed,
    difficulty: state.difficulty,
    hardMode: state.hardMode,
    when: new Date().toISOString(),
  });
  renderScoreList();

  setTimeout(() => {
    showMessage(`Solved! Score ${score}`);
    setTimeout(() => dissolveBoard(), 600);
  }, 400);
}

function showMessage(text, autoHide = 0) {
  els.message.textContent = text;
  els.message.hidden = false;
  if (autoHide) setTimeout(() => (els.message.hidden = true), autoHide);
}
function hideMessage() { els.message.hidden = true; }

// ----- Score storage -----

function userKey() {
  return state.user ? `sudoku_scores_${state.user.sub}` : "sudoku_scores_local";
}

function saveScore(entry) {
  const key = userKey();
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
  // Hook for remote backend:
  // fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${state.user?.idToken}` }, body: JSON.stringify(entry) });
}

function renderScoreList() {
  const key = userKey();
  const list = JSON.parse(localStorage.getItem(key) || "[]").slice(0, 5);
  els.scoreList.innerHTML = "";
  for (const e of list) {
    const li = document.createElement("li");
    const m = Math.floor(e.seconds / 60);
    const s = e.seconds % 60;
    li.textContent = `${e.score} — ${e.difficulty}${e.hardMode ? " (hard)" : ""}, ${m}:${String(s).padStart(2, "0")}`;
    els.scoreList.appendChild(li);
  }
  if (state.user) {
    els.scoreHeading.textContent = `Best scores — ${state.user.name || state.user.email}`;
    els.scoreNote.hidden = true;
  } else {
    els.scoreHeading.textContent = "Best scores (local)";
    els.scoreNote.hidden = false;
  }
}

// ----- Auth -----

function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch { return null; }
}

function setUser(user) {
  const previouslySignedIn = !!state.user;
  state.user = user;
  if (user) {
    els.signInBtn.textContent = "Sign out";
    els.userInfo.textContent = user.name || user.email;
    els.userInfo.hidden = false;
    if (!previouslySignedIn) mergeLocalScoresIntoUser();
  } else {
    els.signInBtn.textContent = "Sign in";
    els.userInfo.hidden = true;
  }
  localStorage.setItem("sudoku_user", JSON.stringify(user));
  renderScoreList();
}

function mergeLocalScoresIntoUser() {
  const localKey = "sudoku_scores_local";
  const local = JSON.parse(localStorage.getItem(localKey) || "[]");
  if (!local.length) return;
  const userK = `sudoku_scores_${state.user.sub}`;
  const existing = JSON.parse(localStorage.getItem(userK) || "[]");
  const merged = existing.concat(local).sort((a, b) => b.score - a.score).slice(0, 50);
  localStorage.setItem(userK, JSON.stringify(merged));
  localStorage.removeItem(localKey);
}

function loadGoogleSignIn() {
  if (!GOOGLE_CLIENT_ID) return;
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.async = true;
  s.defer = true;
  s.onload = () => {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => {
        const payload = decodeJwt(resp.credential);
        if (payload) {
          setUser({
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            idToken: resp.credential,
          });
        }
      },
    });
  };
  document.head.appendChild(s);
}

function handleSignIn() {
  if (state.user) {
    setUser(null);
    if (GOOGLE_CLIENT_ID && window.google) google.accounts.id.disableAutoSelect();
    return;
  }
  if (GOOGLE_CLIENT_ID && window.google) {
    google.accounts.id.prompt();
    return;
  }
  // Fallback: local profile
  const name = prompt("Sign in (local-only fallback). Enter a display name:");
  if (!name) return;
  setUser({ sub: `local_${name.toLowerCase()}`, name, email: "", idToken: "" });
}

// ----- Wire up UI -----

function init() {
  buildBoard();
  els.newGameBtn.addEventListener("click", newGame);
  els.notesBtn.addEventListener("click", () => {
    state.notesMode = !state.notesMode;
    els.notesBtn.textContent = `Notes: ${state.notesMode ? "on" : "off"}`;
    els.notesBtn.classList.toggle("active", state.notesMode);
    state.selected = null;
    refreshHighlights();
  });
  els.hintBtn.addEventListener("click", useHint);
  els.eraseBtn.addEventListener("click", eraseSelected);
  els.submitBtn.addEventListener("click", submitGame);
  els.hardMode.addEventListener("change", () => {
    state.hardMode = els.hardMode.checked;
    els.submitBtn.hidden = !state.hardMode;
  });

  for (const btn of els.numpad.querySelectorAll(".num")) {
    btn.addEventListener("click", () => {
      const n = +btn.dataset.num;
      state.selectedNumber = state.selectedNumber === n ? 0 : n;
      state.selected = null;
      updateNumpad();
      refreshHighlights();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (state.finished) return;
    if (e.key >= "1" && e.key <= "9") {
      state.selectedNumber = +e.key;
      updateNumpad();
      if (state.selected) {
        const { row, col } = state.selected;
        if (!state.givens[row][col]) applyNumber(row, col, state.selectedNumber);
      }
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      eraseSelected();
    } else if (e.key.toLowerCase() === "n") {
      els.notesBtn.click();
    } else if (state.selected && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
      const { row, col } = state.selected;
      const dr = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
      const dc = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
      const nr = Math.max(0, Math.min(SIZE - 1, row + dr));
      const nc = Math.max(0, Math.min(SIZE - 1, col + dc));
      state.selected = { row: nr, col: nc };
      refreshHighlights();
      e.preventDefault();
    }
  });

  els.signInBtn.addEventListener("click", handleSignIn);

  els.themeBtn.addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      els.themeBtn.textContent = "🌙";
    } else {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      els.themeBtn.textContent = "☀️";
    }
  });

  // Update theme button icon on load
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  els.themeBtn.textContent = isDark ? "☀️" : "🌙";

  // Load and display build stamp
  fetch("/version.json")
    .then(r => r.json())
    .then(v => {
      const stamp = document.getElementById("buildStamp");
      const dt = new Date(v.buildTime);
      const timeStr = dt.toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short"
      });
      stamp.textContent = `v${v.version} · ${timeStr}`;
    })
    .catch(() => {});

  // Restore user from localStorage
  const saved = localStorage.getItem("sudoku_user");
  if (saved) {
    try { setUser(JSON.parse(saved)); } catch {}
  } else {
    renderScoreList();
  }
  loadGoogleSignIn();

  newGame();
}

init();
