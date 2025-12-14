import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/auth';
import toast from 'react-hot-toast';
import './Auth.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const [loginType, setLoginType] = useState<'user' | 'employee'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login({ email, password });
      setAuth(response.user, response.token);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = googleClientId ? useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
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
        <h1>Sweet Shop</h1>
        <div className="login-type-selector">
          <button
            type="button"
            className={`type-btn ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => setLoginType('user')}
          >
            User Login
          </button>
          <button
            type="button"
            className={`type-btn ${loginType === 'employee' ? 'active' : ''}`}
            onClick={() => setLoginType('employee')}
          >
            Employee Login
          </button>
        </div>

        {loginType === 'user' ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
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
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </>
        ) : (
          <>
            <div className="employee-info">
              <p className="info-text">Employee/Admin Login</p>
              <p className="hint-text">Use your admin credentials to access the admin panel</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="employee-email">Email</label>
                <input
                  type="email"
                  id="employee-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="admin@sweetshop.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="employee-password">Password</label>
                <input
                  type="password"
                  id="employee-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter admin password"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login as Employee'}
              </button>
            </form>
            <p className="auth-footer">
              Need user access? <button type="button" className="link-btn" onClick={() => setLoginType('user')}>Switch to User Login</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
