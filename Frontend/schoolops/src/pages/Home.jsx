const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="hero-section container-fluid bg-gradient-primary px-0 mb-5">
        <div className="row align-items-center px-3 py-5">
          <div className="col-lg-6 text-white">
            <h1 className="display-4 fw-bold mb-4">Empowering Education Through Technology</h1>
            <p className="lead mb-4">Streamline school operations, enhance learning experiences, and connect educators, students, and parents in one comprehensive platform.</p>
            <div className="d-flex gap-3 flex-wrap">
              <a href="#features" className="btn btn-light btn-lg px-4">Explore Features</a>
              <a href="/signup" className="btn btn-outline-light btn-lg px-4">Get Started</a>
            </div>
          </div>
          <div className="col-lg-6 text-center">
            <img src="/img/header.png" alt="School Management System" className="img-fluid rounded shadow-lg" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary">Comprehensive School Management</h2>
          <p className="lead text-muted">Everything you need to manage your educational institution efficiently</p>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <h5 className="card-title fw-bold">Student Management</h5>
              <p className="card-text text-muted">Track student progress, attendance, grades, and academic performance with detailed analytics.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="bi bi-person-badge"></i>
              </div>
              <h5 className="card-title fw-bold">Teacher Tools</h5>
              <p className="card-text text-muted">Empower educators with lesson planning, gradebook management, and communication tools.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="bi bi-house-door"></i>
              </div>
              <h5 className="card-title fw-bold">Parent Portal</h5>
              <p className="card-text text-muted">Keep parents informed with real-time updates on their child's progress and school activities.</p>
            </div>
          </div>
        </div>
        <div className="row g-4 mt-2">
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="bi bi-calendar-event"></i>
              </div>
              <h5 className="card-title fw-bold">Timetable Management</h5>
              <p className="card-text text-muted">Create and manage class schedules, exams, and events with automated conflict resolution.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <h5 className="card-title fw-bold">Fee Management</h5>
              <p className="card-text text-muted">Handle fee collection, payments, and financial reporting with integrated payment gateways.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="bi bi-bar-chart-line"></i>
              </div>
              <h5 className="card-title fw-bold">Analytics & Reports</h5>
              <p className="card-text text-muted">Generate comprehensive reports and insights to drive data-informed decisions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section py-5">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3">
              <div className="stat-number">10,000+</div>
              <p className="text-muted mb-0 fw-semibold">Students Enrolled</p>
            </div>
            <div className="col-md-3">
              <div className="stat-number">500+</div>
              <p className="text-muted mb-0 fw-semibold">Teachers</p>
            </div>
            <div className="col-md-3">
              <div className="stat-number">50+</div>
              <p className="text-muted mb-0 fw-semibold">Schools</p>
            </div>
            <div className="col-md-3">
              <div className="stat-number">98%</div>
              <p className="text-muted mb-0 fw-semibold">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold text-primary mb-4">Why Choose SchoolOps?</h2>
              <p className="lead text-muted mb-4">
                SchoolOps revolutionizes educational management by providing a unified platform that simplifies administrative tasks,
                enhances communication, and improves learning outcomes.
              </p>
              <ul className="list-unstyled check-list">
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Cloud-based solution accessible from anywhere
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Real-time data synchronization and backup
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Mobile-responsive design for all devices
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  24/7 customer support and training
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <img src="/img/about.png" alt="About SchoolOps" className="img-fluid rounded shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section text-white py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">Ready to Transform Your School?</h2>
          <p className="lead mb-4">Join thousands of educational institutions already using SchoolOps to streamline their operations.</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a href="/contact" className="btn btn-light btn-lg px-4">Contact Us</a>
            <a href="/signup" className="btn btn-outline-light btn-lg px-4">Start Free Trial</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
