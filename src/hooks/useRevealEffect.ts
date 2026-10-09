import React, { useCallback } from 'react';

/**
 * Windows 11 Fluent Design Reveal Effect Hook
 * 
 * Provides buttery-smooth 60/120fps mouse tracking that updates CSS custom properties
 * `--reveal-x`, `--reveal-y`, and `--reveal-opacity` directly on the hovered DOM element.
 * 
 * When paired with `.fluent-reveal-item`, this renders:
 * 1. Surface Fill Glow: Radial spotlight following the cursor coordinates.
 * 2. Border Reveal Glow: Windows 11 border illumination focused on the cursor position.
 * 
 * Zero React re-renders during mouse movement for maximal performance.
 */
export function useRevealEffect() {
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--reveal-x', `${x}px`);
    el.style.setProperty('--reveal-y', `${y}px`);
    el.style.setProperty('--reveal-opacity', '1');
  }, []);

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--reveal-x', `${x}px`);
    el.style.setProperty('--reveal-y', `${y}px`);
    el.style.setProperty('--reveal-opacity', '1');
  }, []);

  const onMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--reveal-opacity', '0');
  }, []);

  return {
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  };
}
