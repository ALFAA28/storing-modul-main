import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SSOCallback from './pages/SSOCallback';
import DashboardGuru from './pages/DashboardGuru';
import DashboardAdmin from './pages/DashboardAdmin';
import UploadModal from './components/UploadModal';
import ReviewModal from './components/ReviewModal';
import { authService } from './services/api';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  if (!authService.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(authService.getUser());
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editModulData, setEditModulData] = useState(null);
  const [selectedReviewDoc, setSelectedReviewDoc] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const rawRole = user?.role || 'guru';
  const role = (rawRole === 'admin' || rawRole === 'pengawas') ? 'admin' : 'guru';

  // Listen for storage changes (e.g. after login)
  useEffect(() => {
    const handleStorage = () => {
      setUser(authService.getUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoginSuccess = () => {
    setUser(authService.getUser());
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  const handleOpenReview = (doc) => {
    setSelectedReviewDoc(doc);
  };

  const handleOpenEdit = (doc) => {
    setEditModulData(doc);
    setIsUploadOpen(true);
  };

  const handleOpenNewUpload = () => {
    setEditModulData(null);
    setIsUploadOpen(true);
  };

  return (
    <Router>
      <Routes>
        {/* Login Route (public) */}
        <Route 
          path="/login" 
          element={
            authService.isLoggedIn() 
              ? <Navigate to={role === 'admin' ? '/admin' : '/guru'} replace /> 
              : <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />

        {/* SSO Callback Route */}
        <Route path="/sso-callback" element={<SSOCallback />} />

        {/* Guru Route (protected) */}
        <Route 
          path="/guru" 
          element={
            <ProtectedRoute>
              <Layout 
                role={role} 
                user={user}
                onUploadClick={handleOpenNewUpload}
                onLogout={handleLogout}
              >
                <DashboardGuru 
                  user={user}
                  onOpenUpload={handleOpenNewUpload} 
                  onOpenEdit={handleOpenEdit}
                  refreshTrigger={refreshTrigger}
                  onOpenReview={handleOpenReview}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Route (protected) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Layout 
                role={role} 
                user={user}
                onUploadClick={handleOpenNewUpload}
                onLogout={handleLogout}
              >
                <DashboardAdmin 
                  refreshTrigger={refreshTrigger}
                  onOpenReview={handleOpenReview}
                  onOpenEdit={handleOpenEdit}
                />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback Redirection */}
        <Route 
          path="*" 
          element={
            authService.isLoggedIn()
              ? <Navigate to={role === 'admin' ? '/admin' : '/guru'} replace />
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>

      {/* Upload & Edit Modal */}
      <UploadModal 
        isOpen={isUploadOpen} 
        editData={editModulData}
        onClose={() => {
          setIsUploadOpen(false);
          setEditModulData(null);
        }} 
        onUploadSuccess={triggerRefresh}
      />

      {/* PDF Review Modal (Admin/Supervisor & Guru View) */}
      <ReviewModal 
        isOpen={!!selectedReviewDoc} 
        document={selectedReviewDoc} 
        role={role}
        onClose={() => setSelectedReviewDoc(null)} 
        onReviewSuccess={triggerRefresh}
      />
    </Router>
  );
}
