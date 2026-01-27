import { Link, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import auth from '../../utils/auth';

const AdminLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: auth.getAuthHeaders()
        });
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'ADMIN') {
            // Redirect if not admin
            window.location.href = '/';
            return;
          }
          setUser(userData);
        } else {
          // Not authenticated
          auth.logout();
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        auth.logout();
      }
    };

    if (!auth.isAuthenticated()) {
      auth.logout();
      return;
    }

    checkAdminAccess();
  }, []);

  const handleLogout = () => {
    auth.logout();
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'bi-house-door' },
    { path: '/admin/teachers', label: 'Teachers', icon: 'bi-person-badge' },
    { path: '/admin/courses', label: 'Courses', icon: 'bi-book' },
    { path: '/admin/students', label: 'Students', icon: 'bi-people' },
    { path: '/admin/users', label: 'Users', icon: 'bi-person-circle' },
    { path: '/admin/enquiries', label: 'Enquiries', icon: 'bi-envelope' },
    { path: '/admin/notices', label: 'Notices', icon: 'bi-megaphone' },
    { path: '/admin/gallery', label: 'Gallery', icon: 'bi-images' }
  ];

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-white shadow" style={{width: '280px', minHeight: '100vh'}}>
        <div className="p-4 border-bottom">
          <Link to="/" className="text-decoration-none">
            <h4 className="text-primary fw-bold mb-0">SchoolOps</h4>
            <small className="text-muted">Admin Panel</small>
          </Link>
        </div>

        <nav className="nav flex-column py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link d-flex align-items-center px-4 py-3 ${
                location.pathname === item.path ? 'bg-primary bg-opacity-10 text-primary fw-semibold' : 'text-dark'
              }`}
            >
              <i className={`bi ${item.icon} me-3`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-top">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
              <i className="bi bi-person-fill text-primary"></i>
            </div>
            <div>
              <div className="fw-semibold small">{user.name || user.username}</div>
              <div className="text-muted small">{user.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm w-100"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        <div className="bg-white shadow-sm border-bottom px-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold">
              {navItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
            </h5>
            <div className="text-muted small">
              Welcome back, {user.name || user.username}
            </div>
          </div>
        </div>

        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;