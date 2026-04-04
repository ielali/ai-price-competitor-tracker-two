import "@testing-library/jest-dom/vitest";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver =
  globalThis.ResizeObserver ?? ResizeObserverStub;

if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = function scrollIntoView() {
    /* no-op for jsdom — cmdk calls this on selection change */
  };
}
