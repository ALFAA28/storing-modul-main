import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardGuru from './pages/DashboardGuru';
import DashboardAdmin from './pages/DashboardAdmin';
import UploadModal from './components/UploadModal';
import ReviewModal from './components/ReviewModal';
import { authService } from './services/api';

export default function App() {
  const [role, setRole] = useState('guru'); // Default role for demo
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedReviewDoc, setSelectedReviewDoc] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const autoLogin = async () => {
      try {
        let email = 'guru@sekolah.com';
        if (role === 'admin') {
          email = 'admin@sekolah.com';
        }
        
        await authService.login(email, 'password123');
        console.log(`Auto logged in as ${email}. Token stored.`);
        triggerRefresh();
      } catch (err) {
        console.error("Gagal melakukan auto login ke backend:", err);
      }
    };
    autoLogin();
  }, [role]);

  const handleOpenReview = (doc) => {
    setSelectedReviewDoc(doc);
  };

  return (
    <Router>
      <Layout 
        role={role} 
        setRole={setRole} 
        onUploadClick={() => setIsUploadOpen(true)}
      >
        <Routes>
          {/* Guru Route */}
          <Route 
            path="/guru" 
            element={
              <DashboardGuru 
                onOpenUpload={() => setIsUploadOpen(true)} 
                refreshTrigger={refreshTrigger}
                onOpenReview={handleOpenReview}
              />
            } 
          />
          
          {/* Admin Route */}
          <Route 
            path="/admin" 
            element={
              <DashboardAdmin 
                refreshTrigger={refreshTrigger}
                onOpenReview={handleOpenReview}
              />
            } 
          />

          {/* Fallback Redirection */}
          <Route 
            path="*" 
            element={<Navigate to={role === 'guru' ? '/guru' : '/admin'} replace />} 
          />
        </Routes>
      </Layout>

      {/* Upload Modal (Guru) */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={triggerRefresh}
      />

      {/* PDF Review Modal (Admin/Supervisor) */}
      <ReviewModal 
        isOpen={!!selectedReviewDoc} 
        document={selectedReviewDoc} 
        onClose={() => setSelectedReviewDoc(null)} 
        onReviewSuccess={triggerRefresh}
      />
    </Router>
  );
}
