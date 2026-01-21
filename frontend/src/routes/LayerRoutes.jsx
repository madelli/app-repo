/**
 * Layer Routes - Multi-layer Routing Configuration
 *
 * Route Structure:
 *   /         → Layer 1 (Login portal)
 *   /layer2   → Layer 2 (Protected - requires authentication)
 *   /blog     → FirstLayer (Public blog facade)
 *   /console  → Layer 3 (Protected - agent console)
 *   /core     → Layer 4 (Protected - system core)
 *   /remote   → Layer 5 (Protected - remote interface)
 *
 * Authentication:
 *   - Layer 1 is public (login page)
 *   - All other layers require authentication via ProtectedRoute
 *   - Session managed via sessionStorage with timeout
 */
import { Routes, Route } from "react-router-dom";

// Authentication
import ProtectedRoute from "../components/ProtectedRoute";

// Layer Components
import Layer1 from "../components/Layer1";
import FirstLayer from "../components/FirstLayer";
import SecondLayer from "../components/SecondLayer";
import AgentConsole from "../components/AgentConsole";
import CoreLayer from "../components/CoreLayer";
import RemoteInterface from "../components/RemoteInterface";

const LayerRoutes = () => {
  return (
    <Routes>
      {/* Layer 1: Public login portal */}
      <Route path="/" element={<Layer1 />} />

      {/* Public blog facade (accessible without auth for cover) */}
      <Route path="/blog" element={<FirstLayer />} />

      {/* Layer 2: Protected - secondary interface */}
      <Route
        path="/layer2"
        element={
          <ProtectedRoute>
            <SecondLayer />
          </ProtectedRoute>
        }
      />

      {/* Layer 3: Protected - agent console */}
      <Route
        path="/console"
        element={
          <ProtectedRoute>
            <AgentConsole />
          </ProtectedRoute>
        }
      />

      {/* Layer 4: Protected - system core */}
      <Route
        path="/core"
        element={
          <ProtectedRoute>
            <CoreLayer />
          </ProtectedRoute>
        }
      />

      {/* Layer 5: Protected - remote interface */}
      <Route
        path="/remote"
        element={
          <ProtectedRoute>
            <RemoteInterface />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default LayerRoutes;
