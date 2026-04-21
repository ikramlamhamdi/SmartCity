from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from typing import List, Dict
import json

app = Flask(__name__)
CORS(app)

# Storage des alertes
alertes: List[Dict] = []
MAX_ALERTS = 100

# État actuel par domaine
dernieres_alertes = {
    "traffic": None,
    "school": None,
    "home": None
}

def creer_alerte(domain: str, category: str, severity: int, location: str, 
                 message: str, data: dict = None) -> Dict:
    """Crée une alerte au format standardisé"""
    alerte = {
        "id": len(alertes) + 1,
        "domain": domain,
        "category": category,
        "severity": severity,  # 1-5
        "location": location,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "data": data or {}
    }
    return alerte

@app.route('/api/alerte', methods=['POST'])
def recevoir_alerte():
    """Reçoit une alerte et la stocke"""
    global alertes
    
    try:
        payload = request.get_json()
        
        # Valider les champs obligatoires
        if not all(k in payload for k in ['domain', 'category', 'severity', 'location', 'message']):
            return jsonify({"error": "Champs manquants"}), 400
        
        # Créer l'alerte standardisée
        alerte = creer_alerte(
            domain=payload['domain'],
            category=payload['category'],
            severity=payload['severity'],
            location=payload['location'],
            message=payload['message'],
            data=payload.get('data', {})
        )
        
        # Ajouter à l'historique
        alertes.append(alerte)
        if len(alertes) > MAX_ALERTS:
            alertes.pop(0)
        
        # Mettre à jour la dernière alerte pour ce domaine
        dernieres_alertes[payload['domain']] = alerte
        
        print(f"✅ Alerte reçue: {alerte['domain'].upper()} - {alerte['category']}")
        
        return jsonify({"status": "OK", "alert_id": alerte['id']}), 200
    
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/status', methods=['GET'])
def envoyer_status():
    """Retourne l'alerte la plus critique actuellement active"""
    # Trouver l'alerte la plus grave
    alertes_actives = [a for a in dernieres_alertes.values() if a is not None]
    
    if not alertes_actives:
        return jsonify({
            "status": "RAS",
            "message": "Système en veille",
            "domain": None,
            "category": None
        }), 200
    
    # Retourner l'alerte avec la plus haute sévérité
    alerte_critique = max(alertes_actives, key=lambda x: x['severity'])
    
    return jsonify({
        "status": "ALERTE",
        "domain": alerte_critique['domain'],
        "category": alerte_critique['category'],
        "severity": alerte_critique['severity'],
        "location": alerte_critique['location'],
        "message": alerte_critique['message'],
        "timestamp": alerte_critique['timestamp']
    }), 200

@app.route('/api/alerts', methods=['GET'])
def get_all_alerts():
    """Retourne toutes les alertes"""
    return jsonify({"alerts": alertes}), 200

@app.route('/api/alerts/<domain>', methods=['GET'])
def get_alerts_by_domain(domain):
    """Retourne les alertes d'un domaine spécifique"""
    domain_alerts = [a for a in alertes if a['domain'] == domain]
    return jsonify({"domain": domain, "alerts": domain_alerts}), 200

@app.route('/api/alerts/clear', methods=['POST'])
def clear_alerts():
    """Efface toutes les alertes"""
    global alertes
    alertes = []
    dernieres_alertes.clear()
    dernieres_alertes.update({"traffic": None, "school": None, "home": None})
    return jsonify({"status": "OK", "message": "Alertes effacées"}), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifier que le serveur est actif"""
    return jsonify({
        "status": "healthy",
        "alerts_count": len(alertes),
        "domains": {
            "traffic": "active" if dernieres_alertes['traffic'] else "idle",
            "school": "active" if dernieres_alertes['school'] else "idle",
            "home": "active" if dernieres_alertes['home'] else "idle"
        }
    }), 200

if __name__ == '__main__':
    print("🚀 CityShield API en démarrage sur http://127.0.0.1:8000")
    print("📊 Domaines: TRAFFIC | SCHOOL | HOME")
    app.run(debug=True, port=8000, host='127.0.0.1')