/*
PublicPrivate.js – Shared visibility toggle helper for Nexus project create/edit UIs.
Usage remains the same as before, but now with CSS classes and ARIA support.
*/
(function(window) {
  'use strict';

  // Configuration – adjust class names and colors via your stylesheet
  const CSS_PUBLIC = 'public-private-public';
  const CSS_PRIVATE = 'public-private-private';
  const CSS_ACTIVE = 'public-private-active';   // applied to active button

  const groups = {};            // key → group object
  const byHiddenId = {};        // hiddenInputId → group (for fast lookup)

  function applyVisual(publicBtn, privateBtn, makePublic) {
    if (!publicBtn || !privateBtn) return;

    // Remove previous active class from both
    publicBtn.classList.remove(CSS_ACTIVE);
    privateBtn.classList.remove(CSS_ACTIVE);

    // Add active class to the selected button
    if (makePublic) {
      publicBtn.classList.add(CSS_ACTIVE);
    } else {
      privateBtn.classList.add(CSS_ACTIVE);
    }

    // Update ARIA pressed state
    publicBtn.setAttribute('aria-pressed', makePublic);
    privateBtn.setAttribute('aria-pressed', !makePublic);
  }

  function bindGroup(publicBtnId, privateBtnId, hiddenInputId) {
    // Determine unique key
    const key = hiddenInputId || `${publicBtnId}|${privateBtnId}`;
    if (groups[key]) return groups[key];

    const publicBtn = document.getElementById(publicBtnId);
    const privateBtn = document.getElementById(privateBtnId);
    const hidden = hiddenInputId ? document.getElementById(hiddenInputId) : null;

    // If critical elements are missing, warn and return a dummy object to avoid crashes
    if (!publicBtn || !privateBtn) {
      console.warn(`PublicPrivate: Buttons not found (${publicBtnId}, ${privateBtnId})`);
      // Return a minimal object that won't break callers
      return {
        setPublic: () => {},
        isPublic: () => false,
      };
    }

    // Add base classes if not already present (optional)
    publicBtn.classList.add('public-private-btn');
    privateBtn.classList.add('public-private-btn');

    function setPublicValue(val, skipEvent = false) {
      const makePublic = !!val;
      applyVisual(publicBtn, privateBtn, makePublic);
      if (hidden) hidden.value = makePublic ? 'true' : 'false';

      if (!skipEvent) {
        const ev = new CustomEvent('publicprivate:changed', {
          detail: { id: hiddenInputId || key, public: makePublic }
        });
        window.dispatchEvent(ev);
      }
    }

    // Click handlers
    publicBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setPublicValue(true);
    });
    privateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setPublicValue(false);
    });

    // Initialize from hidden input or default to public
    let initial = true;
    if (hidden && hidden.value === 'false') initial = false;
    setPublicValue(initial, true); // set immediately (skip event)

    const obj = {
      publicBtnId,
      privateBtnId,
      hiddenInputId,
      setPublic: (val) => setPublicValue(!!val),
      isPublic: () => {
        if (hidden) return hidden.value === 'true';
        // Fallback: check which button has the active class
        return publicBtn.classList.contains(CSS_ACTIVE);
      }
    };

    groups[key] = obj;
    if (hiddenInputId) byHiddenId[hiddenInputId] = obj;
    return obj;
  }

  // Wait for DOM to be ready before processing init calls
  let domReady = false;
  const pendingConfigs = [];

  function processPending() {
    if (!domReady) return;
    while (pendingConfigs.length) {
      const configs = pendingConfigs.shift();
      configs.forEach(cfg => {
        if (!cfg || !cfg.publicBtnId || !cfg.privateBtnId) return;
        bindGroup(cfg.publicBtnId, cfg.privateBtnId, cfg.hiddenInputId);
      });
    }
  }

  function onDOMContentLoaded() {
    domReady = true;
    processPending();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  } else {
    domReady = true;
  }

  // Public API
  const PublicPrivate = {
    init: function(configs) {
      if (!Array.isArray(configs)) configs = [configs];
      pendingConfigs.push(configs);
      processPending(); // will run immediately if DOM is already ready
    },

    ensure: function(publicBtnId, privateBtnId, hiddenInputId) {
      // If DOM not ready, we cannot ensure existence; queue it and return a promise-like? 
      // For simplicity, we bind immediately if elements exist, otherwise queue and return a dummy.
      // Real-world: better to always queue and have callers wait. Here we return a proxy that will be updated later? Too complex.
      // Instead, we assume ensure is called after DOM ready, or we bind immediately and hope.
      if (!domReady) {
        console.warn('PublicPrivate.ensure called before DOM ready; binding may fail.');
      }
      return bindGroup(publicBtnId, privateBtnId, hiddenInputId);
    },

    setPublic: function(idOrKey, makePublic) {
      makePublic = !!makePublic;

      // 1. Try direct group lookup (key = hiddenInputId or composite)
      let group = groups[idOrKey];
      if (!group) group = byHiddenId[idOrKey];

      if (group) {
        group.setPublic(makePublic);
        return true;
      }

      // 2. Fallback: try to treat idOrKey as a hidden input id (unregistered)
      const hidden = document.getElementById(idOrKey);
      if (hidden) {
        hidden.value = makePublic ? 'true' : 'false';
        const ev = new CustomEvent('publicprivate:changed', {
          detail: { id: idOrKey, public: makePublic }
        });
        window.dispatchEvent(ev);
        return true;
      }

      console.warn(`PublicPrivate.setPublic: no group or hidden input found for "${idOrKey}"`);
      return false;
    },

    isPublic: function(idOrKey) {
      let group = groups[idOrKey];
      if (!group) group = byHiddenId[idOrKey];
      if (group) return group.isPublic();

      const hidden = document.getElementById(idOrKey);
      if (hidden) return hidden.value === 'true';

      console.warn(`PublicPrivate.isPublic: no group or hidden input found for "${idOrKey}", returning true`);
      return true;
    }
  };

  window.PublicPrivate = PublicPrivate;
})(window);
