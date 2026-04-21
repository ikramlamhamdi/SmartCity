from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Variable pour stocker la dernière alerte
derniere_alerte = {"status": "RAS", "message": "Système en veille"}

@app.route('/api/alerte', methods=['POST'])
def recevoir_alerte():
    global derniere_alerte
    derniere_alerte = request.get_json()
    derniere_alerte["status"] = "ALERTE"
    return jsonify({"res": "OK"}), 200

# Nouvelle route que React va consulter
@app.route('/api/status', methods=['GET'])
def envoyer_status():
    return jsonify(derniere_alerte)

if __name__ == '__main__':
    app.run(debug=True, port=8000)