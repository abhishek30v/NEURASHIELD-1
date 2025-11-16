import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiActivity, FiShield, FiRefreshCw, FiTrendingUp, FiCpu, FiHardDrive, FiWifi } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import WebSocketService from '../services/WebSocketService';
import AlertService from '../services/AlertService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EnhancedDashboard = () => {
  // State variables
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    total_alerts: 0,
    open_alerts: 0,
    resolved_alerts: 0,
    critical_alerts: 0,
    high_alerts: 0,
    medium_alerts: 0,
    low_alerts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Enhanced detection data
  const [detectionStats, setDetectionStats] = useState({
    signature_detections: 0,
    file_analysis: 0,
    behavioral_analysis: 0,
    encrypted_threats: 0,
    social_engineering: 0,
    ensemble_detections: 0
  });
  
  // Real-time data for graphs
  const [networkData, setNetworkData] = useState({
    timestamps: [],
    inbound: [],
    outbound: [],
    threats: [],
    anomaly_scores: []
  });
  
  const [threatTypes, setThreatTypes] = useState({
    'Malware': 0,
    'Phishing': 0,
    'DDoS': 0,
    'Brute Force': 0,
    'Port Scanning': 0,
    'Data Exfiltration': 0
  });
  
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  });
  
  const navigate = useNavigate();
  
  // Initialize data and set up WebSocket
  useEffect(() => {
    console.log('[EnhancedDashboard] Component mounted');
    
    // Function to load initial data
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch alerts
        const alerts = await AlertService.fetchAlerts();
        console.log('[EnhancedDashboard] Loaded initial alerts:', alerts.length);
        setAlerts(alerts);
        
        // Fetch summary
        try {
          const summaryData = await AlertService.getDashboardSummary();
          console.log('[EnhancedDashboard] Loaded dashboard summary:', summaryData);
          setSummary(summaryData);
        } catch (err) {
          console.error('[EnhancedDashboard] Error loading summary, calculating from alerts');
          updateSummaryFromAlerts(alerts);
        }
        
        // Load enhanced detection stats
        await loadEnhancedStats();
        
        // Initialize real-time data
        initializeRealTimeData();
        
        setLastUpdated(new Date());
      } catch (err) {
        console.error('[EnhancedDashboard] Error loading initial data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load enhanced detection statistics
    const loadEnhancedStats = async () => {
      try {
        // Simulate enhanced detection stats (in real implementation, these would come from the backend)
        setDetectionStats({
          signature_detections: Math.floor(Math.random() * 50) + 10,
          file_analysis: Math.floor(Math.random() * 30) + 5,
          behavioral_analysis: Math.floor(Math.random() * 40) + 8,
          encrypted_threats: Math.floor(Math.random() * 20) + 3,
          social_engineering: Math.floor(Math.random() * 25) + 4,
          ensemble_detections: Math.floor(Math.random() * 60) + 15
        });
        
        // Simulate threat type distribution
        setThreatTypes({
          'Malware': Math.floor(Math.random() * 20) + 5,
          'Phishing': Math.floor(Math.random() * 15) + 3,
          'DDoS': Math.floor(Math.random() * 10) + 2,
          'Brute Force': Math.floor(Math.random() * 12) + 4,
          'Port Scanning': Math.floor(Math.random() * 18) + 6,
          'Data Exfiltration': Math.floor(Math.random() * 8) + 1
        });
        
        // Simulate system metrics
        setSystemMetrics({
          cpu: Math.floor(Math.random() * 30) + 10,
          memory: Math.floor(Math.random() * 40) + 20,
          disk: Math.floor(Math.random() * 25) + 15,
          network: Math.floor(Math.random() * 50) + 30
        });
        
      } catch (err) {
        console.error('[EnhancedDashboard] Error loading enhanced stats:', err);
      }
    };
    
    // Initialize real-time data for graphs
    const initializeRealTimeData = () => {
      const now = new Date();
      const timestamps = [];
      const inbound = [];
      const outbound = [];
      const threats = [];
      const anomaly_scores = [];
      
      // Generate last 24 hours of data
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        timestamps.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        
        // Simulate realistic network traffic patterns
        const baseInbound = 50 + Math.sin(i * 0.5) * 20;
        const baseOutbound = 30 + Math.cos(i * 0.3) * 15;
        
        inbound.push(Math.max(0, baseInbound + (Math.random() - 0.5) * 20));
        outbound.push(Math.max(0, baseOutbound + (Math.random() - 0.5) * 15));
        
        // Simulate threat detections (higher during certain hours)
        const threatProbability = i >= 8 && i <= 18 ? 0.3 : 0.1;
        threats.push(Math.random() < threatProbability ? Math.floor(Math.random() * 5) + 1 : 0);
        
        // Simulate anomaly scores
        anomaly_scores.push(Math.random() * 2);
      }
      
      setNetworkData({
        timestamps,
        inbound,
        outbound,
        threats,
        anomaly_scores
      });
    };
    
    // Handler for WebSocket connection status changes
    const handleConnectionChange = (isConnected) => {
      console.log('[EnhancedDashboard] WebSocket connection status:', isConnected);
      setIsConnected(isConnected);
    };
    
    // Handler for new alert messages
    const handleNewAlert = (alert) => {
      if (!alert || !alert.id) {
        console.error('[EnhancedDashboard] Received invalid alert:', alert);
        return;
      }
      
      console.log('[EnhancedDashboard] Received alert via WebSocket:', alert.threat_type);
      
      // Add alert to service
      AlertService.addAlert(alert);
      
      // Update component state
      setAlerts(current => {
        const exists = current.some(a => a.id === alert.id);
        
        if (exists) {
          return current.map(a => a.id === alert.id ? alert : a);
        } else {
          return [alert, ...current];
        }
      });
      
      // Update summary
      updateSummaryForAlert(alert, true);
      
      // Update threat types
      if (alert.threat_type) {
        setThreatTypes(prev => ({
          ...prev,
          [alert.threat_type]: (prev[alert.threat_type] || 0) + 1
        }));
      }
      
      // Update real-time data
      updateRealTimeData(alert);
      
      setLastUpdated(new Date());
    };
    
    // Update real-time data with new alert
    const updateRealTimeData = (alert) => {
      const now = new Date();
      setNetworkData(prev => {
        const newTimestamps = [...prev.timestamps.slice(1), now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })];
        const newThreats = [...prev.threats.slice(1), 1];
        const newAnomalyScores = [...prev.anomaly_scores.slice(1), Math.random() * 2];
        
        return {
          ...prev,
          timestamps: newTimestamps,
          threats: newThreats,
          anomaly_scores: newAnomalyScores
        };
      });
    };
    
    // Connect to WebSocket
    WebSocketService.connect();
    
    // Subscribe to events
    const unsubscribeConnection = WebSocketService.subscribe('connection', handleConnectionChange);
    const unsubscribeAlert = WebSocketService.subscribe('alert', handleNewAlert);
    
    // Load initial data
    loadInitialData();
    
    // Set up real-time data updates
    const interval = setInterval(() => {
      updateRealTimeData({});
    }, 30000); // Update every 30 seconds
    
    // Clean up on unmount
    return () => {
      console.log('[EnhancedDashboard] Component unmounting');
      unsubscribeConnection();
      unsubscribeAlert();
      clearInterval(interval);
    };
  }, []);
  
  // Helper function to calculate summary stats from alerts array
  const updateSummaryFromAlerts = (alerts) => {
    const stats = {
      total_alerts: alerts.length,
      open_alerts: 0,
      resolved_alerts: 0,
      critical_alerts: 0,
      high_alerts: 0,
      medium_alerts: 0,
      low_alerts: 0
    };
    
    alerts.forEach(alert => {
      if (alert.status === 'resolved') {
        stats.resolved_alerts++;
      } else {
        stats.open_alerts++;
      }
      
      switch(alert.severity) {
        case 'critical': stats.critical_alerts++; break;
        case 'high': stats.high_alerts++; break;
        case 'medium': stats.medium_alerts++; break;
        case 'low': stats.low_alerts++; break;
        default: break;
      }
    });
    
    setSummary(stats);
  };
  
  // Helper function to update summary for a single alert
  const updateSummaryForAlert = (alert, isNew = false) => {
    setSummary(prev => {
      const newSummary = { ...prev };
      
      if (isNew) {
        newSummary.total_alerts++;
        
        if (alert.status === 'resolved') {
          newSummary.resolved_alerts++;
        } else {
          newSummary.open_alerts++;
        }
        
        switch(alert.severity) {
          case 'critical': newSummary.critical_alerts++; break;
          case 'high': newSummary.high_alerts++; break;
          case 'medium': newSummary.medium_alerts++; break;
          case 'low': newSummary.low_alerts++; break;
          default: break;
        }
      }
      
      return newSummary;
    });
  };
  
  // Handler for manual refresh
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      
      const alerts = await AlertService.fetchAlerts();
      setAlerts(alerts);
      
      try {
        const summaryData = await AlertService.getDashboardSummary();
        setSummary(summaryData);
      } catch (err) {
        updateSummaryFromAlerts(alerts);
      }
      
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(`Failed to refresh: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test function to create a new alert
  const createTestAlert = async () => {
    try {
      const response = await fetch('http://localhost:8000/test-alert');
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const result = await response.json();
      console.log('Test alert created:', result);
    } catch (err) {
      console.error('Error creating test alert:', err);
    }
  };
  
  // Chart data configurations
  const networkTrafficData = {
    labels: networkData.timestamps,
    datasets: [
      {
        label: 'Detected Threats',
        data: networkData.threats,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Network Activity',
        data: networkData.inbound,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Anomaly Score',
        data: networkData.anomaly_scores,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        yAxisID: 'y2'
      }
    ]
  };
  
  const threatSeverityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [summary.low_alerts, summary.medium_alerts, summary.high_alerts, summary.critical_alerts],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 69, 19, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 69, 19)'
        ],
        borderWidth: 2
      }
    ]
  };
  
  const attackVectorsData = {
    labels: Object.keys(threatTypes),
    datasets: [
      {
        label: 'Occurrence Rate',
        data: Object.values(threatTypes),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(147, 51, 234)',
          'rgb(59, 130, 246)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 2
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          usePointStyle: true
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: 'white' },
        grid: { drawOnChartArea: false }
      },
      y2: {
        type: 'linear',
        display: false,
        position: 'right',
        ticks: { color: 'white' }
      }
    }
  };
  
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          usePointStyle: true
        }
      }
    }
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  };
  
  // Show loading state
  if (isLoading && !alerts.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/10 to-indigo-950/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 mb-3">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Real-time threat monitoring and analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection status indicator */}
            <div className="flex items-center glass px-4 py-2 rounded-xl">
              <div className={`h-3 w-3 rounded-full mr-3 ${isConnected ? 'status-online' : 'status-offline'}`}></div>
              <span className="text-sm text-white">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Last updated time */}
            {lastUpdated && (
              <div className="text-sm text-gray-300 glass px-4 py-2 rounded-xl">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            
            {/* Refresh button */}
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="btn-purple-outline flex items-center"
            >
              <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            {/* Test button */}
            <button 
              onClick={createTestAlert}
              className="btn-purple-primary"
            >
              Create Test Alert
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="glass-purple border-2 border-purple-500/50 text-purple-200 p-5 mb-6 rounded-2xl">
            <p className="font-bold text-lg">Connection Error</p>
            <p className="text-base">{error}</p>
          </div>
        )}
        
        {/* Enhanced Detection Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="card card-hover text-center">
            <FiShield className="text-blue-500 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{detectionStats.signature_detections}</div>
            <div className="text-sm text-gray-400">Signature</div>
          </div>
          <div className="card card-hover text-center">
            <FiHardDrive className="text-green-500 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{detectionStats.file_analysis}</div>
            <div className="text-sm text-gray-400">File Analysis</div>
          </div>
          <div className="card card-hover text-center">
            <FiActivity className="text-yellow-500 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{detectionStats.behavioral_analysis}</div>
            <div className="text-sm text-gray-400">Behavioral</div>
          </div>
          <div className="card card-hover text-center">
            <FiWifi className="text-purple-500 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{detectionStats.encrypted_threats}</div>
            <div className="text-sm text-gray-400">Encrypted</div>
          </div>
          <div className="card card-hover text-center">
            <FiAlertTriangle className="text-red-500 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{detectionStats.social_engineering}</div>
            <div className="text-sm text-gray-400">Social Eng.</div>
          </div>
          <div className="card card-hover text-center">
            <FiTrendingUp className="text-indigo-500 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{detectionStats.ensemble_detections}</div>
            <div className="text-sm text-gray-400">Ensemble</div>
          </div>
        </div>
        
        {/* System Resources and Anomalies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card card-hover">
            <h2 className="text-xl font-semibold text-white mb-4">System Resources</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiCpu className="text-yellow-500 mr-2" />
                  <span className="text-white">CPU</span>
                </div>
                <div className="text-white font-bold">{systemMetrics.cpu}%</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${systemMetrics.cpu}%`}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiHardDrive className="text-teal-500 mr-2" />
                  <span className="text-white">Memory</span>
                </div>
                <div className="text-white font-bold">{systemMetrics.memory}%</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full" style={{width: `${systemMetrics.memory}%`}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiWifi className="text-blue-500 mr-2" />
                  <span className="text-white">Network</span>
                </div>
                <div className="text-white font-bold">{systemMetrics.network}%</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: `${systemMetrics.network}%`}}></div>
              </div>
            </div>
          </div>
          
          <div className="card card-hover">
            <h2 className="text-xl font-semibold text-white mb-4">Detected Anomalies</h2>
            <div className="flex flex-col items-center justify-center h-full">
              <FiCheckCircle className="text-green-500 text-6xl mb-4" />
              <p className="text-white text-lg mb-2">No anomalies detected</p>
              <p className="text-gray-400 text-sm">Network traffic patterns appear normal</p>
            </div>
          </div>
        </div>
        
        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Network Activity vs Threats Chart */}
          <div className="card card-hover">
            <h3 className="text-lg font-semibold text-white mb-4">Network Activity vs Threats</h3>
            <div className="h-64">
              <Line data={networkTrafficData} options={chartOptions} />
            </div>
          </div>
          
          {/* Threat Severity Distribution */}
          <div className="card card-hover">
            <h3 className="text-lg font-semibold text-white mb-4">Threat Severity Distribution</h3>
            <div className="h-64">
              <Doughnut data={threatSeverityData} options={doughnutOptions} />
            </div>
          </div>
        </div>
        
        {/* Attack Vectors Chart */}
        <div className="card card-hover mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Detected Attack Vectors</h3>
          <div className="h-48">
            <Bar data={attackVectorsData} options={barOptions} />
          </div>
        </div>
        
        {/* Recent Warning Events */}
        <div className="card card-hover mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Warning Events</h2>
            <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
              {alerts.length} events
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FiCheckCircle className="mx-auto mb-2 text-4xl" />
                <p>No warning events recorded</p>
              </div>
            ) : (
              alerts.slice(0, 10).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                  <div className="flex items-center">
                    <FiAlertTriangle className="text-red-500 mr-3" />
                    <div>
                      <p className="text-white font-medium">{alert.threat_type || 'Unknown Threat'}</p>
                      <p className="text-gray-400 text-sm">{alert.message || 'No description'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                      alert.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                      alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {alert.severity || 'Unknown'}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'No timestamp'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;


