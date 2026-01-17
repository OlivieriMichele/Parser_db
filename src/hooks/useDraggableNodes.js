import { useState, useCallback } from 'react';
import { snapToGrid } from '../utils/layoutCalculator';

/**
 * Hook per gestire il drag & drop dei nodi nel diagramma
 */
export const useDraggableNodes = (initialPositions) => {
  const [positions, setPositions] = useState(initialPositions);
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [customPositions, setCustomPositions] = useState(new Map());

  /**
   * Inizia il drag di un nodo (doppio click)
   */
  const startDrag = useCallback((nodeName, event) => {
    const pos = positions.get(nodeName);
    if (!pos) return;

    setDragging(nodeName);
    setDragStart({
      x: event.clientX - pos.x,
      y: event.clientY - pos.y
    });
  }, [positions]);

  /**
   * Gestisce il movimento del mouse durante il drag
   */
  const onDrag = useCallback((event) => {
    if (!dragging) return;

    const newX = event.clientX - dragStart.x;
    const newY = event.clientY - dragStart.y;

    // Snap to grid opzionale
    const snapped = snapToGrid(newX, newY, 25);

    setPositions(prev => {
      const newPositions = new Map(prev);
      newPositions.set(dragging, snapped);
      return newPositions;
    });

    // Salva posizione custom
    setCustomPositions(prev => {
      const newCustom = new Map(prev);
      newCustom.set(dragging, snapped);
      return newCustom;
    });
  }, [dragging, dragStart]);

  /**
   * Termina il drag
   */
  const endDrag = useCallback(() => {
    setDragging(null);
  }, []);

  /**
   * Reset alle posizioni automatiche
   */
  const resetPositions = useCallback(() => {
    setPositions(initialPositions);
    setCustomPositions(new Map());
    setDragging(null);
  }, [initialPositions]);

  /**
   * Aggiorna le posizioni base (quando cambiano i dati)
   */
  const updateBasePositions = useCallback((newPositions) => {
    setPositions(prev => {
      const updated = new Map(newPositions);
      // Mantieni le posizioni custom se esistono
      customPositions.forEach((pos, name) => {
        if (updated.has(name)) {
          updated.set(name, pos);
        }
      });
      return updated;
    });
  }, [customPositions]);

  return {
    positions,
    dragging,
    startDrag,
    onDrag,
    endDrag,
    resetPositions,
    updateBasePositions,
    hasCustomPositions: customPositions.size > 0
  };
};