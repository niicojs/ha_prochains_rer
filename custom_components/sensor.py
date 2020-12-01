"""Prochains RER - Sensor"""

import logging
from datetime import (timedelta, datetime)
from homeassistant.const import (TIME_MINUTES, ATTR_ATTRIBUTION)
from homeassistant.helpers.entity import Entity
import xml.etree.ElementTree as ET
import requests
import json
from random import randrange
import os
import json

DOMAIN = "prochains_rer"
log = logging.getLogger(DOMAIN)

SCAN_INTERVAL = timedelta(minutes=1)

def setup_platform(hass, config, add_entities, discovery_info=None):
  log.info("Init Prochains RER v0.1")
  name = config.get('name', 'Prochains RER')
  depart = config.get('from')
  arrivee = config.get('to')
  auth = config.get('api_auth')
  debut_journee = config.get('debut_journee', 6)
  log.debug('Prochains train entre %s et %s', depart, arrivee)
  sensor = ProchainsTrains(name, depart, arrivee, auth, debut_journee)
  add_entities([sensor])

def find_gare(gares, uic):
  for gare in gares:
    if (gare['uic'] == uic):
        return gare['nom']
  return uic

def get_trains(url, auth):
  log.debug('get_trains(%s)', url)
  r = requests.get(
    url,
    auth=auth,
    headers={'accept': 'application/vnd.sncf.transilien.od.depart+xml;vers=1'}
  )
  r.encoding = 'utf8'
  if not r.ok:
    log.error('unable to call api - %s', r.reason)
    return []
  
  root = ET.fromstring(r.text)
  
  with open(os.path.join(os.path.dirname(__file__), 'gares.json')) as file_gares:
    gares = json.load(file_gares)

  trains = []
  for train in root:
    date = datetime.strptime(train.findtext('date'), '%d/%m/%Y %H:%M')
    num = train.findtext('num')
    miss = train.findtext('miss')
    etat = train.findtext('etat', '')
    term = train.findtext('term', '')

    trains.append({
      'date': date,
      'num': num,
      'mission': miss,
      'code_term': term,
      'terminus': find_gare(gares, term),
      'etat': etat
    })

  return trains

class ProchainsTrains(Entity):
  def __init__(self, name, depart, arrivee, auth, debut_journee):
    self._name = name
    self.depart = depart
    self.arrivee = arrivee
    self.auth = auth
    self.debut_journee = debut_journee
    self._state = None
    self.data = []
    self.last_update = None

  @property
  def name(self):
    return self._name

  @property
  def state(self):
    if self.data and len(self.data) > 0:
      # minutes till next train
      # first clean trains in the past
      self.data = list(filter(lambda x: x['date'] > datetime.now(), self.data))
      minutes = round((self.data[0]['date'] - datetime.now()).total_seconds() / 60)
      return minutes
    else:
      return None

  @property
  def unit_of_measurement(self):
    return TIME_MINUTES

  @property
  def icon(self):
    return "mdi:train"

  @property
  def device_state_attributes(self):
    return {
      'last_update': self.last_update,
      'trains': self.data
    }

  def get_auth(self):
    if isinstance(self.auth['username'], list):
      idx = randrange(len(self.auth['username']))
      return (self.auth['username'][idx], self.auth['password'][idx])
    else:
      return (self.auth['username'], self.auth['password'])

  def update(self):
    if datetime.now().hour < self.debut_journee:
      self.data = []
      self.last_update = None
    else:
      if self.last_update is None or (datetime.now() - self.last_update).total_seconds() > 5*60:
        url = "http://api.transilien.com/gare/{}/depart/{}".format(self.depart, self.arrivee)
        data = get_trains(url, self.get_auth())
        self.data = data
        self.last_update = datetime.now()
