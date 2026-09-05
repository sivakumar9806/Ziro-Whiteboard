import { Peer, type DataConnection, type MediaConnection } from 'peerjs';
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

export type MessageCallback = (msg: RealtimeMessage) => void;
export type RoomStatusCallback = (info: RoomInfo) => void;
export type VoiceStreamCallback = (peerId: string, stream: MediaStream) => void;

class LivePeerService {
  private peer: Peer | null = null;
  private peerId: string = '';
  public clientId: string = `u-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  private currentRoomId: string = '';
  private isConnected: boolean = false;
  private isHost: boolean = false;
  private dataConnections: Map<string, DataConnection> = new Map();
  private mediaCalls: Map<string, MediaConnection> = new Map();
  private messageListeners: Set<MessageCallback> = new Set();
  private roomStatusListeners: Set<RoomStatusCallback> = new Set();
  private voiceStreamListeners: Set<VoiceStreamCallback> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  // Voice chat local stream
  private localAudioStream: MediaStream | null = null;
  public isMicMuted: boolean = true;
  public isVoiceActive: boolean = false;

  // Board state cache
  private latestElementsProvider: (() => { elements: CanvasElement[]; metadata: BoardMetadata }) | null = null;
  private heartbeatInterval: any = null;

  constructor() {
    this.initBroadcastChannel();
  }

  private initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('ziro_multiuser_collab_channel');
        this.broadcastChannel.onmessage = (event: MessageEvent<RealtimeMessage>) => {
          this.emitMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported:', err);
      }
    }
  }

  public setBoardStateProvider(provider: () => { elements: CanvasElement[]; metadata: BoardMetadata }) {
    this.latestElementsProvider = provider;
  }

  /**
   * Join or create a collaborative room
   */
  public joinRoom(roomId: string, user: User) {
    if (!roomId) return;
    if (this.currentRoomId === roomId && this.isConnected) return;

    this.leaveRoom();
    this.currentRoomId = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    this.initPeer(user);
  }

  private initPeer(user: User) {
    const cleanRoom = this.currentRoomId;
    const cleanUser = user.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'user';
    const targetPeerId = `ziro-${cleanRoom}-${cleanUser}-${this.clientId}`;
    this.peerId = targetPeerId;

    try {
      this.peer = new Peer(targetPeerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        this.isConnected = true;
        this.updateRoomStatus();

        // Connect to anchor room coordinator
        this.connectToAnchor(cleanRoom);
        this.startHeartbeat();
      });

      this.peer.on('connection', (conn) => {
        this.setupDataConnection(conn);
      });

      this.peer.on('call', (mediaCall) => {
        this.setupMediaCall(mediaCall);
      });

      this.peer.on('error', (err: any) => {
        console.warn('[Ziro Collab] Peer event info:', err?.type || err?.message);
        if (err.type === 'unavailable-id') {
          // If anchor ID taken, retry as standard peer
          const fallbackId = `ziro-${cleanRoom}-peer-${this.clientId}`;
          this.peerId = fallbackId;
        }
      });

      this.peer.on('close', () => {
        this.isConnected = false;
        this.updateRoomStatus();
      });
    } catch (err) {
      console.error('[Ziro Collab] PeerJS initialization failed:', err);
    }
  }

  private connectToAnchor(roomName: string) {
    // Try to connect to room anchor
    const anchorId = `ziro-${roomName}-anchor`;
    if (this.peerId === anchorId) {
      this.isHost = true;
      this.updateRoomStatus();
      return;
    }

    // Connect to the anchor node
    try {
      const conn = this.peer?.connect(anchorId, { reliable: true });
      if (conn) {
        this.setupDataConnection(conn);
      }
    } catch (err) {
      console.debug('[Ziro Collab] Anchor connection attempt:', err);
    }
  }

  private setupDataConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.dataConnections.set(conn.peer, conn);
      this.updateRoomStatus();

      // Request latest board state if joining an existing room
      this.sendToPeer(conn, {
        type: 'REQUEST_BOARD_STATE',
        payload: { boardId: this.currentRoomId, requesterId: this.clientId },
      });

      // Share list of known peers to form a full mesh
      const peerList = Array.from(this.dataConnections.keys()).filter((p) => p !== conn.peer);
      if (peerList.length > 0) {
        conn.send({
          type: 'PEER_DISCOVERY',
          peers: peerList,
        });
      }
    });

    conn.on('data', (raw: any) => {
      if (!raw) return;

      // Internal peer mesh discovery
      if (raw.type === 'PEER_DISCOVERY' && Array.isArray(raw.peers)) {
        raw.peers.forEach((otherPeerId: string) => {
          if (otherPeerId !== this.peerId && !this.dataConnections.has(otherPeerId)) {
            try {
              const newConn = this.peer?.connect(otherPeerId, { reliable: true });
              if (newConn) this.setupDataConnection(newConn);
            } catch {
              // Ignore
            }
          }
        });
        return;
      }

      const msg = raw as RealtimeMessage;

      // Handle Board State Sync Request
      if (msg.type === 'REQUEST_BOARD_STATE' && this.latestElementsProvider) {
        const { elements, metadata } = this.latestElementsProvider();
        if (elements.length > 0) {
          this.sendToPeer(conn, {
            type: 'SYNC_BOARD_STATE',
            payload: {
              boardId: this.currentRoomId,
              elements,
              metadata,
              senderId: this.clientId,
            },
          });
        }
      }

      this.emitMessage(msg);
    });

    conn.on('close', () => {
      this.dataConnections.delete(conn.peer);
      this.updateRoomStatus();
    });

    conn.on('error', () => {
      this.dataConnections.delete(conn.peer);
      this.updateRoomStatus();
    });
  }

  private setupMediaCall(mediaCall: MediaConnection) {
    if (this.localAudioStream) {
      mediaCall.answer(this.localAudioStream);
    } else {
      mediaCall.answer();
    }

    mediaCall.on('stream', (remoteStream) => {
      this.voiceStreamListeners.forEach((fn) => fn(mediaCall.peer, remoteStream));
    });

    this.mediaCalls.set(mediaCall.peer, mediaCall);
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      this.updateRoomStatus();
    }, 5000);
  }

  private updateRoomStatus() {
    const info: RoomInfo = {
      roomId: this.currentRoomId,
      connected: this.isConnected,
      peerCount: this.dataConnections.size + 1,
      isHost: this.isHost,
    };
    this.roomStatusListeners.forEach((fn) => fn(info));
  }

  public getRoomInfo(): RoomInfo {
    return {
      roomId: this.currentRoomId,
      connected: this.isConnected,
      peerCount: this.dataConnections.size + 1,
      isHost: this.isHost,
    };
  }

  public subscribe(listener: MessageCallback): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public subscribeRoomStatus(listener: RoomStatusCallback): () => void {
    this.roomStatusListeners.add(listener);
    listener(this.getRoomInfo());
    return () => this.roomStatusListeners.delete(listener);
  }

  public subscribeVoiceStream(listener: VoiceStreamCallback): () => void {
    this.voiceStreamListeners.add(listener);
    return () => this.voiceStreamListeners.delete(listener);
  }

  private emitMessage(msg: RealtimeMessage) {
    this.messageListeners.forEach((fn) => {
      try {
        fn(msg);
      } catch (err) {
        console.error('[Ziro Collab] Message handler error:', err);
      }
    });
  }

  private sendToPeer(conn: DataConnection, msg: any) {
    if (conn && conn.open) {
      try {
        conn.send(msg);
      } catch (err) {
        console.warn('[Ziro Collab] Send error:', err);
      }
    }
  }

  /**
   * Broadcast message to all connected peers and local broadcast channel
   */
  public broadcast(msg: RealtimeMessage) {
    // Send to WebRTC peers
    this.dataConnections.forEach((conn) => {
      this.sendToPeer(conn, msg);
    });

    // Send to local browser tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (err) {
        console.warn('BroadcastChannel postMessage error:', err);
      }
    }
  }

  public broadcastPresence(presence: CollaboratorPresence) {
    this.broadcast({
      type: 'PRESENCE_UPDATE',
      payload: presence,
    });
  }

  public broadcastElements(boardId: string, elements: CanvasElement[]) {
    this.broadcast({
      type: 'ELEMENTS_SYNC',
      payload: {
        boardId,
        elements,
        senderId: this.clientId,
      },
    });
  }

  public broadcastChatMessage(text: string, user: User): ChatMessage {
    const msg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: this.clientId,
      senderName: user.name,
      senderAvatarColor: user.avatarColor,
      text: text.trim(),
      timestamp: Date.now(),
    };

    this.broadcast({
      type: 'CHAT_MESSAGE',
      payload: msg,
    });

    return msg;
  }

  public broadcastReaction(emoji: string, user: User, x?: number, y?: number): ReactionEvent {
    const reaction: ReactionEvent = {
      id: `react-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      emoji,
      senderName: user.name,
      x,
      y,
      timestamp: Date.now(),
    };

    this.broadcast({
      type: 'REACTION_TRIGGER',
      payload: reaction,
    });

    return reaction;
  }

  public broadcastLeave(boardId: string) {
    this.broadcast({
      type: 'USER_LEFT',
      payload: { id: this.clientId, boardId },
    });
  }

  /**
   * Live Voice / Audio Chat Methods
   */
  public async startVoiceChat(): Promise<boolean> {
    try {
      if (!this.localAudioStream) {
        this.localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.isMicMuted = false;
        this.isVoiceActive = true;

        // Call all connected peers
        this.dataConnections.forEach((_, peerKey) => {
          if (this.peer && this.localAudioStream) {
            const mediaCall = this.peer.call(peerKey, this.localAudioStream);
            this.setupMediaCall(mediaCall);
          }
        });

        this.broadcast({
          type: 'VOICE_STATUS',
          payload: { peerId: this.peerId, isMuted: this.isMicMuted, isSpeaking: true },
        });

        return true;
      }
      return true;
    } catch (err) {
      console.warn('Could not access microphone for voice discussion:', err);
      return false;
    }
  }

  public toggleMute(): boolean {
    if (this.localAudioStream) {
      this.isMicMuted = !this.isMicMuted;
      this.localAudioStream.getAudioTracks().forEach((t) => {
        t.enabled = !this.isMicMuted;
      });

      this.broadcast({
        type: 'VOICE_STATUS',
        payload: { peerId: this.peerId, isMuted: this.isMicMuted, isSpeaking: !this.isMicMuted },
      });
    }
    return this.isMicMuted;
  }

  public stopVoiceChat() {
    if (this.localAudioStream) {
      this.localAudioStream.getTracks().forEach((t) => t.stop());
      this.localAudioStream = null;
      this.isVoiceActive = false;
      this.isMicMuted = true;
    }
    this.mediaCalls.forEach((call) => call.close());
    this.mediaCalls.clear();
  }

  public leaveRoom() {
    this.stopVoiceChat();
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    if (this.currentRoomId) {
      this.broadcastLeave(this.currentRoomId);
    }

    this.dataConnections.forEach((conn) => conn.close());
    this.dataConnections.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.isConnected = false;
    this.currentRoomId = '';
    this.updateRoomStatus();
  }

  public createPresenceObject(
    user: User,
    boardId: string,
    cursorX: number,
    cursorY: number,
    selectedElementId?: string
  ): CollaboratorPresence {
    return {
      id: this.clientId,
      user,
      boardId,
      cursor: { x: cursorX, y: cursorY },
      lastActive: Date.now(),
      selectedElementId,
    };
  }
}

export const livePeerService = new LivePeerService();
