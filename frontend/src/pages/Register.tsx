import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { register } from '../api/auth';
import toast from 'react-hot-toast';
import './Auth.css';

import { useGoogleLogin } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await register({ name, email, password });
      setAuth(response.user, response.token);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      // Log network errors for debugging
      if (!error.response) {
        console.error('Network error - Backend may be down or unreachable');
        toast.error('Cannot connect to server. Please check if the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Only enable Google login if client ID is configured
  const handleGoogleLogin = googleClientId ? useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // TODO: Send tokenResponse.access_token to your backend
        // Backend should verify the token with Google and create/login user
        toast('Google OAuth: Backend integration needed. Use email/password for now.');
        console.log('Google token received:', tokenResponse);
      } catch (error) {
        toast.error('Google login failed');
      }
    },
    onError: () => {
      toast.error('Google login failed');
    },
  }) : null;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {googleClientId && handleGoogleLogin && (
          <>
            <div className="auth-divider">
              <span>OR</span>
            </div>
            <button onClick={() => handleGoogleLogin()} className="btn-google" disabled={loading}>
              Continue with Google
            </button>
          </>
        )}
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
