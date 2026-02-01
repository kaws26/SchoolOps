import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    classId: '',
    priority: 'normal'
  });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/announcements`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
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

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.classId) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/teacher/announcements`, {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          title: '',
          content: '',
          classId: '',
          priority: 'normal'
        });
        fetchAnnouncements();
      } else {
        setError('Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      setError('Error creating announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/teacher/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        fetchAnnouncements();
      } else {
        setError('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError('Error deleting announcement');
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
        <h2>Announcements</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          New Announcement
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Announcement</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateAnnouncement}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Class Cancelled Tomorrow"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="classId" className="form-label">Select Class *</label>
                    <select
                      className="form-select"
                      id="classId"
                      value={formData.classId}
                      onChange={(e) => setFormData({...formData, classId: e.target.value})}
                      required
                    >
                      <option value="">Choose a class...</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">Content *</label>
                    <textarea
                      className="form-control"
                      id="content"
                      rows="6"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder="Enter announcement details..."
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <select
                      className="form-select"
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Post Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                      <i className="bi bi-people me-2"></i>
                      {announcement.className}
                    </p>
                  </div>
                  <span className={`badge bg-${
                    announcement.priority === 'high' ? 'danger' :
                    announcement.priority === 'normal' ? 'info' : 'secondary'
                  }`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                </div>
                <p className="card-text mb-3">{announcement.content}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Posted {new Date(announcement.createdAt).toLocaleDateString()}
                  </small>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    <i className="bi bi-trash me-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No announcements yet. Create one to get started!
        </div>
      )}
    </div>
  );
};

export default Announcements;
