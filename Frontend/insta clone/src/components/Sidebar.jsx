import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  SearchIcon, 
  ExploreIcon, 
  ReelsIcon, 
  MessagesIcon, 
  NotificationsIcon, 
  CreateIcon, 
  MoreIcon 
} from './Icons';

const Sidebar = ({ onCreateClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMore(false);
  };

  // Get avatar URL properly
  const getAvatarUrl = () => {
    if (!user?.avatar) return `https://i.pravatar.cc/150?u=${user?.username || 'default'}`;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `http://localhost:3001${user.avatar}`;
  };

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <NavLink to="/" className="logo-link">
          <span className="logo-text">INSTAU</span>
        </NavLink>
      </div>

      {/* Navigation Items */}
      <div className="nav-items">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <HomeIcon active={false} />
          <span className="nav-label">Home</span>
        </NavLink>

        <button className="nav-item">
          <SearchIcon />
          <span className="nav-label">Search</span>
        </button>

        <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ExploreIcon active={false} />
          <span className="nav-label">Explore</span>
        </NavLink>

        <NavLink to="/reels" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ReelsIcon active={false} />
          <span className="nav-label">Reels</span>
        </NavLink>

        <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessagesIcon active={false} />
          <span className="nav-label">Messages</span>
        </NavLink>

        <button className="nav-item">
          <NotificationsIcon active={false} />
          <span className="nav-label">Notifications</span>
        </button>

        <button className="nav-item" onClick={onCreateClick}>
          <CreateIcon />
          <span className="nav-label">Create</span>
        </button>

        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-profile-wrapper">
            <img 
              src={getAvatarUrl()} 
              alt="Profile" 
              className="nav-profile-pic"
            />
          </div>
          <span className="nav-label">Profile</span>
        </NavLink>
      </div>

      {/* Footer with More */}
      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => setShowMore(!showMore)}>
          <MoreIcon />
          <span className="nav-label">More</span>
        </button>
        
        {showMore && (
          <div className="more-menu">
            <button className="more-item">
              <span className="more-icon">⚙️</span>
              <span>Settings</span>
            </button>
            <button className="more-item">
              <span className="more-icon">📊</span>
              <span>Your activity</span>
            </button>
            <button className="more-item">
              <span className="more-icon">🔖</span>
              <span>Saved</span>
            </button>
            <button className="more-item">
              <span className="more-icon">🌙</span>
              <span>Switch appearance</span>
            </button>
            <button className="more-item">
              <span className="more-icon">⚠️</span>
              <span>Report a problem</span>
            </button>
            <div className="more-divider"></div>
            <button className="more-item">
              <span className="more-icon">🔄</span>
              <span>Switch accounts</span>
            </button>
            <button className="more-item logout-item" onClick={handleLogout}>
              <span className="more-icon">🚪</span>
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
