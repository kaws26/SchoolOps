import { useEffect, useState } from "react";
import auth from "../../utils/auth";
import API_BASE_URL from "../../config";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/courses`, {
          headers: auth.getAuthHeaders(),
        });
        if (!response.ok) {
          setError("Failed to fetch courses.");
          return;
        }

        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching student courses:", err);
        setError("Unable to load courses right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
        <h2 className="mb-0">My Courses</h2>
        <span className="badge bg-primary-subtle text-primary">{courses.length} enrolled</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {courses.length > 0 ? (
        <div className="row g-3">
          {courses.map((course) => (
            <div key={course.id} className="col-md-6 col-xl-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">{course.name || `Course ${course.id}`}</h5>
                  <p className="text-muted mb-2">
                    <i className="bi bi-person-badge me-2"></i>
                    {course.teacherName || "Teacher not assigned"}
                  </p>
                  <p className="text-muted mb-2">
                    <i className="bi bi-clock me-2"></i>
                    {course.session || course.time || "Schedule not available"}
                  </p>
                  <p className="text-muted mb-0">
                    <i className="bi bi-hash me-2"></i>
                    Course ID: {course.id}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          You are not enrolled in any course yet.
        </div>
      )}
    </div>
  );
};

export default Courses;
