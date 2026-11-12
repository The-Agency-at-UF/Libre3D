import { useEffect, useState, type RefObject } from "react";
import type { FrameSettingsConfig } from "../../scene/types";
import { availableFrameArea, fitFrameScale, type FrameInsets } from "../frameFit";

// The panels that float over the viewport, found by class name (EditorLayout and FloatingToolbar
// render them). The frame is fitted into the space they leave.
const LEFT_SIDEBAR_SELECTOR = ".left-sidebar";
const RIGHT_SIDEBAR_SELECTOR = ".right-sidebar";
const FLOATING_TOOLBAR_SELECTOR = ".floating-toolbar";

// Assumed when a sidebar isn't in the page: the sidebars' default widths, in pixels.
const LEFT_SIDEBAR_FALLBACK_WIDTH = 280;
const RIGHT_SIDEBAR_FALLBACK_WIDTH = 320;

const NO_INSETS: FrameInsets = { left: 0, right: 0, top: 0 };

/** How far the editor's panels reach into the viewport from its left, right and top edges. */
function measurePanelInsets(viewportRect: DOMRect): FrameInsets {
  const leftSidebar = document.querySelector<HTMLElement>(LEFT_SIDEBAR_SELECTOR);
  const rightSidebar = document.querySelector<HTMLElement>(RIGHT_SIDEBAR_SELECTOR);
  const floatingToolbar = document.querySelector<HTMLElement>(FLOATING_TOOLBAR_SELECTOR);
  return {
    left: leftSidebar ? Math.max(0, leftSidebar.getBoundingClientRect().right - viewportRect.left) : LEFT_SIDEBAR_FALLBACK_WIDTH,
    right: rightSidebar ? Math.max(0, viewportRect.right - rightSidebar.getBoundingClientRect().left) : RIGHT_SIDEBAR_FALLBACK_WIDTH,
    top: floatingToolbar ? Math.max(0, floatingToolbar.getBoundingClientRect().bottom - viewportRect.top) : 0,
  };
}

/**
 * The scale a fixed-size frame is shown at so it fits between the editor's panels (1 for a
 * responsive frame). Measured again when the frame's size changes, when Play starts or stops, and
 * when the viewport (the wrapper's parent element) is resized.
 */
export function useFrameAutoScale(
  wrapperRef: RefObject<HTMLDivElement | null>,
  frame: FrameSettingsConfig,
  isPreviewMode: boolean,
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const wrapper      = wrapperRef.current;
    const viewportHost = wrapper?.parentElement;
    if (!wrapper || !viewportHost) {
      setScale(1);
      return;
    }

    const updateScale = () => {
      if (frame.mode !== "fixed") {
        setScale(1);
        return;
      }
      const viewportRect = viewportHost.getBoundingClientRect();
      // Play hides the sidebars and the toolbar, so the frame gets the whole viewport.
      const insets = isPreviewMode ? NO_INSETS : measurePanelInsets(viewportRect);
      setScale(fitFrameScale(frame, availableFrameArea(viewportRect, insets)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewportHost);
    return () => observer.disconnect();
  }, [wrapperRef, frame.mode, frame.width, frame.height, isPreviewMode]);

  return scale;
}
