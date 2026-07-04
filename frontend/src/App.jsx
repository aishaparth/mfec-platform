import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageErrorBoundary from './components/PageErrorBoundary';
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

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buckwheat-suitability" element={<BuckwheatSuitability />} />
            <Route path="/wine-fruits" element={<WineFruits />} />
            <Route path="/crop-health" element={<PageErrorBoundary><CropHealth /></PageErrorBoundary>} />
            <Route path="/climate-risk" element={<ClimateRisk />} />
            <Route path="/water-management" element={<WaterManagement />} />
            <Route path="/priority-zones" element={<PriorityZones />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/weather" element={<Weather />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
