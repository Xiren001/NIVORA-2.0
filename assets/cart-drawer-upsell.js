class CartDrawerUpsell extends HTMLElement {
  constructor() {
    super();
    this.abortController = null;
  }

  connectedCallback() {
    if (!this.dataset.productId) {
      this.remove();
      return;
    }
    this.loadRecommendations();
  }

  disconnectedCallback() {
    this.abortController?.abort();
  }

  loadRecommendations() {
    const productId = this.dataset.productId;
    if (!productId) return;

    this.abortController?.abort();
    this.abortController = new AbortController();

    const url = `${this.dataset.url}&product_id=${productId}&section_id=${this.dataset.sectionId}`;

    fetch(url, { signal: this.abortController.signal })
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const content = html.querySelector('[data-upsell-content]');

        if (content?.innerHTML.trim().length && content.querySelector('.cart-drawer-upsell__slider, .cart-drawer__upsell')) {
          const upsellMarkup = content.querySelector('.cart-drawer__upsell') || content.querySelector('.cart-drawer-upsell');
          const wrapper = this.closest('.cart-drawer__upsell');

          if (upsellMarkup && wrapper) {
            wrapper.innerHTML = upsellMarkup.classList.contains('cart-drawer__upsell')
              ? upsellMarkup.innerHTML
              : upsellMarkup.outerHTML;
            wrapper.classList.remove('cart-drawer-upsell-loader');
            this.remove();
          } else if (wrapper) {
            wrapper.remove();
          }
        } else {
          this.closest('.cart-drawer__upsell')?.remove();
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error(error);
          this.closest('.cart-drawer__upsell')?.remove();
        }
      });
  }
}

if (!customElements.get('cart-drawer-upsell')) {
  customElements.define('cart-drawer-upsell', CartDrawerUpsell);
}
