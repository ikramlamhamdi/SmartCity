from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import threading
import time

app = Flask(__name__)
CORS(app)

# ──────────────────────────────────────────────
# In-memory storage
# ──────────────────────────────────────────────

alertes: List[Dict] = []
MAX_ALERTS = 200

dernieres_alertes: Dict[str, Optional[Dict]] = {
    "traffic": None,
    "school": None,
    "home": None,
}

# Sensor readings – keyed by sensor id
capteurs: Dict[str, Dict] = {}

# Door-lock state
etat_verrou = {
    "locked": True,
    "method": None,          # "keyboard" | "rfid" | "remote"
    "last_action": None,
    "last_updated": datetime.now().isoformat(),
}

# Traffic-light states
feux_circulation: Dict[str, Dict] = {
    "feu_1": {"id": "feu_1", "location": "Carrefour Nord", "state": "green",
               "last_updated": datetime.now().isoformat()},
    "feu_2": {"id": "feu_2", "location": "Carrefour Sud",  "state": "red",
               "last_updated": datetime.now().isoformat()},
    "feu_3": {"id": "feu_3", "location": "Carrefour Est",  "state": "yellow",
               "last_updated": datetime.now().isoformat()},
}

# ──────────────────────────────────────────────
# Helper: alert factory
# ──────────────────────────────────────────────

def creer_alerte(domain: str, category: str, severity: int, location: str,
                 message: str, data: dict = None) -> Dict:
    """Crée une alerte au format standardisé."""
    return {
        "id": len(alertes) + 1,
        "domain": domain,
        "category": category,
        "severity": severity,   # 1-5
        "location": location,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "data": data or {},
    }


def ajouter_alerte(alerte: Dict):
    """Insère une alerte dans l'historique et met à jour l'état du domaine."""
    global alertes
    alertes.append(alerte)
    if len(alertes) > MAX_ALERTS:
        alertes.pop(0)
    domain = alerte.get("domain")
    if domain in dernieres_alertes:
        dernieres_alertes[domain] = alerte


# ──────────────────────────────────────────────
# Background auto-refresh thread
# ──────────────────────────────────────────────

def _auto_refresh_loop():
    """Tâche de fond : nettoyage et vérification des capteurs toutes les 30 s."""
    STALE_SECONDS = 300   # 5 minutes sans mise à jour → hors-ligne
    while True:
        try:
            now = datetime.now()
            for sid, sensor in list(capteurs.items()):
                try:
                    last = datetime.fromisoformat(sensor["last_updated"])
                except (KeyError, ValueError):
                    continue
                if (now - last).total_seconds() > STALE_SECONDS:
                    if sensor.get("status") != "offline":
                        capteurs[sid]["status"] = "offline"
                        alerte = creer_alerte(
                            domain=sensor.get("domain", "home"),
                            category="SENSOR_OFFLINE",
                            severity=2,
                            location=sensor.get("location", sid),
                            message=f"Capteur {sensor.get('name', sid)} hors-ligne",
                            data={"sensor_id": sid},
                        )
                        ajouter_alerte(alerte)
                        print(f"⚠️  Capteur hors-ligne: {sid}")
        except Exception as exc:
            print(f"❌ Erreur auto-refresh: {exc}")
        time.sleep(30)


_refresh_thread = threading.Thread(target=_auto_refresh_loop, daemon=True)
_refresh_thread.start()


# ──────────────────────────────────────────────
# Routes – Alertes (existantes)
# ──────────────────────────────────────────────

@app.route('/api/alerte', methods=['POST'])
def recevoir_alerte():
    """Reçoit une alerte et la stocke."""
    try:
        payload = request.get_json(force=True)
        required = {'domain', 'category', 'severity', 'location', 'message'}
        if not required.issubset(payload):
            return jsonify({"error": "Champs manquants"}), 400

        if payload['domain'] not in dernieres_alertes:
            return jsonify({"error": "Domaine invalide (traffic|school|home)"}), 400

        alerte = creer_alerte(
            domain=payload['domain'],
            category=payload['category'],
            severity=int(payload['severity']),
            location=payload['location'],
            message=payload['message'],
            data=payload.get('data', {}),
        )
        ajouter_alerte(alerte)
        print(f"✅ Alerte reçue: {alerte['domain'].upper()} - {alerte['category']}")
        return jsonify({"status": "OK", "alert_id": alerte['id']}), 200

    except Exception as exc:
        print(f"❌ Erreur: {exc}")
        return jsonify({"error": str(exc)}), 500


@app.route('/api/status', methods=['GET'])
def envoyer_status():
    """Retourne l'alerte la plus critique actuellement active."""
    actives = [a for a in dernieres_alertes.values() if a is not None]
    if not actives:
        return jsonify({"status": "RAS", "message": "Système en veille",
                        "domain": None, "category": None}), 200

    critique = max(actives, key=lambda x: x['severity'])
    return jsonify({
        "status": "ALERTE",
        "domain": critique['domain'],
        "category": critique['category'],
        "severity": critique['severity'],
        "location": critique['location'],
        "message": critique['message'],
        "timestamp": critique['timestamp'],
    }), 200


@app.route('/api/alerts', methods=['GET'])
def get_all_alerts():
    """Retourne toutes les alertes."""
    return jsonify({"alerts": alertes}), 200


@app.route('/api/alerts/clear', methods=['POST'])
def clear_alerts():
    """Efface toutes les alertes."""
    global alertes
    alertes = []
    dernieres_alertes.update({"traffic": None, "school": None, "home": None})
    return jsonify({"status": "OK", "message": "Alertes effacées"}), 200


@app.route('/api/alerts/<domain>', methods=['GET'])
def get_alerts_by_domain(domain):
    """Retourne les alertes d'un domaine spécifique."""
    domain_alerts = [a for a in alertes if a['domain'] == domain]
    return jsonify({"domain": domain, "alerts": domain_alerts}), 200


# ──────────────────────────────────────────────
# Routes – Capteurs
# ──────────────────────────────────────────────

@app.route('/api/sensors', methods=['GET'])
def get_all_sensors():
    """Retourne tous les capteurs et leurs dernières valeurs."""
    return jsonify({"sensors": list(capteurs.values())}), 200


@app.route('/api/sensors/<sensor_type>', methods=['GET'])
def get_sensors_by_type(sensor_type):
    """Retourne les capteurs d'un type donné."""
    filtered = [s for s in capteurs.values() if s.get('type') == sensor_type]
    return jsonify({"type": sensor_type, "sensors": filtered}), 200


@app.route('/api/sensors/update', methods=['POST'])
def update_sensor():
    """Reçoit une mise à jour d'un capteur (ESP32 → Backend)."""
    try:
        payload = request.get_json(force=True)
        required = {'sensor_id', 'type', 'value', 'location'}
        if not required.issubset(payload):
            return jsonify({"error": "Champs manquants"}), 400

        sid = payload['sensor_id']
        now = datetime.now().isoformat()

        # Conserver ou créer l'entrée
        existing = capteurs.get(sid, {})
        existing.update({
            "id": sid,
            "type": payload['type'],
            "name": payload.get('name', sid),
            "value": payload['value'],
            "unit": payload.get('unit', ''),
            "location": payload['location'],
            "domain": payload.get('domain', 'home'),
            "status": "online",
            "last_updated": now,
        })
        capteurs[sid] = existing

        # Vérification de seuil (optionnel)
        threshold_max = payload.get('threshold_max')
        threshold_min = payload.get('threshold_min')
        if threshold_max is not None and float(payload['value']) > float(threshold_max):
            alerte = creer_alerte(
                domain=existing['domain'],
                category=f"{payload['type'].upper()}_HIGH",
                severity=4,
                location=payload['location'],
                message=f"{existing['name']}: {payload['value']}{existing['unit']} dépasse le seuil {threshold_max}",
                data={"sensor_id": sid, "value": payload['value']},
            )
            ajouter_alerte(alerte)
        elif threshold_min is not None and float(payload['value']) < float(threshold_min):
            alerte = creer_alerte(
                domain=existing['domain'],
                category=f"{payload['type'].upper()}_LOW",
                severity=3,
                location=payload['location'],
                message=f"{existing['name']}: {payload['value']}{existing['unit']} sous le seuil {threshold_min}",
                data={"sensor_id": sid, "value": payload['value']},
            )
            ajouter_alerte(alerte)

        return jsonify({"status": "OK", "sensor_id": sid}), 200

    except Exception as exc:
        print(f"❌ Erreur mise à jour capteur: {exc}")
        return jsonify({"error": str(exc)}), 500


# ──────────────────────────────────────────────
# Routes – Contrôle du verrou
# ──────────────────────────────────────────────

@app.route('/api/lock/status', methods=['GET'])
def get_lock_status():
    """Retourne l'état actuel du verrou."""
    return jsonify(etat_verrou), 200


@app.route('/api/lock/unlock', methods=['POST'])
def unlock_door():
    """Déverrouille la porte."""
    try:
        payload = request.get_json(force=True) or {}
        method = payload.get('method', 'remote')
        now = datetime.now().isoformat()
        etat_verrou.update({
            "locked": False,
            "method": method,
            "last_action": "unlock",
            "last_updated": now,
        })
        print(f"🔓 Porte déverrouillée via {method}")
        return jsonify({"status": "OK", "locked": False, "method": method}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route('/api/lock/lock', methods=['POST'])
def lock_door():
    """Verrouille la porte."""
    try:
        payload = request.get_json(force=True) or {}
        method = payload.get('method', 'remote')
        now = datetime.now().isoformat()
        etat_verrou.update({
            "locked": True,
            "method": method,
            "last_action": "lock",
            "last_updated": now,
        })
        print(f"🔒 Porte verrouillée via {method}")
        return jsonify({"status": "OK", "locked": True, "method": method}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ──────────────────────────────────────────────
# Routes – Feux de circulation
# ──────────────────────────────────────────────

@app.route('/api/traffic/lights', methods=['GET'])
def get_traffic_lights():
    """Retourne l'état de tous les feux de circulation."""
    return jsonify({"lights": list(feux_circulation.values())}), 200


@app.route('/api/traffic/lights/<light_id>', methods=['GET'])
def get_traffic_light(light_id):
    """Retourne l'état d'un feu spécifique."""
    light = feux_circulation.get(light_id)
    if not light:
        return jsonify({"error": "Feu non trouvé"}), 404
    return jsonify(light), 200


@app.route('/api/traffic/lights/<light_id>', methods=['POST'])
def update_traffic_light(light_id):
    """Met à jour l'état d'un feu de circulation."""
    try:
        payload = request.get_json(force=True)
        state = payload.get('state')
        if state not in ('red', 'yellow', 'green'):
            return jsonify({"error": "État invalide (red|yellow|green)"}), 400
        if light_id not in feux_circulation:
            feux_circulation[light_id] = {
                "id": light_id,
                "location": payload.get('location', light_id),
                "state": state,
                "last_updated": datetime.now().isoformat(),
            }
        else:
            feux_circulation[light_id]['state'] = state
            feux_circulation[light_id]['last_updated'] = datetime.now().isoformat()
        return jsonify({"status": "OK", "light": feux_circulation[light_id]}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route('/api/traffic/incidents', methods=['GET'])
def get_incidents():
    """Retourne les incidents de trafic (accidents détectés)."""
    traffic_alerts = [a for a in alertes if a['domain'] == 'traffic'
                      and a['category'] == 'ACCIDENT']
    return jsonify({"incidents": traffic_alerts}), 200


@app.route('/api/traffic/incident', methods=['POST'])
def report_incident():
    """Déclare manuellement un incident de trafic."""
    try:
        payload = request.get_json(force=True)
        required = {'location', 'message'}
        if not required.issubset(payload):
            return jsonify({"error": "Champs manquants"}), 400
        alerte = creer_alerte(
            domain="traffic",
            category="ACCIDENT",
            severity=int(payload.get('severity', 4)),
            location=payload['location'],
            message=payload['message'],
            data=payload.get('data', {}),
        )
        ajouter_alerte(alerte)
        return jsonify({"status": "OK", "alert_id": alerte['id']}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ──────────────────────────────────────────────
# Routes – Santé du système
# ──────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifier que le serveur est actif."""
    return jsonify({
        "status": "healthy",
        "alerts_count": len(alertes),
        "sensors_count": len(capteurs),
        "lock_status": "locked" if etat_verrou["locked"] else "unlocked",
        "domains": {
            "traffic": "active" if dernieres_alertes['traffic'] else "idle",
            "school":  "active" if dernieres_alertes['school']  else "idle",
            "home":    "active" if dernieres_alertes['home']    else "idle",
        },
    }), 200


if __name__ == '__main__':
    print("🚀 CityShield API en démarrage sur http://127.0.0.1:8000")
    print("📊 Domaines: TRAFFIC | SCHOOL | HOME")
    print("📡 Endpoints: /api/sensors | /api/lock | /api/traffic/lights | /api/alerts")
    app.run(debug=True, port=8000, host='127.0.0.1')