import requests
import time
import random
from datetime import datetime

API_URL = "http://127.0.0.1:8000/api/alerte"
ROOM_NAME = "Salle A1 (École)"
CO2_THRESHOLD = 1200  # ppm (seuil d'alerte)
NORMAL_CO2 = 400  # CO2 normal extérieur
MAX_CO2 = 1600  # Max simulé

print("🏫 SCHOOL CO2 MONITORING DÉMARRÉ")
print(f"Connecté à {API_URL}")
print(f"Seuil d'alerte: {CO2_THRESHOLD} ppm")

co2_value = NORMAL_CO2
last_alert_time = 0
ALERT_COOLDOWN = 30  # Attendre 30s entre alertes

try:
    while True:
        # Simuler les variations de CO2
        # Augmentation progressive (élèves en classe)
        if random.random() < 0.7:
            co2_value += random.randint(5, 20)
        else:
            # Baisse (ventilation/ouverture fenêtre)
            co2_value -= random.randint(10, 30)
        
        # Limiter entre min et max
        co2_value = max(NORMAL_CO2, min(MAX_CO2, co2_value))
        
        # Afficher la valeur
        timestamp = datetime.now().strftime("%H:%M:%S")
        status_symbol = "🔴" if co2_value > CO2_THRESHOLD else "🟢"
        print(f"[{timestamp}] {status_symbol} CO2: {co2_value} ppm", end="")
        
        # ALERTE si dépassement et cooldown écoulé
        if co2_value > CO2_THRESHOLD and (time.time() - last_alert_time) > ALERT_COOLDOWN:
            print(" → 🚨 ALERTE ENVOYÉE")
            
            payload = {
                "domain": "school",
                "category": "CO2_HIGH",
                "severity": 3,
                "location": ROOM_NAME,
                "message": f"CO2 élevé détecté: {co2_value} ppm (seuil: {CO2_THRESHOLD})",
                "data": {
                    "co2_ppm": co2_value,
                    "room": ROOM_NAME,
                    "recommendation": "Ouvrir les fenêtres ou activer la ventilation"
                }
            }
            
            try:
                response = requests.post(API_URL, json=payload, timeout=5)
                if response.status_code == 200:
                    print("✅ Alerte SCHOOL envoyée au serveur")
                    last_alert_time = time.time()
                else:
                    print(f"⚠️ Erreur serveur: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"❌ Connexion échouée: {e}")
        else:
            print()
        
        # Attendre avant la prochaine mesure
        time.sleep(3)

except KeyboardInterrupt:
    print("\n✋ SCHOOL MONITORING ARRÊTÉ")