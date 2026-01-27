import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import auth from "../../utils/auth";

const Navbar = () => {
  const isAuthenticated = auth.isAuthenticated();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/user/profile', {
            headers: auth.getAuthHeaders()
          });
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [isAuthenticated]);

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light py-3 px-lg-5">
      <Link className="navbar-brand" to="/">
        <span className="text-primary fw-bold">SchoolOps</span>
      </Link>

      <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <div className="navbar-nav mx-auto">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/classes" className="nav-link">Classes</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {userRole === 'ADMIN' && (
            <Link to="/admin" className="nav-link text-primary fw-semibold">
              <i className="bi bi-shield-check me-1"></i>Admin
            </Link>
          )}
        </div>

        <div className="d-flex gap-2">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-outline-danger px-3">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-primary px-3">Login</Link>
              <Link to="/signup" className="btn btn-primary px-3">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
