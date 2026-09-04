import type { RealtimeMessage, CollaboratorPresence, CanvasElement, User } from '../types/whiteboard';

const CHANNEL_NAME = 'miro_whiteboard_sync_channel';

class RealtimeService {
  private channel: BroadcastChannel | null = null;
  private messageListeners: ((msg: RealtimeMessage) => void)[] = [];
  public clientId: string = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  constructor() {
    this.initChannel();
  }

  private initChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<RealtimeMessage>) => {
          this.notifyListeners(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or failed:', err);
      }
    }
  }

  public subscribe(listener: (msg: RealtimeMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(msg: RealtimeMessage) {
    this.messageListeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in realtime message listener:', err);
      }
    });
  }

  public broadcastPresence(presence: CollaboratorPresence) {
    if (!this.channel) return;
    this.channel.postMessage({
      type: 'PRESENCE_UPDATE',
      payload: presence,
    });
  }

  public broadcastElements(boardId: string, elements: CanvasElement[]) {
    if (!this.channel) return;
    this.channel.postMessage({
      type: 'ELEMENTS_SYNC',
      payload: {
        boardId,
        elements,
        senderId: this.clientId,
      },
    });
  }

  public broadcastLeave(boardId: string) {
    if (!this.channel) return;
    this.channel.postMessage({
      type: 'USER_LEFT',
      payload: { id: this.clientId, boardId },
    });
  }

  public createPresenceObject(user: User, boardId: string, cursorX: number, cursorY: number): CollaboratorPresence {
    return {
      id: this.clientId,
      user,
      boardId,
      cursor: { x: cursorX, y: cursorY },
      lastActive: Date.now(),
    };
  }
}

export const realtimeService = new RealtimeService();
