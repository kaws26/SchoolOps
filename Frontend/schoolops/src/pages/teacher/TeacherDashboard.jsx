import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    recentClasses: [],
    upcomingAssignments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const coursesResponse = await fetch(`${API_BASE_URL}/api/teacher/courses`, {
        headers: auth.getAuthHeaders()
      });

      if (!coursesResponse.ok) {
        setError('Failed to load dashboard data');
        return;
      }

      const courses = await coursesResponse.json();
      const normalizedCourses = Array.isArray(courses) ? courses : [];

      const totalStudents = normalizedCourses.reduce(
        (sum, course) => sum + (course.studentNames?.length || 0),
        0
      );

      const classroomResults = await Promise.all(
        normalizedCourses.map(async (course) => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/teacher/classroom/${course.id}`,
              { headers: auth.getAuthHeaders() }
            );

            if (!response.ok) {
              return { course, classworks: [] };
            }

            const classworks = await response.json();
            return {
              course,
              classworks: Array.isArray(classworks) ? classworks : []
            };
          } catch (err) {
            console.error('Error fetching classroom data:', err);
            return { course, classworks: [] };
          }
        })
      );

      const allClassworks = classroomResults.flatMap(({ course, classworks }) =>
        classworks.map((classwork) => ({
          ...classwork,
          courseName: course.name
        }))
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingAssignments = allClassworks
        .filter((classwork) => classwork.lastDate)
        .map((classwork) => {
          const dueDate = new Date(classwork.lastDate);
          dueDate.setHours(0, 0, 0, 0);
          return {
            id: classwork.id,
            title: classwork.title,
            className: classwork.courseName,
            dueDate: classwork.lastDate,
            status: dueDate >= today ? 'active' : 'overdue'
          };
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      const pendingAssignments = upcomingAssignments.filter(
        (assignment) => assignment.status === 'active'
      ).length;

      const recentClasses = normalizedCourses.slice(0, 3).map((course) => ({
        id: course.id,
        name: course.name,
        section: course.session || course.time || 'N/A',
        studentCount: course.studentNames?.length || 0
      }));

      setDashboardData({
        totalClasses: normalizedCourses.length,
        totalStudents,
        totalAssignments: allClassworks.length,
        pendingAssignments,
        recentClasses,
        upcomingAssignments
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error loading dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const summary = useMemo(() => {
    const totalAssignments = dashboardData.totalAssignments || 0;
    const pendingAssignments = dashboardData.pendingAssignments || 0;
    const completedAssignments = Math.max(totalAssignments - pendingAssignments, 0);
    const completionRate = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;
    const pendingRate = totalAssignments > 0
      ? Math.round((pendingAssignments / totalAssignments) * 100)
      : 0;

    const upcomingAssignments = dashboardData.upcomingAssignments || [];
    const sortedUpcoming = [...upcomingAssignments].sort((a, b) => {
      const aDate = new Date(a.dueDate).getTime();
      const bDate = new Date(b.dueDate).getTime();
      return aDate - bDate;
    });

    return {
      totalAssignments,
      pendingAssignments,
      completedAssignments,
      completionRate,
      pendingRate,
      sortedUpcoming
    };
  }, [dashboardData]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

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
    <div className="teacher-dashboard">
      <div className="td-hero mb-4">
        <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
          <div>
            <p className="td-hero-kicker mb-1">Teacher Dashboard</p>
            <h2 className="td-hero-title mb-2">Today is {todayLabel}</h2>
            <p className="td-hero-subtitle mb-0">
              Stay on top of your classes, assignments, and student progress.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/teacher/assignments" className="btn btn-light btn-sm">
              <i className="bi bi-pencil-square me-2"></i>
              Create Assignment
            </Link>
            <Link to="/teacher/attendance" className="btn btn-outline-light btn-sm">
              <i className="bi bi-clipboard-check me-2"></i>
              Take Attendance
            </Link>
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              className="btn btn-outline-light btn-sm"
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
        <div className="td-hero-meta mt-3">
          <span>
            <i className="bi bi-clock me-2"></i>
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => fetchDashboardData(true)}>
            Try Again
          </button>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="td-kpi-card">
            <div className="td-kpi-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-people"></i>
            </div>
            <div>
              <p className="td-kpi-label">My Classes</p>
              <h3 className="td-kpi-value">{dashboardData.totalClasses}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="td-kpi-card">
            <div className="td-kpi-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-person-lines-fill"></i>
            </div>
            <div>
              <p className="td-kpi-label">Total Students</p>
              <h3 className="td-kpi-value">{dashboardData.totalStudents}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="td-kpi-card">
            <div className="td-kpi-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-pencil-square"></i>
            </div>
            <div>
              <p className="td-kpi-label">Assignments</p>
              <h3 className="td-kpi-value">{summary.totalAssignments}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="td-kpi-card">
            <div className="td-kpi-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-exclamation-circle"></i>
            </div>
            <div>
              <p className="td-kpi-label">Pending</p>
              <h3 className="td-kpi-value">{summary.pendingAssignments}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="card td-panel">
            <div className="card-body">
              <h5 className="td-section-title">Quick Actions</h5>
              <div className="d-grid gap-2">
                <Link to="/teacher/classes" className="td-quick-action">
                  <div>
                    <h6>Open My Classes</h6>
                    <p>View class rosters and schedules.</p>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </Link>
                <Link to="/teacher/grades" className="td-quick-action">
                  <div>
                    <h6>Update Grades</h6>
                    <p>Grade submissions and finalize scores.</p>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </Link>
                <Link to="/teacher/announcements" className="td-quick-action">
                  <div>
                    <h6>Post Announcement</h6>
                    <p>Share updates with your classes.</p>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </Link>
                <Link to="/teacher/students" className="td-quick-action">
                  <div>
                    <h6>Student Directory</h6>
                    <p>Find and review student profiles.</p>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card td-panel">
            <div className="card-body">
              <h5 className="td-section-title">Assignment Health</h5>
              <div className="td-progress-wrap">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Completed</span>
                  <span className="fw-semibold">{summary.completionRate}%</span>
                </div>
                <div className="progress td-progress">
                  <div className="progress-bar bg-success" style={{ width: `${summary.completionRate}%` }}></div>
                </div>
              </div>
              <div className="td-progress-wrap">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Pending</span>
                  <span className="fw-semibold">{summary.pendingRate}%</span>
                </div>
                <div className="progress td-progress">
                  <div className="progress-bar bg-warning" style={{ width: `${summary.pendingRate}%` }}></div>
                </div>
              </div>
              <div className="td-summary-row">
                <div>
                  <p className="mb-1 text-muted">Completed</p>
                  <h6 className="mb-0">{summary.completedAssignments}</h6>
                </div>
                <div>
                  <p className="mb-1 text-muted">Pending</p>
                  <h6 className="mb-0">{summary.pendingAssignments}</h6>
                </div>
                <div>
                  <p className="mb-1 text-muted">Total</p>
                  <h6 className="mb-0">{summary.totalAssignments}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card td-panel">
            <div className="card-body">
              <h5 className="td-section-title">Next Due Date</h5>
              {summary.sortedUpcoming.length > 0 ? (
                <div className="td-next-due">
                  <h6 className="mb-1">{summary.sortedUpcoming[0].title}</h6>
                  <p className="text-muted mb-2">{summary.sortedUpcoming[0].className}</p>
                  <div className="td-badge danger">
                    Due {new Date(summary.sortedUpcoming[0].dueDate).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <p className="text-muted mb-0">No upcoming assignments scheduled.</p>
              )}
              <Link to="/teacher/assignments" className="btn btn-sm btn-primary mt-3 w-100">
                Manage Assignments
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card td-panel h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="td-section-title mb-0">My Classes</h5>
                <Link to="/teacher/classes" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
              {dashboardData.recentClasses.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentClasses.map((cls) => (
                    <Link
                      key={cls.id}
                      to={`/teacher/classes/${cls.id}`}
                      className="list-group-item list-group-item-action td-list-item"
                    >
                      <div>
                        <h6 className="mb-1">{cls.name}</h6>
                        <small className="text-muted">{cls.section} • {cls.studentCount} students</small>
                      </div>
                      <i className="bi bi-chevron-right"></i>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No classes assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card td-panel h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="td-section-title mb-0">Upcoming Assignments</h5>
                <Link to="/teacher/assignments" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
              {summary.sortedUpcoming.length > 0 ? (
                <div className="list-group list-group-flush">
                  {summary.sortedUpcoming.map((assignment) => (
                    <Link
                      key={assignment.id}
                      to={`/teacher/assignments/${assignment.id}`}
                      className="list-group-item list-group-item-action td-list-item"
                    >
                      <div className="w-100">
                        <h6 className="mb-1">{assignment.title}</h6>
                        <small className="text-muted">{assignment.className}</small>
                        <div className="small text-danger mt-1">
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`badge bg-${assignment.status === 'active' ? 'success' : 'warning'} ms-2`}>
                        {assignment.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No upcoming assignments.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
