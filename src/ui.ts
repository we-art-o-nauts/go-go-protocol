
import { GameState, Location, Character } from './definitions';
import { TASKS, CHARACTERS, getCharacterAtLocation } from './entities';

// DOM elements
let gameContainer: HTMLElement;
let locationDisplay: HTMLElement;
let bloodPressureBar: HTMLElement;
let bloodPressureText: HTMLElement;
let locationImage: HTMLElement;
let locationDescription: HTMLElement;
let characterArea: HTMLElement;
let inventoryArea: HTMLElement;
let taskArea: HTMLElement;
let actionArea: HTMLElement;
let dialogBox: HTMLElement;
let desktopArea: HTMLElement;
let apartmentArea: HTMLElement;

// Game state
let currentGameState: GameState;

// Initialize UI
export function initUI(gameState: GameState): void {
  currentGameState = gameState;
  
  // Get main container
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  // Create main layout
  app.innerHTML = `
    <div id="game-container" class="game-container">
      <!-- Status Bar -->
      <div id="status-bar" class="status-bar">
        <div class="status-item">
          <span>Day ${gameState.gameDay}</span>
          <span id="game-time">${formatGameTime(gameState.gameTime)}</span>
        </div>
        <div class="blood-pressure">
          <span>Blood Pressure: </span>
          <div class="bp-bar">
            <div id="bp-bar-fill" class="bp-bar-fill"></div>
          </div>
          <span id="bp-text">${gameState.bloodPressure}/${gameState.maxBloodPressure}</span>
        </div>
      </div>
      
      <!-- Main Game Area -->
      <div id="main-area" class="main-area">
        <!-- Left Panel - Game World -->
        <div class="left-panel">
          <div id="location-display" class="location-display">
            <h2 id="location-name">Loading...</h2>
            <div id="location-image" class="location-image"></div>
            <p id="location-description">Loading location...</p>
          </div>
          
          <div id="character-area" class="character-area"></div>
          
          <div class="interaction-area">
            <h3>Actions</h3>
            <div id="action-area" class="action-buttons"></div>
          </div>
        </div>
        
        <!-- Right Panel - UI Elements -->
        <div class="right-panel">
          <div id="inventory-area" class="inventory-area">
            <h3>Inventory</h3>
            <div class="inventory-items"></div>
          </div>
          
          <div id="task-area" class="task-area">
            <h3>Tasks</h3>
            <div class="task-list"></div>
          </div>
        </div>
      </div>
      
      <!-- Desktop Area (hidden by default) -->
      <div id="desktop-area" class="desktop-area" style="display: none;">
        <div class="desktop-background"></div>
        <div class="desktop-icons">
          <div class="desktop-icon" data-app="email">
            <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmVyc2lvbj0iMS4wIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeDE9Ii0zNDQuMTUiIHgyPSItMzk1Ljg1IiB5MT0iMjc0LjcxIiB5Mj0iNDI1LjQiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLS41OTE0NiAwIDAgLjU5MTQ2IDIxMC4wMiAxNDIuMjMpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmZiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iMCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTM3My42NCAtMzE4LjM0KSI+CiAgICA8cmVjdCB3aWR0aD0iMjM1LjAxIiBoZWlnaHQ9IjIzNC45OSIgeD0iLTYxOS4xNSIgeT0iMzI4Ljg1IiBmaWxsPSIjZWNlY2ViIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZT0iI2JkYmRiZCIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLXdpZHRoPSI2IiByeD0iMzUuNDg4IiByeT0iMzUuNDg4IiB0cmFuc2Zvcm09InNjYWxlKC0xIDEpIi8+CiAgICA8cGF0aCBmaWxsPSJ1cmwoI2EpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01NTcuMDYgMzM4LjlINDQ2LjIzYy0yOS4zNCAwLTUyLjk2IDIzLjgtNTIuOTYgNTMuMzh2MTA4LjEzYy45NSAyMy4wOCA0LjYgOC40OSAxMS41Ni0xNy4wOCA4LjA4LTI5LjcxIDM0LjM5LTU1LjY4IDY2LjQ0LTc1LjE0IDI0LjQ2LTE0Ljg2IDUxLjg0LTI0LjM0IDEwMS42OC0yNS4yNSAyOC4yNy0uNTEgMjUuNzctMzYuNjgtMTUuODktNDQuMDR6Ii8+CiAgICA8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNiZGJkYmQiIHN0cm9rZS13aWR0aD0iNiIgZD0ibTM4NS4wNjkgMzc0LjM0IDEwNy4xNCAxMTIuMTRjNi45NiAzLjIgMTMuMjggMi41MSAxOS4yOSAwbDEwNy4xNC0xMTUiLz4KICAgIDxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NkY2VjZSIgc3Ryb2tlLXdpZHRoPSI2IiBkPSJtNDU3LjkyNiA0ODguNjMtNjAgNjIuODVNNTQ5LjM1IDQ4Ny4ybDYyLjg2IDY0LjI4Ii8+CiAgPC9nPgo8L3N2Zz4=" alt="Email">
            <span>Email</span>
          </div>
          <div class="desktop-icon" data-app="forms">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiMwMEE4M0UiIGQ9Ik0xMjggMTYgTCA2NCAxNiBMIDY0IDExMiBMIDEyOCAxMTIgWiIvPgogIDxwYXRoIGZpbGw9IiM0MjhBRjQiIGQ9Ik02NCAxNiBMIDY0IDExMiBMIDYgMTEyIEwgNiAxNiBaIi8+CiAgPHBhdGggZmlsbD0iI0ZGNDUwMCIgZD0iTTY0IDE2IEwgNiAxNiBMIDYgMTEyIEwgNjQgMTEyIFoiLz4KPC9zdmc+" alt="Forms">
            <span>Accounting</span>
          </div>
          <div class="desktop-icon" data-app="printer">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiM5OTkwQUUiIGQ9Ik0xMTIgMTYgTCAxNiAxNiBMIDE2IDMyIEwgNjQgNDggTCAxMTIgMzIgWiIvPgogIDxwYXRoIGZpbGw9IiM0QzdEQkIiIGQ9Ik02NCA0OCBMIDE2IDMyIEwgMTYgNjQgTCA2NCA4MCBMIDExMiA2NCBMIDExMiAzMiBaIi8+CiAgPHBhdGggZmlsbD0iI0ZGQkUwMCIgZD0iTTY0IDQ4IEwgMTYgMzIgTCAxNiA2NCBMIDY0IDgwIEwgMTEyIDY0IEwgMTEyIDMyIFoiLz4KPC9zdmc+" alt="Printer">
            <span>Tax you</span>
          </div>
        </div>
      </div>


      <!-- Apartment Area (hidden by default) -->
      <div id="apartment-area" class="apartment-area" style="display: none;">
        <div class="apartment-background"></div>
      </div>

    </div>
    
    <!-- Dialog Box -->
    <div id="dialog-box" class="dialog-box" style="display: none;">
      <div class="dialog-content">
        <div class="dialog-text"></div>
        <div class="dialog-options"></div>
      </div>
    </div>
  `;

  // Initialize element references
  initializeElements();
  
  // Set up event listeners
  setupEventListeners();
 
  // Update the display elements
  updateElements();
}

function updateElements(): void {
  let gameState = currentGameState;
  // Update display
  updateLocationDisplay(gameState.currentLocation);
  updateInventoryDisplay(gameState.inventory);
  updateTaskDisplay(gameState);
  updateBloodPressureDisplay(gameState.bloodPressure, gameState.maxBloodPressure);
}

function initializeElements(): void {
  gameContainer = document.getElementById('main-area')!;
  locationDisplay = document.getElementById('location-display')!;
  bloodPressureBar = document.getElementById('bp-bar-fill')!;
  bloodPressureText = document.getElementById('bp-text')!;
  locationImage = document.getElementById('location-image')!;
  locationDescription = document.getElementById('location-description')!;
  characterArea = document.getElementById('character-area')!;
  inventoryArea = document.getElementById('inventory-area')!;
  taskArea = document.getElementById('task-area')!;
  actionArea = document.getElementById('action-area')!;
  dialogBox = document.getElementById('dialog-box')!;
  desktopArea = document.getElementById('desktop-area')!;
  apartmentArea = document.getElementById('apartment-area')!;
}

function setupEventListeners(): void {
  // Desktop icon clicks
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      const app = (e.currentTarget as HTMLElement).dataset.app;
      if (app) {
        openDesktopApp(app);
      }
    });
  });
  document.querySelectorAll('.apartment-area').forEach(el => {
    el.addEventListener('click', (e) => {
      currentGameState.bloodPressure += 5;
      updateElements();
      goHome();
    });
  });
}

function updateLocationDisplay(location: Location): void {
  const locationName = document.getElementById('location-name')!;
  const locationImage = document.getElementById('location-image')!;
  const locationDescription = document.getElementById('location-description')!;
  const characterArea = document.getElementById('character-area')!;
  const actionArea = document.getElementById('action-area')!;

  // Update location info
  locationName.textContent = formatLocationName(location);
  locationImage.innerHTML = getLocationImage(location);
  locationDescription.textContent = getLocationDescription(location);

  // Update character area
  const character = getCharacterAtLocation(location, currentGameState);
  if (character) {
    characterArea.innerHTML = `
      <div class="character">
        <div class="character-image"></div>
        <div class="character-info">
          <h4>${character.name}</h4>
          <p>Available for conversation</p>
        </div>
      </div>
    `;
    
    // Add talk button
    actionArea.innerHTML = `
      <button class="action-button" onclick="playerTalkTo('${character.id}')">
        Talk to ${character.name}
      </button>
    `;
  } else {
    characterArea.innerHTML = '<p>No one here right now.</p>';
    actionArea.innerHTML = '';
  }

  // Add location-specific actions
  const locationActions = getLocationActions(location);
  if (locationActions.length > 0) {
    const existingButtons = actionArea.innerHTML;
    actionArea.innerHTML = existingButtons + locationActions.map(action => 
      `<button class="action-button" onclick="${action.onclick}">
        ${action.text}
      </button>`
    ).join('');
  }
}

function updateInventoryDisplay(inventory: any[]): void {
  const inventoryItems = document.querySelector('.inventory-items') as HTMLElement;
  
  if (inventory.length === 0) {
    inventoryItems.innerHTML = '<p>Empty</p>';
    return;
  }

  inventoryItems.innerHTML = inventory.map(item => `
    <div class="inventory-item">
      <span class="item-name">${item.name}</span>
      <button class="use-item" onclick="useItem('${item.id}')">Use</button>
    </div>
  `).join('');
}

function updateTaskDisplay(gameState: GameState): void {
  const taskList = document.querySelector('.task-list') as HTMLElement;
  
  const availableTasks = Object.values(TASKS).filter(task => 
    task.location === gameState.currentLocation &&
    !gameState.completedTasks.includes(task.id) &&
    (!task.prerequisiteTasks || task.prerequisiteTasks.every(id => gameState.completedTasks.includes(id)))
  );

  if (availableTasks.length === 0) {
    taskList.innerHTML = '<p>No tasks available here.</p>';
    return;
  }

  taskList.innerHTML = availableTasks.map(task => `
    <div class="task-item">
      <h4>${task.title}</h4>
      <p>${task.description}</p>
      <div class="task-progress">
        ${getTaskProgress(task)}
      </div>
    </div>
  `).join('');
}

function updateBloodPressureDisplay(current: number, max: number): void {
  const percentage = (current / max) * 100;
  bloodPressureBar.style.width = `${percentage}%`;
  bloodPressureBar.style.backgroundColor = getBloodPressureColor(percentage);
  bloodPressureText.textContent = `${current}/${max}`;
}

function getLocationImage(location: Location): string {
  const images: Record<Location, string> = {
    apartment: '<div class="location-icon">🏠</div>',
    postOffice: '<div class="location-icon">🏢</div>',
    bank: '<div class="location-icon">🏦</div>',
    cityHall: '<div class="location-icon">🏛️</div>',
    library: '<div class="location-icon">📚</div>',
    coffeeShop: '<div class="location-icon">☕</div>',
    dmv: '<div class="location-icon">🚦</div>',
    workplace: '<div class="location-icon">💼</div>'
  };
  return images[location] || '<div class="location-icon">?</div>';
}

function getLocationDescription(location: Location): string {
  const descriptions: Record<Location, string> = {
    apartment: 'Your modest apartment. The mail slot in the door is empty again. At least the coffee maker still works.',
    postOffice: 'The post office lobby. Fluorescent lights hum overhead. The line moves at a glacial pace.',
    bank: 'First National Bank. Plush carpet, hushed voices, and the faint smell of anxiety.',
    cityHall: 'Municipal offices. Endless corridors and the sound of bureaucratic machinery.',
    library: 'The public library. Quiet except for the occasional frustrated sigh from the government forms section.',
    coffeeShop: 'Corner coffee shop. The line is always longer than it looks.',
    dmv: 'Department of Motor Vehicles. The air tastes like despair.',
    workplace: 'Your office. Fluorescent lights, the hum of computers, and the weight of unfinished paperwork.'
  };
  return descriptions[location];
}

function getLocationActions(location: Location): Array<{text: string, onclick: string}> {
  const actions: Record<Location, Array<{text: string, onclick: string}>> = {
    apartment: [
      { text: 'Use the computer', onclick: 'openDesktop()' },
      { text: 'Log into e-banking', onclick: 'openDesktop()' },
      { text: 'Look for lost document', onclick: 'searchApartment()' }
    ],
    postOffice: [
      { text: 'Get in Line', onclick: 'joinPostOfficeLine()' },
      { text: 'Look for Forms', onclick: 'searchPostOfficeForms()' }
    ],
    bank: [
      { text: 'Wait in Line', onclick: 'waitInBankLine()' },
      { text: 'Fill Out Forms', onclick: 'fillBankForms()' }
    ],
    cityHall: [
      { text: 'Find the Right Window', onclick: 'findCityHallWindow()' },
      { text: 'Ask About Circle File', onclick: 'askAboutCircleFile()' }
    ],
    library: [
      { text: 'Use Computer', onclick: 'openDesktop()' },
      { text: 'Ask Librarian for Help', onclick: 'askLibrarian()' }
    ],
    coffeeShop: [
      { text: 'Order Coffee', onclick: 'orderCoffee()' },
      { text: 'Check Phone', onclick: 'checkPhone()' }
    ],
    dmv: [
      { text: 'Take Number', onclick: 'takeDmvNumber()' },
      { text: 'Wait Indefinitely', onclick: 'waitAtDmv()' }
    ],
    workplace: [
      { text: 'Check Work Email', onclick: 'openDesktop()' },
      { text: 'Fill Out HR Forms', onclick: 'fillHrForms()' }
    ]
  };
  return actions[location] || [];
}

function formatLocationName(location: Location): string {
  const names: Record<Location, string> = {
    apartment: 'Home - Your Apartment',
    postOffice: 'Post Office',
    bank: 'First National Bank',
    cityHall: 'City Hall - Department of Records',
    library: 'Public Library',
    coffeeShop: 'Corner Coffee Shop',
    dmv: 'DMV - Department of Motor Vehicles',
    workplace: 'Workplace - TechCorp Office'
  };
  return names[location];
}

function getTaskProgress(task: any): string {
  const completedSteps = task.steps.filter((step: any) => step.isComplete).length;
  const totalSteps = task.steps.length;
  return `${completedSteps}/${totalSteps} steps complete`;
}

function getBloodPressureColor(percentage: number): string {
  if (percentage < 30) return '#4CAF50';
  if (percentage < 60) return '#FF9800';
  return '#F44336';
}

export function formatGameTime(time: number): string {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
}

function openDesktopApp(appName: string): void {
  // Placeholder for desktop app functionality
  console.log(`Opening ${appName} app`);
  showNotification(`Opening ${appName}...`);
  setTimeout(() => {
    currentGameState.bloodPressure += 5;
    updateElements();
    goHome();
  }, 1000)
}

function showNotification(message: string): void {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Global functions for onclick handlers
(window as any).playerTalkTo = function(characterId: string) {
  console.log(`Talking to ${characterId}`);
  // TODO: Implement dialogue system
  characterArea.style.display = 'block'
  characterArea.style.backgroundColor = 'lightgreen';
  setTimeout(() => {
    characterArea.style.backgroundColor = '';
    currentGameState.bloodPressure += 5 + Math.floor(Math.random() * 20);
    updateElements();
  }, 2000);
};

(window as any).useItem = function(itemId: string) {
  console.log(`Using item ${itemId}`);
  // TODO: Implement item usage
};

(window as any).goHome = function() {
  desktopArea.style.display = 'none';
  apartmentArea.style.display = 'none';
  gameContainer.style.display = 'block';
};

(window as any).openDesktop = function() {
  desktopArea.style.display = 'block';
  gameContainer.style.display = 'none';
};

// Location-specific functions
(window as any).searchApartment = function() {
  console.log('Searching apartment');
  apartmentArea.style.display = 'block';
  gameContainer.style.display = 'none';
};

(window as any).joinPostOfficeLine = function() {
  console.log('Joining post office line');
  // TODO: Implement post office line
};

(window as any).searchPostOfficeForms = function() {
  console.log('Searching for forms at post office');
  // TODO: Implement form search
};

(window as any).waitInBankLine = function() {
  console.log('Waiting in bank line');
  // TODO: Implement bank waiting
};

(window as any).fillBankForms = function() {
  console.log('Filling bank forms');
  // TODO: Implement bank form filling
};

(window as any).findCityHallWindow = function() {
  console.log('Finding city hall window');
  // TODO: Implement window finding
};

(window as any).askAboutCircleFile = function() {
  console.log('Asking about circle file');
  // TODO: Implement circle file explanation
};

(window as any).askLibrarian = function() {
  console.log('Asking librarian for help');
  // TODO: Implement librarian interaction
};

(window as any).orderCoffee = function() {
  console.log('Ordering coffee');
  // TODO: Implement coffee ordering
};

(window as any).checkPhone = function() {
  console.log('Checking phone');
  // TODO: Implement phone check
};

(window as any).takeDmvNumber = function() {
  console.log('Taking DMV number');
  // TODO: Implement DMV number taking
};

(window as any).waitAtDmv = function() {
  console.log('Waiting at DMV');
  // TODO: Implement DMV waiting
};

(window as any).fillHrForms = function() {
  console.log('Filling HR forms');
  // TODO: Implement HR form filling
};
