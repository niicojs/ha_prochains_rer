import { LitElement, html, css } from 'lit-element';
import formatDate from 'date-fns/format';
import intervalToDuration from 'date-fns/intervalToDuration';
import formatDuration from 'date-fns/formatDuration';
import { fr } from 'date-fns/locale';

const icons = {
  a: require('./static/a.svg'),
  b: require('./static/b.svg'),
  c: require('./static/c.svg'),
  d: require('./static/d.svg'),
  e: require('./static/e.svg'),
  1: require('./static/1.svg'),
  2: require('./static/2.svg'),
  3: require('./static/3.svg'),
  '3bis': require('./static/3bis.svg'),
  4: require('./static/4.svg'),
  10: require('./static/10.svg'),
  11: require('./static/11.svg'),
  12: require('./static/12.svg'),
  13: require('./static/13.svg'),
  14: require('./static/14.svg'),
};

class ProchainsRER extends LitElement {
  static get properties() {
    return {
      hass: { notify: true },
      config: {},
    };
  }

  ready() {
    console.log('ready');
    super.ready();
    this.addEventListener('hass-changed', (truc) => console.log(truc));
  }

  static getStubConfig() {
    return { icon: 'c', entities: ['sensor.prochains_rer'] };
  }

  setConfig(config) {
    this.config = config;
    this.maxTrains = config.max_trains || 5;
    this.icon = undefined;
    if (this.config.icon) {
      this.icon = icons[this.config.icon];
      if (!config.dev) {
        this.icon = `/local/prochains-rer${icons[this.config.icon]}`;
      }
    }
  }

  render() {
    if (!this.hass || !this.config?.entities?.length) return 'error: no data?';

    const sensor = this.config.entities[0];
    const state = this.hass.states[sensor];
    const api = state.api || 'transilien';

    console.log(api);
    console.log(state.attributes.trains);

    const trains = state.attributes.trains
      .map((train) => {
        train.date = new Date(train.date);
        train.horaire = formatDate(train.date, 'HH:mm');
        train.nicedate = formatDuration(
          intervalToDuration({
            start: new Date(),
            end: train.date,
          }),
          { locale: fr, format: ['hours', 'minutes'] }
        );
        return train;
      })
      .filter((_, i) => i < this.maxTrains);

    console.log(trains);

    return html`
      <table class="train-times">
        <thead>
          <tr>
            <th class="ligne" scope="col"></th>
            ${api === 'transilien'
              ? html`<th class="num" scope="col">Train</th>`
              : null}
            <th class="hour" scope="col">Heure</th>
            <th class="origdest" scope="col">Terminus</th>
            <th class="infos" scope="col">Infos</th>
          </tr>
        </thead>
        <tbody class="">
          ${trains.map(
            (train, idx) => html`
              <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
                <td class="ligne">
                  ${this.icon
                    ? html`<span
                        ><img height="30px" src="${this.icon}"
                      /></span>`
                    : null}
                </td>
                ${api === 'transilien'
                  ? html`<td class="num">${train.mission}</td>`
                  : null}
                <td class="hour">${train.horaire}</td>
                <td class="origdest">${train.terminus}</td>
                <td class="infos">${train.etat || train.nicedate}</td>
              </tr>
            `
          )}
          ${trains.length > 0
            ? null
            : html`
                <tr>
                  <td colspan="6" class="notimes">
                    Les horaires pour cette gare sont momentanément
                    indisponibles.
                  </td>
                </tr>
              `}
        </tbody>
      </table>
    `;
  }

  getCardSize() {
    return this.maxTrains + 1;
  }

  static get styles() {
    return css`
      .train-times {
        color: #fff;
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
      }
      .train-times .ligne {
        text-align: center
      }
      .train-times th,
      .train-times tr {
        background-color: #0a1e61;
        padding: 10px;
        height: 45px;
      }
      .train-times thead th,
      .train-times tr:nth-child(even) {
        background-color: #084b96;
      }
      .train-times th {
        text-align: left;
      }
      .train-times td {
        padding: 0 10px;
      }
    `;
  }
}

customElements.define('x-prochains-rer', ProchainsRER);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'x-prochains-rer',
  name: 'Prochains RER',
  preview: true,
});
