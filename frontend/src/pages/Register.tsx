import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { register, googleLogin } from '../api/auth';
import toast from 'react-hot-toast';
import './Auth.css';

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

  const handleGoogleLogin = googleClientId
    ? useGoogleLogin({
        onSuccess: async (tokenResponse) => {
          try {
            setLoading(true);
            const token = tokenResponse.access_token || (tokenResponse as any).id_token;
            if (!token) {
              toast.error('No token received from Google');
              setLoading(false);
              return;
            }
            const response = await googleLogin(token);
            setAuth(response.user, response.token);
            toast.success('Google registration successful!');
            navigate('/');
          } catch (error: any) {
            console.error('Google login error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Google registration failed';
            toast.error(errorMessage);
            if (error.response?.status === 503) {
              toast.error('Google OAuth is not configured on the backend. Please contact support.');
            }
          } finally {
            setLoading(false);
          }
        },
        onError: (error) => {
          console.error('Google OAuth error:', error);
          toast.error('Google registration failed. Please try again.');
          setLoading(false);
        },
      })
    : null;


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
