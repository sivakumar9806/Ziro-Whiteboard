import type { CollaboratorPresence, User, CanvasElement } from '../types/whiteboard';

const SIMULATED_USER: User = {
  id: 'user-sarah-sim',
  name: 'Sarah Chen (Live)',
  email: 'sarah@product.co',
  avatarColor: '#10b981',
  roleTitle: 'Tech Lead',
};

export class CollabSimulation {
  private timer: number | null = null;
  private currentX = 350;
  private currentY = 220;
  private targetX = 400;
  private targetY = 300;
  private onPresenceUpdate: (presence: CollaboratorPresence) => void;
  private onCreateElement?: (el: CanvasElement) => void;
  private boardId: string;
  private hasCreatedSticky = false;

  constructor(
    boardId: string,
    onPresenceUpdate: (presence: CollaboratorPresence) => void,
    onCreateElement?: (el: CanvasElement) => void
  ) {
    this.boardId = boardId;
    this.onPresenceUpdate = onPresenceUpdate;
    this.onCreateElement = onCreateElement;
  }

  public start() {
    if (this.timer) return;

    this.timer = window.setInterval(() => {
      // Smoothly interpolate towards target
      this.currentX += (this.targetX - this.currentX) * 0.1;
      this.currentY += (this.targetY - this.currentY) * 0.1;

      // Pick new random target when close
      if (Math.hypot(this.targetX - this.currentX, this.targetY - this.currentY) < 15) {
        this.targetX = 200 + Math.random() * 500;
        this.targetY = 150 + Math.random() * 400;

        // Occasionally create a collaborative sticky note
        if (!this.hasCreatedSticky && this.onCreateElement && Math.random() > 0.4) {
          this.hasCreatedSticky = true;
          const simSticky: CanvasElement = {
            id: `sticky-collab-${Date.now()}`,
            type: 'sticky',
            x: Math.round(this.currentX),
            y: Math.round(this.currentY),
            width: 200,
            height: 180,
            colorTheme: 'green',
            text: '✨ Added by Sarah Chen:\n"Great work on real-time sync!"',
            fontSize: 14,
            textAlign: 'left',
            zIndex: 100,
          };
          this.onCreateElement(simSticky);
        }
      }

      this.onPresenceUpdate({
        id: 'simulated-sarah',
        user: SIMULATED_USER,
        boardId: this.boardId,
        cursor: { x: Math.round(this.currentX), y: Math.round(this.currentY) },
        lastActive: Date.now(),
        isSimulated: true,
      });
    }, 50);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
