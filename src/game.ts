
import { GameState, INITIAL_GAME_STATE, GAME_CONSTANTS } from './definitions';
import { initUI } from './ui';
import { persistence } from './libs/persistence';

// Game state management
let gameState: GameState = { ...INITIAL_GAME_STATE };

// Game initialization
export async function initGame(): Promise<void> {
  try {
    // Try to load saved game state
    const savedState = await loadGameState();
    if (savedState) {
      gameState = savedState;
      console.log('Loaded saved game state');
    } else {
      // Initialize with default state
      await saveGameState(gameState);
      console.log('Initialized new game state');
    }

    // Initialize UI
    initUI(gameState);

    // Start game loop
    startGameLoop();

    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Error initializing game:', error);
  }
}

// Game loop
function startGameLoop(): void {
  const gameLoop = () => {
    updateGameTime();
    checkGameConditions();
    updateDisplay();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
  };

  // Start with 1-second intervals (adjusted for game time)
  setInterval(gameLoop, 1000);
}

// Update game time
function updateGameTime(): void {
  // Advance game time by 1 minute every real second
  gameState.gameTime += 1;
  
  // Handle day progression
  if (gameState.gameTime >= 1700) { // 5:00 PM
    gameState.gameDay += 1;
    gameState.gameTime = GAME_CONSTANTS.INITIAL_GAME_TIME; // Reset to 9:00 AM
  }
  
  // Save state periodically
  if (gameState.gameTime % 60 === 0) { // Every game hour
    saveGameState(gameState);
  }
}

// Check game conditions
function checkGameConditions(): void {
  // Check blood pressure
  if (gameState.bloodPressure >= gameState.maxBloodPressure) {
    handleGameOver();
  }
  
  // Check if all tasks are completed
  const allTasksCompleted = Object.values(gameState.completedTasks).length === Object.keys(gameState.completedTasks).length;
  if (allTasksCompleted && gameState.completedTasks.length > 0) {
    handleGameWin();
  }
}

// Handle game over (aneurysm)
function handleGameOver(): void {
  console.log('Game Over - Aneurysm!');
  
  // Show game over message
  const gameOverMessage = `
    💥 ANEURYSM! 💥
    
    The relentless bureaucracy has taken its toll.
    As you reach for Form 45-C, your vision blurs,
    the fluorescent lights seem unbearably bright,
    and then... nothing.
    
    Another victim of the system.
    
    Final Score: Day ${gameState.gameDay}, 
    Tasks Completed: ${gameState.completedTasks.length}
  `;
  
  alert(gameOverMessage);
  
  // Reset game
  resetGame();
}

// Handle game win
function handleGameWin(): void {
  console.log('Game Win!');
  
  const winMessage = `
    🎉 VICTORY! 🎉
    
    Against all odds, you've navigated the labyrinth
    of bureaucracy and restored order to your life.
    
    Your mail is delivered, your bank account accessible,
    and your blood pressure is (relatively) stable.
    
    You've proven that one person CAN战胜
    the soul-crushing machinery of modern administration.
    
    Final Score: Day ${gameState.gameDay}, 
    Blood Pressure: ${gameState.bloodPressure}/${gameState.maxBloodPressure}
  `;
  
  alert(winMessage);
}

// Update display
function updateDisplay(): void {
  // This would trigger UI updates
  // In a real implementation, this would use a proper state management system
  //console.log(`Day ${gameState.gameDay}, Time: ${formatGameTime(gameState.gameTime)}, BP: ${gameState.bloodPressure}/${gameState.maxBloodPressure}`);
}

// Location movement
export function moveToLocation(location: string): void {
  const newLocation = location as any;
  if (Object.values(['apartment', 'postOffice', 'bank', 'cityHall', 'library', 'coffeeShop', 'dmv', 'workplace']).includes(newLocation)) {
    gameState.currentLocation = newLocation;
    updateDisplay();
    console.log(`Moved to ${location}`);
    
    // Add time cost for travel
    gameState.gameTime += 15; // 15 minutes to travel
    
    // Save state
    saveGameState(gameState);
  } else {
    console.error(`Invalid location: ${location}`);
  }
}

// Blood pressure management
export function increaseBloodPressure(amount: number): void {
  gameState.bloodPressure = Math.min(gameState.maxBloodPressure, gameState.bloodPressure + amount);
  console.log(`Blood pressure increased by ${amount}. New BP: ${gameState.bloodPressure}`);
  
  // Check for game over
  checkGameConditions();
}

export function decreaseBloodPressure(amount: number): void {
  gameState.bloodPressure = Math.max(0, gameState.bloodPressure - amount);
  console.log(`Blood pressure decreased by ${amount}. New BP: ${gameState.bloodPressure}`);
}

// Task management
export function completeTask(taskId: string): void {
  if (!gameState.completedTasks.includes(taskId)) {
    gameState.completedTasks.push(taskId);
    console.log(`Completed task: ${taskId}`);
    
    // Reward: decrease blood pressure slightly
    decreaseBloodPressure(10);
    
    saveGameState(gameState);
  }
}

// Item management
export function addItemToInventory(itemId: string): void {
  // This would need the actual item definitions
  console.log(`Added item to inventory: ${itemId}`);
  saveGameState(gameState);
}

export function removeItemFromInventory(itemId: string): void {
  console.log(`Removed item from inventory: ${itemId}`);
  saveGameState(gameState);
}

// Dialogue management
export function advanceDialogue(characterId: string): void {
  console.log(`Advancing dialogue with ${characterId}`);
  
  // Add time cost for conversation
  gameState.gameTime += 5; // 5 minutes per conversation
  
  saveGameState(gameState);
}

// Form management
export function fillOutForm(formId: string, data: Record<string, string>): boolean {
  console.log(`Filling out form ${formId} with data:`, data);
  
  // Simulate form filling time
  gameState.gameTime += 20; // 20 minutes to fill form
  
  // Random chance of form error (increases blood pressure)
  if (Math.random() < 0.95) { // 15% chance of error
    increaseBloodPressure(GAME_CONSTANTS.BLOOD_PRESSURE_GAIN.FORM_ERROR);
    return false;
  }
  
  saveGameState(gameState);
  return true;
}

// Waiting mechanics
export function waitInLine(duration: number): void {
  console.log(`Waiting in line for ${duration} minutes`);
  
  // Add game time
  gameState.gameTime += duration;
  
  // Increase blood pressure based on wait time
  const bpIncrease = Math.floor(duration / 5) * GAME_CONSTANTS.BLOOD_PRESSURE_GAIN.WAIT_TIME;
  increaseBloodPressure(bpIncrease);
  
  saveGameState(gameState);
}

// Email management
export function checkEmail(): void {
  console.log('Checking email...');
  
  // Add time cost
  gameState.gameTime += 5;
  increaseBloodPressure(5);
  
  // This would trigger the email app
  //saveGameState(gameState);
}

// Game utilities
export function formatGameTime(time: number): string {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
}

// Save/load game state
async function saveGameState(state: GameState): Promise<void> {
  try {
    await persistence.setItem('ludum_admin_save', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

async function loadGameState(): Promise<GameState | null> {
  try {
    const savedData = await persistence.getItem('ludum_admin_save');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading game state:', error);
  }
  return null;
}

export function resetGame(): void {
  gameState = { ...INITIAL_GAME_STATE };
  saveGameState(gameState);
  initUI(gameState);
}

// Global functions for UI
(window as any).moveToLocation = moveToLocation;
(window as any).increaseBloodPressure = increaseBloodPressure;
(window as any).decreaseBloodPressure = decreaseBloodPressure;
(window as any).completeTask = completeTask;
(window as any).addItemToInventory = addItemToInventory;
(window as any).removeItemFromInventory = removeItemFromInventory;
(window as any).advanceDialogue = advanceDialogue;
(window as any).fillOutForm = fillOutForm;
(window as any).waitInLine = waitInLine;
(window as any).checkEmail = checkEmail;
(window as any).resetGame = resetGame;
