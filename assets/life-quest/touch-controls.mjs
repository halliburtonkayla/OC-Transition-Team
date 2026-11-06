// Pointer input stays separate from keyboard input, so either can be released safely.
export function createTouchControls(root, {enabled, activity, action}) {
  const view = root.ownerDocument.defaultView;
  const directions = new Set(['up', 'down', 'left', 'right']);
  const pointers = new Map(), pulses = new Map();
  const buttons = [...root.querySelectorAll('[data-touch-action]')];
  let jumping = false, running = false;

  function paint() {
    for (const button of buttons) {
      const name = button.dataset.touchAction;
      const pressed = name === 'sprint' ? running :
        [...pointers.values()].some(p => p.name === name) || pulses.has(name);
      button.classList.toggle('is-held', pressed);
      if (name === 'sprint') button.setAttribute('aria-pressed', String(running));
    }
  }
  function clear() {
    const captured = [...pointers.entries()];
    pointers.clear(); pulses.clear(); jumping = false; running = false;
    for (const [id, {button}] of captured) {
      try { if (button.hasPointerCapture?.(id)) button.releasePointerCapture(id); } catch {}
    }
    paint();
  }
  function trigger(name) {
    if (name === 'jump') jumping = true;
    else if (name === 'sprint') running = !running;
    else if (!directions.has(name)) action(name);
  }
  function release(event) {
    if (!pointers.delete(event.pointerId)) return;
    paint();
  }
  root.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-touch-action]');
    if (!button || !root.contains(button) || button.disabled || !enabled() ||
        (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    activity();
    pointers.set(event.pointerId, {button, name: button.dataset.touchAction});
    try { button.setPointerCapture?.(event.pointerId); } catch {}
    trigger(button.dataset.touchAction);
    paint();
  }, {passive: false});
  // Native keyboard/screen-reader activation of a button also works.
  root.addEventListener('click', event => {
    if (event.detail !== 0) return;
    const button = event.target.closest('[data-touch-action]');
    if (!button || !root.contains(button) || button.disabled || !enabled()) return;
    activity();
    const name = button.dataset.touchAction;
    if (directions.has(name)) pulses.set(name, view.performance.now() + 180);
    else trigger(name);
    paint();
  });
  root.addEventListener('contextmenu', event => event.preventDefault());
  root.addEventListener('lostpointercapture', release);
  view.addEventListener('pointerup', release);
  view.addEventListener('pointercancel', release);
  view.addEventListener('blur', clear);

  return {
    clear,
    read() {
      if (!enabled()) { clear(); return {}; }
      const now = view.performance.now();
      let changed = false;
      for (const [name, until] of pulses) if (until <= now) { pulses.delete(name); changed = true; }
      if (changed) paint();
      const input = {};
      for (const {name} of pointers.values()) if (directions.has(name)) input[name] = true;
      for (const name of pulses.keys()) input[name] = true;
      if (running) input.sprint = true;
      if (jumping) { input.jump = true; jumping = false; }
      return input;
    }
  };
}
