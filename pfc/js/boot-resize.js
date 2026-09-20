/*
  boot-resize.js (lightweight)

  Purpose:
  Some responsive components (notably charts) may measure at an unstable size
  during first paint while fonts/CSS settle. We trigger a small, bounded number
  of resize events to help them lock onto correct dimensions.

  IMPORTANT:
  - This must stay cheap.
  - No MutationObserver loops.
  - No ResizeObserver feedback loops.
*/

(function () {
  var didRun = false;
  var pending = 0;

  function fireResizeOnce() {
    try {
      window.dispatchEvent(new Event('resize'));
    } catch (_) {
      // If a browser can't create Events, it can live without this.
    }
  }

  function scheduleKick() {
    if (didRun) return;
    didRun = true;

    // Two gentle nudges: next frame and a short timeout.
    // This is enough for chart containers to get a stable width/height.
    if (pending) return;
    pending = 1;

    requestAnimationFrame(function () {
      fireResizeOnce();
      setTimeout(function () {
        fireResizeOnce();
        pending = 0;
      }, 180);
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scheduleKick();
  } else {
    document.addEventListener('DOMContentLoaded', scheduleKick, { once: true });
    window.addEventListener('load', scheduleKick, { once: true });
  }

  // Fonts can shift layout after first paint; run one additional bounded kick.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready
      .then(function () {
        // Allow exactly one extra kick if fonts finish later.
        didRun = false;
        scheduleKick();
      })
      .catch(function () {});
  }
})();
