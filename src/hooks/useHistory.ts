import { useState, useCallback, useRef } from 'react';
import type { CanvasElement } from '../types/whiteboard';

interface HistoryState {
  past: CanvasElement[][];
  present: CanvasElement[];
  future: CanvasElement[][];
}

const MAX_HISTORY_STEPS = 50;

export function useHistory(initialPresent: CanvasElement[]) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const presentRef = useRef(initialPresent);
  presentRef.current = history.present;

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;

      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;

      const next = curr.future[0];
      const newFuture = curr.future.slice(1);

      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const setPresent = useCallback((newElements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => {
    setHistory((curr) => {
      const resolved = typeof newElements === 'function' ? newElements(curr.present) : newElements;
      if (resolved === curr.present) return curr;

      const updatedPast = [...curr.past, curr.present];
      if (updatedPast.length > MAX_HISTORY_STEPS) {
        updatedPast.shift();
      }

      return {
        past: updatedPast,
        present: resolved,
        future: [],
      };
    });
  }, []);

  const setPresentTransient = useCallback((updater: (prev: CanvasElement[]) => CanvasElement[]) => {
    setHistory((curr) => ({
      ...curr,
      present: updater(curr.present),
    }));
  }, []);

  const resetHistory = useCallback((elements: CanvasElement[]) => {
    setHistory({
      past: [],
      present: elements,
      future: [],
    });
  }, []);

  return {
    elements: history.present,
    setElements: setPresent,
    setElementsTransient: setPresentTransient,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
