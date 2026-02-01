import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    date: null,
    name: '',
    fatherName: '',
    email: '',
    numbers: '',
    salary: '',
    password: '',
    role: 'TEACHER',
    address: {
      id: null,
      city: '',
      street: ''
    },
    courseIds: [],
    courseNames: []
  });
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);

  // When courses load and we are editing a teacher, auto-populate courseIds
  useEffect(() => {
    if (editingTeacher && courses && courses.length > 0) {
      const selectedIds = courses
        .filter(c => editingTeacher.courseNames && editingTeacher.courseNames.includes(c.name))
        .map(c => c.id);
      setFormData(fd => ({ ...fd, courseIds: selectedIds, courseNames: editingTeacher.courseNames || [] }));
    }
  }, [courses, editingTeacher]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTeacher ? `/api/admin/teachers/${editingTeacher.id}` : '/api/admin/teachers';
      const method = editingTeacher ? 'PUT' : 'POST';

      // Build FormData with a JSON `teacher` part and an optional image part
      const payload = new FormData();
      // Normalize address: convert empty strings to null and include id when present
      const addressObj = formData.address
        ? {
            id: formData.address.id || null,
            city: formData.address.city ? formData.address.city : null,
            street: formData.address.street ? formData.address.street : null
          }
        : null;

      const teacherPart = {
        date: formData.date || null,
        name: formData.name,
        fatherName: formData.fatherName || null,
        email: formData.email,
        numbers: formData.numbers || null,
        salary: formData.salary || null,
        password: editingTeacher ? undefined : formData.password,
        // Do not send role when editing (role cannot be changed)
        ...(editingTeacher ? {} : { role: formData.role || 'TEACHER' }),
        address: addressObj && (addressObj.city || addressObj.street) ? addressObj : null,
        courseIds: formData.courseIds && formData.courseIds.length > 0 ? formData.courseIds : []
      };

      // Attach teacher JSON as a RequestPart named 'teacher'
      payload.append('teacher', new Blob([JSON.stringify(teacherPart)], { type: 'application/json' }));
      if (profileFile) payload.append('image', profileFile);

      // Copy auth headers but remove Content-Type so browser can set the multipart boundary
      const headers = { ...auth.getAuthHeaders() };
      if (headers['Content-Type']) delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers,
        body: payload
      });

      if (response.ok) {
        fetchTeachers();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/teachers/${id}`, {
          method: 'DELETE',
          headers: auth.getAuthHeaders()
        });
        if (response.ok) {
          fetchTeachers();
        }
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      date: teacher.date || null,
      name: teacher.name || '',
      fatherName: teacher.fatherName || '',
      email: teacher.email || '',
      numbers: teacher.numbers || '',
      salary: teacher.salary || '',
      password: '',
      role: 'TEACHER',
      address: teacher.address || { id: null, city: '', street: '' },
      courseIds: [],
      courseNames: teacher.courseNames || []
    });
    setProfileFile(null);
    setShowModal(true);
  };

  const handleViewTeacher = (teacher) => {
    setViewingTeacher(teacher);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: null,
      name: '',
      fatherName: '',
      email: '',
      numbers: '',
      salary: '',
      password: '',
      role: 'TEACHER',
      address: { id: null, city: '', street: '' },
      courseIds: [],
      courseNames: []
    });
    setEditingTeacher(null);
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
        <h2 className="text-primary fw-bold">Teachers Management</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>Add Teacher
        </button>
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
                  <th>Father's Name</th>
                  <th>Courses</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => (
                  <tr key={teacher.id} onClick={() => handleViewTeacher(teacher)} style={{ cursor: 'pointer' }}>
                    <td>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.numbers}</td>
                    <td>{teacher.fatherName}</td>
                    <td>{teacher.courseNames && teacher.courseNames.length > 0 ? teacher.courseNames.join(', ') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
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
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.numbers}
                      onChange={(e) => setFormData({...formData, numbers: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Father's Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Salary</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Password {!editingTeacher && <span className="text-danger">*</span>}</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingTeacher}
                      placeholder={editingTeacher ? 'Leave empty to keep current password' : ''}
                    />
                  </div>
                  {!editingTeacher && (
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select
                        className="form-control"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                      >
                        <option value="TEACHER">Teacher</option>
                        <option value="ADMIN">Admin</option>
                        <option value="STAFF">Staff</option>
                      </select>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address?.city || ''}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Street</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address?.street || ''}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Courses</label>
                    <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {courses.length > 0 ? (
                        courses.map(course => (
                          <div key={course.id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`course-${course.id}`}
                              checked={formData.courseIds.includes(course.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    courseIds: [...formData.courseIds, course.id],
                                    courseNames: [...formData.courseNames, course.name]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    courseIds: formData.courseIds.filter(id => id !== course.id),
                                    courseNames: formData.courseNames.filter(name => name !== course.name)
                                  });
                                }
                              }}
                            />
                            <label className="form-check-label" htmlFor={`course-${course.id}`}>
                              {course.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted mb-0">No courses available</p>
                      )}
                    </div>
                    {formData.courseIds.length > 0 && (
                      <div className="form-text mt-2">
                        Selected: {formData.courseNames.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Profile Image</label>
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
                  {editingTeacher ? 'Update' : 'Add'} Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && <div className="modal-backdrop fade show"></div>}

      {/* View Modal */}
      <div className={`modal fade ${showViewModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Teacher Profile</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {viewingTeacher && (
                <div>
                  {/* Profile Image Section */}
                  <div className="text-center mb-4">
                    {viewingTeacher.profile ? (
                      <img
                        src={viewingTeacher.profile}
                        alt={viewingTeacher.name}
                        className="rounded-circle"
                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid #0d6efd' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center bg-light"
                        style={{ width: '150px', height: '150px', border: '3px solid #0d6efd' }}
                      >
                        <i className="bi bi-person-fill text-secondary" style={{ fontSize: '3rem' }}></i>
                      </div>
                    )}
                  </div>

                  {/* Teacher Information */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6 className="text-muted">Name</h6>
                      <p className="fw-bold">{viewingTeacher.name}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Email</h6>
                      <p className="fw-bold">{viewingTeacher.email}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Phone Number</h6>
                      <p className="fw-bold">{viewingTeacher.numbers || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Salary</h6>
                      <p className="fw-bold">₹{viewingTeacher.salary ? viewingTeacher.salary.toLocaleString() : '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Date</h6>
                      <p className="fw-bold">{viewingTeacher.date ? new Date(viewingTeacher.date).toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="col-12">
                      <h6 className="text-muted">Courses</h6>
                      <p className="fw-bold">
                        {viewingTeacher.courseNames && viewingTeacher.courseNames.length > 0 ? (
                          viewingTeacher.courseNames.map((course, idx) => (
                            <span key={idx} className="badge bg-primary me-2 mb-2">{course}</span>
                          ))
                        ) : (
                          '-'
                        )}
                      </p>
                    </div>
                    {viewingTeacher.address && (
                      <>
                        <div className="col-md-6">
                          <h6 className="text-muted">City</h6>
                          <p className="fw-bold">{viewingTeacher.address.city || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-muted">Street</h6>
                          <p className="fw-bold">{viewingTeacher.address.street || '-'}</p>
                        </div>
                      </>
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
                className="btn btn-danger"
                onClick={() => {
                  setShowViewModal(false);
                  if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
                    handleDelete(viewingTeacher.id);
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
                  handleEdit(viewingTeacher);
                }}
              >
                <i className="bi bi-pencil me-2"></i>Edit Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      {showViewModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Teachers;