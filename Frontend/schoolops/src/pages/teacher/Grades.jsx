import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Grades = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classworks, setClassworks] = useState([]);
  const [selectedClassWork, setSelectedClassWork] = useState('');
  const [workIds, setWorkIds] = useState([]);
  const [grades, setGrades] = useState({});
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
    setSubmitted(false);
    setSelectedClassWork('');
    setWorkIds([]);
    setGrades({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/classroom/${classId}`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setClassworks(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load classwork');
      }
    } catch (error) {
      console.error('Error fetching classwork:', error);
      setError('Error loading classwork');
    }
  };

  const handleClassWorkSelect = (classWorkId) => {
    setSelectedClassWork(classWorkId);
    setSubmitted(false);

    const classwork = classworks.find(
      (item) => String(item.id) === String(classWorkId)
    );

    const ids = classwork?.workIds || [];
    const gradesObj = {};
    ids.forEach((id) => {
      gradesObj[id] = grades[id] || '';
    });

    setWorkIds(ids);
    setGrades(gradesObj);
  };

  const handleGradeChange = (workId, grade) => {
    setGrades({
      ...grades,
      [workId]: grade
    });
  };

  const handleSubmitGrades = async (e) => {
    e.preventDefault();

    try {
      const updates = workIds
        .filter((id) => grades[id] !== '' && grades[id] !== null && grades[id] !== undefined)
        .map((id) => ({
          id: Number(id),
          marks: Number(grades[id])
        }));

      const results = await Promise.all(
        updates.map((update) =>
          fetch(`${API_BASE_URL}/api/teacher/classroom/work`, {
            method: 'PUT',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify(update)
          })
        )
      );

      const allOk = results.every((res) => res.ok);

      if (allOk) {
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
              <option key={cls.id} value={cls.id}>{cls.name} - {cls.session || cls.time || 'N/A'}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && classworks.length > 0 ? (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom">
            <label className="form-label fw-semibold mb-0">Select Classwork</label>
          </div>
          <div className="card-body">
            <select
              className="form-select"
              value={selectedClassWork}
              onChange={(e) => handleClassWorkSelect(e.target.value)}
            >
              <option value="">Choose an assignment...</option>
              {classworks.map((work) => (
                <option key={work.id} value={work.id}>
                  {work.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : selectedClass ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No classwork found for this class.
        </div>
      ) : null}

      {selectedClassWork && workIds.length > 0 ? (
        <form onSubmit={handleSubmitGrades}>
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">Assignment Marks</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Work ID</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {workIds.map((workId) => (
                    <tr key={workId}>
                      <td className="fw-semibold">{workId}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={grades[workId]}
                          onChange={(e) => handleGradeChange(workId, e.target.value)}
                          placeholder="Enter marks"
                          min="0"
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
      ) : selectedClassWork ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No submissions found for this assignment.
        </div>
      ) : null}
    </div>
  );
};

export default Grades;
