import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await usersAPI.searchUsers(searchQuery);
        if (res.data.success) {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
      setSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Focus input when search panel opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getUserAvatar = (userItem) => {
    if (!userItem?.avatar) return `https://i.pravatar.cc/150?u=${userItem?.username || 'default'}`;
    if (userItem.avatar.startsWith('http')) return userItem.avatar;
    return `http://localhost:3001${userItem.avatar}`;
  };

  return (
    <>
      <nav className={`sidebar ${showSearch ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <NavLink to="/" className="logo-link">
            <span className="logo-text">{showSearch ? 'I' : 'INSTAU'}</span>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="nav-items">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <HomeIcon active={false} />
            <span className="nav-label">Home</span>
          </NavLink>

          <button className={`nav-item ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(!showSearch)}>
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

      {/* Search Panel */}
      {showSearch && (
        <div className="search-panel">
          <div className="search-panel-header">
            <h2>Search</h2>
          </div>
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="search-clear" 
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="search-results">
            {searching ? (
              <div className="search-loading">Searching...</div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="search-no-results">No users found</div>
            ) : (
              searchResults.map((userItem) => (
                <div 
                  key={userItem._id} 
                  className="search-result-item"
                  onClick={() => handleUserClick(userItem.username)}
                >
                  <img 
                    src={getUserAvatar(userItem)} 
                    alt={userItem.username}
                    className="search-result-avatar"
                  />
                  <div className="search-result-info">
                    <span className="search-result-username">
                      {userItem.username}
                      {userItem.verified && <span className="verified-badge">✓</span>}
                    </span>
                    <span className="search-result-name">{userItem.name || userItem.username}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

