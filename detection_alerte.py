import cv2
from ultralytics import YOLO
import time
import os
import requests  # <-- NOUVEAU : Permet d'envoyer des requêtes web à Flask

# 1. Configuration Pro
model = YOLO('yolov8n.pt')
cap = cv2.VideoCapture(0)
if not os.path.exists('alerts'): 
    os.makedirs('alerts') # Dossier pour les preuves

# Paramètres de "Victoire"
STATIONARY_THRESHOLD = 4  # secondes
confidence_limit = 0.6    # On ne veut pas de fausses alertes

tracker = {} # Pour suivre chaque voiture individuellement

while cap.isOpened():
    success, frame = cap.read()
    if not success: 
        break

    # Simulation de "Zone de Danger" (On dessine un rectangle sur la route)
    # Si la voiture est dans ce rectangle, on surveille plus attentivement
    cv2.rectangle(frame, (100, 200), (540, 450), (255, 255, 0), 2) 
    cv2.putText(frame, "ZONE DE SURVEILLANCE", (100, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

    results = model.track(frame, persist=True, conf=confidence_limit, iou=0.5)

    if results[0].boxes.id is not None:
        boxes = results[0].boxes.xyxy.int().cpu().tolist()
        ids = results[0].boxes.id.int().cpu().tolist()
        clss = results[0].boxes.cls.int().cpu().tolist()

        for box, id, cls in zip(boxes, ids, clss):
            if cls == 2: # Si c'est une voiture
                x1, y1, x2, y2 = box
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2 # Centre de la voiture

                # Vérifier si la voiture est dans la zone de danger
                if 100 < cx < 540 and 200 < cy < 450:
                    if id not in tracker:
                        tracker[id] = {'start_time': time.time(), 'alerted': False}
                    
                    elapsed = time.time() - tracker[id]['start_time']

                    # Visualisation pour le jury
                    color = (0, 255, 255) if elapsed < STATIONARY_THRESHOLD else (0, 0, 255)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"ID:{id} TIME:{int(elapsed)}s", (x1, y1-10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                    # LOGIQUE GAGNANTE : Alerte + Capture d'image
                    if elapsed > STATIONARY_THRESHOLD and not tracker[id]['alerted']:
                        print(f"!!! ALERTE CRITIQUE : ID {id} bloqué en zone dangereuse !!!")
                        
                        # Sauvegarder la preuve
                        img_path = f"alerts/accident_id_{id}.jpg"
                        cv2.imwrite(img_path, frame)
                        tracker[id]['alerted'] = True
                        
                        # --- ENVOI DE L'ALERTE À L'API FLASK ---
                        payload = {
                            "message": f"Accident détecté (ID {id} immobilisé > 4s)",
                            "location": "Axe Principal - Caméra 1",
                            "type": "Collision"
                        }
                        try:
                            # Requête POST vers ton fichier Flask
                            requests.post("http://127.0.0.1:8000/api/alerte", json=payload)
                            print("--> ✅ Alerte transmise au serveur avec succès !")
                        except requests.exceptions.RequestException as e:
                            print(f"--> ❌ Erreur : Serveur Flask introuvable. Est-il bien lancé ? ({e})")
                        # ---------------------------------------
                else:
                    # Si elle sort de la zone, on reset son compteur
                    if id in tracker: 
                        tracker.pop(id)

    cv2.imshow("AGIOS SMART CITY - AI VISION v2", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): 
        break

cap.release()
cv2.destroyAllWindows()