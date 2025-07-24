from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sqlite3
import json
from datetime import datetime
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Complete CORS Configuration
CORS(app, 
     origins=[
         "https://cti-dashboard-frontend.onrender.com",  # Your Render frontend
         "http://localhost:3000",                        # Local development
         "https://*.onrender.com",                       # Any Render subdomain
         "http://127.0.0.1:3000",                        # Alternative localhost
         "http://localhost:3001"                         # Alternative port
     ],
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=[
         'Content-Type',
         'Authorization',
         'Access-Control-Allow-Credentials',
         'Access-Control-Allow-Origin',
         'Access-Control-Allow-Headers',
         'Access-Control-Allow-Methods',
         'Origin',
         'Accept',
         'X-Requested-With'
     ],
     supports_credentials=True,
     expose_headers=['Content-Type', 'Authorization']
)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    allowed_origins = [
        "https://cti-dashboard-frontend.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,Accept,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    
    return response

# Handle preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,Origin,Accept,X-Requested-With")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

# Your API Keys
VIRUSTOTAL_API = os.getenv('VIRUSTOTAL_API', 'cf38a3903a1a87ddda8be9ce77405b3a48cbbaf5d0be7dd5a539a3e7f3339171')
ABUSEIPDB_API = os.getenv('ABUSEIPDB_API', 'cfe32c805ab88fec494b59a1e8c99b264eb372b82970b42ee686072a864c551460296de8800dfad7')
DATABASE_PATH = os.getenv('DATABASE_PATH', 'database.db')

def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DATABASE_PATH)
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
    """Save scan result to SQLite database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO scan_history (target, target_type, virustotal_result, abuseipdb_result)
        VALUES (?, ?, ?, ?)
    ''', (target, target_type, json.dumps(vt_result), json.dumps(abuse_result)))
    
    conn.commit()
    conn.close()

def get_scan_history():
    """Get scan history from SQLite database"""
    conn = sqlite3.connect(DATABASE_PATH)
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
    """Detect if target is IP, domain, or URL"""
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    url_pattern = r'^https?://'
    
    if re.match(ip_pattern, target):
        return 'ip'
    elif re.match(url_pattern, target):
        return 'url'
    else:
        return 'domain'

def scan_virustotal(target, target_type):
    """Scan target using VirusTotal API"""
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
    """Scan IP using AbuseIPDB API"""
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

@app.route('/api/scan', methods=['POST', 'OPTIONS'])
def scan_target():
    """Main scanning endpoint"""
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight for scan endpoint'})
    
    try:
        data = request.get_json()
        target = data.get('target', '').strip()
        
        if not target:
            return jsonify({'error': 'Target is required'}), 400
        
        target_type = detect_target_type(target)
        
        # Scan with VirusTotal
        vt_result = scan_virustotal(target, target_type)
        
        # Scan with AbuseIPDB (only for IPs)
        abuse_result = None
        if target_type == 'ip':
            abuse_result = scan_abuseipdb(target)
        
        # Save to database
        save_scan_result(target, target_type, vt_result, abuse_result)
        
        return jsonify({
            'target': target,
            'target_type': target_type,
            'virustotal': vt_result,
            'abuseipdb': abuse_result,
            'scan_date': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET', 'OPTIONS'])
def get_history():
    """Get scan history"""
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight for history endpoint'})
    
    history = get_scan_history()
    return jsonify(history)

@app.route('/api/stats', methods=['GET', 'OPTIONS'])
def get_stats():
    """Get basic statistics"""
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight for stats endpoint'})
    
    conn = sqlite3.connect(DATABASE_PATH)
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

@app.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    """Health check endpoint for Render"""
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight for health endpoint'})
    
    return jsonify({
        'status': 'healthy',
        'message': 'CTI Dashboard Backend is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/', methods=['GET', 'OPTIONS'])
def root():
    """Root endpoint"""
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight for root endpoint'})
    
    return jsonify({
        'message': 'CTI Dashboard API is running',
        'created_by': 'Suprodip Biswas (BTech Student)',
        'endpoints': {
            'scan': '/api/scan',
            'history': '/api/history',
            'stats': '/api/stats',
            'health': '/health'
        }
    })

if __name__ == '__main__':
    init_db()
    print("🛡️ CTI Dashboard Backend Starting...")
    print("🔑 VirusTotal API configured")
    print("🔑 AbuseIPDB API configured")
    print("💾 SQLite database initialized")
    print("🌐 Server running at http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
