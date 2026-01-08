import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { GridIcon, TaggedIcon, VerifiedBadge } from '../components/Icons';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', website: '' });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const targetUsername = username || currentUser?.username;
      
      if (!targetUsername) {
        setProfile(currentUser);
        setIsOwnProfile(true);
        setLoading(false);
        return;
      }

      setIsOwnProfile(!username || targetUsername === currentUser?.username);

      const res = await usersAPI.getProfile(targetUsername);
      if (res.data.success) {
        const profileData = res.data.data;
        setProfile(profileData);
        setPosts(profileData.posts || []);
        setEditForm({
          name: profileData.name || '',
          bio: profileData.bio || '',
          website: profileData.website || ''
        });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      if (!username || username === currentUser?.username) {
        setProfile({
          ...currentUser,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0
        });
        setIsOwnProfile(true);
      }
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!profile?._id) return;
    
    const wasFollowing = profile.isFollowing;
    
    setProfile(prev => ({
      ...prev,
      isFollowing: !wasFollowing,
      followersCount: wasFollowing ? prev.followersCount - 1 : prev.followersCount + 1
    }));
    
    try {
      if (wasFollowing) {
        await usersAPI.unfollow(profile._id);
      } else {
        await usersAPI.follow(profile._id);
      }
    } catch (err) {
      setProfile(prev => ({
        ...prev,
        isFollowing: wasFollowing,
        followersCount: wasFollowing ? prev.followersCount + 1 : prev.followersCount - 1
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(editForm);
      if (res.data.success) {
        const updatedData = res.data.data;
        setProfile(prev => ({ ...prev, ...updatedData }));
        updateUser({ 
          name: updatedData.name, 
          bio: updatedData.bio, 
          website: updatedData.website 
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile. Please try again.');
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Upload to server
      const res = await usersAPI.uploadAvatar(file);
      
      if (res.data.success) {
        const newAvatar = `http://localhost:3001${res.data.data.avatar}`;
        
        // Update all states
        setProfile(prev => ({ ...prev, avatar: newAvatar }));
        updateUser({ avatar: newAvatar });
        
        console.log('✅ Avatar updated:', newAvatar);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Failed to upload avatar. Please try again.');
    }
    
    setUploading(false);
    // Clear input so the same file can be selected again
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="profile-container">
          <div className="loading-posts">
            <div className="loading-spinner"></div>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  const displayProfile = profile || currentUser;
  const avatarUrl = displayProfile?.avatar?.startsWith('http') 
    ? displayProfile.avatar 
    : displayProfile?.avatar 
      ? `http://localhost:3001${displayProfile.avatar}`
      : `https://i.pravatar.cc/150?u=${displayProfile?.username}`;
  
  const followersCount = displayProfile?.followersCount ?? displayProfile?.followers?.length ?? 0;
  const followingCount = displayProfile?.followingCount ?? displayProfile?.following?.length ?? 0;
  const postsCount = posts.length || displayProfile?.postsCount || 0;

  return (
    <div className="main-content">
      <div className="profile-container">
        <header className="profile-header">
          <div className="profile-avatar-container" onClick={() => isOwnProfile && fileInputRef.current?.click()}>
            <img 
              src={avatarUrl} 
              alt={displayProfile?.username}
              className="profile-avatar"
            />
            {isOwnProfile && (
              <div className="avatar-overlay">
                {uploading ? '⏳' : '📷'}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              hidden
            />
          </div>

          <div className="profile-info">
            <div className="profile-username-row">
              <h1 className="profile-username">
                {displayProfile?.username}
                {displayProfile?.verified && <VerifiedBadge />}
              </h1>
              
              {isOwnProfile ? (
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  Edit profile
                </button>
              ) : (
                <button 
                  className={`follow-btn ${profile?.isFollowing ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  {profile?.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <div className="profile-stats">
              <span><strong>{postsCount}</strong> posts</span>
              <span><strong>{followersCount.toLocaleString()}</strong> followers</span>
              <span><strong>{followingCount.toLocaleString()}</strong> following</span>
            </div>

            <div className="profile-bio">
              <div className="profile-name">{displayProfile?.name}</div>
              {displayProfile?.bio && <p className="bio-text">{displayProfile.bio}</p>}
              {displayProfile?.website && (
                <a href={displayProfile.website.startsWith('http') ? displayProfile.website : `https://${displayProfile.website}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="profile-website">
                  {displayProfile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </header>

        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <GridIcon /> POSTS
          </button>
          <button 
            className={`profile-tab ${activeTab === 'reels' ? 'active' : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            🎬 REELS
          </button>
          <button 
            className={`profile-tab ${activeTab === 'tagged' ? 'active' : ''}`}
            onClick={() => setActiveTab('tagged')}
          >
            <TaggedIcon /> TAGGED
          </button>
        </div>

        <div className="profile-posts-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="profile-post-item">
                <img 
                  src={post.image?.startsWith('http') ? post.image : `http://localhost:3001${post.image}`} 
                  alt="Post" 
                />
                <div className="profile-post-overlay">
                  <span>❤️ {post.likes?.length || 0}</span>
                  <span>💬 {post.comments?.length || 0}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts-message">
              <div className="no-posts-icon">📷</div>
              <h3>{isOwnProfile ? 'Share Photos' : 'No Posts Yet'}</h3>
              <p>{isOwnProfile 
                ? 'When you share photos, they will appear on your profile.' 
                : 'This user hasn\'t posted anything yet.'}</p>
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <button onClick={() => setIsEditing(false)}>Cancel</button>
                <span className="modal-title">Edit profile</span>
                <button 
                  className="modal-share" 
                  onClick={handleEditSubmit}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Done'}
                </button>
              </div>
              
              <form className="edit-form" onSubmit={handleEditSubmit}>
                <div className="edit-avatar-section">
                  <img src={avatarUrl} alt="Avatar" />
                  <button type="button" onClick={() => fileInputRef.current?.click()}>
                    {uploading ? 'Uploading...' : 'Change profile photo'}
                  </button>
                </div>
                
                <div className="edit-field">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Name"
                    maxLength={50}
                  />
                </div>
                
                <div className="edit-field">
                  <label>Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Bio"
                    maxLength={150}
                  />
                  <span className="char-count">{editForm.bio.length}/150</span>
                </div>
                
                <div className="edit-field">
                  <label>Website</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    placeholder="Website"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
