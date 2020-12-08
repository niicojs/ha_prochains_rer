import logging
import requests
import os
import json
import xml.etree.ElementTree as ET
from datetime import (timedelta, datetime)
from random import randrange

from homeassistant.const import (TIME_MINUTES, ATTR_ATTRIBUTION)
from homeassistant.helpers.entity import Entity

from .timeparse import timeparse

log = logging.getLogger('prochains_rer.ratp')

def get_metros(path):
  url = 'https://api-ratp.pierre-grimaud.fr/v4/schedules/' + path
  log.debug('get_metros(%s)', url)
  r = requests.get(url)
  r.encoding = 'utf8'
  if not r.ok:
    log.error('unable to call ratp api - %s', r.reason)
    return []

  data = []
  now = datetime.now()
  for train in r.json()['result']['schedules']:
    traindate = now
    if (train['message'] != "Train a l'approche"):
      duration = timeparse(train['message'])
      traindate = traindate + timedelta(seconds=duration)
    
    data.append({
      'date': traindate,
      'message': train['message'],
      'terminus': train['destination']
    })

  return data

class ProchainsMetro(Entity):
  def __init__(self, name, path, debut_journee):
    self._name = name
    self.path = path
    self.debut_journee = debut_journee
    self.data = []
    self.last_update = None

  @property
  def name(self):
    return self._name

  @property
  def state(self):
    if self.data and len(self.data) > 0:
      minutes = round((self.data[0]['date'] - datetime.now()).total_seconds() / 60)
      return minutes
    else:
      return None

  @property
  def unit_of_measurement(self):
    return TIME_MINUTES

  @property
  def icon(self):
    return 'mdi:train'

  @property
  def device_state_attributes(self):
    return {
      'api': 'ratp',
      'last_update': self.last_update,
      'trains': self.data
    }

  def update(self):
    if datetime.now().hour < self.debut_journee:
      self.last_update = None
      self.data = []
    else:
      self.last_update = datetime.now()
      self.data = get_metros(self.path)
