import React, { useState, useRef } from 'react';
import { postsAPI, storiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreatePost = ({ onClose, onPostCreated }) => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [postType, setPostType] = useState('post'); // 'post' or 'story'
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const getAvatarUrl = (avatar, username) => {
    if (!avatar) return `https://i.pravatar.cc/150?u=${username}`;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:3001${avatar}`;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File too large. Max 10MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setStep(2);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!image) return;

    setLoading(true);
    setError('');

    try {
      let res;
      
      if (postType === 'story') {
        res = await storiesAPI.createStory({ image });
      } else {
        res = await postsAPI.createPost({ image, caption, location });
      }
      
      if (res.data.success) {
        onPostCreated && onPostCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to create ${postType}`);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {step === 2 && (
            <button className="modal-back" onClick={() => setStep(1)}>←</button>
          )}
          <span className="modal-title">
            {step === 1 ? 'Create new' : postType === 'story' ? 'New Story' : 'New post'}
          </span>
          {step === 2 && (
            <button 
              className="modal-share" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Sharing...' : 'Share'}
            </button>
          )}
          {step === 1 && <div />}
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="modal-error">{error}</div>}
        
        {step === 1 ? (
          <div className="modal-body">
            {/* Post Type Selector */}
            <div className="post-type-selector">
              <button 
                className={`type-btn ${postType === 'post' ? 'active' : ''}`}
                onClick={() => setPostType('post')}
              >
                📷 Post
              </button>
              <button 
                className={`type-btn ${postType === 'story' ? 'active' : ''}`}
                onClick={() => setPostType('story')}
              >
                ⭕ Story
              </button>
            </div>
            
            <svg aria-label="Icon to represent media" fill="currentColor" height="77" viewBox="0 0 97.6 77.3" width="96">
              <path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.77 2.31 4.9 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" fill="currentColor"/>
              <path d="M84.7 18.4 58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z" fill="currentColor"/>
              <path d="M78.2 41.6 61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z" fill="currentColor"/>
            </svg>
            <h3>Drag photos and videos here</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              hidden
            />
            <button className="select-btn" onClick={() => fileInputRef.current?.click()}>
              Select from computer
            </button>
          </div>
        ) : (
          <div className="create-content">
            <div className="create-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
            {postType === 'post' && (
              <div className="create-form">
                <div className="create-user">
                  <img src={getAvatarUrl(user?.avatar, user?.username)} alt={user?.username} />
                  <span>{user?.username || 'username'}</span>
                </div>
                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                />
                <div className="caption-count">{caption.length}/2,200</div>
                <input
                  type="text"
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="location-input"
                />
              </div>
            )}
            {postType === 'story' && (
              <div className="create-form story-form">
                <p className="story-info">Your story will be visible for 24 hours</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
