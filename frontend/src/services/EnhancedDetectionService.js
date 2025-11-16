/**
 * Enhanced Detection Service
 * Integrates with all enhanced threat detection modules
 */

class EnhancedDetectionService {
  constructor() {
    this.baseURL = 'http://localhost:8000';
  }

  // Signature-based detection
  async detectSignatureThreats(fileData) {
    try {
      const response = await fetch(`${this.baseURL}/api/signature/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: fileData.file_path,
          file_content: fileData.file_content,
          file_hash: fileData.file_hash
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in signature detection:', error);
      throw error;
    }
  }

  // File analysis
  async analyzeFile(fileData) {
    try {
      const response = await fetch(`${this.baseURL}/api/file/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: fileData.file_path,
          file_content: fileData.file_content,
          file_type: fileData.file_type
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in file analysis:', error);
      throw error;
    }
  }

  // Behavioral analysis
  async analyzeBehavior(behaviorData) {
    try {
      const response = await fetch(`${this.baseURL}/api/behavioral/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          process_data: behaviorData.process_data,
          api_calls: behaviorData.api_calls,
          network_activity: behaviorData.network_activity,
          system_calls: behaviorData.system_calls
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in behavioral analysis:', error);
      throw error;
    }
  }

  // Encrypted threat detection
  async detectEncryptedThreats(trafficData) {
    try {
      const response = await fetch(`${this.baseURL}/api/encrypted/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tls_data: trafficData.tls_data,
          dns_queries: trafficData.dns_queries,
          traffic_patterns: trafficData.traffic_patterns,
          certificate_data: trafficData.certificate_data
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in encrypted threat detection:', error);
      throw error;
    }
  }

  // Social engineering detection
  async detectSocialEngineering(contentData) {
    try {
      const response = await fetch(`${this.baseURL}/api/social-engineering/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_content: contentData.email_content,
          url_data: contentData.url_data,
          content_text: contentData.content_text,
          website_data: contentData.website_data
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in social engineering detection:', error);
      throw error;
    }
  }

  // Comprehensive threat detection (ensemble)
  async detectThreatsComprehensive(threatData) {
    try {
      const response = await fetch(`${this.baseURL}/api/enhanced/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_data: threatData.file_data,
          network_data: threatData.network_data,
          behavior_data: threatData.behavior_data,
          content_data: threatData.content_data
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in comprehensive threat detection:', error);
      throw error;
    }
  }

  // Advanced threat detection
  async detectAdvancedThreats(advancedData) {
    try {
      const response = await fetch(`${this.baseURL}/api/enhanced/advanced-detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zero_day_data: advancedData.zero_day_data,
          fileless_data: advancedData.fileless_data,
          ai_generated_data: advancedData.ai_generated_data,
          advanced_persistence: advancedData.advanced_persistence
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in advanced threat detection:', error);
      throw error;
    }
  }

  // Get detection statistics
  async getDetectionStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/detection-stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting detection stats:', error);
      throw error;
    }
  }

  // Get module status
  async getModuleStatus() {
    try {
      const response = await fetch(`${this.baseURL}/api/module-status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting module status:', error);
      throw error;
    }
  }

  // Simulate real-time detection data (for demo purposes)
  generateSimulatedData() {
    return {
      signature_detections: Math.floor(Math.random() * 50) + 10,
      file_analysis: Math.floor(Math.random() * 30) + 5,
      behavioral_analysis: Math.floor(Math.random() * 40) + 8,
      encrypted_threats: Math.floor(Math.random() * 20) + 3,
      social_engineering: Math.floor(Math.random() * 25) + 4,
      ensemble_detections: Math.floor(Math.random() * 60) + 15,
      threat_types: {
        'Malware': Math.floor(Math.random() * 20) + 5,
        'Phishing': Math.floor(Math.random() * 15) + 3,
        'DDoS': Math.floor(Math.random() * 10) + 2,
        'Brute Force': Math.floor(Math.random() * 12) + 4,
        'Port Scanning': Math.floor(Math.random() * 18) + 6,
        'Data Exfiltration': Math.floor(Math.random() * 8) + 1
      },
      system_metrics: {
        cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
        disk: Math.floor(Math.random() * 25) + 15,
        network: Math.floor(Math.random() * 50) + 30
      }
    };
  }

  // Generate real-time network data
  generateNetworkData() {
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
    
    return {
      timestamps,
      inbound,
      outbound,
      threats,
      anomaly_scores
    };
  }
}

export default new EnhancedDetectionService();



