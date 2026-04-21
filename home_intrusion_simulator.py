import requests
import time
import random
from datetime import datetime

API_URL = "http://127.0.0.1:8000/api/alerte"
SENSORS = ["Porte avant", "Fenêtre salon", "Capteur PIR"]
SIMULATION_ENABLED = True

print("🏠 HOME SECURITY MONITORING DÉMARRÉ")
print(f"Connecté à {API_URL}")
print(f"Capteurs: {', '.join(SENSORS)}")

intrusion_reported = False

try:
    while True:
        # Simulation: 5% de chance d'intrusion toutes les 10s
        if SIMULATION_ENABLED and random.random() < 0.05 and not intrusion_reported:
            sensor = random.choice(SENSORS)
            severity = random.randint(4, 5)  # Très grave
            
            print(f"\n🚨 INTRUSION DÉTECTÉE - Capteur: {sensor}")
            
            payload = {
                "domain": "home",
                "category": "INTRUSION",
                "severity": severity,
                "location": sensor,
                "message": f"Intrusion détectée au capteur: {sensor}",
                "data": {
                    "sensor": sensor,
                    "type": "MOTION_DETECTED" if "PIR" in sensor else "DOOR_OPENED",
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            try:
                response = requests.post(API_URL, json=payload, timeout=5)
                if response.status_code == 200:
                    print("✅ Alerte HOME envoyée au serveur")
                    intrusion_reported = True
                    # Reset après 20s
                    time.sleep(20)
                    intrusion_reported = False
                else:
                    print(f"⚠️ Erreur serveur: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"❌ Connexion échouée: {e}")
        else:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] ✅ Système sécurisé - En surveillance...", end="\r")
        
        time.sleep(3)

except KeyboardInterrupt:
    print("\n✋ HOME SECURITY ARRÊTÉ")