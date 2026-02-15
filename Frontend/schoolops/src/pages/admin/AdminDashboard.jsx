import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const adminSections = [
    {
      title: 'Teachers',
      description: 'Manage teachers, their profiles and assignments',
      icon: 'bi-person-badge',
      path: '/admin/teachers',
      color: 'primary'
    },
    {
      title: 'Courses',
      description: 'Create and manage courses, assign teachers',
      icon: 'bi-book',
      path: '/admin/courses',
      color: 'success'
    },
    {
      title: 'Students',
      description: 'Manage student records and course enrollments',
      icon: 'bi-people',
      path: '/admin/students',
      color: 'info'
    },
    {
      title: 'Users',
      description: 'Manage user accounts and roles',
      icon: 'bi-person-circle',
      path: '/admin/users',
      color: 'warning'
    },
    {
      title: 'Manage Accounts',
      description: 'Run financial operations, reports, payroll lookup and analytics',
      icon: 'bi-cash-coin',
      path: '/admin/accounts',
      color: 'dark'
    },
    {
      title: 'Enquiries',
      description: 'View and respond to contact enquiries',
      icon: 'bi-envelope',
      path: '/admin/enquiries',
      color: 'secondary'
    },
    {
      title: 'Notice Board',
      description: 'Create and manage school notices',
      icon: 'bi-megaphone',
      path: '/admin/notices',
      color: 'danger'
    },
    {
      title: 'Gallery',
      description: 'Manage school photo gallery',
      icon: 'bi-images',
      path: '/admin/gallery',
      color: 'primary'
    }
  ];

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">Admin Dashboard</h1>
        <p className="lead text-muted">Manage all aspects of your school management system</p>
      </div>

      <div className="row g-4">
        {adminSections.map((section, index) => (
          <div key={index} className="col-md-6 col-lg-4">
            <Link to={section.path} className="text-decoration-none">
              <div className="card h-100 shadow hover-lift">
                <div className="card-body text-center p-4">
                  <div className={`bg-${section.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} style={{width: '80px', height: '80px'}}>
                    <i className={`bi ${section.icon} fs-1 text-${section.color}`}></i>
                  </div>
                  <h5 className="card-title fw-bold text-dark mb-3">{section.title}</h5>
                  <p className="card-text text-muted">{section.description}</p>
                  <div className={`btn btn-${section.color} mt-3`}>
                    Manage {section.title}
                    <i className="bi bi-arrow-right ms-2"></i>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="row mt-5 g-4">
        <div className="col-md-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <div className="stat-number text-primary">500+</div>
              <p className="text-muted mb-0">Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <div className="stat-number text-success">50+</div>
              <p className="text-muted mb-0">Teachers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <div className="stat-number text-info">25+</div>
              <p className="text-muted mb-0">Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <div className="stat-number text-warning">100%</div>
              <p className="text-muted mb-0">System Health</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
