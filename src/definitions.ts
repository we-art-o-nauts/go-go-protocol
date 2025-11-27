
export type Point = { x: number; y: number };

export enum GameState {
  MENU,
  PLAYING,
  GAME_OVER,
  VICTORY
}

export enum PacketType {
  INVOICE = 'INVOICE',
  TAX_FORM = 'TAX_FORM',
  EMAIL = 'EMAIL',
  ERROR = 'ERROR'
}

export enum PacketStatus {
  RAW = 'RAW',
  STAMPED = 'STAMPED', // Processed successfully
  CORRUPTED = 'CORRUPTED' // Processed incorrectly (e.g. stamps on things that shouldn't be stamped)
}

export enum NodeKind {
  // Sources
  INBOX = 'INBOX', 
  
  // Logic
  ROUTER_TYPE = 'ROUTER_TYPE', // Sorts by type (Invoice Up, Others Down)
  ROUTER_RR = 'ROUTER_RR', // Round robin splitting
  PROCESSOR = 'PROCESSOR', // Stamps documents (Takes time)
  
  // Sinks
  FINANCE = 'FINANCE', // Wants Stamped Invoices
  ARCHIVE = 'ARCHIVE', // Wants Raw Tax Forms
  TRASH = 'TRASH' // Wants Emails
}

export interface NodeDef {
  kind: NodeKind;
  cost: number;
  cpuLoad: number; // Passive load
  color: string;
  label: string;
  desc: string;
}

export const NODE_DEFS: Record<NodeKind, NodeDef> = {
  [NodeKind.INBOX]: { kind: NodeKind.INBOX, cost: 0, cpuLoad: 2, color: '#FFFFFF', label: 'INBOX', desc: 'Incoming data stream' },
  [NodeKind.ROUTER_TYPE]: { kind: NodeKind.ROUTER_TYPE, cost: 50, cpuLoad: 1, color: '#FFD700', label: 'SORT (TYPE)', desc: 'Invoices > Top, Others > Bottom' },
  [NodeKind.ROUTER_RR]: { kind: NodeKind.ROUTER_RR, cost: 30, cpuLoad: 1, color: '#FFA500', label: 'SPLITTER', desc: 'Alternates output' },
  [NodeKind.PROCESSOR]: { kind: NodeKind.PROCESSOR, cost: 100, cpuLoad: 5, color: '#00FFFF', label: 'STAMPER', desc: 'Approves Invoices. Corrupts others.' },
  [NodeKind.FINANCE]: { kind: NodeKind.FINANCE, cost: 0, cpuLoad: 0, color: '#00FF00', label: 'PAYROLL', desc: 'Needs Stamped Invoices' },
  [NodeKind.ARCHIVE]: { kind: NodeKind.ARCHIVE, cost: 0, cpuLoad: 0, color: '#8888F0', label: 'ARCHIVE', desc: 'Needs Raw Tax Forms' },
  [NodeKind.TRASH]: { kind: NodeKind.TRASH, cost: 0, cpuLoad: 0, color: '#AA4444', label: 'SHREDDER', desc: 'Destroy Spam' },
};

export const GRID_SIZE = 40;
export const MAX_CPU = 100;
export const ELEVATOR_GOAL = 36000; // km (Geostationary orbit)
