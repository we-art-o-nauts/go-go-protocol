import { Game } from './game';
import { UI } from './ui';

async function main() {
  //await window.persistentStorage.clear(); // Fresh start for demo usually better, but let's keep it clean
  
  const game = new Game();
  const ui = new UI(game);
  
  // Auto-save every 30 seconds
  setInterval(() => {
    if (game.state === 1) { // PLAYING
      game.saveGame();
    }
  }, 30000);
}

main();
