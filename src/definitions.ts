
// Game state definitions
export interface GameState {
  bloodPressure: number;
  maxBloodPressure: number;
  currentLocation: Location;
  inventory: Item[];
  completedTasks: string[];
  dialogueProgress: Record<string, number>;
  documents: Document[];
  gameDay: number;
  gameTime: number; // 0-2359, like 930 = 9:30 AM
}

export type Location = 
  | 'apartment'
  | 'postOffice'
  | 'bank'
  | 'cityHall'
  | 'library'
  | 'coffeeShop'
  | 'dmv'
  | 'workplace';

export interface Item {
  id: string;
  name: string;
  description: string;
  useText?: string;
  canUseInLocations?: Location[];
}

export interface Document {
  id: string;
  name: string;
  description: string;
  requiredFields: string[];
  filledFields: Record<string, string>;
  isComplete: boolean;
}

export interface Character {
  id: string;
  name: string;
  location: Location;
  dialogue: Dialogue[];
  tasks?: Task[];
}

export interface Dialogue {
  id: string;
  speaker: 'player' | 'npc';
  text: string;
  requiredItems?: string[];
  triggersTask?: string;
  changesLocation?: Location;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  location: Location;
  reward?: Item;
  prerequisiteTasks?: string[];
  isComplete: boolean;
  steps: TaskStep[];
}

export interface TaskStep {
  id: string;
  description: string;
  isComplete: boolean;
  actionType: 'collect' | 'talk' | 'fillForm' | 'email' | 'print' | 'solvePuzzle';
  target?: string;
  requirements?: Record<string, any>;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  isRead: boolean;
  attachments?: Document[];
  sentTime: number;
}

export interface DesktopApp {
  id: string;
  name: string;
  icon: string;
  windowTitle: string;
  component: string;
  minWidth: number;
  minHeight: number;
}

// Game constants
export const GAME_CONSTANTS = {
  BLOOD_PRESSURE_GAIN: {
    FORM_ERROR: 15,
    WAIT_TIME: 5,
    RUDE_PERSON: 25,
    LOST_DOCUMENT: 30,
    TECHNICAL_ERROR: 20,
    CIRCLE_FILE: 35,
    RED_TAPE: 40
  },
  MAX_BLOOD_PRESSURE: 100,
  BASE_WAIT_TIME: 3000, // 3 seconds base wait
  INITIAL_GAME_TIME: 900, // 9:00 AM
  DAY_LENGTH: 480 // 8 hours in game minutes
};

// Initial game state
export const INITIAL_GAME_STATE: GameState = {
  bloodPressure: 0,
  maxBloodPressure: GAME_CONSTANTS.MAX_BLOOD_PRESSURE,
  currentLocation: 'apartment',
  inventory: [],
  completedTasks: [],
  dialogueProgress: {},
  documents: [],
  gameDay: 1,
  gameTime: GAME_CONSTANTS.INITIAL_GAME_TIME
};
