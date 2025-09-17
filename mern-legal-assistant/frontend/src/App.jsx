// App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import CaseSummarizer from './components/CaseSummarizer';
import ContractAnalyzer from './components/ContractAnalyzer';
import RecommendSections from './components/RecommendSections';
import History from './components/History';
import Login from './components/Login';
import Signup from './components/Signup';

import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 📦 AuthLayout for Login/Signup
const AuthLayout = () => (
  <div className="auth-layout">
    <Outlet />
  </div>
);

// 🧠 Main App Layout
const AppLayout = ({ user }) => {
  const [activeTab, setActiveTab] = useState('summarizer');
  const [sharedInput, setSharedInput] = useState('');
  const navigate = useNavigate();

  const loadFromHistory = (tab, text) => {
    setSharedInput(text);
    setActiveTab(tab);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      window.location.reload(); // Ensures clean state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderTab = () => {
    const props = { sharedInput, setSharedInput };
    switch (activeTab) {
      case 'summarizer': return <CaseSummarizer {...props} />;
      case 'analyzer': return <ContractAnalyzer {...props} />;
      case 'sections': return <RecommendSections {...props} />;
      case 'history': return <History onLoadFromHistory={loadFromHistory} />;
      default: return <CaseSummarizer {...props} />;
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Legal AI Assistant</h1>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Logged in as: <strong>{user.email}</strong>
          </p>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-button ${activeTab === 'summarizer' ? 'active' : ''}`} onClick={() => setActiveTab('summarizer')}>
            <span className="nav-icon">📝</span> <span className="nav-text">Case Summarizer</span>
          </button>
          <button className={`nav-button ${activeTab === 'analyzer' ? 'active' : ''}`} onClick={() => setActiveTab('analyzer')}>
            <span className="nav-icon">📄</span> <span className="nav-text">Contract Analyzer</span>
          </button>
          <button className={`nav-button ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>
            <span className="nav-icon">⚖️</span> <span className="nav-text">Recommend Sections</span>
          </button>
          <button className={`nav-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <span className="nav-icon">🕘</span> <span className="nav-text">History</span>
          </button>
          <button className="nav-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span> <span className="nav-text">Logout</span>
          </button>
        </nav>
      </div>

      <main className="main-content">{renderTab()}</main>
    </div>
  );
};

// 🔐 Auth Provider to track current user
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return children(user);
};

// 🚀 Main App
const App = () => {
  return (
    <>
      <ToastContainer /> {/* ✅ GLOBAL toast container */}
      <Router>
        <AuthProvider>
          {(user) => {
            const handleLogin = (userData) => {
              console.log('✅ Authenticated:', userData.email);
            };

            return (
              <Routes>
                {/* Auth Pages */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login onLogin={handleLogin} />} />
                  <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
                </Route>

                {/* Main App Pages */}
                <Route
                  path="/*"
                  element={user ? <AppLayout user={user} /> : <Navigate to="/login" replace />}
                />
              </Routes>
            );
          }}
        </AuthProvider>
      </Router>
    </>
  );
};

export default App;

