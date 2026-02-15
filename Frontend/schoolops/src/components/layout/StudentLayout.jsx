import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import auth from "../../utils/auth";
import API_BASE_URL from "../../config";

const StudentLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkStudentAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: auth.getAuthHeaders(),
        });

        if (!response.ok) {
          auth.logout();
          return;
        }

        const userData = await response.json();
        if (userData.role !== "STUDENT") {
          window.location.href = "/";
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Error checking student access:", error);
        auth.logout();
      }
    };

    if (!auth.isAuthenticated()) {
      auth.logout();
      return;
    }

    checkStudentAccess();
  }, []);

  const navItems = [
    { path: "/student", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/student/courses", label: "My Courses", icon: "bi-journal-bookmark" },
    { path: "/student/attendance", label: "Attendance", icon: "bi-clipboard-check" },
    { path: "/student/classroom", label: "Classroom", icon: "bi-journal-text" },
    { path: "/student/notices", label: "Notices", icon: "bi-megaphone" },
    { path: "/student/account", label: "Account & Fees", icon: "bi-wallet2" },
  ];

  const activeTitle = navItems.find((item) => item.path === location.pathname)?.label || "Student Panel";

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying student access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <aside
        className="bg-white shadow position-fixed"
        style={{
          width: sidebarOpen ? "280px" : "0",
          minHeight: "100vh",
          zIndex: 1000,
          overflow: "hidden",
          transition: "width 0.3s ease",
        }}
      >
        <div className="p-4 border-bottom">
          <Link to="/" className="text-decoration-none">
            <h4 className="text-primary fw-bold mb-0">SchoolOps</h4>
            <small className="text-muted">Student Panel</small>
          </Link>
        </div>

        <nav className="nav flex-column py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link d-flex align-items-center px-4 py-3 ${
                location.pathname === item.path ? "bg-primary bg-opacity-10 text-primary fw-semibold" : "text-dark"
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
              style={{ width: "40px", height: "40px" }}
            >
              <i className="bi bi-person-fill text-primary"></i>
            </div>
            <div>
              <div className="fw-semibold small">{user.name || user.username}</div>
              <div className="text-muted small">Student</div>
            </div>
          </div>
          <button type="button" onClick={auth.logout} className="btn btn-outline-danger btn-sm w-100">
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </aside>

      <main
        style={{
          marginLeft: sidebarOpen ? "280px" : "0",
          width: sidebarOpen ? "calc(100% - 280px)" : "100%",
          transition: "all 0.3s ease",
        }}
      >
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
          <div className="container-fluid">
            <button className="btn btn-link text-dark" onClick={() => setSidebarOpen((prev) => !prev)}>
              <i className="bi bi-list fs-5"></i>
            </button>
            <span className="ms-3 text-muted">{activeTitle}</span>
            <div className="ms-auto text-muted small">Welcome, {user.name || user.username}</div>
          </div>
        </nav>

        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
