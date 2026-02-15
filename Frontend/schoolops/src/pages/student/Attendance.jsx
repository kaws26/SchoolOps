import { useEffect, useMemo, useState } from "react";
import auth from "../../utils/auth";
import API_BASE_URL from "../../config";

const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/courses`, {
          headers: auth.getAuthHeaders(),
        });
        if (!response.ok) {
          setError("Failed to load courses.");
          return;
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourse(String(list[0].id));
        }
      } catch (err) {
        console.error("Error fetching student courses:", err);
        setError("Unable to load courses.");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setAttendanceDates([]);
      return;
    }

    const fetchAttendance = async () => {
      setLoadingAttendance(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/attendance/${selectedCourse}`, {
          headers: auth.getAuthHeaders(),
        });
        if (!response.ok) {
          setError("Failed to load attendance.");
          return;
        }

        const data = await response.json();
        setAttendanceDates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError("Unable to load attendance data.");
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendance();
  }, [selectedCourse]);

  const attendancePercent = useMemo(() => {
    const classesHeld = 100;
    const present = attendanceDates.length;
    return classesHeld > 0 ? Math.min(Math.round((present / classesHeld) * 100), 100) : 0;
  }, [attendanceDates]);

  if (loadingCourses) {
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
        <h2 className="mb-0">Attendance</h2>
        <span className="badge text-bg-success">{attendancePercent}% (approx)</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <label className="form-label fw-semibold">Select Course</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={courses.length === 0}
          >
            {courses.length === 0 ? (
              <option value="">No courses available</option>
            ) : (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name || `Course ${course.id}`}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Present Dates</h5>
          {loadingAttendance ? (
            <div className="d-flex justify-content-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : attendanceDates.length > 0 ? (
            <div className="row g-2">
              {attendanceDates.map((dateValue, index) => (
                <div key={`${dateValue}-${index}`} className="col-md-4 col-lg-3">
                  <div className="badge text-bg-light border text-dark w-100 py-2">{dateValue}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-0">No attendance records found for the selected course.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
