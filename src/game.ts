
import { 
  GameState, 
  NodeKind, 
  NODE_DEFS, 
  PacketType, 
  PacketStatus, 
  GRID_SIZE,
  MAX_CPU,
  ELEVATOR_GOAL
} from './definitions';
import { GameNode, Packet } from './entities';
import { snapToGrid, pointInRect, dist, lerp, formatCurrency, uuid } from './utils';

// Types for Persistence
interface SaveData {
  money: number;
  height: number;
  nodes: { kind: NodeKind, x: number, y: number, outputs: {x: number, y: number}[] }[];
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  
  state: GameState = GameState.MENU;
  
  // Economy & Progress
  money: number = 200.00;
  elevatorHeight: number = 0; // meters
  cpuUsage: number = 0;
  
  // Entities
  nodes: GameNode[] = [];
  packets: Packet[] = [];
  
  // Interaction
  selectedTool: NodeKind | 'WIRE' | 'DELETE' | null = null;
  hoverGrid: { x: number, y: number } | null = null;
  dragStartNode: GameNode | null = null; // For wiring
  
  // Timers
  lastTime: number = 0;
  spawnTimer: number = 0;
  spawnInterval: number = 2.5; // Seconds
  
  // Visuals
  camOffset: number = 0; // For right screen scrolling
  popupTimer: number = 0;
  activePopups: { id: string, x: number, y: number, text: string }[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    // Input listeners
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });

    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Initial Setup
    this.initLevel();
  }

  initLevel() {
    this.nodes = [];
    this.packets = [];
    
    // Create base inputs and outputs
    const inbox = new GameNode(NodeKind.INBOX, 2, 2);
    const pay = new GameNode(NodeKind.FINANCE, 12, 2);
    const archive = new GameNode(NodeKind.ARCHIVE, 12, 6);
    const trash = new GameNode(NodeKind.TRASH, 12, 10);
    
    this.nodes.push(inbox, pay, archive, trash);
  }

  async loadGame() {
    try {
      const dataStr = null; // await window.persistentStorage.getItem('entropy_save');
      if (dataStr) {
        const data: SaveData = JSON.parse(dataStr);
        this.money = data.money;
        this.elevatorHeight = data.height;
        
        // Reconstruct nodes
        this.nodes = [];
        const nodeMap = new Map<string, GameNode>();
        
        // First pass: create nodes
        data.nodes.forEach(n => {
          const node = new GameNode(n.kind, n.x, n.y);
          this.nodes.push(node);
          // Use a temp key based on pos to link logic
          nodeMap.set(`${n.x},${n.y}`, node);
        });
        
        // Second pass: link outputs
        data.nodes.forEach(n => {
          const source = nodeMap.get(`${n.x},${n.y}`);
          if (source) {
            n.outputs.forEach(outPos => {
              const target = nodeMap.get(`${outPos.x},${outPos.y}`);
              if (target) {
                source.outputs.push(target.id);
              }
            });
          }
        });
      }
    } catch (e) {
      console.error("Failed to load save", e);
    }
  }

  async saveGame() {
    const data: SaveData = {
      money: this.money,
      height: this.elevatorHeight,
      nodes: this.nodes.map(n => ({
        kind: n.kind,
        x: n.gridX,
        y: n.gridY,
        outputs: n.outputs.map(oid => {
          const target = this.nodes.find(no => no.id === oid);
          return target ? { x: target.gridX, y: target.gridY } : {x:0, y:0};
        }).filter(o => o.x !== 0)
      }))
    };
    //await window.persistentStorage.setItem('entropy_save', JSON.stringify(data));
  }

  start() {
    this.state = GameState.PLAYING;
    this.loop(0);
  }

  loop(timestamp: number) {
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (this.state === GameState.PLAYING) {
      this.update(dt);
    }
    this.draw();
    
    requestAnimationFrame(this.loop.bind(this));
  }

  // --- LOGIC ---

  update(dt: number) {
    if (dt > 0.1) dt = 0.1; // Cap delta time

    // 1. Spawning
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnPacket();
      this.spawnTimer = Math.max(0.5, 3.0 - (this.elevatorHeight / 5000)); // Faster as you go up
    }

    // 2. Annoying Popups (Bureaucracy)
    this.popupTimer += dt;
    if (this.popupTimer > 15) {
      this.popupTimer = 0;
      if (Math.random() > 0.5 && this.activePopups.length < 3) {
        this.createPopup();
      }
    }

    // 3. CPU Calculation
    let activeNodes = this.nodes.length; // Base load for hardware
    let heavyProcessing = 0;
    
    // 4. Packets & Nodes Update
    const arrivedIds: string[] = [];

    this.nodes.forEach(node => {
      // Process packets inside nodes (Stampers)
      if (node.processingPacket) {
        activeNodes += 2; // Processing costs extra
        heavyProcessing++;
        node.processTimer -= dt;
        if (node.processTimer <= 0) {
          // Finish processing
          this.applyNodeEffect(node, node.processingPacket);
          this.dispatchPacket(node.processingPacket, node);
          node.processingPacket = null;
        }
      } else {
        // Try to pull a packet from queue? 
        // Our model: Packets physically move. If they hit a node, they enter it.
      }
    });

    this.packets.forEach(p => {
      activeNodes += 0.5; // Moving data costs CPU
      
      if (p.targetNodeId) {
        const target = this.nodes.find(n => n.id === p.targetNodeId);
        const from = this.nodes.find(n => n.id === p.fromNodeId);
        
        if (target && from) {
          // Move along wire
          p.progress += (p.speed * dt) / dist({x: from.gridX, y: from.gridY}, {x: target.gridX, y: target.gridY});
          if (p.progress >= 1) {
            p.progress = 1;
            p.x = target.pixelX;
            p.y = target.pixelY;
            this.handlePacketArrival(p, target);
          } else {
            // Interpolate
            const px = from.pixelX + (target.pixelX - from.pixelX) * p.progress;
            const py = from.pixelY + (target.pixelY - from.pixelY) * p.progress;
            p.x = px;
            p.y = py;
          }
        } else {
          // Lost packet (deleted node?)
          p.status = PacketStatus.CORRUPTED;
          this.removePacket(p.id);
        }
      }
    });

    // Remove finished packets
    this.packets = this.packets.filter(p => p.progress < 1 || p.targetNodeId !== null);

    // 5. Elevator Simulation
    this.cpuUsage = Math.min(100, activeNodes * 1.5 + heavyProcessing * 5);
    const availablePower = Math.max(0, MAX_CPU - this.cpuUsage);
    
    // Speed increases based on height (momentum) but capped by power
    const ascentRate = (availablePower / 100) * 50; // meters per second
    this.elevatorHeight += ascentRate * dt;

    if (this.elevatorHeight >= ELEVATOR_GOAL * 1000) {
      if (this.state !== GameState.VICTORY) {
        this.state = GameState.VICTORY;
        alert("MOONSHOT COMPLETE. ESCAPE VELOCITY ACHIEVED.");
      }
    }
  }

  createPopup() {
    const msgs = ["UPDATE JAVA", "LICENSE EXPIRED", "PAPER JAM", "MEETING REMINDER"];
    const txt = msgs[Math.floor(Math.random() * msgs.length)];
    // Random position on Left Screen
    const w = this.canvas.width / 2;
    const h = this.canvas.height;
    this.activePopups.push({
      id: uuid(),
      x: 100 + Math.random() * (w - 300),
      y: 100 + Math.random() * (h - 200),
      text: txt
    });
  }

  closePopup(id: string) {
    this.activePopups = this.activePopups.filter(p => p.id !== id);
  }

  spawnPacket() {
    const inboxes = this.nodes.filter(n => n.kind === NodeKind.INBOX);
    if (inboxes.length === 0) return;
    
    const source = inboxes[Math.floor(Math.random() * inboxes.length)];
    
    // Determine type
    const r = Math.random();
    let type = PacketType.EMAIL;
    if (r < 0.3) type = PacketType.INVOICE;
    else if (r < 0.6) type = PacketType.TAX_FORM;
    
    const p = new Packet(type, source.pixelX, source.pixelY);
    
    // Find output and send instantly if not processing
    this.dispatchPacket(p, source);
    
    this.packets.push(p);
  }

  dispatchPacket(p: Packet, currentNode: GameNode): void {
    if (currentNode.outputs.length === 0) {
      // Stuck at node, effectively destroyed or waiting
      // Ideally we delete packets stuck at non-sink nodes to prevent leak
      if (!this.isSink(currentNode)) {
        // Lingering packets just sit there? Let's kill them after a while or handle in update
        // For now, if no output, it stays at '1.0' progress on the node.
        // Or we simulate 'buffer overflow' losing money?
      }
      return;
    }

    let targetId: string | null = null;

    // Routing Logic
    if (currentNode.kind === NodeKind.ROUTER_TYPE) {
       // Invoice go to Output 0 (Top if configured properly, but we use order of connection)
       // Let's rely on "First connection is High priority". 
       // Simplification: We need actual logic. 
       // Let's say: If Invoice, go to output with smallest Y (Up). Else largest Y (Down).
       const sorted = [...currentNode.outputs].sort((a,b) => {
         const na = this.nodes.find(n => n.id === a)!;
         const nb = this.nodes.find(n => n.id === b)!;
         return na.gridY - nb.gridY;
       });
       
       if (p.type === PacketType.INVOICE) {
         targetId = sorted[0]; // Up
       } else {
         targetId = sorted[sorted.length - 1]; // Down
       }
    } else if (currentNode.kind === NodeKind.ROUTER_RR) {
       // Round Robin implementation requires state in node.
       // HACK: Use random for now or time based
       targetId = currentNode.outputs[Math.floor(Math.random() * currentNode.outputs.length)];
    } else {
       // Default broadcast to first wire
       targetId = currentNode.outputs[0];
    }

    if (targetId) {
      p.fromNodeId = currentNode.id;
      p.targetNodeId = targetId;
      p.progress = 0;
    }
  }

  handlePacketArrival(p: Packet, node: GameNode) {
    if (this.isSink(node)) {
      this.processSink(p, node);
      this.removePacket(p.id);
      return;
    }

    if (this.isProcessor(node)) {
      if (!node.processingPacket) {
        node.processingPacket = p;
        node.processTimer = node.maxProcessTime;
        p.targetNodeId = null; // Stop moving
      } else {
        // Node busy! Packet builds up or explodes?
        // Let's say it bounces back or destroys.
        // Simple: Destroy = Packet Loss
        this.addNotification("PACKET LOST: BUFFER FULL");
        this.removePacket(p.id);
      }
      return;
    }

    // Pass through
    this.dispatchPacket(p, node);
  }

  applyNodeEffect(node: GameNode, p: Packet) {
    if (node.kind === NodeKind.PROCESSOR) {
      if (p.type === PacketType.INVOICE) {
        p.status = PacketStatus.STAMPED;
      } else {
        p.status = PacketStatus.CORRUPTED; // Stamp on wrong doc
      }
      p.updateColor();
    }
  }

  processSink(p: Packet, node: GameNode) {
    let income = 0;
    
    if (node.kind === NodeKind.FINANCE) {
      if (p.type === PacketType.INVOICE && p.status === PacketStatus.STAMPED) {
        income = 50;
      } else {
        income = -20; // Error / Fine
      }
    } else if (node.kind === NodeKind.ARCHIVE) {
      if (p.type === PacketType.TAX_FORM && p.status === PacketStatus.RAW) {
        income = 20;
      } else if (p.status === PacketStatus.CORRUPTED) {
         income = -100; // Audited!
      } else {
         income = -10; // Wrong filing
      }
    } else if (node.kind === NodeKind.TRASH) {
      if (p.type === PacketType.EMAIL) {
        income = 5; // Efficiency bonus
      } else {
        income = -50; // Deleted important doc
      }
    }

    this.money += income;
    if (income < 0) this.flashScreen();
  }

  removePacket(id: string) {
    const idx = this.packets.findIndex(p => p.id === id);
    if (idx !== -1) this.packets.splice(idx, 1);
  }

  isSink(node: GameNode): boolean {
    return [NodeKind.FINANCE, NodeKind.ARCHIVE, NodeKind.TRASH].includes(node.kind);
  }

  isProcessor(node: GameNode): boolean {
    return [NodeKind.PROCESSOR].includes(node.kind);
  }

  addNotification(msg: string) {
    // console.log(msg); // Optional debug
  }

  flashScreen() {
    this.canvas.style.filter = "brightness(1.5) sepia(1) hue-rotate(-50deg)";
    setTimeout(() => {
      this.canvas.style.filter = "none";
    }, 100);
  }

  // --- INPUT HANDLING ---

  handleMouseDown(e: MouseEvent) {
    if (this.state !== GameState.PLAYING) return;

    // Check Popups first
    const mx = e.clientX;
    const my = e.clientY;
    
    // Reverse iterate to hit top first
    for (let i = this.activePopups.length - 1; i >= 0; i--) {
      const pop = this.activePopups[i];
      if (pointInRect({x:mx, y:my}, {x: pop.x, y: pop.y, w: 200, h: 100})) {
        // Check if button click (bottom area)
        if (my > pop.y + 60) {
          this.closePopup(pop.id);
        }
        return; // Block other interactions
      }
    }

    if (mx > this.canvas.width / 2) return; // Ignore clicks on right side

    const gridPos = snapToGrid(mx, my);
    const gx = gridPos.x / GRID_SIZE;
    const gy = gridPos.y / GRID_SIZE;

    const clickedNode = this.nodes.find(n => n.gridX === gx && n.gridY === gy);

    if (this.selectedTool === 'DELETE') {
      if (clickedNode && !this.isProtected(clickedNode)) {
        this.nodes = this.nodes.filter(n => n !== clickedNode);
        // Clean connections
        this.nodes.forEach(n => {
          n.outputs = n.outputs.filter(id => id !== clickedNode.id);
        });
      }
      return;
    }

    if (this.selectedTool === 'WIRE') {
      if (clickedNode) {
        this.dragStartNode = clickedNode;
      }
      return;
    }

    // Placing Nodes
    if (this.selectedTool && NODE_DEFS[this.selectedTool]) {
      const def = NODE_DEFS[this.selectedTool];
      if (this.money >= def.cost) {
        if (!clickedNode) {
          // Place
          this.money -= def.cost;
          const n = new GameNode(this.selectedTool, gx, gy);
          this.nodes.push(n);
        }
      }
    }
  }

  handleMouseUp(e: MouseEvent) {
    if (this.state !== GameState.PLAYING) return;
    
    if (this.selectedTool === 'WIRE' && this.dragStartNode) {
       const mx = e.clientX;
       const my = e.clientY;
       const gridPos = snapToGrid(mx, my);
       const gx = gridPos.x / GRID_SIZE;
       const gy = gridPos.y / GRID_SIZE;
       
       const target = this.nodes.find(n => n.gridX === gx && n.gridY === gy);
       
       if (target && target !== this.dragStartNode) {
         // Connect
         if (!this.dragStartNode.outputs.includes(target.id)) {
           this.dragStartNode.outputs.push(target.id);
         }
       }
    }
    
    this.dragStartNode = null;
  }

  handleMouseMove(e: MouseEvent) {
    if (e.clientX < this.canvas.width / 2) {
      const g = snapToGrid(e.clientX, e.clientY);
      this.hoverGrid = { x: g.x, y: g.y };
    } else {
      this.hoverGrid = null;
    }
  }

  isProtected(node: GameNode) {
    return node.kind === NodeKind.INBOX || node.kind === NodeKind.FINANCE || node.kind === NodeKind.ARCHIVE || node.kind === NodeKind.TRASH;
  }

  // --- RENDERING ---

  draw() {
    // Clear
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const splitX = this.canvas.width / 2;

    // --- LEFT SCREEN (ADMIN) ---
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, splitX, this.canvas.height);
    this.ctx.clip();
    
    // Background: Grid
    this.ctx.strokeStyle = "#222";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < splitX; x += GRID_SIZE) {
      this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += GRID_SIZE) {
      this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(splitX, y); this.ctx.stroke();
    }

    // Wires
    this.nodes.forEach(n => {
      n.outputs.forEach(oid => {
        const target = this.nodes.find(tn => tn.id === oid);
        if (target) {
          this.ctx.strokeStyle = "#444";
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          this.ctx.moveTo(n.pixelX, n.pixelY);
          this.ctx.lineTo(target.pixelX, target.pixelY);
          this.ctx.stroke();

          // Render arrows/direction?
          const midX = (n.pixelX + target.pixelX)/2;
          const midY = (n.pixelY + target.pixelY)/2;
          this.ctx.fillStyle = "#444";
          this.ctx.fillRect(midX-2, midY-2, 4, 4);
        }
      });
    });
    
    // Dragging line
    if (this.dragStartNode && this.hoverGrid) {
      this.ctx.strokeStyle = "#fff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.dragStartNode.pixelX, this.dragStartNode.pixelY);
      this.ctx.lineTo(this.hoverGrid.x + GRID_SIZE/2, this.hoverGrid.y + GRID_SIZE/2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Nodes
    this.nodes.forEach(n => {
      const def = NODE_DEFS[n.kind];
      this.ctx.fillStyle = def.color;
      
      // Box
      this.ctx.fillRect(n.rect.x + 2, n.rect.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
      
      // Active state
      if (n.processingPacket) {
         this.ctx.strokeStyle = "#FFF";
         this.ctx.lineWidth = 2;
         this.ctx.strokeRect(n.rect.x + 2, n.rect.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
         
         // Progress Bar
         this.ctx.fillStyle = "#F00";
         const pct = n.processTimer / n.maxProcessTime;
         this.ctx.fillRect(n.rect.x, n.rect.y - 5, GRID_SIZE * (1-pct), 4);
      }

      // Label
      this.ctx.fillStyle = "#000";
      this.ctx.font = "10px monospace";
      this.ctx.fillText(def.label.substring(0,4), n.rect.x + 4, n.rect.y + GRID_SIZE/2 + 3);
    });

    // Packets
    this.packets.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      
      if (p.type === PacketType.EMAIL) {
        // Circle
        this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === PacketType.INVOICE) {
        // Rect
        this.ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
      } else {
        // Diamond
        this.ctx.moveTo(p.x, p.y - 6);
        this.ctx.lineTo(p.x + 6, p.y);
        this.ctx.lineTo(p.x, p.y + 6);
        this.ctx.lineTo(p.x - 6, p.y);
        this.ctx.fill();
      }
    });
    
    // Selection Highlight
    if (this.hoverGrid) {
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.hoverGrid.x, this.hoverGrid.y, GRID_SIZE, GRID_SIZE);
    }

    // Popups
    this.activePopups.forEach(pop => {
      this.ctx.fillStyle = "#dadada";
      this.ctx.fillRect(pop.x, pop.y, 200, 100);
      
      this.ctx.fillStyle = "#000080";
      this.ctx.fillRect(pop.x, pop.y, 200, 20); // Header
      
      this.ctx.strokeStyle = "white";
      this.ctx.strokeRect(pop.x, pop.y, 200, 100);
      this.ctx.fillStyle = "white";
      this.ctx.fillText("System Alert", pop.x + 5, pop.y + 14);
      
      this.ctx.fillStyle = "black";
      this.ctx.font = "12px sans-serif";
      this.ctx.fillText(pop.text, pop.x + 20, pop.y + 50);
      
      // Button
      this.ctx.fillStyle = "#ccc";
      this.ctx.fillRect(pop.x + 75, pop.y + 65, 50, 25);
      this.ctx.strokeRect(pop.x + 75, pop.y + 65, 50, 25);
      this.ctx.fillStyle = "black";
      this.ctx.fillText("OK", pop.x + 92, pop.y + 82);
    });

    this.ctx.restore();

    // --- RIGHT SCREEN (SIMULATION) ---
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(splitX, 0, splitX, this.canvas.height);
    this.ctx.clip();
    this.ctx.translate(splitX, 0);


    // Dynamic Sky Logic based on Height
    // 0 = Blue, 10000 = Black
    const t = Math.min(1, this.elevatorHeight / 30000);
    const r = lerp(135, 0, t);
    const g = lerp(206, 0, t);
    const b = lerp(235, 0, t);
    this.ctx.fillStyle = `rgb(${r},${g},${b})`;
    this.ctx.fillRect(0, 0, splitX, this.canvas.height);

    // Stars (if high enough)
    if (t > 0.5) {
      this.ctx.fillStyle = `rgba(255,255,255, ${ (t-0.5)*2 })`;
      for(let i=0; i<50; i++) {
        const sx = ((i * 1324) % splitX);
        const sy = ((i * 521) % this.canvas.height);
        this.ctx.fillRect(sx, sy, 2, 2);
      }
    }
    
    // Earth curve at bottom (if high enough)
    if (this.elevatorHeight > 1000) {
      const curveY = this.canvas.height + (this.elevatorHeight / 100);
      this.ctx.fillStyle = "#004400";
      this.ctx.beginPath();
      this.ctx.arc(splitX/2, curveY, splitX * 2, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Ground
      this.ctx.fillStyle = "#2e8b57";
      this.ctx.fillRect(0, this.canvas.height - 100 + (this.elevatorHeight/10), splitX, 1000);
    }
    
    // Tether
    this.ctx.strokeStyle = "#888"; // CNT Color
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(splitX/2, 0);
    this.ctx.lineTo(splitX/2, this.canvas.height);
    this.ctx.stroke();

    // Climber (Centered vertically)
    const climberY = this.canvas.height / 2;
    this.ctx.fillStyle = "#ccc";
    this.ctx.fillRect(splitX/2 - 15, climberY - 30, 30, 60);
    
    // Thruster effect / Speed lines
    if (this.cpuUsage < 100) {
      this.ctx.fillStyle = "rgba(255, 100, 0, 0.5)";
      this.ctx.beginPath();
      this.ctx.moveTo(splitX/2 - 5, climberY + 30);
      this.ctx.lineTo(splitX/2, climberY + 30 + (MAX_CPU - this.cpuUsage));
      this.ctx.lineTo(splitX/2 + 5, climberY + 30);
      this.ctx.fill();
    }

    // Stats HUD on Right
    this.ctx.fillStyle = "rgba(0,0,0,0.5)";
    this.ctx.fillRect(10, 10, 200, 100);
    this.ctx.fillStyle = "#0f0";
    this.ctx.font = "14px Courier New";
    this.ctx.fillText(`ALTITUDE: ${(this.elevatorHeight/1000).toFixed(2)} km`, 20, 30);
    this.ctx.fillText(`VELOCITY: ${((MAX_CPU - this.cpuUsage)*1).toFixed(0)} m/s`, 20, 50);
    this.ctx.fillText(`CPU LOAD: ${this.cpuUsage.toFixed(1)}%`, 20, 70);
    this.ctx.fillText(`TARGET  : ${36000} km`, 20, 90);

    this.ctx.restore();

    // Divider
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(splitX - 2, 0, 4, this.canvas.height);
  }
}
