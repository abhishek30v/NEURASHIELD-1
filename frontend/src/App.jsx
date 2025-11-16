import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import EnhancedDashboard from "./components/EnhancedDashboard";
import EnhancedDetectionModules from "./components/EnhancedDetectionModules";
import MalwareTestSuite from "./components/MalwareTestSuite";
import Auth from "./components/Auth";
import SimpleAlertsPage from "./pages/SimpleAlertsPage";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-indigo-950/30">
          <Sidebar />
          <main className="lg:ml-70 transition-all duration-300">
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />

              {/* Direct alert monitoring page - no auth required */}
              <Route path="/alerts-simple" element={<SimpleAlertsPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <EnhancedDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Enhanced Detection Modules */}
              <Route
                path="/detection-modules"
                element={
                  <ProtectedRoute>
                    <EnhancedDetectionModules />
                  </ProtectedRoute>
                }
              />

              {/* Malware Test Suite */}
              <Route
                path="/test-suite"
                element={
                  <ProtectedRoute>
                    <MalwareTestSuite />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route redirects to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
