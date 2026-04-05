import "@testing-library/jest-dom/vitest";

process.env.AUTH_SECRET = "test-auth-secret-32-characters-min!!";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver =
  globalThis.ResizeObserver ?? ResizeObserverStub;

if (
  typeof Element !== "undefined" &&
  !Element.prototype.scrollIntoView
) {
  Element.prototype.scrollIntoView = () => {};
}
