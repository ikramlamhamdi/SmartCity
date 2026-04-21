"""
Simulateur de feux de circulation pour SmartCity.

Simule le cycle normal rouge → vert → jaune → rouge ainsi que
des anomalies (feu bloqué, clignotant) déclenchant des alertes.

Usage:
    python traffic_light_simulator.py
"""

import requests
import time
import random
from datetime import datetime

API_URL = "http://127.0.0.1:8000"
LIGHTS_URL = f"{API_URL}/api/traffic/lights"
ALERT_URL = f"{API_URL}/api/alerte"

# Feux gérés
LIGHTS = [
    {"id": "feu_1", "location": "Carrefour Nord"},
    {"id": "feu_2", "location": "Carrefour Sud"},
    {"id": "feu_3", "location": "Carrefour Est"},
]

# Cycles normaux (durée en secondes, simulées à l'accéléré)
CYCLE = [
    ("green",  8),
    ("yellow", 3),
    ("red",    8),
]

# État interne
light_states = {l["id"]: {"step": i % 3, "elapsed": 0} for i, l in enumerate(LIGHTS)}

last_anomaly_alert = {l["id"]: 0 for l in LIGHTS}
ANOMALY_COOLDOWN = 60   # secondes entre deux alertes pour le même feu

print("🚦 TRAFFIC LIGHT SIMULATOR DÉMARRÉ")
print(f"Connecté à {API_URL}")

try:
    while True:
        now_str = datetime.now().strftime("%H:%M:%S")

        for light in LIGHTS:
            lid = light["id"]
            state = light_states[lid]

            # Progression dans le cycle
            current_color, duration = CYCLE[state["step"]]
            state["elapsed"] += 5  # tick de 5 secondes

            if state["elapsed"] >= duration:
                state["step"] = (state["step"] + 1) % len(CYCLE)
                state["elapsed"] = 0
                current_color, _ = CYCLE[state["step"]]

            color_emoji = {"green": "🟢", "yellow": "🟡", "red": "🔴"}[current_color]
            print(f"[{now_str}] {color_emoji} {light['location']} → {current_color.upper()}", end="   ")

            # Envoi au backend
            try:
                requests.post(
                    f"{LIGHTS_URL}/{lid}",
                    json={"state": current_color, "location": light["location"]},
                    timeout=3,
                )
            except requests.exceptions.RequestException:
                pass

            # Anomalie : feu bloqué sur rouge (1% de chance)
            if current_color == "red" and random.random() < 0.01:
                if (time.time() - last_anomaly_alert[lid]) > ANOMALY_COOLDOWN:
                    print(f"\n⚠️  ANOMALIE : {light['location']} bloqué sur ROUGE")
                    alert_payload = {
                        "domain": "traffic",
                        "category": "RED_LIGHT",
                        "severity": 3,
                        "location": light["location"],
                        "message": f"Feu {lid} bloqué sur ROUGE – intervention requise",
                        "data": {"light_id": lid, "state": "red", "anomaly": "stuck"},
                    }
                    try:
                        r = requests.post(ALERT_URL, json=alert_payload, timeout=3)
                        if r.status_code == 200:
                            last_anomaly_alert[lid] = time.time()
                    except requests.exceptions.RequestException:
                        pass

        print()
        time.sleep(5)

except KeyboardInterrupt:
    print("\n✋ TRAFFIC LIGHT SIMULATOR ARRÊTÉ")
