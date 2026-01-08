import React, { useState } from 'react';
import { CreateIcon } from '../components/Icons';

const conversationsData = [
  { id: 1, username: 'john_doe', avatar: 'https://i.pravatar.cc/150?img=11', lastMessage: 'Hey! How are you doing?', time: '2h', unread: true },
  { id: 2, username: 'jane_smith', avatar: 'https://i.pravatar.cc/150?img=5', lastMessage: 'That photo was amazing! 📸', time: '5h', unread: true },
  { id: 3, username: 'mike_wilson', avatar: 'https://i.pravatar.cc/150?img=8', lastMessage: 'See you tomorrow!', time: '1d', unread: false },
  { id: 4, username: 'sarah_jones', avatar: 'https://i.pravatar.cc/150?img=9', lastMessage: 'Thanks for sharing 🙏', time: '2d', unread: false },
  { id: 5, username: 'travel_group', avatar: 'https://i.pravatar.cc/150?img=12', lastMessage: 'Alex: Let\'s plan the trip!', time: '3d', unread: false },
];

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="main-content">
      <div className="messages-container">
        <div className="messages-sidebar">
          <div className="messages-header">
            <h2>yourusername</h2>
            <button>
              <CreateIcon />
            </button>
          </div>
          
          <div className="messages-list">
            {conversationsData.map((conv) => (
              <div 
                key={conv.id} 
                className={`message-item ${selectedChat === conv.id ? 'active' : ''}`}
                onClick={() => setSelectedChat(conv.id)}
              >
                <img src={conv.avatar} alt={conv.username} className="message-avatar" />
                <div className="message-info">
                  <div className="message-username">{conv.username}</div>
                  <div className="message-preview">
                    {conv.lastMessage} · {conv.time}
                  </div>
                </div>
                {conv.unread && <div className="unread-indicator" />}
              </div>
            ))}
          </div>
        </div>

        <div className="messages-content">
          <div className="messages-empty">
            <svg aria-label="Direct" fill="currentColor" height="96" viewBox="0 0 96 96" width="96">
              <circle cx="48" cy="48" fill="none" r="47" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
              <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="69.286" x2="41.447" y1="33.724" y2="48.737"/>
              <polygon fill="none" points="47.254 73.123 69.286 33.724 27.715 33.724 41.447 48.737 47.254 73.123" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
            <h3>Your messages</h3>
            <p>Send private photos and messages to a friend or group</p>
            <button className="send-message-btn">Send message</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
