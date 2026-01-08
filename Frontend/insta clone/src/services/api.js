import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Users API
export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  follow: (userId) => api.post(`/users/${userId}/follow`),
  unfollow: (userId) => api.delete(`/users/${userId}/follow`),
  getSuggestions: () => api.get('/users/feed/suggestions'),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`)
};

// Posts API
export const postsAPI = {
  getFeed: (page = 1) => api.get(`/posts?page=${page}`),
  getExplore: (page = 1) => api.get(`/posts/explore?page=${page}`),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => {
    const formData = new FormData();
    if (data.image instanceof File) {
      formData.append('image', data.image);
    } else {
      formData.append('image', data.image);
    }
    formData.append('caption', data.caption || '');
    formData.append('location', data.location || '');
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  savePost: (id) => api.post(`/posts/${id}/save`),
  addComment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`)
};

// Stories API
export const storiesAPI = {
  getStories: () => api.get('/stories'),
  createStory: (data) => {
    const formData = new FormData();
    if (data.image instanceof File) {
      formData.append('image', data.image);
    } else {
      formData.append('image', data.image);
    }
    return api.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  viewStory: (id) => api.get(`/stories/${id}`),
  deleteStory: (id) => api.delete(`/stories/${id}`),
  getViewers: (id) => api.get(`/stories/${id}/viewers`)
};

export default api;
