import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://cti-dashboard-api.onrender.com/api';

function App() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!target.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/scan`, { target });
      setResult(response.data);
      loadHistory();
      loadStats();
    } catch (error) {
      console.error('Scan error:', error);
      setResult({ error: 'Scan failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛡️ CTI Dashboard</h1>
      
      <form onSubmit={handleScan} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter IP, domain, or URL to scan..."
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !target.trim()}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
        >
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </form>

      <div style={{ marginBottom: '20px' }}>
        <h3>Statistics</h3>
        <div>Total Scans: {stats.total_scans || 0}</div>
        <div>IP Scans: {stats.ip_scans || 0}</div>
        <div>Domain Scans: {stats.domain_scans || 0}</div>
        <div>URL Scans: {stats.url_scans || 0}</div>
      </div>

      {result && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
          <h3>Scan Results for: {result.target}</h3>
          {result.error ? (
            <div style={{ color: 'red' }}>Error: {result.error}</div>
          ) : (
            <div>
              <h4>VirusTotal:</h4>
              <div>Detections: {result.virustotal?.positives || 0} / {result.virustotal?.total || 0}</div>
              
              {result.abuseipdb && (
                <div>
                  <h4>AbuseIPDB:</h4>
                  <div>Abuse Confidence: {result.abuseipdb.data?.abuseConfidencePercentage || 0}%</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h3>Recent Scans</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Target</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>VT Detections</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 10).map((scan, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{scan.target}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{scan.target_type}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {scan.virustotal_result?.positives || 0} / {scan.virustotal_result?.total || 0}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {new Date(scan.scan_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
