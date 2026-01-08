import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const Suggestions = () => {
  const { user, logout } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Demo/fallback suggestions - always show these
  const demoSuggestions = [
    { _id: 'demo1', username: 'travel_explorer', name: 'Travel Explorer', avatar: null, followersCount: 12500, reason: 'Popular' },
    { _id: 'demo2', username: 'food_lover', name: 'Food Lover', avatar: null, followersCount: 8500, reason: 'Suggested for you' },
    { _id: 'demo3', username: 'tech_daily', name: 'Tech Daily', avatar: null, followersCount: 45000, reason: 'Popular' },
    { _id: 'demo4', username: 'art_gallery', name: 'Art Gallery', avatar: null, followersCount: 23000, reason: 'Suggested for you' },
    { _id: 'demo5', username: 'fitness_pro', name: 'Fitness Pro', avatar: null, followersCount: 18000, reason: 'Popular' },
  ];

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getSuggestions();
      if (res.data.success && res.data.data.length > 0) {
        setSuggestions(res.data.data.slice(0, 5));
      } else {
        // Use demo suggestions if no real ones
        setSuggestions(demoSuggestions);
      }
    } catch (err) {
      // Use demo suggestions on error
      setSuggestions(demoSuggestions);
    }
    setLoading(false);
  };

  const handleFollow = async (userId) => {
    const isFollowing = followingIds.has(userId);
    
    // Optimistic update
    if (isFollowing) {
      setFollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } else {
      setFollowingIds(prev => new Set([...prev, userId]));
    }
    
    // Only call API for real users (not demo)
    if (!userId.startsWith('demo')) {
      try {
        if (isFollowing) {
          await usersAPI.unfollow(userId);
        } else {
          await usersAPI.follow(userId);
        }
      } catch (err) {
        // Revert on error
        if (isFollowing) {
          setFollowingIds(prev => new Set([...prev, userId]));
        } else {
          setFollowingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }
      }
    }
  };

  const getAvatarUrl = (avatar, username) => {
    if (!avatar) return `https://i.pravatar.cc/150?u=${username}`;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:3001${avatar}`;
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <aside className="suggestions-panel">
      {/* Current User */}
      <div className="current-user">
        <img 
          src={getAvatarUrl(user?.avatar, user?.username)} 
          alt={user?.username} 
          className="current-user-avatar"
        />
        <div className="current-user-info">
          <span className="current-username">{user?.username || 'username'}</span>
          <span className="current-name">{user?.name || 'Your Name'}</span>
        </div>
        <button className="switch-btn" onClick={logout}>Switch</button>
      </div>
      
      {/* Suggestions Header */}
      <div className="suggestions-header">
        <span>Suggested for you</span>
        <button className="see-all-btn">See All</button>
      </div>
      
      {/* Suggestions List */}
      <div className="suggestions-list">
        {suggestions.map((suggestion) => (
          <div key={suggestion._id} className="suggestion-item">
            <img 
              src={getAvatarUrl(suggestion.avatar, suggestion.username)} 
              alt={suggestion.username}
              className="suggestion-avatar"
            />
            <div className="suggestion-info">
              <span className="suggestion-username">{suggestion.username}</span>
              <span className="suggestion-label">
                {suggestion.followersCount 
                  ? `${formatFollowers(suggestion.followersCount)} followers`
                  : suggestion.reason || 'Suggested for you'}
              </span>
            </div>
            <button 
              className={`follow-link ${followingIds.has(suggestion._id) ? 'following' : ''}`}
              onClick={() => handleFollow(suggestion._id)}
            >
              {followingIds.has(suggestion._id) ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
      
      {/* Footer Links */}
      <footer className="suggestions-footer">
        <nav className="footer-nav">
          About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language · Meta Verified
        </nav>
        <p className="copyright">© 2024 INSTAU</p>
      </footer>
    </aside>
  );
};

export default Suggestions;
