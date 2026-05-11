import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabase/supabaseClient';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inventory from './pages/Inventory.jsx'; 
import DeletedItems from './pages/DeletedItems.jsx'; 
import Users from './pages/Users.jsx'; 
import Layout from './components/Layout.jsx';

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Kunin ang initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.email);
      setLoading(false);
    });

    // 2. Makinig sa changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function para i-verify kung Admin/Superadmin
  const checkAdminStatus = (email) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }
    const SUPER_ADMIN = "jcesperanza@neu.edu.ph";
    const ADMINS = [
      "luiskenneth.fajardo@neu.edu.ph",
      "romeofelipe.fetalvo@neu.edu.ph",
      "robbyrein.barrera@neu.edu.ph",
      "kayelaine.diaz@neu.edu.ph",
      "cassandrajadealiyah.perez@neu.edu.ph"
    ];
    setIsAdmin(email === SUPER_ADMIN || ADMINS.includes(email.toLowerCase()));
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading Hope PMS...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} /> 
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes for ALL logged in users */}
        <Route path="/dashboard" element={
          session ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />
        } />

        <Route path="/inventory" element={
          session ? <Layout><Inventory /></Layout> : <Navigate to="/login" />
        } />

        {/* Restricted Routes: ADMIN & SUPERADMIN ONLY */}
        <Route path="/archive" element={
          session && isAdmin ? (
            <Layout><DeletedItems /></Layout>
          ) : (
            <Navigate to="/dashboard" /> // I-kick out pag hindi admin
          )
        } />

        <Route path="/users" element={
          session && isAdmin ? (
            <Layout><Users /></Layout>
          ) : (
            <Navigate to="/dashboard" /> // I-kick out pag hindi admin
          )
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;