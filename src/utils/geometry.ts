import type { Point, CanvasElement, ViewportTransform, SelectionBounds, ResizeHandle } from '../types/whiteboard';

/**
 * Converts screen/pointer coordinates (pixels in browser viewport) to world coordinates on the infinite canvas.
 */
export function screenToWorld(
  screenPoint: Point,
  viewport: ViewportTransform,
  containerRect: DOMRect
): Point {
  return {
    x: (screenPoint.x - containerRect.left - viewport.x) / viewport.zoom,
    y: (screenPoint.y - containerRect.top - viewport.y) / viewport.zoom,
  };
}

/**
 * Converts world coordinates to screen pixel coordinates.
 */
export function worldToScreen(
  worldPoint: Point,
  viewport: ViewportTransform,
  containerRect: DOMRect
): Point {
  return {
    x: worldPoint.x * viewport.zoom + viewport.x + containerRect.left,
    y: worldPoint.y * viewport.zoom + viewport.y + containerRect.top,
  };
}

/**
 * Computes the axis-aligned bounding box for a single element.
 */
export function getElementBounds(element: CanvasElement): SelectionBounds {
  if (element.type === 'arrow') {
    const minX = Math.min(element.startX, element.endX);
    const maxX = Math.max(element.startX, element.endX);
    const minY = Math.min(element.startY, element.endY);
    const maxY = Math.max(element.startY, element.endY);
    const padding = 10;
    return {
      x: minX - padding,
      y: minY - padding,
      width: Math.max(maxX - minX + padding * 2, 20),
      height: Math.max(maxY - minY + padding * 2, 20),
    };
  }

  if (element.type === 'draw') {
    if (element.points.length === 0) {
      return { x: element.x, y: element.y, width: 20, height: 20 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    element.points.forEach((pt) => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });
    const padding = Math.max(element.strokeWidth, 8);
    return {
      x: minX - padding,
      y: minY - padding,
      width: Math.max(maxX - minX + padding * 2, 20),
      height: Math.max(maxY - minY + padding * 2, 20),
    };
  }

  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
}

/**
 * Computes the combined bounding box enclosing multiple elements.
 */
export function getElementsBounds(elements: CanvasElement[]): SelectionBounds | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    const bounds = getElementBounds(el);
    if (bounds.x < minX) minX = bounds.x;
    if (bounds.y < minY) minY = bounds.y;
    if (bounds.x + bounds.width > maxX) maxX = bounds.x + bounds.width;
    if (bounds.y + bounds.height > maxY) maxY = bounds.y + bounds.height;
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Checks if a point (in world coordinates) intersects an element.
 */
export function isPointInElement(point: Point, element: CanvasElement): boolean {
  if (element.type === 'arrow') {
    return isPointNearLine(
      point,
      { x: element.startX, y: element.startY },
      { x: element.endX, y: element.endY },
      Math.max(element.strokeWidth + 10, 16)
    );
  }

  if (element.type === 'draw') {
    const threshold = Math.max(element.strokeWidth + 8, 12);
    for (let i = 0; i < element.points.length - 1; i++) {
      if (isPointNearLine(point, element.points[i], element.points[i + 1], threshold)) {
        return true;
      }
    }
    return false;
  }

  // Sticky, Rectangle, Circle, Text
  return (
    point.x >= element.x &&
    point.x <= element.x + element.width &&
    point.y >= element.y &&
    point.y <= element.y + element.height
  );
}

/**
 * Distance from point P to line segment AB.
 */
function isPointNearLine(p: Point, a: Point, b: Point, maxDistance: number): boolean {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y) <= maxDistance;

  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projX = a.x + t * (b.x - a.x);
  const projY = a.y + t * (b.y - a.y);
  return Math.hypot(p.x - projX, p.y - projY) <= maxDistance;
}

/**
 * Determines if an element intersects or is contained within a marquee selection box.
 */
export function isElementInBox(element: CanvasElement, box: SelectionBounds): boolean {
  const elemBounds = getElementBounds(element);
  return (
    elemBounds.x < box.x + box.width &&
    elemBounds.x + elemBounds.width > box.x &&
    elemBounds.y < box.y + box.height &&
    elemBounds.y + elemBounds.height > box.y
  );
}

/**
 * Generate smooth SVG path from freehand points.
 */
export function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }
  d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return d;
}

/**
 * Calculate Arrowhead points given start and end points.
 */
export function getArrowPoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  headLength: number = 18,
  headAngle: number = Math.PI / 6
) {
  const angle = Math.atan2(endY - startY, endX - startX);

  const x1 = endX - headLength * Math.cos(angle - headAngle);
  const y1 = endY - headLength * Math.sin(angle - headAngle);

  const x2 = endX - headLength * Math.cos(angle + headAngle);
  const y2 = endY - headLength * Math.sin(angle + headAngle);

  return { x1, y1, x2, y2, angle };
}

/**
 * Resize calculation taking into account the active handle and aspect ratio constraints.
 */
export function calculateResize(
  initialBounds: SelectionBounds,
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
  keepAspectRatio: boolean = false,
  minSize: number = 24
): SelectionBounds {
  let { x, y, width, height } = initialBounds;

  switch (handle) {
    case 'se':
      width = Math.max(minSize, initialBounds.width + deltaX);
      height = Math.max(minSize, initialBounds.height + deltaY);
      break;
    case 's':
      height = Math.max(minSize, initialBounds.height + deltaY);
      break;
    case 'e':
      width = Math.max(minSize, initialBounds.width + deltaX);
      break;
    case 'sw':
      width = Math.max(minSize, initialBounds.width - deltaX);
      x = initialBounds.x + (initialBounds.width - width);
      height = Math.max(minSize, initialBounds.height + deltaY);
      break;
    case 'w':
      width = Math.max(minSize, initialBounds.width - deltaX);
      x = initialBounds.x + (initialBounds.width - width);
      break;
    case 'nw':
      width = Math.max(minSize, initialBounds.width - deltaX);
      x = initialBounds.x + (initialBounds.width - width);
      height = Math.max(minSize, initialBounds.height - deltaY);
      y = initialBounds.y + (initialBounds.height - height);
      break;
    case 'n':
      height = Math.max(minSize, initialBounds.height - deltaY);
      y = initialBounds.y + (initialBounds.height - height);
      break;
    case 'ne':
      width = Math.max(minSize, initialBounds.width + deltaX);
      height = Math.max(minSize, initialBounds.height - deltaY);
      y = initialBounds.y + (initialBounds.height - height);
      break;
    default:
      break;
  }

  if (keepAspectRatio && initialBounds.width > 0 && initialBounds.height > 0) {
    const ratio = initialBounds.width / initialBounds.height;
    if (width / height > ratio) {
      width = height * ratio;
    } else {
      height = width / ratio;
    }
  }

  return { x, y, width, height };
}
