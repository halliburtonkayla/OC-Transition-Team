/* Neighborhood artwork/navigation only. Does not read or change resident records. */
(function () {
  'use strict';
  const viewport = document.querySelector('.mapviewport');
  const original = viewport && viewport.querySelector('.townmap');
  if (!original || document.getElementById('ttNeighborhoodStage')) return;
  const names = ['Original Town', 'Business Neighborhood', 'Residential Neighborhood'];
  let active = 0;
  const nav = document.createElement('nav');
  nav.className = 'ttNeighborhoodNav';
  nav.setAttribute('aria-label', 'Travel between neighborhoods');
  const previous = document.createElement('button');
  const next = document.createElement('button');
  previous.type = next.type = 'button';
  nav.append(previous, next);
  const status = document.createElement('p');
  status.className = 'ttNeighborhoodStatus';
  status.setAttribute('aria-live', 'polite');
  const stage = document.createElement('div');
  stage.id = 'ttNeighborhoodStage';
  const track = document.createElement('div');
  track.className = 'ttNeighborhoodTrack';
  const panels = names.map((name) => {
    const p = document.createElement('section');
    p.className = 'ttNeighborhoodPanel';
    p.setAttribute('aria-label', name);
    track.append(p);
    return p;
  });
  panels[0].append(original);
  stage.append(track);
  viewport.replaceChildren(stage);
  viewport.before(nav, status);
  function fit() { stage.style.height = panels[active].getBoundingClientRect().height + 'px'; }
  function show(index) {
    active = (index + panels.length) % panels.length;
    panels.forEach((panel, i) => {
      panel.inert = i !== active;
      panel.setAttribute('aria-hidden', String(i !== active));
    });
    track.style.transform = 'translateX(-' + (active * 100) + '%)';
    previous.textContent = '← ' + names[(active + 2) % 3];
    next.textContent = names[(active + 1) % 3] + ' →';
    status.textContent = names[active] + ' · ' + (active + 1) + ' of 3';
    fit();
  }
  previous.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(active + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  function scene(panel, filename, label, ratio) {
    const map = document.createElement('div');
    map.className = 'ttNeighborhoodMap';
    map.style.aspectRatio = ratio;
    const image = document.createElement('img');
    image.src = 'assets/town-neighborhoods/' + filename;
    image.alt = label;
    image.addEventListener('load', fit);
    map.append(image);
    panel.append(map);
    return map;
  }
  function hotspot(map, name, bounds, action, text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ttNeighborhoodHotspot';
    button.setAttribute('aria-label', name);
    button.title = name;
    ['left', 'top', 'width', 'height'].forEach((property, i) => button.style[property] = bounds[i] + '%');
    if (text) { button.textContent = text; button.classList.add('ttNeighborhoodArrow'); }
    button.addEventListener('click', action);
    map.append(button);
  }
  function call(name) { if (typeof window[name] === 'function') window[name](); }
  function pending(title, message) {
    // Titles/messages are fixed local strings, never student data.
    if (typeof window.openSheet === 'function') window.openSheet('<h2>' + title + '</h2><p>' + message + '</p><p>This neighborhood is open to explore. This interior is not open yet.</p>');
  }
  function business(title) {
    pending(title, 'The storefront is part of the new business neighborhood. Its dedicated student business activities are still being prepared.');
  }
  const district = scene(panels[1], 'business.webp', 'Business neighborhood with the Library, Gamer’s Den, Burger Palace, Movie Theater, Home & Beyond, Car Haven and No Doubt Farm Equipment Repair.', '1672 / 941');
  hotspot(district, 'Library', [8, 9, 27, 27], () => { window.location.href = 'town-library/index.html'; });
  hotspot(district, 'Gamer’s Den', [36, 9, 28, 26], () => business('Gamer’s Den'));
  hotspot(district, 'Burger Palace', [68, 9, 24, 27], () => business('Burger Palace'));
  hotspot(district, 'Movie Theater', [35, 37, 29, 22], () => pending('Movie Theater', 'Educational videos and the theater interior are still being prepared and checked.'));
  hotspot(district, 'Home & Beyond home décor store', [69, 37, 26, 20], () => { window.location.href = 'home-beyond.html'; });
  hotspot(district, 'Car Haven', [4, 55, 29, 27], () => business('Car Haven'));
  hotspot(district, 'No Doubt Farm Equipment Repair', [69, 57, 28, 24], () => business('No Doubt Farm Equipment Repair'));
  hotspot(district, 'Back to Original Town', [0.5, 90, 18, 9.5], () => show(0));
  hotspot(district, 'Next: Residential Neighborhood', [81.5, 90, 18, 9.5], () => show(2));
  const homes = scene(panels[2], 'residential.webp', 'Residential neighborhood: four estates, Oak Ridge Budget Apartments, gated Town Center Apartments, HOA homes and houses numbered 1 through 10.', '1536 / 1024');
  hotspot(homes, 'Previous: Business Neighborhood', [1, 1.5, 20, 5], () => show(1));
  hotspot(homes, 'Next: Original Town', [79, 1.5, 20, 5], () => show(0), 'Original Town →');
  hotspot(homes, 'Oak Ridge Budget Apartments: view existing rental options', [5, 36, 21, 21], () => { if (window.need && window.need()) call('riverviewApartments'); });
  hotspot(homes, 'Town Center Apartments: view existing rental options', [27, 36, 22, 21], () => { if (window.need && window.need()) call('townCenterApartments'); });
  const homeBounds = [[10,62,15,15],[28,61,13,16],[43,60,13,17],[58,63,15,14],[76,60,14,17],[55,36,13,17],[69,37,11,16],[81,36,14,17],[22,79,25,13],[54,79,28,13]];
  homeBounds.forEach((b, i) => hotspot(homes, 'House ' + (i + 1) + ': browse the existing Housing Office listings', b, () => { if (window.need && window.need()) call('buyHouse'); }));
  [[12,11,19,18],[33,11,16,18],[52,11,18,18],[71,11,19,18]].forEach((b, i) => hotspot(homes, 'Estate M' + (i + 1) + ': browse the existing Housing Office listings', b, () => { if (window.need && window.need()) call('buyHouse'); }));
  const note = document.createElement('p');
  note.className = 'ttNeighborhoodNote';
  note.textContent = 'Explore each neighborhood with the arrows. Tap a building to learn more. Housing opens the existing listings; the map does not show current occupancy or reserve a home.';
  viewport.after(note);
  original.querySelectorAll('img').forEach(img => img.addEventListener('load', fit));
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(viewport);
  window.addEventListener('resize', fit);
  show(0);
})();
