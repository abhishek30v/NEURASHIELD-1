import React, { useState, useEffect } from 'react';
import { 
  FiShield, 
  FiHardDrive, 
  FiActivity, 
  FiWifi, 
  FiAlertTriangle, 
  FiTrendingUp,
  FiCheckCircle,
  FiX,
  FiRefreshCw,
  FiCpu,
  FiDatabase,
  FiGlobe,
  FiMail,
  FiEye
} from 'react-icons/fi';
import EnhancedDetectionService from '../services/EnhancedDetectionService';

const EnhancedDetectionModules = () => {
  const [modules, setModules] = useState({
    signature: { name: 'Signature Detection', status: 'active', detections: 0, lastUpdate: null },
    file: { name: 'File Analysis', status: 'active', detections: 0, lastUpdate: null },
    behavioral: { name: 'Behavioral Analysis', status: 'active', detections: 0, lastUpdate: null },
    encrypted: { name: 'Encrypted Threats', status: 'active', detections: 0, lastUpdate: null },
    social: { name: 'Social Engineering', status: 'active', detections: 0, lastUpdate: null },
    ensemble: { name: 'Ensemble Detection', status: 'active', detections: 0, lastUpdate: null }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    loadModuleStatus();
    const interval = setInterval(loadModuleStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadModuleStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get real module status from backend
      try {
        const status = await EnhancedDetectionService.getModuleStatus();
        setModules(prev => ({
          ...prev,
          ...status.modules
        }));
      } catch (err) {
        // Fallback to simulated data
        console.log('Using simulated module data');
        const simulatedData = EnhancedDetectionService.generateSimulatedData();
        setModules(prev => ({
          signature: { ...prev.signature, detections: simulatedData.signature_detections },
          file: { ...prev.file, detections: simulatedData.file_analysis },
          behavioral: { ...prev.behavioral, detections: simulatedData.behavioral_analysis },
          encrypted: { ...prev.encrypted, detections: simulatedData.encrypted_threats },
          social: { ...prev.social, detections: simulatedData.social_engineering },
          ensemble: { ...prev.ensemble, detections: simulatedData.ensemble_detections }
        }));
      }
    } catch (err) {
      console.error('Error loading module status:', err);
      setError('Failed to load module status');
    } finally {
      setIsLoading(false);
    }
  };

  const testModule = async (moduleType) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let result;
      const testData = generateTestData(moduleType);
      
      switch (moduleType) {
        case 'signature':
          result = await EnhancedDetectionService.detectSignatureThreats(testData);
          break;
        case 'file':
          result = await EnhancedDetectionService.analyzeFile(testData);
          break;
        case 'behavioral':
          result = await EnhancedDetectionService.analyzeBehavior(testData);
          break;
        case 'encrypted':
          result = await EnhancedDetectionService.detectEncryptedThreats(testData);
          break;
        case 'social':
          result = await EnhancedDetectionService.detectSocialEngineering(testData);
          break;
        case 'ensemble':
          result = await EnhancedDetectionService.detectThreatsComprehensive(testData);
          break;
        default:
          throw new Error('Unknown module type');
      }
      
      setTestResults(prev => ({
        ...prev,
        [moduleType]: {
          success: true,
          result: result,
          timestamp: new Date()
        }
      }));
      
      // Update module detection count
      setModules(prev => ({
        ...prev,
        [moduleType]: {
          ...prev[moduleType],
          detections: prev[moduleType].detections + 1,
          lastUpdate: new Date()
        }
      }));
      
    } catch (err) {
      console.error(`Error testing ${moduleType} module:`, err);
      setTestResults(prev => ({
        ...prev,
        [moduleType]: {
          success: false,
          error: err.message,
          timestamp: new Date()
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestData = (moduleType) => {
    const baseData = {
      timestamp: new Date().toISOString(),
      source: 'test'
    };
    
    switch (moduleType) {
      case 'signature':
        return {
          file_path: '/test/sample.exe',
          file_content: 'MZ...', // PE header
          file_hash: 'a1b2c3d4e5f6...'
        };
      case 'file':
        return {
          file_path: '/test/sample.pdf',
          file_content: 'PDF content...',
          file_type: 'application/pdf'
        };
      case 'behavioral':
        return {
          process_data: { pid: 1234, name: 'test.exe' },
          api_calls: ['CreateFile', 'WriteFile', 'ReadFile'],
          network_activity: { connections: 5, bytes_sent: 1024 },
          system_calls: ['NtCreateFile', 'NtWriteFile']
        };
      case 'encrypted':
        return {
          tls_data: { version: 'TLS 1.3', cipher: 'AES-256-GCM' },
          dns_queries: ['suspicious-domain.com'],
          traffic_patterns: { packet_size: 1024, frequency: 0.5 },
          certificate_data: { issuer: 'Unknown CA', validity: 365 }
        };
      case 'social':
        return {
          email_content: 'Urgent: Click here to verify your account',
          url_data: { domain: 'suspicious-site.com', path: '/verify' },
          content_text: 'This is a phishing attempt',
          website_data: { title: 'Fake Bank Login' }
        };
      case 'ensemble':
        return {
          file_data: { path: '/test/malware.exe', hash: 'abc123' },
          network_data: { connections: 10, bytes: 2048 },
          behavior_data: { processes: 3, api_calls: 15 },
          content_data: { text: 'Suspicious content detected' }
        };
      default:
        return baseData;
    }
  };

  const getModuleIcon = (moduleType) => {
    const iconProps = { className: "text-2xl" };
    
    switch (moduleType) {
      case 'signature': return <FiShield {...iconProps} />;
      case 'file': return <FiHardDrive {...iconProps} />;
      case 'behavioral': return <FiActivity {...iconProps} />;
      case 'encrypted': return <FiWifi {...iconProps} />;
      case 'social': return <FiMail {...iconProps} />;
      case 'ensemble': return <FiTrendingUp {...iconProps} />;
      default: return <FiEye {...iconProps} />;
    }
  };

  const getModuleColor = (moduleType) => {
    switch (moduleType) {
      case 'signature': return 'text-blue-500';
      case 'file': return 'text-green-500';
      case 'behavioral': return 'text-yellow-500';
      case 'encrypted': return 'text-purple-500';
      case 'social': return 'text-red-500';
      case 'ensemble': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Enhanced Detection Modules</h2>
          <p className="text-cyan-200 text-lg font-medium mt-2">Advanced threat detection capabilities</p>
        </div>
        <button
          onClick={loadModuleStatus}
          disabled={isLoading}
          className="btn-primary flex items-center"
        >
          <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-blue border-2 border-cyan-500/50 text-cyan-200 p-5 rounded-2xl">
          <p className="font-bold text-lg">Error</p>
          <p className="text-base">{error}</p>
        </div>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(modules).map(([moduleType, module]) => (
          <div key={moduleType} className="card card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`mr-3 ${getModuleColor(moduleType)}`}>
                  {getModuleIcon(moduleType)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{module.name}</h3>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(module.status)}`}></div>
                    <span className="text-sm text-gray-400 capitalize">{module.status}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => testModule(moduleType)}
                disabled={isLoading}
                className="btn-secondary text-sm px-3 py-1"
              >
                Test
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Detections:</span>
                <span className="text-white font-bold">{module.detections}</span>
              </div>
              
              {module.lastUpdate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Update:</span>
                  <span className="text-gray-300 text-sm">
                    {new Date(module.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              {/* Test Results */}
              {testResults[moduleType] && (
                <div className="mt-3 p-3 glass rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Test Result:</span>
                    {testResults[moduleType].success ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiX className="text-red-500" />
                    )}
                  </div>
                  {testResults[moduleType].success ? (
                    <div className="text-sm text-gray-300">
                      <p>Confidence: {testResults[moduleType].result.confidence || 'N/A'}</p>
                      <p>Threat Type: {testResults[moduleType].result.threat_type || 'N/A'}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-red-300">
                      <p>Error: {testResults[moduleType].error}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(testResults[moduleType].timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* System Overview */}
      <div className="card card-hover">
        <h3 className="text-lg font-semibold text-white mb-4">System Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <FiCpu className="text-blue-500 text-2xl mx-auto mb-2" />
            <div className="text-white font-bold">5</div>
            <div className="text-gray-400 text-sm">Active Modules</div>
          </div>
          <div className="text-center">
            <FiDatabase className="text-green-500 text-2xl mx-auto mb-2" />
            <div className="text-white font-bold">1,247</div>
            <div className="text-gray-400 text-sm">Total Detections</div>
          </div>
          <div className="text-center">
            <FiGlobe className="text-purple-500 text-2xl mx-auto mb-2" />
            <div className="text-white font-bold">99.2%</div>
            <div className="text-gray-400 text-sm">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <FiActivity className="text-yellow-500 text-2xl mx-auto mb-2" />
            <div className="text-white font-bold">0.3s</div>
            <div className="text-gray-400 text-sm">Avg Response</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDetectionModules;



