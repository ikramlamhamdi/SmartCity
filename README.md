# SmartCity – CityShield 🛡️

**Système de gestion intelligente de la ville** : maison, école, et trafic en temps réel.

---

## 🏗️ Architecture

```
ESP32 (Capteurs) ──► Flask API (Python) ──► React Dashboard (TypeScript)
                         ▲                           │
                   Simulateurs Python         Polling / WebSocket
```

### Composants matériels prévus

| Capteur / Module | Rôle |
|---|---|
| ESP32-DEVKIT | Microcontrôleur principal (WiFi + BLE intégré) |
| MQ-2 / MQ-135 / MQ-131 | Gaz & fumée (incendie, qualité d'air, ozone) |
| HC-SR501 PIR | Détection de mouvement |
| LDR 3/5/10 mm + Relais 5V | Éclairage automatique |
| DHT22 | Température & humidité |
| RFID-RC522 | Contrôle d'accès par carte |
| Clavier 4×4 | Saisie de code PIN |
| SG90 Servo | Mécanisme de verrouillage de porte |
| HC-SR04 | Capteur ultrasonique (présence) |
| JDY-31 / HC-05 / HC-06 | Modules Bluetooth |
| LCD I²C 1602 | Affichage local |
| Buzzer + LEDs | Alertes audio/visuelles |

---

## 📁 Structure du projet

```
SmartCity/
├── serveur_api.py            # Backend Flask – API principale
├── detection_alerte.py       # Détection YOLO (trafic, accidents)
├── school_co2_simulator.py   # Simulateur CO₂ école
├── home_intrusion_simulator.py # Simulateur intrusion maison
├── gas_fire_simulator.py     # Simulateur gaz & incendie
├── traffic_light_simulator.py # Simulateur feux de circulation
├── environment_simulator.py  # Simulateur DHT22 + LDR + PIR
└── React/                    # Frontend React + TypeScript + Tailwind
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── Header.tsx
        │   ├── MapArea.tsx        # Zone de contrôle + verrou + feux
        │   ├── SensorPanel.tsx    # Panneau capteurs temps réel
        │   ├── LockControl.tsx    # Contrôle du verrou de porte
        │   ├── TrafficMonitor.tsx # État des feux de circulation
        │   ├── AlertsSidebar.tsx  # Historique des alertes
        │   └── LogsTerminal.tsx   # Terminal logs
        └── types/
            └── alert.ts           # Types TypeScript partagés
```

---

## 🚀 Démarrage rapide

### 1. Backend (Flask)

```bash
pip install flask flask-cors
python serveur_api.py
# → API disponible sur http://127.0.0.1:8000
```

### 2. Frontend (React)

```bash
cd React
npm install
npm run dev
# → Dashboard sur http://localhost:5173
```

### 3. Simulateurs (fenêtres séparées)

```bash
# Trafic – détection accidents (nécessite caméra + ultralytics)
python detection_alerte.py

# Feux de circulation
python traffic_light_simulator.py

# Capteurs gaz/incendie
python gas_fire_simulator.py

# Température, humidité, luminosité, mouvement
python environment_simulator.py

# CO₂ école
python school_co2_simulator.py

# Intrusion maison
python home_intrusion_simulator.py
```

---

## 📡 API – Endpoints principaux

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/alerte` | Envoyer une alerte |
| `GET` | `/api/status` | Alerte critique actuelle |
| `GET` | `/api/alerts` | Historique de toutes les alertes |
| `GET` | `/api/alerts/<domain>` | Alertes par domaine (home/school/traffic) |
| `POST` | `/api/alerts/clear` | Effacer les alertes |
| `GET` | `/api/sensors` | Tous les capteurs et leurs valeurs |
| `GET` | `/api/sensors/<type>` | Capteurs par type |
| `POST` | `/api/sensors/update` | Mettre à jour un capteur (ESP32) |
| `GET` | `/api/lock/status` | État du verrou |
| `POST` | `/api/lock/unlock` | Déverrouiller la porte |
| `POST` | `/api/lock/lock` | Verrouiller la porte |
| `GET` | `/api/traffic/lights` | État des feux |
| `POST` | `/api/traffic/lights/<id>` | Mettre à jour un feu |
| `GET` | `/api/traffic/incidents` | Accidents détectés |
| `POST` | `/api/traffic/incident` | Déclarer un incident |
| `GET` | `/api/health` | Santé du système |

### Format d'une mise à jour capteur (ESP32 → Backend)

```json
{
  "sensor_id": "mq2",
  "type": "gas",
  "name": "MQ-2 Fumée",
  "value": 320,
  "unit": "ppm",
  "location": "Maison - Cuisine",
  "domain": "home",
  "threshold_max": 300
}
```

---

## 🌐 Dashboard

Le dashboard React se rafraîchit automatiquement :

| Donnée | Intervalle |
|---|---|
| Statut critique | 1 s |
| Alertes | 2 s |
| Capteurs | 3 s |
| Verrou + Feux | 5 s |
| Santé serveur | 10 s |

Fonctionnalités :
- 🔴 Bannière d'alerte critique animée
- 📊 Panneau capteurs en direct (gaz, température, luminosité…)
- 🚪 Contrôle du verrou (clic pour verrouiller/déverrouiller)
- 🚦 État des feux de circulation en temps réel
- 📋 Historique des alertes avec sévérité colorée
- 📡 Terminal de logs

---

## 💰 Budget matériel estimé

| Catégorie | Total estimé |
|---|---|
| Microcontrôleur (ESP32) | 20 $ |
| Contrôle d'accès (RFID, servo, clavier) | 18,50 $ |
| Capteurs gaz/incendie (MQ-2/135/131) | 15,50 $ |
| Détection mouvement + alertes | 7,50 $ |
| Éclairage automatique (LDR + relais) | 8,10 $ |
| Capteurs environnement (DHT22, HC-SR04) | 15 $ |
| Communication Bluetooth | 16,50 $ |
| Affichage LCD | 10 $ |
| Composants passifs + câblage | 17,50 $ |
| **SOUS-TOTAL** | **128,60 $** |
| Contingence 15 % | 19,29 $ |
| **TOTAL** | **~148 $** |
