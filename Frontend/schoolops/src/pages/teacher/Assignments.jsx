import { useState, useEffect } from 'react';

import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: '',
    reference: '',
    classId: ''
  });
  const [classes, setClasses] = useState([]);
  const selectedCourse = classes.find((cls) => String(cls.id) === String(selectedClass));

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAssignments(selectedClass);
    } else {
      setAssignments([]);
    }
  }, [selectedClass]);

  const fetchAssignments = async (classId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/teacher/classroom/${classId}`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(Array.isArray(data) ? data : []);
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
      const response = await fetch(`${API_BASE_URL}/api/teacher/courses`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      if (!selectedClass) {
        setLoading(false);
      }
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.classId || !formData.dueDate || !formData.totalMarks) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const classWorkPayload = {
        title: formData.title,
        description: formData.description,
        totalMarks: Number(formData.totalMarks),
        lastDate: formData.dueDate,
        reference: formData.reference || null
      };

      const payload = new FormData();
      payload.append(
        'classWork',
        new Blob([JSON.stringify(classWorkPayload)], { type: 'application/json' })
      );
      payload.append('courseId', formData.classId);

      const response = await fetch(`${API_BASE_URL}/api/teacher/classroom/classwork`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.getToken()}`
        },
        body: payload
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          totalMarks: '',
          reference: '',
          classId: ''
        });
        fetchAssignments(formData.classId);
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
      const response = await fetch(`${API_BASE_URL}/api/teacher/classroom/classwork/${assignmentId}`, {
        method: 'DELETE',
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        if (selectedClass) {
          fetchAssignments(selectedClass);
        }
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

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom">
          <label className="form-label fw-semibold mb-0">Select Class</label>
        </div>
        <div className="card-body">
          <select
            className="form-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Choose a class...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

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
                    <label htmlFor="dueDate" className="form-label">Last Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="totalMarks" className="form-label">Total Marks *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="totalMarks"
                      min="0"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="reference" className="form-label">Reference (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
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
      {selectedClass && assignments.length > 0 ? (
        <div className="row">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">{assignment.title}</h5>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-people me-2"></i>
                    {selectedCourse?.name || 'Selected Class'}
                  </p>
                  {assignment.description && (
                    <p className="card-text text-muted small mb-3">
                      {assignment.description.substring(0, 60)}...
                    </p>
                  )}
                  <div className="mb-3">
                    <span className={`badge bg-${
                      assignment.lastDate && new Date(assignment.lastDate) >= new Date() ? 'info' : 'danger'
                    }`}>
                      Due: {assignment.lastDate ? new Date(assignment.lastDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <small className="text-muted d-block">
                    <i className="bi bi-file-earmark me-2"></i>
                    Submissions: {assignment.workIds?.length || 0}
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
      ) : selectedClass ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No assignments created yet.
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Select a class to view assignments.
        </div>
      )}
    </div>
  );
};

export default Assignments;
