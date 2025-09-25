import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import InventoryPage from './components/InventoryPage';
import PurchaseOrderPage from './components/PurchaseOrderPage';
import CreatePurchaseOrder from './components/CreatePurchaseOrder';
import ReportDashboard from './components/ReportDashboard';
import EmployeeHoursReport from './components/EmployeeHoursReport';
import ProjectBreakdownReport from './components/ProjectBreakdownReport';
import MRFManagement from './components/MRFManagement';
import axios from 'axios';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/status');
      if (response.data.authenticated) {
        setIsAuthenticated(true);
        setUser(response.data.username);
        setUserRoles(response.data.authorities);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
              <Login onLogin={checkAuthStatus} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard user={user} userRoles={userRoles} onLogout={() => {
                setIsAuthenticated(false);
                setUser(null);
                setUserRoles(null);
              }} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/inventory" 
            element={
              isAuthenticated && userRoles && userRoles.some(role => role.authority === 'ROLE_PROJECTMANAGER') ? 
              <InventoryPage /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/purchase-orders" 
            element={
              isAuthenticated && userRoles && userRoles.some(role => role.authority === 'ROLE_PROJECTMANAGER') ? 
              <PurchaseOrderPage /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/purchase-orders/create" 
            element={
              isAuthenticated && userRoles && userRoles.some(role => role.authority === 'ROLE_PROJECTMANAGER') ? 
              <CreatePurchaseOrder /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/reports/cashflow" 
            element={
              isAuthenticated && userRoles && userRoles.some(role => role.authority === 'ROLE_ADMIN') ? 
              <ReportDashboard /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/reports/employee-hours" 
            element={
              isAuthenticated && userRoles && userRoles.some(role => role.authority === 'ROLE_ADMIN') ? 
              <EmployeeHoursReport /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/reports/project-breakdown" 
            element={
              isAuthenticated && userRoles && userRoles.some(role => role.authority === 'ROLE_ADMIN') ? 
              <ProjectBreakdownReport /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/mrf" 
            element={
              isAuthenticated && userRoles && (
                userRoles.some(role => role.authority === 'ROLE_PROJECTMANAGER') ||
                userRoles.some(role => role.authority === 'ROLE_ADMIN') ||
                userRoles.some(role => role.authority === 'ROLE_SUPER_ADMIN')
              ) ? 
              <MRFManagement /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;