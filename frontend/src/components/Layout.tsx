import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
