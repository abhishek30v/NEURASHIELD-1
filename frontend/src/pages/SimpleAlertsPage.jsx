import React, { useState, useEffect } from "react";

const SimpleAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("ws://localhost:8001/ws");

        ws.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          console.log("Received message:", event.data);
          setLastMessage(event.data);

          try {
            const data = JSON.parse(event.data);
            if (data.type === "alert" && data.data) {
              setAlerts((prev) => [data.data, ...prev]);
            } else if (data.type === "initial" && data.alerts) {
              setAlerts(data.alerts);
            }
          } catch (err) {
            console.error("Error parsing message:", err);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("WebSocket connection error");
          setIsConnected(false);
        };

        return ws;
      } catch (err) {
        console.error("Error creating WebSocket:", err);
        setError("Failed to create WebSocket connection");
        return null;
      }
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const createTestAlert = async () => {
    try {
      const response = await fetch("http://localhost:8001/test-alert", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Test alert created:", data);
    } catch (err) {
      console.error("Error creating test alert:", err);
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Direct Alert Monitor
      </h1>

      <div className="glass-blue border-2 border-cyan-500/50 p-6 rounded-2xl mb-6">
        <h2 className="font-bold text-cyan-300 text-xl mb-3">
          About This Page
        </h2>
        <p className="text-cyan-200 mb-3 text-base">
          This page uses a completely standalone approach to display alerts with
          minimal dependencies. The WebSocket connection is established directly
          in the component, bypassing all other services.
        </p>
        <p className="text-cyan-200 text-base">
          If you see alerts on this page but not elsewhere in the application,
          it indicates an issue with the service implementation or state
          management in other components, not with the WebSocket or backend.
        </p>
      </div>

      {/* Connection Status */}
      <div className="card card-hover mb-6">
        <h2 className="text-xl font-bold mb-5 text-cyan-300">
          Connection Status
        </h2>
        <div className="flex items-center space-x-4 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="font-medium">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="flex space-x-3 mb-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-cyan-400 hover:to-blue-500 font-semibold shadow-lg shadow-cyan-500/50"
          >
            Connect
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-700 text-white px-5 py-2.5 rounded-xl hover:bg-slate-600 font-semibold"
          >
            Disconnect
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:from-blue-400 hover:to-cyan-400 font-semibold shadow-lg shadow-blue-500/50"
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="glass-blue border-2 border-cyan-500/50 text-cyan-200 px-5 py-4 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="card card-hover mb-6">
        <h2 className="text-xl font-bold mb-5 text-cyan-300">Test Controls</h2>
        <div className="flex space-x-3">
          <button
            onClick={createTestAlert}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:from-purple-400 hover:to-cyan-400 font-semibold shadow-lg shadow-purple-500/50"
          >
            + Create Test Alert
          </button>
          <button
            onClick={clearAlerts}
            className="bg-slate-700 text-white px-5 py-2.5 rounded-xl hover:bg-slate-600 font-semibold"
          >
            Clear Alerts
          </button>
        </div>
      </div>

      {/* Alerts Display */}
      <div className="card card-hover">
        <h2 className="text-xl font-bold mb-5 text-cyan-300">
          Alerts ({alerts.length})
        </h2>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-yellow-500 text-4xl mb-2">⚠️</div>
            <p className="text-gray-600">No alerts received yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Try creating a test alert or wait for real threats
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={alert.id || index}
                className="glass-blue border-2 border-cyan-500/30 rounded-2xl p-5 mb-4 hover:border-cyan-400/50 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{alert.threat_type}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : alert.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {alert.severity?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{alert.description}</p>
                <div className="text-sm text-gray-500">
                  <p>Method: {alert.detection_method}</p>
                  <p>Confidence: {(alert.confidence * 100).toFixed(1)}%</p>
                  <p>Time: {new Date(alert.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-6 glass-blue rounded-2xl border-2 border-cyan-500/30">
        <h2 className="font-bold text-xl mb-4 text-cyan-300">
          Troubleshooting Tips
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">If no connection is established:</h3>
            <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
              <li>
                Make sure the backend server is running at http://localhost:8000
              </li>
              <li>
                Check that the WebSocket endpoint is available at
                ws://localhost:8000/ws
              </li>
              <li>
                Use the "Reset Connection" button to force a reconnection
                attempt
              </li>
              <li>Look for CORS errors in your browser console</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">If connected but no alerts appear:</h3>
            <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
              <li>
                Use the "Create Test Alert" button to generate a test alert
              </li>
              <li>
                Check the "Last Raw Message" section to see if any data is being
                received
              </li>
              <li>
                Verify that the backend is properly generating and broadcasting
                alerts
              </li>
              <li>
                Check if there are any parse errors in your browser console
              </li>
              <li>
                Try the "Reset Connection" button to establish a fresh
                connection
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Backend Commands to Test:</h3>
            <div className="bg-gray-100 p-2 rounded font-mono text-sm mt-1 overflow-x-auto">
              <p className="mb-1">curl http://localhost:8000/test-alert</p>
              <p>curl http://localhost:8000/debug/alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAlertsPage;
