import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import auth from "../../utils/auth";
import API_BASE_URL from "../../config";

const PDF_CARD_WIDTH_MM = 86;
const PDF_CARD_HEIGHT_MM = 54;

const loadExternalScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve(true);
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const idCardRef = useRef(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [profileRes, coursesRes, noticesRes, accountRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/student/profile`, { headers: auth.getAuthHeaders() }),
        fetch(`${API_BASE_URL}/api/student/courses`, { headers: auth.getAuthHeaders() }),
        fetch(`${API_BASE_URL}/api/student/notices`, { headers: auth.getAuthHeaders() }),
        fetch(`${API_BASE_URL}/api/student/account`, { headers: auth.getAuthHeaders() }),
      ]);

      if (!profileRes.ok || !coursesRes.ok || !noticesRes.ok || !accountRes.ok) {
        setError("Failed to load dashboard data.");
        return;
      }

      const [profileData, coursesData, noticesData, accountData] = await Promise.all([
        profileRes.json(),
        coursesRes.json(),
        noticesRes.json(),
        accountRes.json(),
      ]);

      setProfile(profileData || null);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setNotices(Array.isArray(noticesData) ? noticesData : []);
      setAccount(accountData || null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading student dashboard:", err);
      setError("Unable to load student dashboard right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const summary = useMemo(() => {
    const safeAccount = account || {};
    const transactions = Array.isArray(safeAccount.transactions) ? safeAccount.transactions : [];
    const paidTotal = transactions
      .filter((txn) => String(txn.type || "").toUpperCase() === "CREDIT")
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

    const currentBalance = Number(safeAccount.accountBalance ?? safeAccount.balance ?? 0);
    const pendingTotal = Math.max(
      Number(safeAccount.dues ?? safeAccount.pendingAmount ?? (currentBalance < 0 ? Math.abs(currentBalance) : 0)),
      0
    );

    return {
      fullName: profile?.name || `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Student",
      courseCount: courses.length,
      noticeCount: notices.length,
      pendingTotal,
      paidTotal,
      recentNotices: notices.slice(0, 4),
    };
  }, [account, courses, notices, profile]);

  const profileFields = useMemo(
    () => [
      { label: "Student ID", value: profile?.id },
      { label: "Roll No", value: profile?.rollNo },
      { label: "Registration No", value: profile?.registrationNo },
      {
        label: "Date of Birth",
        value: profile?.dob
          ? new Date(profile.dob).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
          : null,
      },
      { label: "Gender", value: profile?.sex },
      { label: "Father Name", value: profile?.fatherName },
      { label: "Email", value: profile?.email },
      { label: "Mobile", value: profile?.numbers },
      { label: "Address", value: [profile?.address?.street, profile?.address?.city].filter(Boolean).join(", ") || null },
      { label: "Added By", value: profile?.addBy },
      {
        label: "Courses",
        value:
          (Array.isArray(profile?.courseNames) && profile.courseNames.length > 0 && profile.courseNames.join(", ")) || null,
      },
    ],
    [profile]
  );

  const handleDownloadIdCard = async () => {
    if (!idCardRef.current || !profile) return;

    setGeneratingPdf(true);
    setError("");
    try {
      await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

      if (!window.html2canvas || !window.jspdf?.jsPDF) {
        throw new Error("PDF libraries unavailable.");
      }

      const canvas = await window.html2canvas(idCardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [PDF_CARD_HEIGHT_MM, PDF_CARD_WIDTH_MM],
      });
      pdf.addImage(imageData, "PNG", 0, 0, PDF_CARD_WIDTH_MM, PDF_CARD_HEIGHT_MM, undefined, "FAST");

      const safeName = (profile.name || "student").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
      pdf.save(`${safeName}_id_card.pdf`);
    } catch (err) {
      console.error("Error generating ID card PDF:", err);
      setError("Unable to generate ID card PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
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

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="student-dashboard">
      <div className="sd-hero">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
          <div>
            <p className="sd-hero-kicker mb-1">Student Dashboard</p>
            <h2 className="sd-hero-title mb-2">Hello, {summary.fullName}</h2>
            <p className="sd-hero-subtitle mb-0">Today is {todayLabel}. Track courses, attendance, and fee payments.</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/student/classroom" className="btn btn-light btn-sm">
              <i className="bi bi-journal-text me-2"></i>
              Open Classroom
            </Link>
            <Link to="/student/account" className="btn btn-outline-light btn-sm">
              <i className="bi bi-wallet2 me-2"></i>
              Pay Fees
            </Link>
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Refreshing
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
        <div className="sd-hero-meta mt-3">
          <i className="bi bi-clock me-2"></i>
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <div className="row g-3 mt-1">
        <div className="col-sm-6 col-xl-3">
          <div className="sd-kpi-card">
            <div className="sd-kpi-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-journal-bookmark"></i>
            </div>
            <div>
              <p className="sd-kpi-label">Courses</p>
              <h3 className="sd-kpi-value">{summary.courseCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="sd-kpi-card">
            <div className="sd-kpi-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-megaphone"></i>
            </div>
            <div>
              <p className="sd-kpi-label">Active Notices</p>
              <h3 className="sd-kpi-value">{summary.noticeCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="sd-kpi-card">
            <div className="sd-kpi-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-cash-stack"></i>
            </div>
            <div>
              <p className="sd-kpi-label">Paid Total</p>
              <h3 className="sd-kpi-value">Rs {summary.paidTotal.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="sd-kpi-card">
            <div className="sd-kpi-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-exclamation-circle"></i>
            </div>
            <div>
              <p className="sd-kpi-label">Pending Dues</p>
              <h3 className="sd-kpi-value">Rs {summary.pendingTotal.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-12">
          <div className="card sd-panel">
            <div className="card-body">
              <div className="d-flex flex-column flex-xl-row gap-4 align-items-start">
                <div className="sd-profile-photo-wrap">
                  {profile?.profile ? (
                    <img src={profile.profile} alt={summary.fullName} className="sd-profile-photo" crossOrigin="anonymous" />
                  ) : (
                    <div className="sd-profile-photo sd-photo-placeholder">
                      <i className="bi bi-person-badge"></i>
                    </div>
                  )}
                </div>
                <div className="flex-grow-1 w-100">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <h5 className="sd-section-title mb-0">Student Profile</h5>
                    <span className="badge text-bg-light border text-dark px-3 py-2">Status: Active</span>
                  </div>
                  <div className="row g-2">
                    {profileFields.map(({ label, value }) => (
                      <div className="col-sm-6 col-xl-4" key={label}>
                        <div className="sd-profile-item">
                          <small>{label}</small>
                          <strong>{value || "N/A"}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card sd-panel h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="sd-section-title mb-0">My Courses</h5>
                <Link to="/student/courses" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              {courses.length > 0 ? (
                <div className="list-group list-group-flush">
                  {courses.slice(0, 4).map((course) => (
                    <div key={course.id} className="list-group-item sd-list-item">
                      <div>
                        <h6 className="mb-1">{course.name || `Course ${course.id}`}</h6>
                        <small className="text-muted">{course.teacherName || course.session || course.time || "Ongoing"}</small>
                      </div>
                      <Link to="/student/attendance" className="btn btn-sm btn-outline-secondary">
                        Attendance
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No courses assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card sd-panel h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="sd-section-title mb-0">Recent Notices</h5>
                <Link to="/student/notices" className="btn btn-sm btn-outline-primary">
                  Open Board
                </Link>
              </div>
              {summary.recentNotices.length > 0 ? (
                <div className="list-group list-group-flush">
                  {summary.recentNotices.map((notice, index) => (
                    <div key={notice.id || `${notice.title}-${index}`} className="list-group-item sd-list-item">
                      <div>
                        <h6 className="mb-1">{notice.title || "Notice"}</h6>
                        <small className="text-muted">
                          {notice.description || notice.message || "No additional details."}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No notices available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card sd-panel mt-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h5 className="sd-section-title mb-0">Digital Student ID Card</h5>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleDownloadIdCard} disabled={generatingPdf}>
              {generatingPdf ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Generating PDF
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Download PDF
                </>
              )}
            </button>
          </div>

          <div className="sd-id-stage">
            <div className="sd-id-card" ref={idCardRef}>
              <div className="sd-id-card__bg"></div>
              <div className="sd-id-card__header">
                <div>
                  <p className="mb-0 sd-id-school">SchoolOps Academy</p>
                  <small className="sd-id-subtitle">Official Student Identification</small>
                </div>
                <span className="sd-id-chip">2026</span>
              </div>

              <div className="sd-id-card__body">
                <div className="sd-id-avatar-wrap">
                  {profile?.profile ? (
                    <img src={profile.profile} alt={summary.fullName} className="sd-id-avatar" crossOrigin="anonymous" />
                  ) : (
                    <div className="sd-id-avatar sd-photo-placeholder">
                      <i className="bi bi-person"></i>
                    </div>
                  )}
                </div>
                <div className="sd-id-info">
                  <h6>{summary.fullName}</h6>
                  <p>
                    ID: {profile?.id || "N/A"} | Roll: {profile?.rollNo || "N/A"}
                  </p>
                  <p>Reg No: {profile?.registrationNo || "N/A"}</p>
                  <p>DOB: {profile?.dob || "N/A"}</p>
                  <p>Course: {profile?.courseNames?.[0] || "N/A"}</p>
                  <p className="sd-id-contact">{profile?.numbers || "N/A"}</p>
                </div>
              </div>

              <div className="sd-id-card__footer">
                <span>{[profile?.address?.street, profile?.address?.city].filter(Boolean).join(", ") || "Address unavailable"}</span>
                <span className="sd-id-issuer">Issued by School Administration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
