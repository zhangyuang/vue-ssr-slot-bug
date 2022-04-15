// Thanks to: https://github.com/airyland/vux/blob/v2/src/directives/transfer-dom/index.js
// Thanks to: https://github.com/calebroseland/vue-dom-portal
import { Directive } from 'vue';

interface TransferData {
  parentNode: HTMLElement;
  home: Comment;
  hasMovedOut: boolean;
  target: HTMLElement;
}
interface TransferElement extends HTMLElement {
  __transferDomData?: TransferData;
  parentNode: HTMLElement;
}

const isServer = typeof window === 'undefined' || typeof window.HTMLElement === 'undefined';

/**
 * Get target DOM Node
 * @param {(Node|string|Boolean)} [node=document.body] DOM Node, CSS selector, or Boolean
 * @return {Node} The target that the el will be appended to
 */
function getTarget(node) {
  let parentNode = node;

  if (parentNode === undefined) {
    parentNode = document.body;
  }
  if (parentNode === true) {
    return document.body;
  }

  if (!(parentNode instanceof window.Node)) {
    parentNode = document.querySelector(node);
  }

  return parentNode;
}

const directive: Directive<TransferElement, boolean | string> = {
  mounted(el, { value }) {
    if (isServer) return;

    if (el.dataset && el.dataset.transfer !== 'true') return false;
    el.className = el.className ? `${el.className} v-transfer-dom` : 'v-transfer-dom';
    const { parentNode } = el;
    if (!parentNode) return false;
    const home = document.createComment('');
    let hasMovedOut = false;
    let target;

    if (value) {
      parentNode.replaceChild(home, el); // moving out, el is no longer in the document
      target = getTarget(value);
      target?.appendChild(el); // moving into new place
      hasMovedOut = true;
    }
    if (!el.__transferDomData) {
      // eslint-disable-next-line no-param-reassign
      el.__transferDomData = {
        parentNode,
        home,
        target,
        hasMovedOut,
      };
    }
    return true;
  },
  updated(el, { value }) {
    if (isServer) return;

    if (el.dataset && el.dataset.transfer !== 'true') return false;
    // need to make sure children are done updating (vs. `update`)
    // __
    const ref$1 = el.__transferDomData;
    if (!ref$1) return true;
    // homes.get(el)
    const { parentNode } = ref$1;
    const { home } = ref$1;
    const { hasMovedOut } = ref$1; // recall where home is

    if (!hasMovedOut && value) {
      // remove from document and leave placeholder
      parentNode.replaceChild(home, el);
      // append to target
      getTarget(value)?.appendChild(el);
      // eslint-disable-next-line no-param-reassign
      el.__transferDomData = {
        ...el.__transferDomData,
        hasMovedOut: true,
        target: getTarget(value),
      };
    } else if (hasMovedOut && !value) {
      // previously moved, coming back home
      parentNode.replaceChild(el, home);
      // eslint-disable-next-line no-param-reassign
      el.__transferDomData = {
        ...el.__transferDomData,
        hasMovedOut: false,
        target: getTarget(value),
      };
    } else if (value) {
      // already moved, going somewhere else
      getTarget(value)?.appendChild(el);
    }
    return true;
  },
  unmounted(el) {
    if (isServer) return;

    if (el.dataset && el.dataset.transfer !== 'true') return false;
    el.className = el.className.replace('v-transfer-dom', '');
    if (el.__transferDomData && el.__transferDomData.hasMovedOut === true) {
      el.__transferDomData.parentNode?.appendChild(el);
    }
    el.__transferDomData = null;
  },
};

export default directive;
 