import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Students = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/courses`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Error loading classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = async (classId) => {
    setSelectedClass(classId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/search/students/by-course?courseId=${classId}`,
        {
          method: 'POST',
          headers: auth.getAuthHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Error loading students');
    }
  };

  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(student.rollNo || '').includes(searchTerm) ||
    String(student.registrationNo || '').includes(searchTerm)
  );

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
      <h2 className="mb-4">My Students</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom">
          <label className="form-label fw-semibold mb-0">Select Class</label>
        </div>
        <div className="card-body">
          <select
            className="form-select form-select-lg"
            value={selectedClass}
            onChange={(e) => handleClassSelect(e.target.value)}
          >
            <option value="">Choose a class...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name} - {cls.session || cls.time || 'N/A'}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && students.length > 0 ? (
        <div>
          <div className="mb-4">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Search students by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">Student List ({filteredStudents.length})</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="fw-semibold">{student.rollNo}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.numbers}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" title="View Profile">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-info" title="View Grades">
                            <i className="bi bi-file-earmark-text"></i>
                          </button>
                          <button className="btn btn-outline-warning" title="View Attendance">
                            <i className="bi bi-clipboard-check"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedClass ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No students found in this class.
        </div>
      ) : null}
    </div>
  );
};

export default Students;
