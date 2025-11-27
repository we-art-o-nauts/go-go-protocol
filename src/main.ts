
import { initGame } from './game';
import './styles/index.css';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Ludum Admin - Starting initialization...');
  
  // Initialize the game
  initGame().catch(error => {
    console.error('Failed to initialize game:', error);
    document.body.innerHTML = `
      <div class="error-screen">
        <h1>Ludum Admin</h1>
        <p>Failed to load the game. Please refresh and try again.</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  });
});

// Handle page visibility changes to pause game
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Game paused (page hidden)');
    // Save game state when page is hidden
    import('./game').then(({ saveGameState, gameState }) => {
      //saveGameState(gameState);
    });
  }
});

// Handle beforeunload to save game state
window.addEventListener('beforeunload', (event) => {
  // Try to save game state before page unloads
  import('./game').then(({ saveGameState, gameState }) => {
    //saveGameState(gameState);
  });
  
  // Note: Modern browsers may not allow custom messages here
  return null;
});

console.log('Ludum Admin - Main script loaded');
