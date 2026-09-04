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
  curve?: number; // offset for curved arrows
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
  lastModified: number;
  version: number;
}

export interface BoardState {
  metadata: BoardMetadata;
  elements: CanvasElement[];
  viewport: ViewportTransform;
}
