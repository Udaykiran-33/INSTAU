import React, { useState } from 'react';
import { LikeIcon, CommentIcon, ShareIcon, SaveIcon } from '../components/Icons';

const reelsData = [
  {
    id: 1,
    username: 'dance_vibes',
    avatar: 'https://i.pravatar.cc/150?img=32',
    video: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=700&fit=crop',
    likes: 125000,
    comments: 1234,
    caption: 'New dance trend 💃🔥 Drop a ❤️ if you vibing!',
    audio: 'Original Audio - dance_vibes'
  },
  {
    id: 2,
    username: 'comedy_central',
    avatar: 'https://i.pravatar.cc/150?img=33',
    video: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=700&fit=crop',
    likes: 89000,
    comments: 567,
    caption: 'When your code finally works 😂 #programming #relatable',
    audio: 'Funny Sound Effect'
  },
  {
    id: 3,
    username: 'travel_reels',
    avatar: 'https://i.pravatar.cc/150?img=34',
    video: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=700&fit=crop',
    likes: 234000,
    comments: 2345,
    caption: 'POV: You finally took that trip ✈️🌍',
    audio: 'Wanderlust - Travel Music'
  }
];

const Reels = () => {
  const [likedReels, setLikedReels] = useState({});
  const [savedReels, setSavedReels] = useState({});

  const toggleLike = (id) => {
    setLikedReels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id) => {
    setSavedReels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <div className="main-content">
      <div className="reels-container">
        {reelsData.map((reel) => (
          <div key={reel.id} className="reel">
            <img src={reel.video} alt="Reel" className="reel-video" />
            
            <div className="reel-content">
              <div className="reel-user">
                <img src={reel.avatar} alt={reel.username} className="reel-avatar" />
                <span className="reel-username">{reel.username}</span>
                <button className="reel-follow-btn">Follow</button>
              </div>
              <p className="reel-caption">{reel.caption}</p>
              <div className="reel-audio">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                {reel.audio}
              </div>
            </div>

            <div className="reel-actions">
              <button className={`reel-action ${likedReels[reel.id] ? 'liked' : ''}`} onClick={() => toggleLike(reel.id)}>
                <LikeIcon filled={likedReels[reel.id]} />
                <span>{formatNumber(reel.likes + (likedReels[reel.id] ? 1 : 0))}</span>
              </button>
              <button className="reel-action">
                <CommentIcon />
                <span>{formatNumber(reel.comments)}</span>
              </button>
              <button className="reel-action">
                <ShareIcon />
              </button>
              <button className={`reel-action ${savedReels[reel.id] ? 'saved' : ''}`} onClick={() => toggleSave(reel.id)}>
                <SaveIcon filled={savedReels[reel.id]} />
              </button>
              <img src={reel.avatar} alt="Audio" className="reel-music-disc" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reels;
