"""
Simulateur de capteurs gaz / incendie pour SmartCity.

Capteurs simulés :
  - MQ-2  : fumée / LPG (home)
  - MQ-135: qualité de l'air (school)
  - MQ-131: ozone (school)
  - Buzzer + LED rouge (sortie logique)

Usage:
    python gas_fire_simulator.py
"""

import requests
import time
import random
from datetime import datetime

API_URL = "http://127.0.0.1:8000"
ALERT_URL = f"{API_URL}/api/alerte"
SENSOR_URL = f"{API_URL}/api/sensors/update"

# Seuils d'alarme (valeurs analogiques 0-1023)
THRESHOLDS = {
    "mq2":  300,   # Fumée / LPG
    "mq135": 400,  # Air quality (CO2 + COV)
    "mq131": 250,  # Ozone
}

# Valeurs initiales (état normal)
values = {
    "mq2":  150,
    "mq135": 200,
    "mq131": 120,
}

# Cooldown entre alertes (en secondes)
last_alert = {k: 0 for k in values}
COOLDOWN = 30

print("🔥 GAS / FIRE SENSOR SIMULATOR DÉMARRÉ")
print(f"Connecté à {API_URL}")

try:
    while True:
        now = datetime.now().strftime("%H:%M:%S")

        for sensor_id, value in list(values.items()):
            # Variation aléatoire
            delta = random.randint(-20, 30)
            values[sensor_id] = max(50, min(900, value + delta))

            # Simuler une montée rapide occasionnelle (1% de chance)
            if random.random() < 0.01:
                values[sensor_id] = random.randint(500, 900)
                print(f"[{now}] 🔥 SIMULATION INCENDIE – {sensor_id.upper()}: {values[sensor_id]}")

            v = values[sensor_id]
            threshold = THRESHOLDS[sensor_id]

            status_sym = "🔴" if v > threshold else "🟢"
            unit_labels = {"mq2": "ppm", "mq135": "ppm", "mq131": "ppb"}
            print(f"[{now}] {status_sym} {sensor_id.upper()}: {v} {unit_labels[sensor_id]}", end="  ")

            # Envoyer la lecture au backend
            sensor_payload = {
                "sensor_id": sensor_id,
                "type": "gas",
                "name": sensor_id.upper(),
                "value": v,
                "unit": unit_labels[sensor_id],
                "location": "Maison - Cuisine" if sensor_id == "mq2" else "École - Salle A1",
                "domain": "home" if sensor_id == "mq2" else "school",
                "threshold_max": threshold,
            }
            try:
                requests.post(SENSOR_URL, json=sensor_payload, timeout=3)
            except requests.exceptions.RequestException:
                pass

            # Envoi alerte si seuil dépassé et cooldown écoulé
            if v > threshold and (time.time() - last_alert[sensor_id]) > COOLDOWN:
                category = "FIRE" if sensor_id == "mq2" else "GAS_HIGH"
                severity = 5 if v > threshold * 2 else 4
                domain = "home" if sensor_id == "mq2" else "school"
                location = "Maison - Cuisine" if sensor_id == "mq2" else "École - Salle A1"

                alert_payload = {
                    "domain": domain,
                    "category": category,
                    "severity": severity,
                    "location": location,
                    "message": f"⚠️ {sensor_id.upper()} critique : {v} (seuil : {threshold})",
                    "data": {
                        "sensor": sensor_id,
                        "value": v,
                        "threshold": threshold,
                    },
                }
                try:
                    r = requests.post(ALERT_URL, json=alert_payload, timeout=3)
                    if r.status_code == 200:
                        print(f"\n🚨 Alerte {sensor_id.upper()} envoyée")
                        last_alert[sensor_id] = time.time()
                except requests.exceptions.RequestException as exc:
                    print(f"\n❌ Erreur alerte: {exc}")

        print()
        time.sleep(5)

except KeyboardInterrupt:
    print("\n✋ GAS/FIRE SIMULATOR ARRÊTÉ")
