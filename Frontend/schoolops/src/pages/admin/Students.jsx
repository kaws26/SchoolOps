import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [formData, setFormData] = useState({
    rollNo: '',
    registrationNo: '',
    name: '',
    dob: '',
    sex: '',
    fatherName: '',
    email: '',
    addBy: '',
    numbers: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [addCourseData, setAddCourseData] = useState({
    courseId: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingStudent ? `/api/admin/students/${editingStudent.id}` : '/api/admin/students';
      const method = editingStudent ? 'PUT' : 'POST';

      // Normalize form data - convert empty strings to null and parse numbers
      const normalizedFormData = {
        rollNo: formData.rollNo ? parseInt(formData.rollNo) : 0,
        registrationNo: formData.registrationNo ? parseInt(formData.registrationNo) : 0,
        name: formData.name || null,
        dob: formData.dob || null,
        sex: formData.sex || null,
        fatherName: formData.fatherName || null,
        email: formData.email || null,
        addBy: formData.addBy || 'BY_ADMIN',
        numbers: formData.numbers ? parseInt(formData.numbers) : null,
        address: {
          street: formData.address.street || null,
          city: formData.address.city || null,
          state: formData.address.state || null,
          zipCode: formData.address.zipCode || null
        }
      };

      if (editingStudent) {
        // For UPDATE: use multipart/form-data
        const formDataToSend = new FormData();
        formDataToSend.append('student', new Blob([JSON.stringify(normalizedFormData)], { type: 'application/json' }));
        
        if (profileFile) {
          formDataToSend.append('file', profileFile);
        }

        const headers = auth.getAuthHeaders();
        delete headers['Content-Type'];

        const response = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: headers,
          body: formDataToSend
        });

        if (response.ok) {
          fetchStudents();
          setShowModal(false);
          resetForm();
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error updating student:', errorData);
          alert('Failed to update student. Please try again.');
        }
      } else {
        // For CREATE: use JSON
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: {
            ...auth.getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(normalizedFormData)
        });

        if (response.ok) {
          fetchStudents();
          setShowModal(false);
          resetForm();
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error creating student:', errorData);
          alert('Failed to create student. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving student:', error);
      alert('An error occurred while saving the student.');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/students/${selectedStudent.id}/courses/${addCourseData.courseId}`, {
        method: 'POST',
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        fetchStudents();
        setShowAddCourseModal(false);
        setAddCourseData({ courseId: '' });
        alert('Course added successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error adding course:', errorData);
        alert('Failed to add course. Please try again.');
      }
    } catch (error) {
      console.error('Error adding course to student:', error);
      alert('An error occurred while adding the course.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/students/${id}`, {
          method: 'DELETE',
          headers: auth.getAuthHeaders()
        });
        if (response.ok) {
          fetchStudents();
          alert('Student deleted successfully!');
        } else {
          alert('Failed to delete student.');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('An error occurred while deleting the student.');
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      rollNo: student.rollNo || '',
      registrationNo: student.registrationNo || '',
      name: student.name || '',
      dob: student.dob || '',
      sex: student.sex || '',
      fatherName: student.fatherName || '',
      email: student.email || '',
      addBy: student.addBy || 'BY_ADMIN',
      numbers: student.numbers || '',
      address: student.address || {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
    setProfileFile(null);
    setShowModal(true);
  };

  const handleAddCourseToStudent = (student) => {
    setSelectedStudent(student);
    setAddCourseData({ courseId: '' });
    setShowAddCourseModal(true);
  };

  const resetForm = () => {
    setFormData({
      rollNo: '',
      registrationNo: '',
      name: '',
      dob: '',
      sex: '',
      fatherName: '',
      email: '',
      addBy: 'BY_ADMIN',
      numbers: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
    setEditingStudent(null);
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
        <h2 className="text-primary fw-bold">Students Management</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>Add Student
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Roll No</th>
                  <th>Registration No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Sex</th>
                  <th>Courses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.rollNo}</td>
                    <td>{student.registrationNo}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {student.profileImageUrl && (
                          <img 
                            src={student.profileImageUrl} 
                            alt={student.name}
                            className="rounded-circle me-2"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                        )}
                        {student.name}
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.numbers}</td>
                    <td>{student.sex}</td>
                    <td>
                      {student.courseNames && student.courseNames.length > 0 ? (
                        <div>
                          {student.courseNames.map((courseName, index) => (
                            <span key={index} className="badge bg-primary me-1">
                              {courseName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No courses</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(student)}
                        title="Edit Student"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success me-2"
                        onClick={() => handleAddCourseToStudent(student)}
                        title="Add Course"
                      >
                        <i className="bi bi-plus-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(student.id)}
                        title="Delete Student"
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
                {editingStudent ? 'Edit Student' : 'Add Student'}
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
                    <label className="form-label">Roll No</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                      placeholder="Auto-generated if left empty"
                    />
                    <small className="text-muted">Leave empty for auto-generation</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Registration No</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.registrationNo}
                      onChange={(e) => setFormData({...formData, registrationNo: e.target.value})}
                      placeholder="Auto-generated if left empty"
                    />
                    <small className="text-muted">Leave empty for auto-generation</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
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
                    <label className="form-label">Email *</label>
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
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sex</label>
                    <select
                      className="form-select"
                      value={formData.sex}
                      onChange={(e) => setFormData({...formData, sex: e.target.value})}
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {editingStudent && (
                    <div className="col-12">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => setProfileFile(e.target.files && e.target.files[0])}
                      />
                      <small className="text-muted">Only available when editing a student</small>
                    </div>
                  )}
                  <div className="col-12">
                    <hr />
                    <h6 className="text-primary">Address Information</h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Street</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address.street}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address.city}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address.state}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, zipCode: e.target.value}})}
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
                  {editingStudent ? 'Update' : 'Add'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      <div className={`modal fade ${showAddCourseModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Course to {selectedStudent?.name}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddCourseModal(false)}
              ></button>
            </div>
            <form onSubmit={handleAddCourse}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Course</label>
                  <select
                    className="form-select"
                    value={addCourseData.courseId}
                    onChange={(e) => setAddCourseData({ courseId: e.target.value })}
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} {course.fees && `- ₹${course.fees}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Adding a course will automatically create a financial transaction for the student.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddCourseModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {(showModal || showAddCourseModal) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Students;