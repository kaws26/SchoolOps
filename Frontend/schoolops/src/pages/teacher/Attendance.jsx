import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
        const attendanceObj = {};
        data.forEach(student => {
          attendanceObj[student.id] = 'present';
        });
        setAttendance(attendanceObj);
      } else {
        setError('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Error loading students');
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status
    });
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();

    try {
      const presentStudentIds = Object.entries(attendance)
        .filter(([, status]) => status === 'present')
        .map(([studentId]) => Number(studentId));

      const response = await fetch(`${API_BASE_URL}/api/teacher/attendance/${selectedClass}`, {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: JSON.stringify(presentStudentIds)
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setError('Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Error saving attendance');
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
      <h2 className="mb-4">Mark Attendance</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {submitted && <div className="alert alert-success">Attendance saved successfully!</div>}

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <label className="form-label fw-semibold mb-0">Select Class</label>
            </div>
            <div className="card-body">
              <select
                className="form-select"
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
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <label className="form-label fw-semibold mb-0">Select Date</label>
            </div>
            <div className="card-body">
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedClass && students.length > 0 ? (
        <form onSubmit={handleSubmitAttendance}>
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Attendance Sheet</h5>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => handleMarkAll('present')}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  All Present
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => handleMarkAll('absent')}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  All Absent
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="fw-semibold">{student.name}</td>
                      <td>{student.rollNo}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <input
                            type="radio"
                            className="btn-check"
                            name={`attendance-${student.id}`}
                            id={`present-${student.id}`}
                            value="present"
                            checked={attendance[student.id] === 'present'}
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          />
                          <label
                            className="btn btn-outline-success btn-sm"
                            htmlFor={`present-${student.id}`}
                          >
                            Present
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name={`attendance-${student.id}`}
                            id={`absent-${student.id}`}
                            value="absent"
                            checked={attendance[student.id] === 'absent'}
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          />
                          <label
                            className="btn btn-outline-danger btn-sm"
                            htmlFor={`absent-${student.id}`}
                          >
                            Absent
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name={`attendance-${student.id}`}
                            id={`leave-${student.id}`}
                            value="leave"
                            checked={attendance[student.id] === 'leave'}
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          />
                          <label
                            className="btn btn-outline-warning btn-sm"
                            htmlFor={`leave-${student.id}`}
                          >
                            Leave
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-white border-top">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check-circle me-2"></i>
                Save Attendance
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

export default Attendance;
