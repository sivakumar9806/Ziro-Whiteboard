import { useState, useCallback } from 'react';
import type { ViewportTransform, Point, CanvasElement } from '../types/whiteboard';
import { getElementsBounds } from '../utils/geometry';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 1.2;

export function useCanvasTransform(initialViewport: ViewportTransform = { x: 0, y: 0, zoom: 1 }) {
  const [viewport, setViewport] = useState<ViewportTransform>(initialViewport);

  const setPan = useCallback((dx: number, dy: number) => {
    setViewport((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  const setPosition = useCallback((x: number, y: number) => {
    setViewport((prev) => ({
      ...prev,
      x,
      y,
    }));
  }, []);

  const zoomAtPoint = useCallback((factor: number, screenPoint: Point, containerRect: DOMRect) => {
    setViewport((prev) => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor));
      if (newZoom === prev.zoom) return prev;

      const mouseX = screenPoint.x - containerRect.left;
      const mouseY = screenPoint.y - containerRect.top;

      const scaleChange = newZoom / prev.zoom;
      const newX = mouseX - (mouseX - prev.x) * scaleChange;
      const newY = mouseY - (mouseY - prev.y) * scaleChange;

      return {
        x: newX,
        y: newY,
        zoom: newZoom,
      };
    });
  }, []);

  const zoomIn = useCallback((containerRect?: DOMRect) => {
    if (!containerRect) {
      setViewport((prev) => ({
        ...prev,
        zoom: Math.min(MAX_ZOOM, prev.zoom * ZOOM_STEP),
      }));
      return;
    }
    const center = {
      x: containerRect.left + containerRect.width / 2,
      y: containerRect.top + containerRect.height / 2,
    };
    zoomAtPoint(ZOOM_STEP, center, containerRect);
  }, [zoomAtPoint]);

  const zoomOut = useCallback((containerRect?: DOMRect) => {
    if (!containerRect) {
      setViewport((prev) => ({
        ...prev,
        zoom: Math.max(MIN_ZOOM, prev.zoom / ZOOM_STEP),
      }));
      return;
    }
    const center = {
      x: containerRect.left + containerRect.width / 2,
      y: containerRect.top + containerRect.height / 2,
    };
    zoomAtPoint(1 / ZOOM_STEP, center, containerRect);
  }, [zoomAtPoint]);

  const resetZoom = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: 1,
    }));
  }, []);

  const fitToElements = useCallback((elements: CanvasElement[], containerRect: DOMRect) => {
    if (elements.length === 0) {
      setViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    const bounds = getElementsBounds(elements);
    if (!bounds) return;

    const padding = 80;
    const availableWidth = containerRect.width - padding * 2;
    const availableHeight = containerRect.height - padding * 2;

    const scaleX = availableWidth / bounds.width;
    const scaleY = availableHeight / bounds.height;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), MIN_ZOOM), 1.5);

    const contentCenterX = bounds.x + bounds.width / 2;
    const contentCenterY = bounds.y + bounds.height / 2;

    const newX = containerRect.width / 2 - contentCenterX * newZoom;
    const newY = containerRect.height / 2 - contentCenterY * newZoom;

    setViewport({
      x: newX,
      y: newY,
      zoom: newZoom,
    });
  }, []);

  return {
    viewport,
    setViewport,
    setPan,
    setPosition,
    zoomAtPoint,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToElements,
  };
}
