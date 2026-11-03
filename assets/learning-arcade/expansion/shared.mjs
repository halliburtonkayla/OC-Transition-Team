import { escapeHTML as e, speak } from "../../learning/progress.mjs";
export const $ = (root, id) => root.querySelector('[data-ui="' + id + '"]');
export const on = (root, id, type, fn, signal) =>
  $(root, id)?.addEventListener(type, fn, { signal });
export function chime(enabled = false, success = false) {
  if (!enabled) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    const ctx = new Audio();
    [523.25, 659.25, 783.99, ...(success ? [1046.5] : [])].forEach((hz, i) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = hz;
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + i * 0.07 + 0.015);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.07 + 0.25,
      );
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.07);
      o.stop(ctx.currentTime + i * 0.07 + 0.27);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {}
}
export function celebrate(root, text, reduced = false) {
  const box = document.createElement("div");
  box.className = "premium-celebration";
  box.setAttribute("role", "status");
  box.innerHTML = `<strong>✦ ${e(text)} ✦</strong>${reduced ? "" : Array.from({ length: 28 }, (_, i) => `<i style="--x:${i * 3.7}%;--delay:${(i % 7) * 0.07}s;--h:${i * 47}"></i>`).join("")}`;
  root.append(box);
  setTimeout(() => box.remove(), reduced ? 1800 : 2600);
}
export function shell(root, host, { title, kicker, description, onPrint }) {
  const state = host.get().checkpoint,
    preferences = (state.preferences ||= {
      sound: false,
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      low: false,
      text: 1,
      simple: true,
      hints: true,
    });
  const controller = new AbortController(),
    signal = controller.signal;
  root.className = "premium-shell";
  root.innerHTML = `<header class="premium-header"><div class="premium-brand"><span class="premium-tt">TT</span><div>THE LEARNING ARCADE<small>${e(kicker)}</small></div></div><nav aria-label="Game controls"><button data-ui="speak" aria-label="Read game instructions aloud">Read aloud ♫</button><button data-ui="pause" aria-pressed="false">Pause</button><button data-ui="fullscreen">Full screen ⛶</button><button data-ui="print">Print / save PDF</button><button data-ui="save">Save progress</button><button data-ui="exit">Arcade ↗</button></nav></header><div class="premium-title"><div><p class="premium-eyebrow">${e(kicker)}</p><h1 id="premium-title">${e(title)}</h1><p>${e(description)}</p></div><details class="premium-settings"><summary>Accessibility & sound</summary><div><label><input type="checkbox" data-ui="record" ${host.get().options.record ? "checked" : ""} ${host.connected() ? "" : "disabled"}> Save to connected profile</label><label><input type="checkbox" data-ui="sound" ${preferences.sound ? "checked" : ""}> Reward sounds</label><label><input type="checkbox" data-ui="reduced" ${preferences.reduced ? "checked" : ""}> Reduce motion</label><label><input type="checkbox" data-ui="hints" ${preferences.hints ? "checked" : ""}> Show hint button</label><label>Text size <select data-ui="text"><option value="1">Standard</option><option value="1.15">Larger</option><option value="1.35">Largest</option></select></label><label><input type="checkbox" data-ui="simple" ${preferences.simple ? "checked" : ""}> Tap start and end letters</label><label><input type="checkbox" data-ui="low" ${preferences.low ? "checked" : ""}> Lower graphics</label></div></details></div><p class="premium-save-notice" data-ui="notice" role="status">${e(host.notice())}</p><main class="premium-content" data-ui="content"></main><div class="premium-paused" data-ui="paused" hidden><div><p class="premium-eyebrow">TAKE YOUR TIME</p><h2>Pick up when you’re ready.</h2><p>Active practice time is paused.</p><button data-ui="resume">Resume game →</button></div></div><dialog class="premium-print-dialog" data-ui="print-menu"><h2>Print your practice.</h2><p>Your browser’s print menu also offers Save as PDF.</p><div data-ui="print-options"></div><button data-ui="close-print">Back to game</button></dialog>`;
  $(root, "text").value = String(preferences.text);
  root.style.setProperty("--game-text", preferences.text);
  root.classList.toggle("motion-off", preferences.reduced);
  const say = (text, done = () => {}) => {
    if (!speak(text, done))
      $(root, "notice").textContent =
        "Read-aloud is unavailable on this device. The full instruction is shown on screen.";
  };
  const api = {
    root,
    content: $(root, "content"),
    signal,
    preferences,
    say,
    onChange: () => {},
    onPause: () => {},
    paused: false,
    status: (text) => ($(root, "notice").textContent = text),
    printOptions(options) {
      $(root, "print-options").innerHTML = options
        .map(
          ([id, label]) =>
            `<button data-print-kind="${id}">${e(label)}</button>`,
        )
        .join("");
      $(root, "print-menu").showModal();
    },
    dispose() {
      controller.abort();
      window.speechSynthesis?.cancel();
      $(root, "print-menu").close();
    },
  };
  function pause(v) {
    api.paused = v;
    host.pause(v);
    api.onPause(v);
    $(root, "paused").hidden = !v;
    api.content.inert = v;
    $(root, "pause").setAttribute("aria-pressed", String(v));
    $(root, "pause").textContent = v ? "Resume" : "Pause";
    if (v) $(root, "resume").focus();
  }
  on(root, "pause", "click", () => pause(!api.paused), signal);
  on(root, "resume", "click", () => pause(false), signal);
  on(
    root,
    "save",
    "click",
    async () => {
      const ok = await host.save();
      api.status(
        ok
          ? "Saved to your connected private learning profile."
          : host.notice(),
      );
    },
    signal,
  );
  on(root, "exit", "click", () => host.exit(), signal);
  on(root, "print", "click", () => onPrint(api), signal);
  on(root, "close-print", "click", () => $(root, "print-menu").close(), signal);
  $(root, "print-options").addEventListener(
    "click",
    (ev) => {
      const b = ev.target.closest("[data-print-kind]");
      if (b) {
        $(root, "print-menu").close();
        host.print(b.dataset.printKind);
      }
    },
    { signal },
  );
  on(
    root,
    "record",
    "change",
    () => {
      host.get().options.record = $(root, "record").checked;
      host.changed();
      api.status(host.notice());
    },
    signal,
  );
  on(
    root,
    "speak",
    "click",
    () => say(api.instructions || description),
    signal,
  );
  on(
    root,
    "fullscreen",
    "click",
    async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await root.closest("dialog").requestFullscreen();
      } catch {
        api.status(
          "Use the browser’s full-screen menu on this device. The game already fills the available screen.",
        );
      }
    },
    signal,
  );
  for (const key of ["sound", "reduced", "low", "simple", "hints", "text"])
    on(
      root,
      key,
      "change",
      () => {
        preferences[key] =
          key === "text" ? Number($(root, key).value) : $(root, key).checked;
        root.style.setProperty("--game-text", preferences.text);
        root.classList.toggle("motion-off", preferences.reduced);
        host.changed();
        api.onChange(key);
      },
      signal,
    );
  return api;
}
