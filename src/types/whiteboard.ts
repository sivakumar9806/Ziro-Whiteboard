export type ToolType =
  | 'select'
  | 'pan'
  | 'template'
  | 'text'
  | 'sticky'
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'arrow'
  | 'draw'
  | 'frame'
  | 'eraser';

export type ElementType =
  | 'sticky'
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'arrow'
  | 'draw'
  | 'text'
  | 'frame';

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
  type: 'rectangle' | 'circle' | 'diamond';
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

export type RealtimeMessage =
  | { type: 'PRESENCE_UPDATE'; payload: CollaboratorPresence }
  | { type: 'ELEMENTS_SYNC'; payload: { boardId: string; elements: CanvasElement[]; senderId: string } }
  | { type: 'USER_LEFT'; payload: { id: string; boardId: string } };
