const SIZE = 9;
const BOX = 3;

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneGrid(g) {
  return g.map(row => row.slice());
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValidPlacement(grid, row, col, num) {
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const br = Math.floor(row / BOX) * BOX;
  const bc = Math.floor(col / BOX) * BOX;
  for (let r = br; r < br + BOX; r++) {
    for (let c = bc; c < bc + BOX; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function fillGrid(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) {
        const nums = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const n of nums) {
          if (isValidPlacement(grid, r, c, n)) {
            grid[r][c] = n;
            if (fillGrid(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(grid, limit = 2) {
  let count = 0;
  function solve() {
    if (count >= limit) return;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) {
          for (let n = 1; n <= 9; n++) {
            if (isValidPlacement(grid, r, c, n)) {
              grid[r][c] = n;
              solve();
              grid[r][c] = 0;
              if (count >= limit) return;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  solve();
  return count;
}

function generateSolution() {
  const grid = emptyGrid();
  fillGrid(grid);
  return grid;
}

function generatePuzzle(difficulty) {
  const targetClues = {
    beginner: 45,
    intermediate: 34,
    expert: 26,
  }[difficulty] ?? 40;

  const solution = generateSolution();
  const puzzle = cloneGrid(solution);

  const positions = shuffled(
    Array.from({ length: 81 }, (_, i) => i)
  );

  let cluesLeft = 81;
  for (const pos of positions) {
    if (cluesLeft <= targetClues) break;
    const r = Math.floor(pos / SIZE);
    const c = pos % SIZE;
    const saved = puzzle[r][c];
    puzzle[r][c] = 0;
    const test = cloneGrid(puzzle);
    if (countSolutions(test, 2) !== 1) {
      puzzle[r][c] = saved;
    } else {
      cluesLeft--;
    }
  }

  return { puzzle, solution };
}

window.Sudoku = { generatePuzzle, isValidPlacement, SIZE };
