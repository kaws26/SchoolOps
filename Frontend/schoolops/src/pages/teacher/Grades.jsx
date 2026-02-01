import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Grades = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
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
    setSubmitted(false);

    try {
      const response = await fetch(`${API_BASE_URL}/teacher/classes/${classId}/students`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        const gradesObj = {};
        data.forEach(student => {
          gradesObj[student.id] = student.grade || '';
        });
        setGrades(gradesObj);
      } else {
        setError('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Error loading students');
    }
  };

  const handleGradeChange = (studentId, grade) => {
    setGrades({
      ...grades,
      [studentId]: grade
    });
  };

  const handleSubmitGrades = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/teacher/grades`, {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: JSON.stringify({
          classId: selectedClass,
          grades: grades
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setError('Failed to save grades');
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      setError('Error saving grades');
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
      <h2 className="mb-4">Manage Grades</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {submitted && <div className="alert alert-success">Grades saved successfully!</div>}

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
              <option key={cls.id} value={cls.id}>{cls.name} - {cls.section}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && students.length > 0 ? (
        <form onSubmit={handleSubmitGrades}>
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">Student Grades</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="fw-semibold">{student.firstName} {student.lastName}</td>
                      <td>{student.rollNumber}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={grades[student.id]}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          placeholder="Enter grade (A, B, C, etc.)"
                          maxLength="3"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-white border-top">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle me-2"></i>
                Save All Grades
              </button>
            </div>
          </div>
        </form>
      ) : selectedClass ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No students found in this class.
        </div>
      ) : null}
    </div>
  );
};

export default Grades;
