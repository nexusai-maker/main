/*
PublicPrivate.js
Shared visibility toggle helper for Nexus project create/edit UIs.

Usage (auto-exposed as window.PublicPrivate):
  // initialize toggles by passing config objects for each toggle group:
  PublicPrivate.init([
    { publicBtnId: 'projPublicBtn', privateBtnId: 'projPrivateBtn', hiddenInputId: 'projPublic' },
    { publicBtnId: 'editProjPublicBtn', privateBtnId: 'editProjPrivateBtn', hiddenInputId: 'editProjPublic' }
  ]);

  // read current value:
  const isPublic = PublicPrivate.isPublic('projPublic'); // true/false

  // set value programmatically:
  PublicPrivate.setPublic('editProjPublic', false);
*/

(function(window){
  const groups = {};

  function applyVisual(publicBtn, privateBtn, makePublic){
    if(!publicBtn || !privateBtn) return;
    if(makePublic){
      publicBtn.style.background = '#0056b3';
      publicBtn.style.color = '#fff';
      privateBtn.style.background = '#e6e6e6';
      privateBtn.style.color = '#333';
    } else {
      privateBtn.style.background = '#0056b3';
      privateBtn.style.color = '#fff';
      publicBtn.style.background = '#e6e6e6';
      publicBtn.style.color = '#333';
    }
  }

  function bindGroup(publicBtnId, privateBtnId, hiddenInputId){
    const key = hiddenInputId || (publicBtnId + '|' + privateBtnId);
    if(groups[key]) return groups[key];

    const publicBtn = document.getElementById(publicBtnId);
    const privateBtn = document.getElementById(privateBtnId);
    const hidden = hiddenInputId ? document.getElementById(hiddenInputId) : null;

    function setPublicValue(val, skipEvent){
      const makePublic = !!val;
      applyVisual(publicBtn, privateBtn, makePublic);
      if(hidden) hidden.value = makePublic ? 'true' : 'false';
      if(!skipEvent){
        const ev = new CustomEvent('publicprivate:changed', { detail: { id: (hiddenInputId || key), public: makePublic }});
        window.dispatchEvent(ev);
      }
    }

    // wire click events (if buttons exist)
    if(publicBtn){
      publicBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        setPublicValue(true);
      });
    }
    if(privateBtn){
      privateBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        setPublicValue(false);
      });
    }

    // initialize from hidden input value or default to public
    let initial = true;
    if(hidden && hidden.value === 'false') initial = false;
    setTimeout(()=> setPublicValue(initial, true), 0);

    const obj = {
      publicBtnId, privateBtnId, hiddenInputId,
      setPublic: (v) => setPublicValue(!!v),
      isPublic: () => {
        if(hidden) return (hidden.value === 'true');
        // derive from button visuals if hidden missing
        if(publicBtn && publicBtn.style && publicBtn.style.background) {
          return publicBtn.style.background.indexOf('#0056b3') !== -1 || publicBtn.style.color === '#fff';
        }
        return true;
      }
    };
    groups[key] = obj;
    return obj;
  }

  // Public API
  const PublicPrivate = {
    // Initialize multiple toggle groups. Accepts array of { publicBtnId, privateBtnId, hiddenInputId }
    init: function(configs){
      if(!Array.isArray(configs)) configs = [configs];
      configs.forEach(cfg=>{
        if(!cfg || !cfg.publicBtnId || !cfg.privateBtnId) return;
        bindGroup(cfg.publicBtnId, cfg.privateBtnId, cfg.hiddenInputId);
      });
    },

    // Create or ensure a single group exists immediately (returns group object)
    ensure: function(publicBtnId, privateBtnId, hiddenInputId){
      return bindGroup(publicBtnId, privateBtnId, hiddenInputId);
    },

    // Set visibility by hidden input id (or group key returned by ensure)
    setPublic: function(hiddenInputIdOrKey, makePublic){
      // try to find group by hiddenInputId
      const key = hiddenInputIdOrKey;
      let group = groups[key];
      if(!group){
        // attempt to find group where hiddenInputId matches
        for(const k in groups){
          if(groups[k] && groups[k].hiddenInputId === key) { group = groups[k]; break; }
        }
      }
      if(group){
        group.setPublic(!!makePublic);
        return true;
      }
      // fallback: try to set an element with that id if it's a hidden input
      const hidden = document.getElementById(key);
      if(hidden){
        hidden.value = !!makePublic ? 'true' : 'false';
        const ev = new CustomEvent('publicprivate:changed', { detail: { id: key, public: !!makePublic }});
        window.dispatchEvent(ev);
        return true;
      }
      return false;
    },

    // Query current value
    isPublic: function(hiddenInputIdOrKey){
      const key = hiddenInputIdOrKey;
      let group = groups[key];
      if(!group){
        for(const k in groups){
          if(groups[k] && groups[k].hiddenInputId === key) { group = groups[k]; break; }
        }
      }
      if(group) return group.isPublic();
      const hidden = document.getElementById(key);
      if(hidden) return hidden.value === 'true';
      return true;
    }
  };

  // expose globally
  window.PublicPrivate = PublicPrivate;
})(window);