/* helix-design button switcher: picks the button variant via <html data-btn="a|b|c|e">.
   Temporary: once a variant is chosen, the library keeps one and this file goes away.
   No dependencies. Loads as a plain <script src> (window.HelixDesign) and through bundlers
   (import { setButtonStyle, getButtonStyle } from 'helix-design/switcher.js'). */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module && module.exports) module.exports = api;
  if (root && root.document) {
    root.HelixDesign = Object.assign(root.HelixDesign || {}, api);
    api.init();
  }
})(typeof window !== 'undefined' ? window : undefined, function (root) {
  'use strict';

  var VARIANTS = ['a', 'b', 'c', 'e'];
  var DEFAULT = 'e';
  var STORAGE_KEY = 'helix-design.btn';
  var SWITCH_SELECTOR = '[data-btn-switch]';

  function isValid(v) {
    return typeof v === 'string' && VARIANTS.indexOf(v) !== -1;
  }

  function doc() {
    return root && root.document ? root.document : null;
  }

  function readStored() {
    try {
      return root && root.localStorage ? root.localStorage.getItem(STORAGE_KEY) : null;
    } catch (e) {
      return null;
    }
  }

  function getButtonStyle() {
    var d = doc();
    var v = d && d.documentElement && d.documentElement.dataset ? d.documentElement.dataset.btn : null;
    return isValid(v) ? v : DEFAULT;
  }

  function syncSwitches() {
    var d = doc();
    if (!d || !d.querySelectorAll) return;
    var current = getButtonStyle();
    var els = d.querySelectorAll(SWITCH_SELECTOR);
    for (var i = 0; i < els.length; i++) {
      els[i].setAttribute('aria-pressed', String(els[i].dataset.btnSwitch === current));
    }
  }

  function setButtonStyle(v) {
    var d = doc();
    if (!isValid(v) || !d) return false;
    d.documentElement.dataset.btn = v;
    try {
      if (root.localStorage) root.localStorage.setItem(STORAGE_KEY, v);
    } catch (e) {
      /* storage blocked (private mode, quota): the choice still applies to this page */
    }
    syncSwitches();
    return true;
  }

  function onClick(event) {
    var t = event && event.target;
    var el = t && t.closest ? t.closest(SWITCH_SELECTOR) : null;
    if (el) setButtonStyle(el.dataset.btnSwitch);
  }

  function init() {
    var d = doc();
    if (!d) return;
    var stored = readStored();
    if (isValid(stored)) d.documentElement.dataset.btn = stored;
    d.addEventListener('click', onClick);
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', syncSwitches);
    else syncSwitches();
  }

  return {
    VARIANTS: VARIANTS.slice(),
    DEFAULT: DEFAULT,
    STORAGE_KEY: STORAGE_KEY,
    getButtonStyle: getButtonStyle,
    setButtonStyle: setButtonStyle,
    init: init,
  };
});
