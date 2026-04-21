import cv2
from ultralytics import YOLO
import time
import os
import requests
import sys

# Configuration
model = YOLO('yolov8n.pt')
cap = cv2.VideoCapture(0)

if not os.path.exists('alerts'): 
    os.makedirs('alerts')

API_URL = "http://127.0.0.1:8000/api/alerte"
STATIONARY_THRESHOLD = 4  # secondes avant alerte
confidence_limit = 0.6

tracker = {}
frame_count = 0

print("🚗 TRAFFIC DETECTION SYSTEM DÉMARRÉ")
print(f"Connecté à {API_URL}")

while cap.isOpened():
    success, frame = cap.read()
    if not success: 
        break
    
    frame_count += 1
    
    # Zone de surveillance (rectangle sur la route)
    cv2.rectangle(frame, (100, 200), (540, 450), (0, 255, 255), 2) 
    cv2.putText(frame, "ZONE DE SURVEILLANCE", (100, 190), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    
    # Détection avec YOLO
    results = model.track(frame, persist=True, conf=confidence_limit, iou=0.5)
    
    if results[0].boxes.id is not None:
        boxes = results[0].boxes.xyxy.int().cpu().tolist()
        ids = results[0].boxes.id.int().cpu().tolist()
        clss = results[0].boxes.cls.int().cpu().tolist()
        
        for box, id, cls in zip(boxes, ids, clss):
            if cls == 2:  # Classe "voiture"
                x1, y1, x2, y2 = box
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                
                # Vérifier si dans la zone de danger
                if 100 < cx < 540 and 200 < cy < 450:
                    if id not in tracker:
                        tracker[id] = {'start_time': time.time(), 'alerted': False}
                    
                    elapsed = time.time() - tracker[id]['start_time']
                    
                    # Couleur: jaune avant seuil, rouge après
                    color = (0, 255, 255) if elapsed < STATIONARY_THRESHOLD else (0, 0, 255)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"ID:{id} TIME:{int(elapsed)}s", (x1, y1-10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                    
                    # ALERTE si dépassement du seuil
                    if elapsed > STATIONARY_THRESHOLD and not tracker[id]['alerted']:
                        print(f"🚨 ACCIDENT DÉTECTÉ: Véhicule ID {id} immobilisé > {STATIONARY_THRESHOLD}s")
                        
                        # Sauvegarder la preuve
                        img_path = f"alerts/accident_id_{id}_{int(time.time())}.jpg"
                        cv2.imwrite(img_path, frame)
                        tracker[id]['alerted'] = True
                        
                        # Envoyer l'alerte au Flask
                        payload = {
                            "domain": "traffic",
                            "category": "ACCIDENT",
                            "severity": 5,
                            "location": "Axe Principal - Caméra 1",
                            "message": f"Accident détecté: Véhicule {id} immobilisé depuis {int(elapsed)}s",
                            "data": {
                                "vehicle_id": id,
                                "elapsed_time": int(elapsed),
                                "position": [cx, cy]
                            }
                        }
                        
                        try:
                            response = requests.post(API_URL, json=payload, timeout=5)
                            if response.status_code == 200:
                                print("✅ Alerte TRAFFIC envoyée au serveur")
                            else:
                                print(f"⚠️ Erreur serveur: {response.status_code}")
                        except requests.exceptions.RequestException as e:
                            print(f"❌ Connexion échouée: {e}")
                else:
                    # Sortie de zone: reset
                    if id in tracker: 
                        tracker.pop(id)
    
    # Affichage
    cv2.imshow("CityShield - TRAFFIC DETECTION", frame)
    
    # Quitter avec 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'): 
        break

cap.release()
cv2.destroyAllWindows()
print("✋ TRAFFIC DETECTION ARRÊTÉ")