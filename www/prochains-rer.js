// const LitElement = customElements.get("hui-masonry-view")
//   ? Object.getPrototypeOf(customElements.get("hui-masonry-view"))
//   : Object.getPrototypeOf(customElements.get("hui-view"));
// const html = LitElement.prototype.html;
// const css = LitElement.prototype.css;

import { LitElement, html, css } from 'lit-element';

class ProchainsRER extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  render() {
    if (!this.config || !this.hass) return '';

    return html`
      <div elevation="2">
        ${this.config.entities.map((ent) => {
          const stateObj = this.hass.states[ent];
          return stateObj
            ? html`
                <div class="state">
                  ${stateObj.attributes.friendly_name}
                  <div
                    .checked="${stateObj.state === 'on'}"
                    @change="${(ev) => this._toggle(stateObj)}"
                  ></div>
                </div>
              `
            : html` <div class="not-found">Entity ${ent} not found.</div> `;
        })}
      </div>
    `;
  }

  setConfig(config) {
    console.log('setConfig');
    console.log(config);
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return this.config.entities.length + 1;
  }

  _toggle(state) {
    this.hass.callService('homeassistant', 'toggle', {
      entity_id: state.entity_id,
    });
  }

  static get styles() {
    return css`
      :host {
        font-family: 'Gloria Hallelujah', cursive;
      }
      wired-card {
        background-color: white;
        padding: 16px;
        display: block;
        font-size: 18px;
      }
      .state {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        align-items: center;
      }
      .not-found {
        background-color: yellow;
        font-family: sans-serif;
        font-size: 14px;
        padding: 8px;
      }
      wired-toggle {
        margin-left: 8px;
      }
    `;
  }
}

customElements.define('x-prochains-rer', ProchainsRER);
