import { useState, useEffect } from 'react';
import auth from '../../utils/auth';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    duration: '',
    fees: '',
    session: '',
    time: ''
  });
  const [profileFile, setProfileFile] = useState(null);
  const [assignData, setAssignData] = useState({
    teacherId: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers', {
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      // Normalize form data - convert empty strings to null for optional fields
      const normalizedFormData = {
        name: formData.name || null,
        about: formData.about || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        fees: formData.fees ? parseFloat(formData.fees) : null,
        session: formData.session || null,
        time: formData.time || null
      };

      const formDataToSend = new FormData();
      // Send the course data as a JSON blob with application/json content type
      formDataToSend.append('course', new Blob([JSON.stringify(normalizedFormData)], { type: 'application/json' }));

      if (profileFile) {
        formDataToSend.append('image', profileFile);
      }

      // Get auth headers without Content-Type (let browser set it for multipart/form-data)
      const headers = auth.getAuthHeaders();
      // Remove Content-Type header if it exists, as it should be auto-set for FormData
      delete headers['Content-Type'];

      const response = await fetch(url, {
        method,
        headers: headers,
        body: formDataToSend
      });

      if (response.ok) {
        fetchCourses();
        setShowModal(false);
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error saving course:', errorData);
        alert('Failed to save course. Please try again.');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('An error occurred while saving the course.');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}/assign-teacher/${assignData.teacherId}`, {
        method: 'POST',
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        fetchCourses();
        setShowAssignModal(false);
        setAssignData({ teacherId: '' });
      }
    } catch (error) {
      console.error('Error assigning teacher:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await fetch(`/api/admin/courses/${id}`, {
          method: 'DELETE',
          headers: auth.getAuthHeaders()
        });
        if (response.ok) {
          fetchCourses();
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || '',
      about: course.about || '',
      duration: course.duration || '',
      fees: course.fees || '',
      session: course.session || '',
      time: course.time || ''
    });
    setProfileFile(null);
    setShowModal(true);
  };

  const handleViewCourse = (course) => {
    setViewingCourse(course);
    setShowViewModal(true);
  };

  const handleAssignTeacher = (course) => {
    setSelectedCourse(course);
    setAssignData({ teacherId: course.teacher?.id || '' });
    setShowAssignModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      about: '',
      duration: '',
      fees: '',
      session: '',
      time: ''
    });
    setEditingCourse(null);
    setProfileFile(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
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
        <h2 className="text-primary fw-bold">Courses Management</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>Add Course
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Fees</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id} onClick={() => handleViewCourse(course)} style={{ cursor: 'pointer' }}>
                    <td>{course.name}</td>
                    <td>{course.about}</td>
                    <td>{course.duration}</td>
                    <td>₹{course.fees}</td>
                    <td>{course.teacherName || 'Not Assigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingCourse ? 'Edit Course' : 'Add Course'}
              </h5>
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
                    <label className="form-label">Course Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">About</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.about}
                      onChange={(e) => setFormData({...formData, about: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="e.g., 6 months"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fees</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.fees}
                      onChange={(e) => setFormData({...formData, fees: e.target.value})}
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Session</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.session}
                      onChange={(e) => setFormData({...formData, session: e.target.value})}
                      placeholder="e.g., Spring 2024"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      placeholder="e.g., 9:00 AM - 10:30 AM"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Course Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => setProfileFile(e.target.files && e.target.files[0])}
                    />
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
                  {editingCourse ? 'Update' : 'Add'} Course
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Assign Teacher Modal */}
      <div className={`modal fade ${showAssignModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Assign Teacher to {selectedCourse?.name}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAssignModal(false)}
              ></button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Teacher</label>
                  <select
                    className="form-select"
                    value={assignData.teacherId}
                    onChange={(e) => setAssignData({ teacherId: e.target.value })}
                    required
                  >
                    <option value="">Choose a teacher...</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* View Course Modal */}
      <div className={`modal fade ${showViewModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Course Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {viewingCourse && (
                <div>
                  {/* Course Image Section */}
                  <div className="text-center mb-4">
                    {viewingCourse.profile ? (
                      <img
                        src={viewingCourse.profile}
                        alt={viewingCourse.name}
                        className="rounded"
                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="bg-light rounded d-inline-flex align-items-center justify-content-center"
                        style={{ width: '100%', height: '200px' }}
                      >
                        <i className="bi bi-book text-secondary" style={{ fontSize: '3rem' }}></i>
                      </div>
                    )}
                  </div>

                  {/* Course Information */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6 className="text-muted">Course Name</h6>
                      <p className="fw-bold">{viewingCourse.name}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Duration</h6>
                      <p className="fw-bold">{viewingCourse.duration || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Fees</h6>
                      <p className="fw-bold">₹{viewingCourse.fees || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Teacher</h6>
                      <p className="fw-bold">{viewingCourse.teacherName || 'Not Assigned'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Session</h6>
                      <p className="fw-bold">{viewingCourse.session || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Class Room ID</h6>
                      <p className="fw-bold">{viewingCourse.classRoomId || '-'}</p>
                    </div>
                    <div className="col-12">
                      <h6 className="text-muted">Time</h6>
                      <p className="fw-bold">{viewingCourse.time || '-'}</p>
                    </div>
                    <div className="col-12">
                      <h6 className="text-muted">About</h6>
                      <p className="fw-bold">
                        {viewingCourse.about || '-'}
                      </p>
                    </div>
                    {viewingCourse.studentNames && viewingCourse.studentNames.length > 0 && (
                      <div className="col-12">
                        <h6 className="text-muted">Students</h6>
                        <p className="fw-bold">
                          {viewingCourse.studentNames.join(', ')}
                        </p>
                      </div>
                    )}
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
                className="btn btn-success"
                onClick={() => {
                  setShowViewModal(false);
                  handleAssignTeacher(viewingCourse);
                }}
              >
                <i className="bi bi-person-plus me-2"></i>Assign Teacher
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setShowViewModal(false);
                  if (window.confirm('Are you sure you want to delete this course?')) {
                    handleDelete(viewingCourse.id);
                  }
                }}
              >
                <i className="bi bi-trash me-2"></i>Delete
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(viewingCourse);
                }}
              >
                <i className="bi bi-pencil me-2"></i>Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {(showModal || showAssignModal || showViewModal) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Courses;