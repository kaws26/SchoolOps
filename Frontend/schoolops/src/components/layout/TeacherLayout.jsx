import { Link, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const TeacherLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkTeacherAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: auth.getAuthHeaders()
        });
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'TEACHER') {
            window.location.href = '/';
            return;
          }
          setUser(userData);
        } else {
          auth.logout();
        }
      } catch (error) {
        console.error('Error checking teacher access:', error);
        auth.logout();
      }
    };

    if (!auth.isAuthenticated()) {
      auth.logout();
      return;
    }

    checkTeacherAccess();
  }, []);

  const handleLogout = () => {
    auth.logout();
  };

  const navItems = [
    { path: '/teacher', label: 'Dashboard', icon: 'bi-house-door' },
    { path: '/teacher/classes', label: 'My Classes', icon: 'bi-people' },
    { path: '/teacher/assignments', label: 'Assignments', icon: 'bi-pencil-square' },
    { path: '/teacher/grades', label: 'Grades', icon: 'bi-file-earmark-text' },
    { path: '/teacher/attendance', label: 'Attendance', icon: 'bi-clipboard-check' },
    { path: '/teacher/announcements', label: 'Announcements', icon: 'bi-megaphone' },
    { path: '/teacher/students', label: 'Students', icon: 'bi-person-lines-fill' }
  ];

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying teacher access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div 
        className="bg-white shadow position-fixed" 
        style={{
          width: sidebarOpen ? '280px' : '0',
          minHeight: '100vh',
          zIndex: 1000,
          overflow: 'hidden',
          transition: 'width 0.3s ease'
        }}
      >
        <div className="p-4 border-bottom">
          <Link to="/" className="text-decoration-none">
            <h4 className="text-primary fw-bold mb-0">SchoolOps</h4>
            <small className="text-muted">Teacher Panel</small>
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
            <div 
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
              style={{width: '40px', height: '40px'}}
            >
              <i className="bi bi-person-fill text-primary"></i>
            </div>
            <div>
              <p className="mb-0 small fw-semibold">{user.first_name} {user.last_name}</p>
              <small className="text-muted">Teacher</small>
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
      <div style={{ marginLeft: sidebarOpen ? '280px' : '0', width: sidebarOpen ? 'calc(100% - 280px)' : '100%', transition: 'all 0.3s ease' }}>
        {/* Top Bar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
          <div className="container-fluid">
            <button
              className="btn btn-link text-dark"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <span className="ms-3 text-muted">Welcome, {user.name}!</span>
            <div className="ms-auto">
              <Link to="/teacher" className="text-decoration-none text-dark ms-3">
                <i className="bi bi-person-circle fs-5"></i>
              </Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TeacherLayout;
