import { ProchainsRER } from './prochains-rer.js';

document.addEventListener('DOMContentLoaded', () => {
  const elt = document.createElement('x-prochains-rer');
  try {
    elt.setConfig({
      type: 'custom:x-prochains-rer',
      entities: ['sensor.prochains_rer'],
    });
    elt.hass = { toto: 'toto' };
  } catch (e) {
    console.error(e);
  }
  setTimeout(() => {
    elt.hass = { toto: 'titi' };
  }, 1000);
  document.body.appendChild(elt);
});
