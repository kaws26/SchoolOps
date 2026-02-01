import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/dashboard`, {
        headers: auth.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error loading dashboard');
    } finally {
      setLoading(false);
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
      <h2 className="mb-4">Teacher Dashboard</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                  <i className="bi bi-people text-primary fs-5"></i>
                </div>
                <div className="ms-3">
                  <h5 className="card-title mb-0">My Classes</h5>
                  <h3 className="text-primary fw-bold mb-0">{dashboardData.totalClasses}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                  <i className="bi bi-person-lines-fill text-success fs-5"></i>
                </div>
                <div className="ms-3">
                  <h5 className="card-title mb-0">Total Students</h5>
                  <h3 className="text-success fw-bold mb-0">{dashboardData.totalStudents}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                  <i className="bi bi-pencil-square text-info fs-5"></i>
                </div>
                <div className="ms-3">
                  <h5 className="card-title mb-0">Assignments</h5>
                  <h3 className="text-info fw-bold mb-0">{dashboardData.totalAssignments}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                  <i className="bi bi-exclamation-circle text-warning fs-5"></i>
                </div>
                <div className="ms-3">
                  <h5 className="card-title mb-0">Pending</h5>
                  <h3 className="text-warning fw-bold mb-0">{dashboardData.pendingAssignments}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Classes */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">My Classes</h5>
            </div>
            <div className="card-body">
              {dashboardData.recentClasses.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentClasses.map((cls) => (
                    <Link
                      key={cls.id}
                      to={`/teacher/classes/${cls.id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-1">{cls.name}</h6>
                        <small className="text-muted">{cls.section} - {cls.studentCount} students</small>
                      </div>
                      <i className="bi bi-chevron-right text-primary"></i>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No classes assigned yet</p>
              )}
            </div>
            <div className="card-footer bg-white border-top">
              <Link to="/teacher/classes" className="btn btn-sm btn-primary">
                View All Classes
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">Upcoming Assignments</h5>
            </div>
            <div className="card-body">
              {dashboardData.upcomingAssignments.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.upcomingAssignments.map((assignment) => (
                    <Link
                      key={assignment.id}
                      to={`/teacher/assignments/${assignment.id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                    >
                      <div className="w-100">
                        <h6 className="mb-1">{assignment.title}</h6>
                        <small className="text-muted">{assignment.className}</small>
                        <br />
                        <small className="text-danger">Due: {new Date(assignment.dueDate).toLocaleDateString()}</small>
                      </div>
                      <span className={`badge bg-${assignment.status === 'active' ? 'success' : 'warning'} ms-2`}>
                        {assignment.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No upcoming assignments</p>
              )}
            </div>
            <div className="card-footer bg-white border-top">
              <Link to="/teacher/assignments" className="btn btn-sm btn-primary">
                Manage Assignments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
