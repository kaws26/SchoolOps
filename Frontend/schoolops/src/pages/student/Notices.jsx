import { useEffect, useState } from "react";
import auth from "../../utils/auth";
import API_BASE_URL from "../../config";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/notices`, {
          headers: auth.getAuthHeaders(),
        });
        if (!response.ok) {
          setError("Failed to load notices.");
          return;
        }
        const data = await response.json();
        setNotices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError("Unable to fetch notices.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
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
        <h2 className="mb-0">Notice Board</h2>
        <span className="badge bg-primary-subtle text-primary">{notices.length} notices</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {notices.length > 0 ? (
        <div className="row g-3">
          {notices.map((notice, index) => (
            <div key={notice.id || `${notice.title}-${index}`} className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h5 className="card-title mb-2">{notice.title || "Notice"}</h5>
                      <p className="card-text text-muted mb-2">{notice.description || notice.message || "No details provided."}</p>
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-2"></i>
                        {notice.createdDate
                          ? new Date(notice.createdDate).toLocaleString()
                          : "Date unavailable"}
                      </small>
                    </div>
                    <span className="badge text-bg-info">New</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No notices available at the moment.
        </div>
      )}
    </div>
  );
};

export default Notices;
