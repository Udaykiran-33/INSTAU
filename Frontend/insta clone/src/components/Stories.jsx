import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { storiesAPI } from '../services/api';

const Stories = ({ onCreateStory }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await storiesAPI.getStories();
      if (res.data.success && res.data.data) {
        // Separate user's own stories from others
        const allStories = res.data.data;
        const mine = allStories.filter(s => s.user?._id === user?._id || s.user?.username === user?.username);
        const others = allStories.filter(s => s.user?._id !== user?._id && s.user?.username !== user?.username);
        
        setMyStories(mine);
        setStories(others);
      }
    } catch (err) {
      console.log('Stories fetch error:', err);
      setStories([]);
      setMyStories([]);
    }
  };

  const getAvatarUrl = (avatar, username) => {
    if (!avatar) return `https://i.pravatar.cc/150?u=${username}`;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:3001${avatar}`;
  };

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `http://localhost:3001${img}`;
  };

  const handleViewMyStory = () => {
    if (myStories.length > 0 && myStories[0].stories?.length > 0) {
      setViewingStory(myStories[0]);
      setCurrentStoryIndex(0);
    } else {
      // No stories - open create modal
      onCreateStory && onCreateStory();
    }
  };

  const handleViewStory = async (storyGroup) => {
    setViewingStory(storyGroup);
    setCurrentStoryIndex(0);
    
    // Mark as viewed
    if (storyGroup.stories && storyGroup.stories[0]?._id) {
      try {
        await storiesAPI.viewStory(storyGroup.stories[0]._id);
      } catch (err) {}
    }
  };

  const handleCloseStory = () => {
    setViewingStory(null);
    setCurrentStoryIndex(0);
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Delete this story?')) return;
    
    try {
      await storiesAPI.deleteStory(storyId);
      setViewingStory(null);
      fetchStories(); // Refresh stories
    } catch (err) {
      console.error('Delete story error:', err);
    }
  };

  const userAvatar = getAvatarUrl(user?.avatar, user?.username);
  const hasMyStories = myStories.length > 0 && myStories[0].stories?.length > 0;

  // Demo stories to show when there are no real stories
  const demoStories = [
    { user: { _id: 'd1', username: 'travel_pics', avatar: null }, hasUnviewed: true, stories: [] },
    { user: { _id: 'd2', username: 'food_lover', avatar: null }, hasUnviewed: true, stories: [] },
    { user: { _id: 'd3', username: 'tech_news', avatar: null }, hasUnviewed: false, stories: [] },
    { user: { _id: 'd4', username: 'art_daily', avatar: null }, hasUnviewed: true, stories: [] },
    { user: { _id: 'd5', username: 'fashion_week', avatar: null }, hasUnviewed: false, stories: [] },
  ];

  const displayStories = stories.length > 0 ? stories : demoStories;

  // Get current story to display
  const currentStory = viewingStory?.stories?.[currentStoryIndex];

  return (
    <>
      <div className="stories-container">
        <div className="stories-wrapper">
          {/* Your Story */}
          <div className="story-item" onClick={handleViewMyStory}>
            <div className={`story-ring ${hasMyStories ? '' : 'add-story'}`}>
              <div className="story-avatar-wrapper">
                <img src={userAvatar} alt="Your story" className="story-avatar" />
                {!hasMyStories && <div className="add-story-badge">+</div>}
              </div>
            </div>
            <span className="story-username">Your story</span>
          </div>
          
          {/* Other Stories */}
          {displayStories.map((item, index) => (
            <div 
              key={item.user?._id || index} 
              className="story-item"
              onClick={() => handleViewStory(item)}
            >
              <div className={`story-ring ${item.hasUnviewed ? '' : 'seen'}`}>
                <div className="story-avatar-wrapper">
                  <img 
                    src={getAvatarUrl(item.user?.avatar, item.user?.username)} 
                    alt={item.user?.username} 
                    className="story-avatar"
                  />
                </div>
              </div>
              <span className="story-username">{item.user?.username?.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && (
        <div className="story-viewer-overlay" onClick={handleCloseStory}>
          <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
            {/* Progress bars */}
            <div className="story-progress-container">
              {viewingStory.stories?.map((_, idx) => (
                <div key={idx} className="story-progress-bar">
                  <div 
                    className={`story-progress ${idx < currentStoryIndex ? 'complete' : idx === currentStoryIndex ? 'active' : ''}`}
                  ></div>
                </div>
              )) || <div className="story-progress-bar"><div className="story-progress active"></div></div>}
            </div>

            <div className="story-viewer-header">
              <div className="story-viewer-user">
                <img 
                  src={getAvatarUrl(viewingStory.user?.avatar, viewingStory.user?.username)} 
                  alt={viewingStory.user?.username}
                  className="story-viewer-avatar"
                />
                <span className="story-viewer-username">{viewingStory.user?.username}</span>
                <span className="story-viewer-time">
                  {currentStory?.createdAt ? new Date(currentStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </span>
              </div>
              <div className="story-viewer-actions">
                {(viewingStory.user?.username === user?.username || viewingStory.user?._id === user?._id) && currentStory?._id && (
                  <button 
                    className="story-delete-btn"
                    onClick={() => handleDeleteStory(currentStory._id)}
                  >
                    🗑️
                  </button>
                )}
                <button className="story-close-btn" onClick={handleCloseStory}>×</button>
              </div>
            </div>
            
            <div className="story-viewer-content">
              {currentStory ? (
                <img 
                  src={getImageUrl(currentStory.image)} 
                  alt="Story" 
                  className="story-image"
                />
              ) : (
                <div className="story-placeholder">
                  <p>No story content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;
