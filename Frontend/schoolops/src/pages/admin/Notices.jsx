import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingNotice, setViewingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notices`, {
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Normalize form data
      const normalizedFormData = {
        title: formData.title || null,
        description: formData.description || null
      };

      const formDataToSend = new FormData();
      // Send the notice data as a JSON blob with application/json content type
      formDataToSend.append('notice', new Blob([JSON.stringify(normalizedFormData)], { type: 'application/json' }));

      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      // Get auth headers without Content-Type (let browser set it for multipart/form-data)
      const headers = auth.getAuthHeaders();
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/api/admin/notices`, {
        method: 'POST',
        headers: headers,
        body: formDataToSend
      });

      if (response.ok) {
        fetchNotices();
        setShowModal(false);
        resetForm();
        alert('Notice created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error creating notice:', errorData);
        alert('Failed to create notice. Please try again.');
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      alert('An error occurred while creating the notice.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/notices/${id}`, {
          method: 'DELETE',
          headers: auth.getAuthHeaders()
        });
        if (response.ok) {
          fetchNotices();
          alert('Notice deleted successfully!');
        } else {
          alert('Failed to delete notice.');
        }
      } catch (error) {
        console.error('Error deleting notice:', error);
        alert('An error occurred while deleting the notice.');
      }
    }
  };

  const handleViewNotice = (notice) => {
    setViewingNotice(notice);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: ''
    });
    setSelectedFile(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files && e.target.files[0]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Notice Board Management</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>Add Notice
        </button>
      </div>

      <div className="row">
        {notices.map(notice => (
          <div key={notice.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm hover-shadow" style={{ cursor: 'pointer' }}>
              <div onClick={() => handleViewNotice(notice)}>
                {notice.image ? (
                  <img
                    src={notice.image}
                    className="card-img-top"
                    alt={notice.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="card-img-top bg-light d-flex align-items-center justify-content-center"
                    style={{ height: '200px' }}
                  >
                    <i className="bi bi-megaphone text-secondary" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title text-primary">{notice.title}</h5>
                  <p className="card-text text-muted small">
                    {notice.description && notice.description.length > 100
                      ? `${notice.description.substring(0, 100)}...`
                      : notice.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      <i className="bi bi-person me-1"></i>
                      {notice.issueby}
                    </small>
                    <small className="text-muted">
                      <i className="bi bi-calendar me-1"></i>
                      {formatDate(notice.date)}
                    </small>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <button
                  className="btn btn-sm btn-outline-danger w-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notice.id);
                  }}
                >
                  <i className="bi bi-trash me-2"></i>Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {notices.length === 0 && (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-clipboard-x text-muted" style={{ fontSize: '4rem' }}></i>
              <p className="text-muted mt-3">No notices found. Create your first notice!</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Notice</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      maxLength={150}
                    />
                    <small className="text-muted">Maximum 150 characters</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Image (Optional)</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <div className="form-text">
                      Accepted formats: JPG, JPEG, PNG, GIF
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      The notice will be automatically timestamped and attributed to you.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>Add Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* View Notice Modal */}
      <div className={`modal fade ${showViewModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Notice Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {viewingNotice && (
                <div>
                  {/* Notice Image Section */}
                  {viewingNotice.image && (
                    <div className="text-center mb-4">
                      <img
                        src={viewingNotice.image}
                        alt={viewingNotice.title}
                        className="img-fluid rounded"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                    </div>
                  )}

                  {/* Notice Information */}
                  <div className="mb-3">
                    <h4 className="text-primary">{viewingNotice.title}</h4>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6 className="text-muted">Issued By</h6>
                      <p className="fw-bold">
                        <i className="bi bi-person-circle me-2"></i>
                        {viewingNotice.issueby}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Date & Time</h6>
                      <p className="fw-bold">
                        <i className="bi bi-calendar-event me-2"></i>
                        {formatDate(viewingNotice.date)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted">Description</h6>
                    <div className="bg-light p-3 rounded">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {viewingNotice.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowViewModal(false);
                  handleDelete(viewingNotice.id);
                }}
              >
                <i className="bi bi-trash me-2"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {(showModal || showViewModal) && <div className="modal-backdrop fade show"></div>}

      <style jsx>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Notices;