export type ToolType =
  | 'select'
  | 'pan'
  | 'template'
  | 'text'
  | 'sticky'
  | 'rectangle'
  | 'rounded_rectangle'
  | 'circle'
  | 'diamond'
  | 'triangle'
  | 'star'
  | 'cloud'
  | 'speech_bubble'
  | 'arrow'
  | 'draw'
  | 'frame'
  | 'comment'
  | 'eraser';

export type ElementType =
  | 'sticky'
  | 'rectangle'
  | 'rounded_rectangle'
  | 'circle'
  | 'diamond'
  | 'triangle'
  | 'star'
  | 'cloud'
  | 'speech_bubble'
  | 'arrow'
  | 'draw'
  | 'text'
  | 'frame'
  | 'comment';

export type StickyColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'pink'
  | 'orange'
  | 'purple'
  | 'cyan'
  | 'gray';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  opacity?: number;
  locked?: boolean;
}

export interface StickyElement extends BaseElement {
  type: 'sticky';
  colorTheme: StickyColor;
  text: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  fontColor?: string;
}

export interface ShapeElementData extends BaseElement {
  type: 'rectangle' | 'rounded_rectangle' | 'circle' | 'diamond' | 'triangle' | 'star' | 'cloud' | 'speech_bubble';
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed';
  borderRadius?: number;
  text?: string;
  fontSize?: number;
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface FrameElementData extends BaseElement {
  type: 'frame';
  title: string;
  fill?: string;
  stroke?: string;
}

export interface CommentElementData extends BaseElement {
  type: 'comment';
  authorName: string;
  authorAvatarColor: string;
  text: string;
  createdAt: number;
  resolved?: boolean;
  replies?: {
    id: string;
    authorName: string;
    authorAvatarColor: string;
    text: string;
    createdAt: number;
  }[];
}

export interface ArrowElementData extends BaseElement {
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed';
  arrowHead: 'end' | 'both' | 'none';
  curve?: number;
  text?: string;
}

export interface DrawElementData extends BaseElement {
  type: 'draw';
  points: Point[];
  stroke: string;
  strokeWidth: number;
}

export interface TextElementData extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontColor: string;
  fontWeight?: 'normal' | 'bold' | '600';
  textAlign: 'left' | 'center' | 'right';
  fill?: string;
}

export type CanvasElement =
  | StickyElement
  | ShapeElementData
  | FrameElementData
  | CommentElementData
  | ArrowElementData
  | DrawElementData
  | TextElementData;

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResizeHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'arrow-start'
  | 'arrow-end'
  | 'arrow-curve'
  | 'rotate';

export interface BoardMetadata {
  id: string;
  title: string;
  ownerId?: string;
  lastModified: number;
  version: number;
  thumbnailColor?: string;
  isStarred?: boolean;
}

export interface BoardState {
  metadata: BoardMetadata;
  elements: CanvasElement[];
  viewport: ViewportTransform;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  roleTitle?: string;
}

export interface BoardRecord extends BoardState {
  isFavorite?: boolean;
}

export interface CollaboratorPresence {
  id: string;
  user: User;
  boardId: string;
  cursor: Point;
  lastActive: number;
  isSimulated?: boolean;
  selectedElementId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarColor: string;
  text: string;
  timestamp: number;
}

export interface ReactionEvent {
  id: string;
  emoji: string;
  senderName: string;
  x?: number;
  y?: number;
  timestamp: number;
}

export interface RoomInfo {
  roomId: string;
  connected: boolean;
  peerCount: number;
  isHost?: boolean;
}

export type RealtimeMessage =
  | { type: 'PRESENCE_UPDATE'; payload: CollaboratorPresence }
  | { type: 'ELEMENTS_SYNC'; payload: { boardId: string; elements: CanvasElement[]; senderId: string } }
  | { type: 'USER_LEFT'; payload: { id: string; boardId: string } }
  | { type: 'CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'REACTION_TRIGGER'; payload: ReactionEvent }
  | { type: 'REQUEST_BOARD_STATE'; payload: { boardId: string; requesterId: string } }
  | { type: 'SYNC_BOARD_STATE'; payload: { boardId: string; elements: CanvasElement[]; metadata?: BoardMetadata; senderId: string } }
  | { type: 'VOICE_STATUS'; payload: { peerId: string; isMuted: boolean; isSpeaking: boolean } };

