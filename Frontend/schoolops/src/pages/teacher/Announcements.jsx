import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/notices`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Error loading announcements');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Notices</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="card shadow-sm border-0 mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="card-title mb-1">{announcement.title}</h5>
                    <p className="text-muted small mb-2">
                      <i className="bi bi-person-badge me-2"></i>
                      {announcement.issueby || 'Administration'}
                    </p>
                  </div>
                </div>
                <p className="card-text mb-3">{announcement.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Posted {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'N/A'}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No notices yet.
        </div>
      )}
    </div>
  );
};

export default Announcements;
