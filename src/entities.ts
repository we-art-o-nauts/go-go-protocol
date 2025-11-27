
import { 
  PacketType, 
  PacketStatus, 
  NodeKind, 
  NODE_DEFS, 
  GRID_SIZE
} from './definitions';
import { lerp, uuid } from './utils';

export class Packet {
  id: string;
  type: PacketType;
  status: PacketStatus;
  
  // Position
  x: number;
  y: number;
  
  // Movement
  targetNodeId: string | null = null;
  fromNodeId: string | null = null;
  progress: number = 0; // 0 to 1 along the wire
  speed: number = 2.0; // Grid cells per second (approx)

  // Visuals
  color: string;

  constructor(type: PacketType, x: number, y: number) {
    this.id = uuid();
    this.type = type;
    this.status = PacketStatus.RAW;
    this.x = x;
    this.y = y;
    this.color = this.getColor();
  }

  getColor(): string {
    switch (this.type) {
      case PacketType.INVOICE: return '#00FF00'; // Green
      case PacketType.TAX_FORM: return '#5555FF'; // Blue
      case PacketType.EMAIL: return '#FF5555'; // Red
      default: return '#FFF';
    }
  }

  updateColor() {
    if (this.status === PacketStatus.CORRUPTED) {
      this.color = '#880000'; // Corrupt blood red
    } else if (this.status === PacketStatus.STAMPED) {
      this.color = '#FFFFFF'; // Bright white meaning processed
    } else {
      this.color = this.getColor();
    }
  }
}

export class GameNode {
  id: string;
  kind: NodeKind;
  gridX: number; // Grid Coordinates
  gridY: number;
  
  // Connections
  outputs: string[] = []; // IDs of destination Nodes
  
  // Processing state
  processingPacket: Packet | null = null;
  processTimer: number = 0;
  maxProcessTime: number = 1.0; // Seconds

  constructor(kind: NodeKind, gx: number, gy: number) {
    this.id = uuid();
    this.kind = kind;
    this.gridX = gx;
    this.gridY = gy;
    
    // Config times
    if (this.kind === NodeKind.PROCESSOR) {
      this.maxProcessTime = 1.5;
    }
  }

  get pixelX(): number { return this.gridX * GRID_SIZE + GRID_SIZE/2; }
  get pixelY(): number { return this.gridY * GRID_SIZE + GRID_SIZE/2; }
  
  get rect() {
    return {
      x: this.gridX * GRID_SIZE,
      y: this.gridY * GRID_SIZE,
      w: GRID_SIZE,
      h: GRID_SIZE
    };
  }
}
