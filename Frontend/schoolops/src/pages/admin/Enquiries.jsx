import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/enquiries`, {
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setEnquiries(data);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/enquiries/${id}`, {
          method: 'DELETE',
          headers: auth.getAuthHeaders()
        });
        if (response.ok) {
          fetchEnquiries();
        }
      } catch (error) {
        console.error('Error deleting enquiry:', error);
      }
    }
  };

  const handleUpdateStatus = async (id) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: 'PUT',
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        fetchEnquiries();
      }
    } catch (error) {
      console.error('Error updating enquiry status:', error);
    }
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
        <h2 className="text-primary fw-bold">Enquiries Management</h2>
        <div className="text-muted">
          Total Enquiries: {enquiries.length}
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map(enquiry => (
                  <tr key={enquiry.id}>
                    <td>{enquiry.name}</td>
                    <td>{enquiry.email}</td>
                    <td>{enquiry.phone}</td>
                    <td>{enquiry.subject}</td>
                    <td>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {enquiry.message}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        enquiry.status === 'RESPONDED' ? 'bg-success' :
                        enquiry.status === 'PENDING' ? 'bg-warning' :
                        'bg-secondary'
                      }`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td>{new Date(enquiry.createdDate).toLocaleDateString()}</td>
                    <td>
                      {enquiry.status !== 'RESPONDED' && (
                        <button
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => handleUpdateStatus(enquiry.id)}
                          title="Mark as Responded"
                        >
                          <i className="bi bi-check-circle"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(enquiry.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {enquiries.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-inbox display-4 text-muted"></i>
          <h4 className="text-muted mt-3">No enquiries found</h4>
          <p className="text-muted">Enquiries from the contact form will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default Enquiries;