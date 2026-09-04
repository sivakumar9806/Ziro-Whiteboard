export type ToolType =
  | 'select'
  | 'pan'
  | 'sticky'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'draw'
  | 'text'
  | 'eraser';

export type ElementType =
  | 'sticky'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'draw'
  | 'text';

export type StickyColor = 'yellow' | 'coral' | 'blue' | 'green' | 'purple' | 'amber';

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
  type: 'rectangle' | 'circle';
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
}

export interface BoardState {
  metadata: BoardMetadata;
  elements: CanvasElement[];
  viewport: ViewportTransform;
}

// ==========================================
// Stage 7: Auth & User Accounts
// ==========================================
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

// ==========================================
// Stage 8: Real-Time Presence & Collaboration
// ==========================================
export interface CollaboratorPresence {
  id: string;
  user: User;
  boardId: string;
  cursor: Point; // in world coordinates
  lastActive: number;
  isSimulated?: boolean;
  selectedElementId?: string;
}

export type RealtimeMessage =
  | { type: 'PRESENCE_UPDATE'; payload: CollaboratorPresence }
  | { type: 'ELEMENTS_SYNC'; payload: { boardId: string; elements: CanvasElement[]; senderId: string } }
  | { type: 'USER_LEFT'; payload: { id: string; boardId: string } };
