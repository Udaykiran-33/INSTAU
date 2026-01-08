import React, { useState, useEffect } from 'react';
import Stories from '../components/Stories';
import Post from '../components/Post';
import Suggestions from '../components/Suggestions';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await postsAPI.getFeed();
      if (res.data.success && res.data.data.length > 0) {
        setPosts(res.data.data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.log('Feed fetch error:', err.message);
      setPosts([]);
    }
    setLoading(false);
  };

  const handleLike = (postId, isLiked) => {
    setPosts(posts.map(post => 
      post._id === postId 
        ? { ...post, isLiked, likesCount: isLiked ? (post.likesCount || 0) + 1 : (post.likesCount || 0) - 1 }
        : post
    ));
  };

  const handleComment = (postId, text) => {
    setPosts(posts.map(post => 
      post._id === postId 
        ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
        : post
    ));
  };

  const handleDeletePost = async (postId) => {
    const originalPosts = [...posts];
    setPosts(posts.filter(post => post._id !== postId));
    
    try {
      await postsAPI.deletePost(postId);
    } catch (err) {
      setPosts(originalPosts);
      console.error('Delete post error:', err);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="home-layout">
          <div className="feed-container">
            <div className="loading-posts">
              <div className="loading-spinner"></div>
              Loading your feed...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="home-layout">
        <div className="feed-container">
          <Stories />
          
          {posts.length > 0 ? (
            posts.map((post) => (
              <Post 
                key={post._id} 
                post={{
                  _id: post._id,
                  userId: post.user?._id,
                  username: post.user?.username,
                  avatar: post.user?.avatar,
                  verified: post.user?.verified,
                  image: post.image,
                  likes: post.likesCount ?? post.likes?.length ?? 0,
                  isLiked: post.isLiked || false,
                  isSaved: post.isSaved || false,
                  caption: post.caption,
                  comments: post.commentsCount ?? post.comments?.length ?? 0,
                  recentComments: post.comments?.slice(0, 2) || [],
                  location: post.location,
                  createdAt: post.createdAt
                }}
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDeletePost}
                isOwner={post.user?._id === user?._id || post.user?.username === user?.username}
              />
            ))
          ) : (
            <div className="empty-feed">
              <div className="empty-feed-icon">📷</div>
              <h2>Welcome to INSTAU</h2>
              <p>Start by creating your first post or following other users to see their posts here.</p>
              <p className="empty-feed-hint">Click <strong>Create</strong> in the sidebar to share your first photo!</p>
            </div>
          )}
        </div>
        
        <Suggestions />
      </div>
    </div>
  );
};

export default Home;
