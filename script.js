let maze = [];
let start = [0, 0];
let end = [0, 0];
let path = [];
let visited = [];
let currentX = 0;
let currentY = 0;
let paused = false;
let delay = 2000; // 2 seconds delay for each step

// Generate the maze based on the selected rows, columns, and blocked nodes
function generateMaze() {
  const rows = parseInt(document.getElementById("rows").value);
  const columns = parseInt(document.getElementById("columns").value);
  const blockedCount = parseInt(document.getElementById("blocked").value);

  // Reset maze
  maze = Array.from({ length: rows }, () => Array(columns).fill(0));

  // Set end point to bottom-right corner
  end = [rows - 1, columns - 1];

  // Add blocked nodes randomly
  addBlockedNodes(blockedCount);

  // Render the maze
  renderMaze();

  // Reset the solving state
  path = [];
  visited = Array.from({ length: maze.length }, () =>
    Array(maze[0].length).fill(false)
  );
  currentX = 0;
  currentY = 0;
}

// Add random blocked nodes to the maze
function addBlockedNodes(count) {
  let blocked = 0;
  while (blocked < count) {
    const x = Math.floor(Math.random() * maze.length);
    const y = Math.floor(Math.random() * maze[0].length);
    if (
      maze[x][y] === 0 &&
      !(x === start[0] && y === start[1]) &&
      !(x === end[0] && y === end[1])
    ) {
      maze[x][y] = 1; // Block this node
      blocked++;
    }
  }
}

// Render the maze on the page
function renderMaze() {
  const mazeContainer = document.getElementById("maze-container");
  mazeContainer.innerHTML = ""; // Clear previous maze

  // Update grid columns based on selection
  mazeContainer.style.gridTemplateColumns = `repeat(${maze[0].length}, 50px)`;

  // Create the maze cells
  maze.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      if (cell === 1) {
        cellDiv.classList.add("wall");
      }
      if (rowIndex === start[0] && colIndex === start[1]) {
        cellDiv.classList.add("start");
      }
      if (rowIndex === end[0] && colIndex === end[1]) {
        cellDiv.classList.add("end");
      }
      mazeContainer.appendChild(cellDiv);
    });
  });
}

// Utility to check if a cell is safe for movement
function isSafe(x, y) {
  return (
    x >= 0 &&
    x < maze.length &&
    y >= 0 &&
    y < maze[0].length &&
    maze[x][y] === 0 &&
    !visited[x][y]
  );
}

function toggleButtons(solveState, pauseState, resumeState) {
  const solveButton = document.querySelector('button[onclick="solveMaze()"]');
  const pauseButton = document.querySelector(
    'button[onclick="pauseSolving()"]'
  );
  const resumeButton = document.querySelector(
    'button[onclick="resumeSolving()"]'
  );

  solveButton.disabled = solveState; // Disable/enable the Solve button
  pauseButton.disabled = pauseState; // Disable/enable the Pause button
  resumeButton.disabled = resumeState; // Disable/enable the Resume button
}

// Solve the maze with delay
async function solveMaze() {
  let found = false;
  clearPath(); // Clear any previous path markers

  toggleButtons(true, false, true); // Disable Solve, enable Pause, disable Resume

  path = [];
  visited = Array.from({ length: maze.length }, () =>
    Array(maze[0].length).fill(false)
  );
  console.log(found);
  found = await solveMazeWithDelay(currentX, currentY);
  console.log(found);
  if (found) {
    alert("Maze solved!");
    toggleButtons(false, true, true); // Enable Solve, disable Pause and Resume after solving
  } else {
    alert("No solution found");
  }
}

// Backtracking with delay and pause handling
async function solveMazeWithDelay(x, y) {
  // Halt the recursion if solving is paused, but don't return false
  while (paused) {
    await waitFor(100); // Small delay to check if paused has been lifted
  }

  // Store current state for restarting
  currentX = x;
  currentY = y;

  // If we reached the end
  if (x === end[0] && y === end[1]) {
    markPath(x, y);
    currentX = 0;
    currentY = 0;
    return true;
  }

  // Mark the cell as visited and add to the path
  if (isSafe(x, y)) {
    visited[x][y] = true;
    markPath(x, y); // Mark the path visually

    // Wait for 2 seconds (2000ms) before moving
    await waitFor(delay);

    // Move in 4 possible directions: down, right, up, left
    if (await solveMazeWithDelay(x + 1, y)) return true; // Down
    if (await solveMazeWithDelay(x, y + 1)) return true; // Right
    if (await solveMazeWithDelay(x - 1, y)) return true; // Up
    if (await solveMazeWithDelay(x, y - 1)) return true; // Left

    // Backtrack if no move is possible
    unmarkPath(x, y); // Unmark path if we backtrack
    visited[x][y] = false;
  }
  return false;
}

// Mark the cell in the visual maze
function markPath(x, y) {
  document
    .querySelector(
      `#maze-container .cell:nth-child(${x * maze[0].length + y + 1})`
    )
    .classList.add("path");
}

// Unmark the cell in case of backtracking
function unmarkPath(x, y) {
  document
    .querySelector(
      `#maze-container .cell:nth-child(${x * maze[0].length + y + 1})`
    )
    .classList.remove("path");
}

// Clear all the yellow cells (path) when restarting
function clearPath() {
  document.querySelectorAll(".path").forEach((cell) => {
    cell.classList.remove("path");
  });
}

// Wait for a given time
function waitFor(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pauseSolving() {
  paused = true;
  toggleButtons(true, true, false); // Disable Solve, Pause, enable Resume
}

async function resumeSolving() {
  paused = false;
  toggleButtons(true, false, true); // Disable Solve, enable Pause, disable Resume
  await solveMazeWithDelay(currentX, currentY); // Continue solving from last state
}

// Initialize the maze when the page loads
window.onload = function () {
  generateMaze();
  toggleButtons(false, true, true);
};
