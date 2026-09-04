import { useEffect } from 'react';
import type { ToolType } from '../types/whiteboard';

interface UseKeyboardShortcutsProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  selectedIds: string[];
  deleteSelected: () => void;
  duplicateSelected: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setIsSpacePanning: (panning: boolean) => void;
  openShortcutsModal: () => void;
  onStartEditing?: (id: string) => void;
}

export function useKeyboardShortcuts({
  setActiveTool,
  selectedIds,
  deleteSelected,
  duplicateSelected,
  selectAll,
  clearSelection,
  undo,
  redo,
  zoomIn,
  zoomOut,
  resetZoom,
  setIsSpacePanning,
  openShortcutsModal,
  onStartEditing,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePanning(true);
        e.preventDefault();
        return;
      }

      if (cmdOrCtrl && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (cmdOrCtrl && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
        return;
      }

      if (cmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        selectAll();
        return;
      }

      if (cmdOrCtrl && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
        return;
      }
      if (cmdOrCtrl && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        zoomOut();
        return;
      }
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        resetZoom();
        return;
      }

      if (e.key === 'Enter' && selectedIds.length === 1) {
        e.preventDefault();
        onStartEditing?.(selectedIds[0]);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        setActiveTool('select');
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        openShortcutsModal();
        return;
      }

      if (!cmdOrCtrl && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'h':
            setActiveTool('pan');
            break;
          case 's':
            setActiveTool('sticky');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'o':
          case 'c':
            setActiveTool('circle');
            break;
          case 'a':
            setActiveTool('arrow');
            break;
          case 'p':
            setActiveTool('draw');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'e':
            setActiveTool('eraser');
            break;
          default:
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    setActiveTool,
    deleteSelected,
    duplicateSelected,
    selectAll,
    clearSelection,
    undo,
    redo,
    zoomIn,
    zoomOut,
    resetZoom,
    setIsSpacePanning,
    openShortcutsModal,
  ]);
}
