// Shared anchored popover, one #popover root, one open at a time. Items are
// plain buttons carrying data-choice; the opener's callback receives the
// chosen value. Dismissed by outside click, Esc (via the overlay stack), or
// choosing an item.

const $ = (sel) => document.querySelector(sel);

let onChoose = null;
let openedAt = 0;

export function openPopover(anchorEl, html, choose) {
  const pop = $('#popover');
  pop.innerHTML = html;
  pop.hidden = false;
  onChoose = choose || null;
  openedAt = performance.now();

  const r = anchorEl.getBoundingClientRect();
  const pw = Math.min(340, window.innerWidth - 20);
  let x = Math.min(r.left, window.innerWidth - pw - 10);
  let y = r.bottom + 6;
  pop.style.left = `${Math.max(6, x)}px`;
  pop.style.top = '0px';
  // measure after content lands, then keep it on screen
  const ph = pop.offsetHeight;
  if (y + ph > window.innerHeight - 8) y = Math.max(8, r.top - ph - 6);
  pop.style.top = `${y}px`;
}

export function closePopover() {
  const pop = $('#popover');
  pop.hidden = true;
  pop.innerHTML = '';
  onChoose = null;
}

export function popoverOpen() {
  return !$('#popover').hidden;
}

export function wirePopover() {
  const pop = $('#popover');
  pop.addEventListener('click', (e) => {
    const item = e.target.closest('[data-choice]');
    if (!item || item.disabled) return;
    const fn = onChoose;
    closePopover();
    if (fn) fn(item.dataset.choice, item.dataset);
  });
  window.addEventListener('pointerdown', (e) => {
    if (pop.hidden) return;
    if (performance.now() - openedAt < 120) return; // the opening click itself
    if (!pop.contains(e.target)) closePopover();
  });
}
