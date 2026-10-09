/**
 * Windows 10 & 11 Fluent Design Global Reveal Highlight Engine
 * 
 * Provides app-wide 60/120fps hardware-accelerated Reveal Highlight:
 * 1. Surface Fill Illumination: Soft radial spotlight following cursor coordinates.
 * 2. Border Reveal Illumination: Concentrated border illumination focused right where the cursor is.
 * 3. Proximity Sibling Illumination: Neighboring items illuminate adjacent borders as cursor approaches.
 * 
 * Zero React re-renders, fully decoupled, works on all buttons, cards, list items,
 * inputs, dock tabs, modals, and elements with .fluent-reveal-item or .reveal-item.
 */

let isInitialized = false;
const activeElements = new Set<HTMLElement>();
const activeSiblings = new Set<HTMLElement>();

export function initGlobalRevealEngine(): () => void {
  if (typeof window === 'undefined' || isInitialized) {
    return () => {};
  }

  isInitialized = true;

  const handlePointerMove = (e: PointerEvent) => {
    // Only track mouse / stylus (touch devices don't have hovering cursor)
    if (e.pointerType === 'touch') return;

    const currentHovered = new Set<HTMLElement>();
    const currentSiblings = new Set<HTMLElement>();

    // 1. Find all revealable elements in the hierarchy under pointer
    let node = e.target as HTMLElement | null;
    while (node && node !== document.body && node !== document.documentElement) {
      if (
        node.classList.contains('fluent-reveal-item') ||
        node.classList.contains('reveal-item') ||
        node.classList.contains('reveal-target') ||
        node.classList.contains('channel-card') ||
        node.classList.contains('news-card') ||
        node.classList.contains('sidebar-nav-item') ||
        node.tagName === 'BUTTON' ||
        node.getAttribute('role') === 'button'
      ) {
        if (!node.classList.contains('no-reveal')) {
          currentHovered.add(node);
        }
      }
      node = node.parentElement;
    }

    // 2. Illuminate direct hovered elements
    currentHovered.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      el.style.setProperty('--reveal-x', `${x}px`);
      el.style.setProperty('--reveal-y', `${y}px`);
      el.style.setProperty('--reveal-opacity', '1');
      activeElements.add(el);

      // Check siblings if element is in a reveal group / list
      const parent = el.parentElement;
      if (parent && (parent.classList.contains('reveal-group') || parent.classList.contains('space-y-0.5') || parent.classList.contains('space-y-1'))) {
        const siblings = parent.children;
        for (let i = 0; i < siblings.length; i++) {
          const sib = siblings[i] as HTMLElement;
          if (sib !== el && (sib.classList.contains('fluent-reveal-item') || sib.classList.contains('sidebar-nav-item') || sib.tagName === 'BUTTON')) {
            const sibRect = sib.getBoundingClientRect();
            // Check if pointer is within 80px distance of sibling bounds
            const dx = Math.max(sibRect.left - e.clientX, 0, e.clientX - sibRect.right);
            const dy = Math.max(sibRect.top - e.clientY, 0, e.clientY - sibRect.bottom);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 80) {
              const sibX = Math.round(e.clientX - sibRect.left);
              const sibY = Math.round(e.clientY - sibRect.top);
              sib.style.setProperty('--reveal-x', `${sibX}px`);
              sib.style.setProperty('--reveal-y', `${sibY}px`);
              const borderOpacity = Math.max(0, (1 - dist / 80) * 0.75).toFixed(2);
              sib.style.setProperty('--reveal-border-opacity', borderOpacity);
              currentSiblings.add(sib);
            }
          }
        }
      }
    });

    // 3. Clear elements that are no longer hovered
    activeElements.forEach((el) => {
      if (!currentHovered.has(el)) {
        el.style.setProperty('--reveal-opacity', '0');
        activeElements.delete(el);
      }
    });

    // 4. Clear siblings that are out of range
    activeSiblings.forEach((el) => {
      if (!currentSiblings.has(el)) {
        el.style.setProperty('--reveal-border-opacity', '0');
        activeSiblings.delete(el);
      }
    });

    currentSiblings.forEach((el) => activeSiblings.add(el));
  };

  const handlePointerLeave = () => {
    activeElements.forEach((el) => {
      el.style.setProperty('--reveal-opacity', '0');
    });
    activeElements.clear();

    activeSiblings.forEach((el) => {
      el.style.setProperty('--reveal-border-opacity', '0');
    });
    activeSiblings.clear();
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.addEventListener('pointerleave', handlePointerLeave, { passive: true });
  window.addEventListener('blur', handlePointerLeave);

  return () => {
    window.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerleave', handlePointerLeave);
    window.removeEventListener('blur', handlePointerLeave);
    isInitialized = false;
  };
}
