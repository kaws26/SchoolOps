import { useState, useEffect } from 'react';
import auth from '../../utils/auth';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    fees: ''
  });
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

      const response = await fetch(url, {
        method,
        headers: auth.getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchCourses();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving course:', error);
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
      description: course.description || '',
      duration: course.duration || '',
      fees: course.fees || ''
    });
    setShowModal(true);
  };

  const handleAssignTeacher = (course) => {
    setSelectedCourse(course);
    setAssignData({ teacherId: course.teacher?.id || '' });
    setShowAssignModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: '',
      fees: ''
    });
    setEditingCourse(null);
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>{course.name}</td>
                    <td>{course.description}</td>
                    <td>{course.duration}</td>
                    <td>${course.fees}</td>
                    <td>{course.teacher?.name || 'Not Assigned'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(course)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success me-2"
                        onClick={() => handleAssignTeacher(course)}
                      >
                        <i className="bi bi-person-plus"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(course.id)}
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
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
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

      {(showModal || showAssignModal) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Courses;