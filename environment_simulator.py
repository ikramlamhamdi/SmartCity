"""
Simulateur de capteurs d'environnement (DHT22 + LDR + PIR) pour SmartCity.

Capteurs simulés :
  - DHT22  : température + humidité
  - LDR    : luminosité ambiante
  - HC-SR501 (PIR) : détection de mouvement

Usage:
    python environment_simulator.py
"""

import requests
import time
import random
from datetime import datetime

API_URL = "http://127.0.0.1:8000"
SENSOR_URL = f"{API_URL}/api/sensors/update"
ALERT_URL  = f"{API_URL}/api/alerte"

# Valeurs initiales
temperature   = 22.5   # °C
humidity      = 55.0   # %
lux           = 400    # lx
motion_active = False

last_motion_alert = 0
MOTION_COOLDOWN   = 15   # secondes

print("🌡️  ENVIRONMENT SENSOR SIMULATOR DÉMARRÉ")
print(f"Connecté à {API_URL}")

try:
    while True:
        now_str = datetime.now().strftime("%H:%M:%S")

        # ── DHT22 ──────────────────────────────────────────────
        temperature += random.uniform(-0.3, 0.3)
        temperature  = max(15.0, min(45.0, temperature))

        humidity += random.uniform(-1.0, 1.0)
        humidity  = max(20.0, min(95.0, humidity))

        for sid, value, unit, name, t_min, t_max in [
            ("dht22_temp",     round(temperature, 1), "°C", "DHT22 Température", 10, 40),
            ("dht22_humidity", round(humidity, 1),    "%",  "DHT22 Humidité",    20, 90),
        ]:
            try:
                requests.post(SENSOR_URL, json={
                    "sensor_id": sid,
                    "type":      "environment",
                    "name":      name,
                    "value":     value,
                    "unit":      unit,
                    "location":  "Maison - Salon",
                    "domain":    "home",
                    "threshold_min": t_min,
                    "threshold_max": t_max,
                }, timeout=3)
            except requests.exceptions.RequestException:
                pass

        # ── LDR ────────────────────────────────────────────────
        lux += random.randint(-30, 30)
        lux  = max(0, min(1023, lux))
        lights_on = lux < 300  # relais activé si sombre

        try:
            requests.post(SENSOR_URL, json={
                "sensor_id": "ldr_main",
                "type":      "light",
                "name":      "LDR Luminosité",
                "value":     lux,
                "unit":      "lx",
                "location":  "Maison - Entrée",
                "domain":    "home",
            }, timeout=3)
        except requests.exceptions.RequestException:
            pass

        # ── PIR – détection de mouvement (5% de chance) ────────
        motion_active = random.random() < 0.05
        if motion_active and (time.time() - last_motion_alert) > MOTION_COOLDOWN:
            try:
                r = requests.post(ALERT_URL, json={
                    "domain":   "home",
                    "category": "MOTION",
                    "severity": 3,
                    "location": "Maison - Couloir",
                    "message":  "Mouvement détecté par capteur PIR HC-SR501",
                    "data":     {"sensor": "hc_sr501", "triggered": True},
                }, timeout=3)
                if r.status_code == 200:
                    last_motion_alert = time.time()
            except requests.exceptions.RequestException:
                pass

        # ── Affichage console ──────────────────────────────────
        motion_sym = "🔴 MOUVEMENT" if motion_active else "🟢 calme"
        light_sym  = "💡 ON" if lights_on else "⬛ OFF"
        print(
            f"[{now_str}] 🌡️ {temperature:.1f}°C  💧{humidity:.1f}%  "
            f"☀️ {lux}lx ({light_sym})  PIR: {motion_sym}"
        )

        time.sleep(5)

except KeyboardInterrupt:
    print("\n✋ ENVIRONMENT SIMULATOR ARRÊTÉ")
