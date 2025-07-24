import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Use your deployed backend URL
const API_BASE = 'https://cti-dashboard-backend.onrender.com/api';

function App() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadHistory();
    loadStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false
      });
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
      const response = await axios.post(`${API_BASE}/scan`, 
        { target },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: false
        }
      );
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

  const getThreatLevel = (vtResult) => {
    if (!vtResult || vtResult.error) return 'unknown';
    const positives = vtResult.positives || 0;
    if (positives === 0) return 'clean';
    if (positives <= 2) return 'low';
    if (positives <= 5) return 'medium';
    return 'high';
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'clean': return '#10B981';
      case 'low': return '#F59E0B';
      case 'medium': return '#F97316';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getThreatGradient = (level) => {
    switch (level) {
      case 'clean': return 'linear-gradient(135deg, #10B981, #059669)';
      case 'low': return 'linear-gradient(135deg, #F59E0B, #D97706)';
      case 'medium': return 'linear-gradient(135deg, #F97316, #EA580C)';
      case 'high': return 'linear-gradient(135deg, #EF4444, #DC2626)';
      default: return 'linear-gradient(135deg, #6B7280, #4B5563)';
    }
  };

  const pulseAnimation = {
    animation: 'pulse 2s infinite',
  };

  const fadeInAnimation = {
    animation: 'fadeIn 0.5s ease-in',
  };

  const styles = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
      50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); }
    }
    
    .card-hover {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .card-hover:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    
    .scan-button-hover {
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .scan-button-hover:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
    }
    
    .scan-button-hover:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    .scan-button-hover:hover:before {
      left: 100%;
    }
  `;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{styles}</style>
      
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 0
      }}></div>

      <div style={{ 
        position: 'relative',
        zIndex: 1,
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          color: 'white',
          ...fadeInAnimation
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{
              fontSize: '60px',
              animation: 'glow 2s infinite alternate'
            }}>🛡️</div>
            <h1 style={{ 
              fontSize: '48px',
              margin: '0',
              fontWeight: '700',
              background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '-1px'
            }}>
              CTI Dashboard
            </h1>
          </div>
          
          <p style={{ 
            fontSize: '18px',
            margin: '0 0 10px 0',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '300'
          }}>
            Advanced Cyber Threat Intelligence Portal
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '10px'
          }}>
            <div>🕒 {currentTime.toLocaleTimeString()}</div>
            <div>•</div>
            <div>📅 {currentTime.toLocaleDateString()}</div>
          </div>
          
          {/* Creator Attribution */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '25px',
            padding: '12px 24px',
            display: 'inline-block',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: '500'
          }}>
            <span style={{ marginRight: '8px' }}>👨‍💻</span>
            Created by <strong>Suprodip Biswas</strong> • BTech Student
          </div>
        </div>

        {/* Main Dashboard Container */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          ...fadeInAnimation
        }}>
          
          {/* Scan Section */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#1f2937',
              marginBottom: '20px',
              fontSize: '24px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              🔍 Threat Intelligence Scanner
            </h2>
            
            <form onSubmit={handleScan} style={{ 
              display: 'flex',
              gap: '15px',
              alignItems: 'stretch',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="🌐 Enter IP address, domain, or URL to scan..."
                  style={{ 
                    width: '100%',
                    padding: '18px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '15px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                  }}
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !target.trim()}
                className="scan-button-hover"
                style={{ 
                  padding: '18px 36px',
                  background: loading ? 
                    'linear-gradient(135deg, #9ca3af, #6b7280)' : 
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  whiteSpace: 'nowrap',
                  ...(loading ? pulseAnimation : {})
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Scanning...
                  </span>
                ) : (
                  '🚀 Scan Now'
                )}
              </button>
            </form>
          </div>

          {/* Statistics Cards */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {[
              { title: 'Total Scans', value: stats.total_scans || 0, icon: '📊', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', bg: 'rgba(99, 102, 241, 0.1)' },
              { title: 'IP Scans', value: stats.ip_scans || 0, icon: '🌐', gradient: 'linear-gradient(135deg, #10b981, #059669)', bg: 'rgba(16, 185, 129, 0.1)' },
              { title: 'Domain Scans', value: stats.domain_scans || 0, icon: '🏠', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', bg: 'rgba(245, 158, 11, 0.1)' },
              { title: 'URL Scans', value: stats.url_scans || 0, icon: '🔗', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', bg: 'rgba(239, 68, 68, 0.1)' }
            ].map((stat, index) => (
              <div
                key={index}
                className="card-hover"
                style={{ 
                  background: stat.gradient,
                  color: 'white',
                  padding: '30px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  transform: 'rotate(45deg)'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{stat.icon}</div>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '500', opacity: 0.9 }}>
                    {stat.title}
                  </h3>
                  <h2 style={{ margin: '0', fontSize: '42px', fontWeight: '700', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                    {stat.value}
                  </h2>
                </div>
              </div>
            ))}
          </div>

          {/* Results Section */}
          {result && (
            <div style={{ 
              marginBottom: '40px',
              ...fadeInAnimation
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                borderRadius: '20px',
                padding: '30px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
              }}>
                <h3 style={{ 
                  marginTop: '0',
                  marginBottom: '25px',
                  color: '#1e293b',
                  fontSize: '22px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  🛡️ Scan Results for: <span style={{ 
                    fontFamily: 'monospace',
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    color: '#1d4ed8'
                  }}>{result.target}</span>
                </h3>
                
                {result.error ? (
                  <div style={{ 
                    color: '#b91c1c',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    textAlign: 'center',
                    fontSize: '16px'
                  }}>
                    ❌ <strong>Error:</strong> {result.error}
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '25px'
                  }}>
                    {/* VirusTotal Card */}
                    <div className="card-hover" style={{ 
                      background: 'white',
                      borderRadius: '15px',
                      padding: '25px',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '24px', marginRight: '10px' }}>🔍</span>
                        <h4 style={{ margin: '0', color: '#374151', fontSize: '18px', fontWeight: '600' }}>
                          VirusTotal Analysis
                        </h4>
                      </div>
                      
                      {result.virustotal && !result.virustotal.error ? (
                        <div>
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '15px',
                            padding: '15px',
                            borderRadius: '10px',
                            background: getThreatGradient(getThreatLevel(result.virustotal)),
                            color: 'white'
                          }}>
                            <span style={{ fontWeight: '600' }}>Threat Level</span>
                            <span style={{ 
                              fontSize: '18px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '1px'
                            }}>
                              {getThreatLevel(result.virustotal)}
                            </span>
                          </div>
                          
                          <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: '#6b7280', fontWeight: '500' }}>Detections:</span>
                              <span style={{ fontWeight: '600', color: '#374151' }}>
                                {result.virustotal.positives || 0} / {result.virustotal.total || 0}
                              </span>
                            </div>
                            
                            <div style={{
                              width: '100%',
                              height: '8px',
                              background: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${((result.virustotal.positives || 0) / (result.virustotal.total || 1)) * 100}%`,
                                height: '100%',
                                background: getThreatColor(getThreatLevel(result.virustotal)),
                                borderRadius: '4px',
                                transition: 'width 1s ease'
                              }}></div>
                            </div>
                          </div>
                          
                          {result.virustotal.permalink && (
                            <a href={result.virustotal.permalink} target="_blank" rel="noopener noreferrer" 
                               style={{ 
                                 display: 'inline-flex',
                                 alignItems: 'center',
                                 gap: '8px',
                                 color: '#3b82f6',
                                 textDecoration: 'none',
                                 fontWeight: '500',
                                 padding: '8px 16px',
                                 borderRadius: '8px',
                                 background: 'rgba(59, 130, 246, 0.1)',
                                 transition: 'all 0.3s ease'
                               }}
                               onMouseOver={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.2)'}
                               onMouseOut={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                            >
                              <span>View Full Report</span>
                              <span>→</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#6b7280',
                          textAlign: 'center',
                          padding: '20px',
                          fontStyle: 'italic'
                        }}>
                          {result.virustotal?.error || 'No data available'}
                        </div>
                      )}
                    </div>

                    {/* AbuseIPDB Card */}
                    <div className="card-hover" style={{ 
                      background: 'white',
                      borderRadius: '15px',
                      padding: '25px',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '24px', marginRight: '10px' }}>🛡️</span>
                        <h4 style={{ margin: '0', color: '#374151', fontSize: '18px', fontWeight: '600' }}>
                          AbuseIPDB Analysis
                        </h4>
                      </div>
                      
                      {result.abuseipdb && !result.abuseipdb.error ? (
                        <div style={{ space: '15px' }}>
                          {[
                            { label: 'Abuse Confidence', value: `${result.abuseipdb.data?.abuseConfidencePercentage || 0}%`, icon: '⚠️' },
                            { label: 'Usage Type', value: result.abuseipdb.data?.usageType || 'Unknown', icon: '🏷️' },
                            { label: 'Country', value: result.abuseipdb.data?.countryCode || 'Unknown', icon: '🌍' }
                          ].map((item, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              marginBottom: '10px',
                              background: '#f8fafc',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{item.icon}</span>
                                <span style={{ color: '#6b7280', fontWeight: '500' }}>{item.label}:</span>
                              </div>
                              <span style={{ fontWeight: '600', color: '#374151' }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#6b7280',
                          textAlign: 'center',
                          padding: '20px',
                          fontStyle: 'italic'
                        }}>
                          {result.abuseipdb?.error || result.abuseipdb?.message || 'No data available'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Section */}
          <div>
            <h3 style={{ 
              color: '#1f2937',
              marginBottom: '25px',
              fontSize: '22px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              📋 Recent Scan History
            </h3>
            
            <div style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
                      {['Target', 'Type', 'VT Detections', 'Date'].map((header, index) => (
                        <th key={index} style={{ 
                          padding: '20px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#374151',
                          fontSize: '14px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 10).map((scan, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ 
                          padding: '16px 20px',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          color: '#1e293b',
                          fontWeight: '500'
                        }}>
                          {scan.target}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: scan.target_type === 'ip' ? 'rgba(59, 130, 246, 0.1)' : 
                                       scan.target_type === 'domain' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: scan.target_type === 'ip' ? '#1d4ed8' :
                                   scan.target_type === 'domain' ? '#047857' : '#b45309'
                          }}>
                            {scan.target_type}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '16px 20px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          <span style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#5b21b6',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}>
                            {scan.virustotal_result?.positives || 0} / {scan.virustotal_result?.total || 0}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '16px 20px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          {new Date(scan.scan_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {history.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280',
                  fontSize: '16px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
                  <p>No scan history yet. Start by scanning your first target!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '15px',
            display: 'inline-block',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <p style={{ margin: '0', fontWeight: '500' }}>
              🚀 Powered by VirusTotal & AbuseIPDB APIs • Developed with ❤️ by <strong>Suprodip Biswas</strong>
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
