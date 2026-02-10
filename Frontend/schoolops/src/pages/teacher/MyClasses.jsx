import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/courses`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        setError('Failed to load classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Error loading classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">My Classes</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {classes.length > 0 ? (
        <div className="row">
          {classes.map((cls) => (
            <div key={cls.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">{cls.name}</h5>
                  <p className="text-muted mb-3">
                    <i className="bi bi-tag me-2"></i>
                    Session: {cls.session || cls.time || 'N/A'}
                  </p>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="bg-light p-3 rounded text-center">
                        <small className="text-muted d-block">Students</small>
                        <h5 className="mb-0 text-primary">{cls.studentNames?.length || 0}</h5>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-light p-3 rounded text-center">
                        <small className="text-muted d-block">Room</small>
                        <h5 className="mb-0 text-primary">{cls.classRoomId || 'N/A'}</h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-top">
                  <div className="d-grid gap-2">
                    <button className="btn btn-sm btn-primary">
                      <i className="bi bi-eye me-2"></i>View Class
                    </button>
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-person-lines-fill me-2"></i>Students
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No classes assigned yet. Contact administration for class assignment.
        </div>
      )}
    </div>
  );
};

export default MyClasses;
