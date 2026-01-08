import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: '700', 
            margin: '0 0 10px 0', 
            letterSpacing: '-1px',
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #bc1888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>INSTAU</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className="auth-input"
            autoComplete="email"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="auth-input"
            autoComplete="current-password"
          />
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <p style={{ 
          marginTop: '10px', 
          fontSize: '13px', 
          color: '#a8a8a8',
          lineHeight: '1.6'
        }}>
          First time? <Link to="/register" style={{ color: '#0095f6' }}>Create an account</Link> to get started.
        </p>
      </div>
      
      <div className="auth-switch">
        Don't have an account? <Link to="/register">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
