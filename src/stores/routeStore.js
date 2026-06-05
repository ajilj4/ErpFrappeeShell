/**
 * routeStore.js
 * AxonAI One — Global Route State Store (Cross-React-Root)
 *
 * Problem: Sidebar, SubNav, ModuleNav, TopHeader are each rendered into
 *          separate React roots via createRoot(). Each root gets its own
 *          useState, so when one root calls setRouteState(), the other
 *          roots never re-render.
 *
 * Solution: A tiny event-emitter-based global store. Every useRoute() hook
 *           subscribes to it, so a navigate() in Sidebar triggers re-render
 *           in SubNav, ModuleNav, and TopHeader simultaneously.
 */

const listeners = new Set();

let _state = { moduleId: 'erp', tabId: null };

export const routeStore = {
  getState() {
    return _state;
  },

  setState(newState) {
    if (_state.moduleId === newState.moduleId && _state.tabId === newState.tabId) {
      return; // no-op — prevents infinite re-render loops
    }
    _state = { ...newState };
    listeners.forEach((fn) => fn(_state));
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
