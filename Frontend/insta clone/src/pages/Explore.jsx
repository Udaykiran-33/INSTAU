import React from 'react';
import { LikeIcon, CommentIcon } from '../components/Icons';

const exploreData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop', likes: 1234, comments: 56 },
  { id: 2, image: 'https://images.unsplash.com/photo-1682686581362-7c43a2a907ed?w=400&h=400&fit=crop', likes: 2345, comments: 78 },
  { id: 3, image: 'https://images.unsplash.com/photo-1682695796497-31a44224d6d6?w=400&h=400&fit=crop', likes: 3456, comments: 90 },
  { id: 4, image: 'https://images.unsplash.com/photo-1682695797221-8164ff1fafc9?w=400&h=400&fit=crop', likes: 4567, comments: 123 },
  { id: 5, image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400&h=400&fit=crop', likes: 5678, comments: 234 },
  { id: 6, image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=400&fit=crop', likes: 6789, comments: 345 },
  { id: 7, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop', likes: 7890, comments: 456 },
  { id: 8, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', likes: 8901, comments: 567 },
  { id: 9, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop', likes: 9012, comments: 678 },
  { id: 10, image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=400&fit=crop', likes: 1234, comments: 56 },
  { id: 11, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', likes: 2345, comments: 78 },
  { id: 12, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop', likes: 3456, comments: 90 },
];

const Explore = () => {
  return (
    <div className="main-content">
      <div className="explore-container">
        <div className="explore-grid">
          {exploreData.map((item) => (
            <div key={item.id} className="explore-item">
              <img src={item.image} alt="Explore" />
              <div className="explore-overlay">
                <div className="explore-stat">
                  <LikeIcon filled={true} />
                  <span>{item.likes.toLocaleString()}</span>
                </div>
                <div className="explore-stat">
                  <CommentIcon />
                  <span>{item.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
