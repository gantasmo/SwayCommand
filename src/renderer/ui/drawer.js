// Right-side drawer for the deep panels (synth, rack, kit). Overlays the
// cockpit; the render loop never stops. Content renders lazily on first open
// through the onOpenTab callback.

const $ = (sel) => document.querySelector(sel);
const TABS = ['synth', 'rack', 'kit', 'plugins'];

export function createDrawer({ onOpenTab }) {
  const drawer = $('#drawer');
  let current = null;
  const rendered = new Set();

  function apply() {
    for (const tab of TABS) {
      $(`#deck-${tab}`).hidden = tab !== current;
    }
    // The deckbar is the drawer's tab strip, its buttons show the open tab.
    for (const btn of document.querySelectorAll('#deckbar [data-drawer]')) {
      btn.classList.toggle('on', btn.dataset.drawer === current);
    }
  }

  function open(tab) {
    current = TABS.includes(tab) ? tab : TABS[0];
    drawer.hidden = false;
    // next frame so the slide-in transition runs from the hidden state
    requestAnimationFrame(() => drawer.classList.add('open'));
    if (!rendered.has(current)) {
      rendered.add(current);
      onOpenTab && onOpenTab(current, true);
    } else {
      onOpenTab && onOpenTab(current, false);
    }
    apply();
  }

  function close() {
    current = null;
    drawer.classList.remove('open');
    apply();
    setTimeout(() => {
      if (!current) drawer.hidden = true;
    }, 260);
  }

  $('#drawer-close').addEventListener('click', close);

  return {
    open,
    close,
    toggle(tab) {
      if (current === tab) close();
      else open(tab);
    },
    isOpen(tab) {
      return tab === undefined ? current !== null : current === tab;
    },
    currentTab() {
      return current;
    },
  };
}
