import { useEffect, useState } from "react";
import auth from "../../utils/auth";
import API_BASE_URL from "../../config";

const Classroom = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [classworks, setClassworks] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [errors, setErrors] = useState("");
  const [submissionMeta, setSubmissionMeta] = useState({});
  const [selectedFile, setSelectedFile] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/courses`, {
          headers: auth.getAuthHeaders(),
        });
        if (!response.ok) {
          setErrors("Failed to load courses.");
          return;
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourse(String(list[0].id));
        }
      } catch (err) {
        console.error("Error loading student courses:", err);
        setErrors("Unable to fetch courses.");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setClassworks([]);
      return;
    }

    const fetchClassroom = async () => {
      setLoadingWorks(true);
      setErrors("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/classroom/${selectedCourse}`, {
          headers: auth.getAuthHeaders(),
        });
        if (!response.ok) {
          setErrors("Failed to load classroom work.");
          return;
        }
        const data = await response.json();
        setClassworks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading classroom:", err);
        setErrors("Unable to fetch classroom work.");
      } finally {
        setLoadingWorks(false);
      }
    };

    fetchClassroom();
  }, [selectedCourse]);

  const handleSubmitWork = async (classWorkId) => {
    const file = selectedFile[classWorkId];
    const remarks = submissionMeta[classWorkId] || "";

    if (!file) {
      setErrors("Select a file before submission.");
      return;
    }

    setSubmittingId(classWorkId);
    setErrors("");

    try {
      const workPayload = { remarks };
      const formData = new FormData();
      formData.append("work", new Blob([JSON.stringify(workPayload)], { type: "application/json" }));
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/student/classroom/work/submit?classWorkId=${classWorkId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        setErrors("Submission failed. Try again.");
        return;
      }

      setSelectedFile((prev) => ({ ...prev, [classWorkId]: null }));
      setSubmissionMeta((prev) => ({ ...prev, [classWorkId]: "" }));
    } catch (err) {
      console.error("Error submitting classwork:", err);
      setErrors("Could not submit work at this time.");
    } finally {
      setSubmittingId(null);
    }
  };

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
        <h2 className="mb-0">Classroom</h2>
      </div>

      {errors && <div className="alert alert-danger">{errors}</div>}

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

      {loadingWorks ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : classworks.length > 0 ? (
        <div className="row g-3">
          {classworks.map((work) => (
            <div key={work.id} className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                    <h5 className="mb-0">{work.title || "Classwork"}</h5>
                    <span className="badge text-bg-info">
                      Due: {work.lastDate ? new Date(work.lastDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <p className="text-muted mb-2">{work.description || "No description provided."}</p>
                  <p className="mb-3">
                    <small className="text-muted">Total Marks: {work.totalMarks ?? "N/A"}</small>
                  </p>

                  <div className="row g-2 align-items-end">
                    <div className="col-lg-5">
                      <label className="form-label mb-1">Remarks (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={submissionMeta[work.id] || ""}
                        onChange={(e) =>
                          setSubmissionMeta((prev) => ({
                            ...prev,
                            [work.id]: e.target.value,
                          }))
                        }
                        placeholder="Add short note"
                      />
                    </div>
                    <div className="col-lg-5">
                      <label className="form-label mb-1">Upload File</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) =>
                          setSelectedFile((prev) => ({
                            ...prev,
                            [work.id]: e.target.files?.[0] || null,
                          }))
                        }
                      />
                    </div>
                    <div className="col-lg-2">
                      <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={() => handleSubmitWork(work.id)}
                        disabled={submittingId === work.id}
                      >
                        {submittingId === work.id ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No classroom work is currently available for this course.
        </div>
      )}
    </div>
  );
};

export default Classroom;
