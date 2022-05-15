"""Prochains RER - Sensor"""

import logging
import os
from datetime import timedelta

from homeassistant.const import (TIME_MINUTES, ATTR_ATTRIBUTION)

from .transilien import ProchainsTrains
from .ratp import ProchainsMetro

DOMAIN = 'prochains_rer'
log = logging.getLogger(DOMAIN)

SCAN_INTERVAL = timedelta(minutes=1)

def setup_platform(hass, config, add_entities, discovery_info=None):
  log.info('Prochains RER v1.1.0')
  name = config.get('name', 'Prochains RER')
  api = config.get('api', 'transilien')
  debut_journee = config.get('debut_journee', 5)
  if api == 'transilien': 
    log.info('using API from transilien')
    depart = config.get('from')
    arrivee = config.get('to')
    auth = config.get('api_auth')
    log.debug('Prochains train entre %s et %s', depart, arrivee)
    sensor = ProchainsTrains(name, depart, arrivee, auth, debut_journee)
    add_entities([sensor])
  elif api == 'ratp':
    log.info('using API from RATP')
    path = config.get('path')
    log.debug('Prochains metro en utilisant %s', path)
    sensor = ProchainsMetro(name, path, debut_journee)
    add_entities([sensor])
  else:
    log.warn('unknwon API: %s', api)
