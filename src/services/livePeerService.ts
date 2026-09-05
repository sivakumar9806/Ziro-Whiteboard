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
  public peerId: string = '';
  public clientId: string = `u-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  public currentRoomId: string = '';
  public currentUser: User | null = null;
  private isConnected: boolean = false;
  private isHost: boolean = false;
  private isRetryingAsPeer: boolean = false;
  
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
    const cleanRoom = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (this.currentRoomId === cleanRoom && this.isConnected) return;

    this.leaveRoom();
    this.currentRoomId = cleanRoom;
    this.currentUser = user;
    this.isRetryingAsPeer = false;

    // Try joining first as Room Anchor / Host Coordinator
    this.attemptJoinAsHost(cleanRoom);
  }

  /**
   * Attempt to register as the room anchor host
   */
  private attemptJoinAsHost(cleanRoom: string) {
    const anchorId = `ziro-room-${cleanRoom}-host`;
    console.log(`📡 [Ziro Collab] Attempting to host room: ${anchorId}`);

    try {
      this.peer = new Peer(anchorId, {
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
        console.log(`👑 [Ziro Collab] Successfully registered as Room Anchor Host: ${id}`);
        this.peerId = id;
        this.isConnected = true;
        this.isHost = true;
        this.updateRoomStatus();
        this.startHeartbeat();
      });

      this.peer.on('connection', (conn) => {
        console.log(`🤝 [Ziro Collab] Incoming connection from peer: ${conn.peer}`);
        this.setupDataConnection(conn);
      });

      this.peer.on('call', (mediaCall) => {
        this.setupMediaCall(mediaCall);
      });

      this.peer.on('error', (err: any) => {
        console.log(`ℹ️ [Ziro Collab] Host registration notice:`, err?.type || err?.message);
        
        // If anchor ID is unavailable (someone is already hosting), connect as a Peer!
        if ((err.type === 'unavailable-id' || err.message?.includes('ID')) && !this.isRetryingAsPeer) {
          this.isRetryingAsPeer = true;
          this.destroyCurrentPeer();
          this.joinAsPeer(cleanRoom);
        }
      });

      this.peer.on('close', () => {
        this.isConnected = false;
        this.updateRoomStatus();
      });
    } catch (err) {
      console.warn('[Ziro Collab] Host attempt failed, switching to peer:', err);
      this.joinAsPeer(cleanRoom);
    }
  }

  /**
   * Join as a guest peer and connect to the room host
   */
  private joinAsPeer(cleanRoom: string) {
    const peerUniqueId = `ziro-room-${cleanRoom}-peer-${this.clientId}`;
    const anchorId = `ziro-room-${cleanRoom}-host`;
    console.log(`🌐 [Ziro Collab] Connecting as peer: ${peerUniqueId} ➔ Host: ${anchorId}`);

    try {
      this.peer = new Peer(peerUniqueId, {
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
        console.log(`✅ [Ziro Collab] Peer registered: ${id}. Now connecting to host...`);
        this.peerId = id;
        this.isConnected = true;
        this.isHost = false;
        this.updateRoomStatus();
        this.startHeartbeat();

        // Connect directly to the Host Anchor
        this.connectToPeer(anchorId);
      });

      this.peer.on('connection', (conn) => {
        this.setupDataConnection(conn);
      });

      this.peer.on('call', (mediaCall) => {
        this.setupMediaCall(mediaCall);
      });

      this.peer.on('error', (err: any) => {
        console.warn('[Ziro Collab] Peer event warning:', err?.type || err?.message);
      });

      this.peer.on('close', () => {
        this.isConnected = false;
        this.updateRoomStatus();
      });
    } catch (err) {
      console.error('[Ziro Collab] Failed to join as peer:', err);
    }
  }

  private connectToPeer(targetPeerId: string) {
    if (!this.peer || this.dataConnections.has(targetPeerId)) return;

    try {
      console.log(`🔗 [Ziro Collab] Connecting to peer: ${targetPeerId}`);
      const conn = this.peer.connect(targetPeerId, { reliable: true });
      if (conn) {
        this.setupDataConnection(conn);
      }
    } catch (err) {
      console.warn(`[Ziro Collab] Failed to connect to ${targetPeerId}:`, err);
    }
  }

  private setupDataConnection(conn: DataConnection) {
    conn.on('open', () => {
      console.log(`✨ [Ziro Collab] Data connection established with: ${conn.peer}`);
      this.dataConnections.set(conn.peer, conn);
      this.updateRoomStatus();

      // If we are a guest joining, request the current board state from the host
      if (!this.isHost) {
        this.sendToPeer(conn, {
          type: 'REQUEST_BOARD_STATE',
          payload: { boardId: this.currentRoomId, requesterId: this.clientId },
        });
      } else {
        // If we are the host, immediately send the current board state to the newcomer!
        if (this.latestElementsProvider) {
          const { elements, metadata } = this.latestElementsProvider();
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

        // Inform other connected peers about the new member to maintain a full mesh
        const allOtherPeers = Array.from(this.dataConnections.keys()).filter((p) => p !== conn.peer);
        if (allOtherPeers.length > 0) {
          conn.send({
            type: 'PEER_DISCOVERY',
            peers: allOtherPeers,
          });
        }
      }

      // Broadcast our presence immediately so our cursor appears on their screen
      if (this.currentUser) {
        const presence = this.createPresenceObject(
          this.currentUser,
          this.currentRoomId,
          window.innerWidth / 2,
          window.innerHeight / 2
        );
        this.sendToPeer(conn, {
          type: 'PRESENCE_UPDATE',
          payload: presence,
        });
      }
    });

    conn.on('data', (raw: any) => {
      if (!raw) return;

      // Handle mesh peer discovery
      if (raw.type === 'PEER_DISCOVERY' && Array.isArray(raw.peers)) {
        raw.peers.forEach((otherPeerId: string) => {
          if (otherPeerId !== this.peerId && !this.dataConnections.has(otherPeerId)) {
            this.connectToPeer(otherPeerId);
          }
        });
        return;
      }

      const msg = raw as RealtimeMessage;

      // Handle Board State Sync Request
      if (msg.type === 'REQUEST_BOARD_STATE' && this.latestElementsProvider) {
        const { elements, metadata } = this.latestElementsProvider();
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

      this.emitMessage(msg);
    });

    conn.on('close', () => {
      console.log(`🔌 [Ziro Collab] Peer disconnected: ${conn.peer}`);
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
    }, 4000);
  }

  private destroyCurrentPeer() {
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // Safe destroy
      }
      this.peer = null;
    }
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
        console.warn('[Ziro Collab] Send error to peer:', err);
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

    // Send to local browser tabs & windows
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

    this.destroyCurrentPeer();

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
