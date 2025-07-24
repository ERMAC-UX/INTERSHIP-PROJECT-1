from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sqlite3
import json
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)

# Your API Keys
VIRUSTOTAL_API = "cf38a3903a1a87ddda8be9ce77405b3a48cbbaf5d0be7dd5a539a3e7f3339171"
ABUSEIPDB_API = "cfe32c805ab88fec494b59a1e8c99b264eb372b82970b42ee686072a864c551460296de8800dfad7"

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target TEXT NOT NULL,
            target_type TEXT NOT NULL,
            virustotal_result TEXT,
            abuseipdb_result TEXT,
            scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_scan_result(target, target_type, vt_result, abuse_result):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO scan_history (target, target_type, virustotal_result, abuseipdb_result)
        VALUES (?, ?, ?, ?)
    ''', (target, target_type, json.dumps(vt_result), json.dumps(abuse_result)))
    conn.commit()
    conn.close()

def get_scan_history():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT target, target_type, virustotal_result, abuseipdb_result, scan_date
        FROM scan_history ORDER BY scan_date DESC LIMIT 50
    ''')
    results = cursor.fetchall()
    conn.close()
    
    history = []
    for row in results:
        history.append({
            'target': row[0],
            'target_type': row[1],
            'virustotal_result': json.loads(row[2]) if row[2] else None,
            'abuseipdb_result': json.loads(row[3]) if row[3] else None,
            'scan_date': row[4]
        })
    return history

def detect_target_type(target):
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    url_pattern = r'^https?://'
    
    if re.match(ip_pattern, target):
        return 'ip'
    elif re.match(url_pattern, target):
        return 'url'
    else:
        return 'domain'

def scan_virustotal(target, target_type):
    try:
        if target_type == 'ip':
            url = "https://www.virustotal.com/vtapi/v2/ip-address/report"
            params = {'apikey': VIRUSTOTAL_API, 'ip': target}
        elif target_type == 'domain':
            url = "https://www.virustotal.com/vtapi/v2/domain/report"
            params = {'apikey': VIRUSTOTAL_API, 'domain': target}
        elif target_type == 'url':
            url = "https://www.virustotal.com/vtapi/v2/url/report"
            params = {'apikey': VIRUSTOTAL_API, 'resource': target}
        
        response = requests.get(url, params=params, timeout=10)
        return response.json()
    except Exception as e:
        return {'error': str(e)}

def scan_abuseipdb(target):
    try:
        if detect_target_type(target) != 'ip':
            return {'message': 'AbuseIPDB only supports IP addresses'}
        
        url = "https://api.abuseipdb.com/api/v2/check"
        headers = {
            'Key': ABUSEIPDB_API,
            'Accept': 'application/json'
        }
        params = {'ipAddress': target, 'maxAgeInDays': 90, 'verbose': ''}
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        return response.json()
    except Exception as e:
        return {'error': str(e)}

@app.route('/api/scan', methods=['POST'])
def scan_target():
    data = request.get_json()
    target = data.get('target', '').strip()
    
    if not target:
        return jsonify({'error': 'Target is required'}), 400
    
    target_type = detect_target_type(target)
    vt_result = scan_virustotal(target, target_type)
    
    abuse_result = None
    if target_type == 'ip':
        abuse_result = scan_abuseipdb(target)
    
    save_scan_result(target, target_type, vt_result, abuse_result)
    
    return jsonify({
        'target': target,
        'target_type': target_type,
        'virustotal': vt_result,
        'abuseipdb': abuse_result,
        'scan_date': datetime.now().isoformat()
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    history = get_scan_history()
    return jsonify(history)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM scan_history')
    total_scans = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM scan_history WHERE target_type = "ip"')
    ip_scans = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM scan_history WHERE target_type = "domain"')
    domain_scans = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM scan_history WHERE target_type = "url"')
    url_scans = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'total_scans': total_scans,
        'ip_scans': ip_scans,
        'domain_scans': domain_scans,
        'url_scans': url_scans
    })

if __name__ == '__main__':
    init_db()
    print("🛡️ CTI Dashboard Backend Starting...")
    print("🔑 VirusTotal API configured")
    print("🔑 AbuseIPDB API configured")
    print("💾 SQLite database initialized")
    print("🌐 Server running at http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
