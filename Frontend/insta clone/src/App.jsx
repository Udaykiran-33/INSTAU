import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import CreatePost from './components/CreatePost';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Reels from './pages/Reels';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App Layout
const AppLayout = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshFeed, setRefreshFeed] = useState(0);

  const handlePostCreated = () => {
    setRefreshFeed(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <Sidebar onCreateClick={() => setShowCreateModal(true)} />
      <Routes>
        <Route path="/" element={<Home key={refreshFeed} />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
      {showCreateModal && (
        <CreatePost 
          onClose={() => setShowCreateModal(false)} 
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
