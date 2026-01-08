import React, { useState } from 'react';
import { LikeIcon, CommentIcon, ShareIcon, SaveIcon, EmojiIcon, MoreDotsIcon, VerifiedBadge } from './Icons';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Post = ({ post, onLike, onComment, onDelete, isOwner }) => {
  const { user: currentUser } = useAuth();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [saved, setSaved] = useState(post.isSaved || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.recentComments || []);
  const [showOptions, setShowOptions] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
    
    if (newLiked) {
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 1000);
    }
    
    try {
      if (post._id) {
        await postsAPI.likePost(post._id);
      }
      onLike && onLike(post._id, newLiked);
    } catch (err) {
      setLiked(!newLiked);
      setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  const handleSave = async () => {
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      if (post._id) {
        await postsAPI.savePost(post._id);
      }
    } catch (err) {
      setSaved(!newSaved);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    
    setDeleting(true);
    setShowOptions(false);
    
    try {
      onDelete && onDelete(post._id);
    } catch (err) {
      console.error('Delete error:', err);
    }
    setDeleting(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
      _id: Date.now(),
      user: { username: currentUser?.username, avatar: currentUser?.avatar },
      text: comment.trim()
    };
    
    setComments(prev => [...prev, newComment]);
    const commentText = comment.trim();
    setComment('');
    
    try {
      if (post._id) {
        const res = await postsAPI.addComment(post._id, commentText);
        if (res.data.success) {
          setComments(prev => prev.map(c => 
            c._id === newComment._id ? res.data.data : c
          ));
        }
      }
      onComment && onComment(post._id, commentText);
    } catch (err) {
      setComments(prev => prev.filter(c => c._id !== newComment._id));
    }
  };

  const handleDeleteComment = async (commentId) => {
    const originalComments = [...comments];
    setComments(prev => prev.filter(c => c._id !== commentId));
    
    try {
      if (post._id && commentId) {
        await postsAPI.deleteComment(post._id, commentId);
      }
    } catch (err) {
      setComments(originalComments);
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    } else {
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 1000);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffWeeks < 4) return `${diffWeeks}w`;
    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/600';
    if (img.startsWith('http')) return img;
    return `http://localhost:3001${img}`;
  };

  const getAvatarUrl = (avatar, username) => {
    if (!avatar) return `https://i.pravatar.cc/150?u=${username}`;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:3001${avatar}`;
  };

  const isOwnComment = (commentUser) => {
    return commentUser?.username === currentUser?.username;
  };

  if (deleting) return null;

  return (
    <article className="post">
      <header className="post-header">
        <div className="post-user-info">
          <img 
            src={getAvatarUrl(post.avatar, post.username)} 
            alt={post.username} 
            className="post-avatar"
          />
          <div className="post-user-details">
            <div className="post-username-row">
              <span className="post-username">{post.username}</span>
              {post.verified && <VerifiedBadge />}
              <span className="post-time"> • {formatTime(post.createdAt)}</span>
            </div>
            {post.location && <span className="post-location">{post.location}</span>}
          </div>
        </div>
        <button className="post-more-btn" onClick={() => setShowOptions(!showOptions)}>
          <MoreDotsIcon />
        </button>
        
        {showOptions && (
          <div className="post-options-menu">
            {isOwner && (
              <button className="option-item danger" onClick={handleDeletePost}>
                Delete
              </button>
            )}
            <button className="option-item danger">Report</button>
            {!isOwner && <button className="option-item danger">Unfollow</button>}
            <button className="option-item">Add to favorites</button>
            <button className="option-item">Go to post</button>
            <button className="option-item">Share to...</button>
            <button className="option-item">Copy link</button>
            <button className="option-item" onClick={() => setShowOptions(false)}>Cancel</button>
          </div>
        )}
      </header>

      <div className="post-image-container" onDoubleClick={handleDoubleTap}>
        <img src={getImageUrl(post.image)} alt="Post" className="post-image" loading="lazy" />
        {likeAnimation && (
          <div className="double-tap-heart">
            <LikeIcon filled={true} />
          </div>
        )}
      </div>

      <div className="post-actions">
        <div className="post-actions-left">
          <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <LikeIcon filled={liked} />
          </button>
          <button className="action-btn" onClick={() => setShowComments(!showComments)}>
            <CommentIcon />
          </button>
          <button className="action-btn">
            <ShareIcon />
          </button>
        </div>
        <button className={`action-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
          <SaveIcon filled={saved} />
        </button>
      </div>

      <div className="post-likes">{likesCount.toLocaleString()} likes</div>

      <div className="post-caption">
        <span className="caption-username">{post.username}</span> {post.caption}
      </div>

      {post.comments > 0 && !showComments && (
        <button className="view-comments-btn" onClick={() => setShowComments(true)}>
          View all {post.comments} comments
        </button>
      )}

      {showComments && comments.length > 0 && (
        <div className="comments-section">
          {comments.map((c, i) => (
            <div key={c._id || i} className="comment">
              <img src={getAvatarUrl(c.user?.avatar, c.user?.username)} alt="" className="comment-avatar" />
              <div className="comment-content">
                <span className="comment-username">{c.user?.username}</span>
                <span className="comment-text">{c.text}</span>
              </div>
              {isOwnComment(c.user) && (
                <button className="delete-comment-btn" onClick={() => handleDeleteComment(c._id)}>×</button>
              )}
            </div>
          ))}
        </div>
      )}

      <form className="post-comment-form" onSubmit={handleComment}>
        <img src={getAvatarUrl(currentUser?.avatar, currentUser?.username)} alt="" className="comment-form-avatar" />
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="comment-input"
        />
        <button type="submit" className="post-comment-btn" disabled={!comment.trim()}>Post</button>
      </form>
    </article>
  );
};

export default Post;
