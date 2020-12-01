## Installation

### Custom Component

Copier le repertoire `custom_components` dans `/config/custom_components`, modifier la config comme indiqué ci dessous puis rémarrer Home Assistant.  
Vous devriez voir arriver un `sensor.prochain_rer` avec le nombre de minute avant le prochain train. 

### Lovelace

Copier le repertoire `www/dist` dans `/config/www/prochains_rer`.
Ajouter une ressource Lovelace de type `Module JavaScript` avec comme valeur `/local/prochains-rer/prochains-rer.js`.  
Ajouter une carte avec comme config:
```yaml
type: 'custom:x-prochains-rer'
icon: c # icon de la ligne de RER : a, b, c, d ou e (ou rien)
max_trains: 5
entities:
  - sensor.prochains_rer
```

## Config

Tout d'abord, trouver le code de votre gare et de la gare d'arrivée (sur la meme ligne).  
Le fichier `gares.json` contient les gares RER du réseau.

Ensuite, trouver des codes pour intérroger l'API transilien.
Voir [ici](https://ressources.data.sncf.com/explore/dataset/api-temps-reel-transilien/information/).

Enfin, dans le fichier `configuration.yaml`, déclarer le `sensor` :
```
sensor:
  - platform: prochains_rer
    from: '87381087' 
    to: '87381087' 
    api_auth:
        username: !secret transilien_username
        password: !secret transilien_password
```
