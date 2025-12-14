import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useThemeStore } from '../store/themeStore';
import './Layout.css';

const Layout = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Layout.tsx:7', message: 'Layout component rendered', data: { hasUser: !!useAuthStore.getState().user }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'A' }) }).catch(() => { });
  // #endregion
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            🍬 Sweet Shop
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-link">
                Admin Panel
              </Link>
            )}
          </nav>
          <div className="user-section">
            <label className="theme-toggle">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
                className="theme-toggle-input"
              />
              <span className="theme-toggle-slider"></span>
            </label>
            <Link to="/cart" className="cart-link">
              🛒 <span className="cart-badge">{useCartStore((state) => state.items.reduce((total, item) => total + item.cartQuantity, 0))}</span>
            </Link>
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        {/* #region agent log */}
        {(() => {
          fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Layout.tsx:60', message: 'Rendering Outlet', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'E' }) }).catch(() => { });
          return null;
        })()}
        {/* #endregion */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
