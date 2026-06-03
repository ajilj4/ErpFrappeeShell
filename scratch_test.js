// Mock window and document for node testing
global.window = {
  frappe: {
    boot: { 
      user: { name: 'Administrator' },
      sysdefaults: { company: 'Test Company' }
    },
    session: { user_fullname: 'Administrator' },
    router: {
      on: () => {},
      off: () => {}
    }
  },
  location: { pathname: '/app/home' }
};
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  createElement: () => ({
    style: {},
    appendChild: () => {},
    prepend: () => {}
  }),
  body: {
    prepend: () => {},
    appendChild: () => {}
  },
  querySelector: () => ({
    prepend: () => {}
  }),
  querySelectorAll: () => [],
  getElementById: () => null
};
Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'node' },
  configurable: true,
  writable: true
});
global.MutationObserver = class {
  observe() {}
  disconnect() {}
};

async function run() {
  try {
    await import('./dist/js/axonai-bundle.js');
    console.log('SUCCESS: Bundle loaded successfully without syntax/import errors!');
  } catch (err) {
    console.error('FAILURE: Error loading bundle:', err);
  }
}

run();
