const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');
const newGameBtn = document.getElementById('newGameBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');

const CELL_SIZE = 30;
const WALL_COLOR = '#e94560';
const PATH_COLOR = '#0f0f23';
const PLAYER_COLOR = '#4ecdc4';
const GOAL_COLOR = '#ffd93d';

let maze = [];
let rows = 0;
let cols = 0;
let player = { x: 0, y: 0 };
let goal = { x: 0, y: 0 };
let moves = 0;
let seconds = 0;
let timerInterval = null;
let currentLevel = 1;
let gameWon = false;

function getMazeSize(level) {
    const baseSize = 10;
    const increase = (level - 1) * 2;
    const size = baseSize + increase;
    return Math.min(size, 20);
}

function generateMaze(numRows, numCols) {
    let grid = [];
    
    for (let y = 0; y < numRows; y++) {
        grid[y] = [];
        for (let x = 0; x < numCols; x++) {
            grid[y][x] = 1;
        }
    }
    
    function carve(x, y) {
        grid[y][x] = 0;
        
        let directions = [
            { dx: 0, dy: -2 },
            { dx: 2, dy: 0 },
            { dx: 0, dy: 2 },
            { dx: -2, dy: 0 }
        ];
        
        shuffleArray(directions);
        
        for (let dir of directions) {
            let newX = x + dir.dx;
            let newY = y + dir.dy;
            
            if (newX > 0 && newX < numCols - 1 && newY > 0 && newY < numRows - 1) {
                if (grid[newY][newX] === 1) {
                    grid[y + dir.dy / 2][x + dir.dx / 2] = 0;
                    carve(newX, newY);
                }
            }
        }
    }
    
    carve(1, 1);
    
    return grid;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initGame() {
    let size = getMazeSize(currentLevel);
    rows = size;
    cols = size;
    
    if (rows % 2 === 0) rows++;
    if (cols % 2 === 0) cols++;
    
    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;
    
    maze = generateMaze(rows, cols);
    
    player.x = 1;
    player.y = 1;
    
    goal.x = cols - 2;
    goal.y = rows - 2;
    maze[goal.y][goal.x] = 0;
    
    moves = 0;
    seconds = 0;
    gameWon = false;
    
    movesDisplay.textContent = moves;
    timerDisplay.textContent = seconds;
    levelDisplay.textContent = currentLevel;
    nextLevelBtn.disabled = true;
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(updateTimer, 1000);
    
    draw();
}

function updateTimer() {
    if (!gameWon) {
        seconds++;
        timerDisplay.textContent = seconds;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = WALL_COLOR;
            } else {
                ctx.fillStyle = PATH_COLOR;
            }
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
    
    ctx.fillStyle = GOAL_COLOR;
    ctx.beginPath();
    ctx.arc(
        goal.x * CELL_SIZE + CELL_SIZE / 2,
        goal.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(
        player.x * CELL_SIZE + CELL_SIZE / 2,
        player.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function movePlayer(dx, dy) {
    if (gameWon) return;
    
    let newX = player.x + dx;
    let newY = player.y + dy;
    
    if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
        if (maze[newY][newX] === 0) {
            player.x = newX;
            player.y = newY;
            moves++;
            movesDisplay.textContent = moves;
            
            draw();
            checkWin();
        }
    }
}

function checkWin() {
    if (player.x === goal.x && player.y === goal.y) {
        gameWon = true;
        clearInterval(timerInterval);
        nextLevelBtn.disabled = false;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#4ecdc4';
        ctx.font = 'bold 24px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.fillStyle = '#fff';
        ctx.font = '16px Segoe UI';
        ctx.fillText(`Moves: ${moves} | Time: ${seconds}s`, canvas.width / 2, canvas.height / 2 + 15);
    }
}

function handleKeyDown(event) {
    let key = event.key.toLowerCase();
    
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
    }
    
    switch (key) {
        case 'arrowup':
        case 'w':
            movePlayer(0, -1);
            break;
        case 'arrowdown':
        case 's':
            movePlayer(0, 1);
            break;
        case 'arrowleft':
        case 'a':
            movePlayer(-1, 0);
            break;
        case 'arrowright':
        case 'd':
            movePlayer(1, 0);
            break;
    }
}

newGameBtn.addEventListener('click', function() {
    currentLevel = 1;
    initGame();
});

nextLevelBtn.addEventListener('click', function() {
    currentLevel++;
    initGame();
});

document.addEventListener('keydown', handleKeyDown);

initGame();
