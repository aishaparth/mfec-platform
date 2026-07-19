import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import PageErrorBoundary from './components/PageErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BuckwheatSuitability from './pages/BuckwheatSuitability';
import WineFruits from './pages/WineFruits';
import CropHealth from './pages/CropHealth';
import ClimateRisk from './pages/ClimateRisk';
import WaterManagement from './pages/WaterManagement';
import PriorityZones from './pages/PriorityZones';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function PublicPortal({ children }) {
  return (
    <ProtectedRoute>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>} />

            <Route path="/" element={<PublicPortal><Home /></PublicPortal>} />
            <Route path="/buckwheat-suitability" element={<PublicPortal><BuckwheatSuitability /></PublicPortal>} />
            <Route path="/wine-fruits" element={<PublicPortal><WineFruits /></PublicPortal>} />
            <Route path="/crop-health" element={<PublicPortal><PageErrorBoundary><CropHealth /></PageErrorBoundary></PublicPortal>} />
            <Route path="/climate-risk" element={<PublicPortal><ClimateRisk /></PublicPortal>} />
            <Route path="/water-management" element={<PublicPortal><WaterManagement /></PublicPortal>} />
            <Route path="/priority-zones" element={<PublicPortal><PriorityZones /></PublicPortal>} />
            <Route path="/dashboard" element={<PublicPortal><Dashboard /></PublicPortal>} />
            <Route path="/weather" element={<PublicPortal><Weather /></PublicPortal>} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
