import type {
  RealtimeMessage,
  CollaboratorPresence,
  CanvasElement,
  User,
  ChatMessage,
  ReactionEvent,
  RoomInfo,
  BoardMetadata,
} from '../types/whiteboard';
import { livePeerService } from './livePeerService';

class RealtimeService {
  public get clientId(): string {
    return livePeerService.clientId;
  }

  public setBoardStateProvider(provider: () => { elements: CanvasElement[]; metadata: BoardMetadata }) {
    livePeerService.setBoardStateProvider(provider);
  }

  public joinRoom(roomId: string, user: User) {
    livePeerService.joinRoom(roomId, user);
  }

  public leaveRoom() {
    livePeerService.leaveRoom();
  }

  public subscribe(listener: (msg: RealtimeMessage) => void): () => void {
    return livePeerService.subscribe(listener);
  }

  public subscribeRoomStatus(listener: (info: RoomInfo) => void): () => void {
    return livePeerService.subscribeRoomStatus(listener);
  }

  public subscribeVoiceStream(listener: (peerId: string, stream: MediaStream) => void): () => void {
    return livePeerService.subscribeVoiceStream(listener);
  }

  public broadcastPresence(presence: CollaboratorPresence) {
    livePeerService.broadcastPresence(presence);
  }

  public broadcastElements(boardId: string, elements: CanvasElement[]) {
    livePeerService.broadcastElements(boardId, elements);
  }

  public broadcastChatMessage(text: string, user: User): ChatMessage {
    return livePeerService.broadcastChatMessage(text, user);
  }

  public broadcastReaction(emoji: string, user: User, x?: number, y?: number): ReactionEvent {
    return livePeerService.broadcastReaction(emoji, user, x, y);
  }

  public broadcastLeave(boardId: string) {
    livePeerService.broadcastLeave(boardId);
  }

  public startVoiceChat(): Promise<boolean> {
    return livePeerService.startVoiceChat();
  }

  public toggleMute(): boolean {
    return livePeerService.toggleMute();
  }

  public stopVoiceChat() {
    livePeerService.stopVoiceChat();
  }

  public get isMicMuted(): boolean {
    return livePeerService.isMicMuted;
  }

  public get isVoiceActive(): boolean {
    return livePeerService.isVoiceActive;
  }

  public createPresenceObject(
    user: User,
    boardId: string,
    cursorX: number,
    cursorY: number,
    selectedElementId?: string
  ): CollaboratorPresence {
    return livePeerService.createPresenceObject(user, boardId, cursorX, cursorY, selectedElementId);
  }
}

export const realtimeService = new RealtimeService();
