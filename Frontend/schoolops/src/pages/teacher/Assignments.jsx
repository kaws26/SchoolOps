import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    classId: '',
    attachments: []
  });
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
    fetchClasses();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/assignments`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        setError('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Error loading assignments');
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

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.classId || !formData.dueDate) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/teacher/assignments`, {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          classId: '',
          attachments: []
        });
        fetchAssignments();
      } else {
        setError('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError('Error creating assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/teacher/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        fetchAssignments();
      } else {
        setError('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Error deleting assignment');
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
        <h2>Assignments</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Create Assignment
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Create Assignment Modal */}
      {showModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Assignment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateAssignment}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dueDate" className="form-label">Due Date *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      required
                    />
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
                    Create Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length > 0 ? (
        <div className="row">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">{assignment.title}</h5>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-people me-2"></i>
                    {assignment.className}
                  </p>
                  {assignment.description && (
                    <p className="card-text text-muted small mb-3">
                      {assignment.description.substring(0, 60)}...
                    </p>
                  )}
                  <div className="mb-3">
                    <span className={`badge bg-${
                      new Date(assignment.dueDate) > new Date() ? 'info' : 'danger'
                    }`}>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <small className="text-muted d-block">
                    <i className="bi bi-file-earmark me-2"></i>
                    Submissions: {assignment.submissionCount || 0}
                  </small>
                </div>
                <div className="card-footer bg-white border-top">
                  <div className="d-grid gap-2">
                    <button className="btn btn-sm btn-primary">
                      <i className="bi bi-eye me-2"></i>View Submissions
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      <i className="bi bi-trash me-2"></i>Delete
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
          No assignments created yet.
        </div>
      )}
    </div>
  );
};

export default Assignments;
