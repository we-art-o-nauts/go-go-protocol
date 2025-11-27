
import { NODE_DEFS, NodeKind } from './definitions';
import { Game } from './game';
import { formatCurrency } from './utils';

export class UI {
  game: Game;
  toolsContainer: HTMLElement;
  statusElement: HTMLElement;
  moneyElement: HTMLElement;
  startScreen: HTMLElement;

  constructor(game: Game) {
    this.game = game;
    
    // Create UI layers
    const layer = document.createElement('div');
    layer.id = 'ui-layer';
    layer.innerHTML = `
      <div id="left-panel" class="screen-split">
        <div id="admin-tools"></div>
      </div>
      <div id="right-panel" class="screen-split">
        <div id="status-bar" class="overlay-info">
           <div id="money-display">$0.00</div>
           <div id="goal-display">GEO: 0%</div>
        </div>
      </div>
    `;
    document.body.appendChild(layer);

    this.toolsContainer = document.getElementById('admin-tools')!;
    this.moneyElement = document.getElementById('money-display')!;
    this.statusElement = document.getElementById('goal-display')!;

    // Start Screen
    this.startScreen = document.createElement('div');
    this.startScreen.id = 'start-screen';
    this.startScreen.innerHTML = `
      <h1>ENTROPY PROTOCOL</h1>
      <h2>Project: MOONSHOT</h2>
      <p style="text-align:center; max-width: 600px; margin-bottom: 20px; line-height: 1.5; color: #ccc;">
        To escape the planet, you must build the Space Elevator.<br/>
        Funding is acquired by processing bureaucratic paperwork.<br/>
        <b>Left Screen:</b> Build logic circuits to process Invoices and Tax Forms.<br/>
        <b>Right Screen:</b> Monitor the Elevator's ascent.<br/>
        <br/>
        <b style="color:#f55">WARNING:</b> Automation consumes CPU cycles. <br/>Spare CPU powers the elevator. Balance efficiency with complexity.
      </p>
      <button class="primary-btn" id="start-btn">INITIATE SEQUENCE</button>
    `;
    document.body.appendChild(this.startScreen);
    
    document.getElementById('start-btn')?.addEventListener('click', () => {
       this.startScreen.classList.add('hidden');
       this.game.start();
    });

    this.buildTools();
    
    // Start update loop
    setInterval(() => this.updateUI(), 100);
  }

  buildTools() {
    const tools = [
      { id: 'WIRE', label: 'WIRE', cost: 0 },
      { id: 'DELETE', label: 'DELETE', cost: 0 },
      NODE_DEFS[NodeKind.ROUTER_TYPE],
      NODE_DEFS[NodeKind.ROUTER_RR],
      NODE_DEFS[NodeKind.PROCESSOR],
    ];

    tools.forEach(t => {
      const btn = document.createElement('div');
      btn.className = 'tool-btn';
      btn.innerHTML = `
        <span>${t.label}</span>
        <span class="tool-cost">${t.cost > 0 ? '$'+t.cost : '-'}</span>
      `;
      btn.onclick = () => {
        this.game.selectedTool = t['id'];
        this.updateActiveTool();
      };
      this.toolsContainer.appendChild(btn);
    });
  }

  updateActiveTool() {
    const btns = this.toolsContainer.children;
    for(let i=0; i<btns.length; i++) {
      const btn = btns[i] as HTMLElement;
      if (btn.innerText.includes(this.game.selectedTool || 'xxx')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  updateUI() {
    this.moneyElement.innerText = formatCurrency(this.game.money);
    
    // Color money red if low
    if (this.game.money < 0) this.moneyElement.style.color = 'red';
    else this.moneyElement.style.color = '#00ffaa';

    const pct = Math.min(100, (this.game.elevatorHeight / (36000*1000)) * 100);
    this.statusElement.innerText = `GEO: ${pct.toFixed(4)}%`;
  }
}
