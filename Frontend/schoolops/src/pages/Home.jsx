const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="hero-section container-fluid bg-gradient-primary px-0 mb-5">
        <div className="row align-items-center px-3 py-5">
          <div className="col-lg-6 text-grey">
            <h1 className="display-4 fw-bold mb-4">Empowering Education Through Technology</h1>
            <p className="lead mb-4">Streamline school operations, enhance learning experiences, and connect educators, students, and parents in one comprehensive platform.</p>
            <div className="d-flex gap-3 flex-wrap">
              <a href="#features" className="btn btn-light btn-lg px-4">Explore Features</a>
              <a href="/signup" className="btn btn-dark btn-lg px-4 ">Get Started</a>
            </div>
          </div>
          <div className="col-lg-6 text-center">
            <img src="https://res.cloudinary.com/dzffxmfsu/image/upload/v1769874234/47300623-bc14-489d-9e6a-00b670f18473_epxp72.png" alt="School Management System" className="img-fluid rounded shadow-lg" />
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

      {/* Platform Highlights Section */}
      <div className="stats-section py-5">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3">
              <div className="stat-number">
                <i className="bi bi-shield-check"></i>
              </div>
              <p className="text-muted mb-0 fw-semibold">Secure & Reliable</p>
            </div>
            <div className="col-md-3">
              <div className="stat-number">
                <i className="bi bi-lightning-charge"></i>
              </div>
              <p className="text-muted mb-0 fw-semibold">Fast & Scalable</p>
            </div>
            <div className="col-md-3">
              <div className="stat-number">
                <i className="bi bi-sliders"></i>
              </div>
              <p className="text-muted mb-0 fw-semibold">Highly Configurable</p>
            </div>
            <div className="col-md-3">
              <div className="stat-number">
                <i className="bi bi-people"></i>
              </div>
              <p className="text-muted mb-0 fw-semibold">Built for Real Users</p>
            </div>
          </div>
        </div>
      </div>


      {/* About Section */}
      <div className="about-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold text-primary mb-4">
                Built With Real School Needs in Mind
              </h2>

              <p className="lead text-muted mb-4">
                SchoolOps is a modern school management platform designed to simplify everyday
                academic and administrative workflows. Instead of overloading users with
                unnecessary features, we focus on clarity, efficiency, and ease of use.
              </p>

              <p className="text-muted mb-4">
                From managing students and staff to handling schedules, communication, and reports,
                SchoolOps brings essential school operations into one unified system that is easy
                to adopt and scale over time.
              </p>

              <ul className="list-unstyled check-list">
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Clean and intuitive user experience
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Role-based access for admins, teachers, parents, and students
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Designed to grow with your institution
                </li>
                <li>
                  <i className="bi bi-check-circle-fill"></i>
                  Focused on real-world usability, not marketing hype
                </li>
              </ul>
            </div>

            <div className="col-lg-6">
              <img
                src="https://res.cloudinary.com/dzffxmfsu/image/upload/v1769875105/8b2f488c-7557-4ccb-bafb-c980085bef41_natwdc.png"
                alt="About SchoolOps"
                className="img-fluid rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="cta-section text-white py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">
            Ready to Simplify School Management?
          </h2>

          <p className="lead mb-4">
            Explore how SchoolOps can help streamline operations, improve communication,
            and reduce administrative overhead for your institution.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a href="/contact" className="btn btn-light btn-lg px-4">
              Contact Us
            </a>
            <a href="/signup" className="btn btn-outline-light btn-lg px-4">
              Get Started
            </a>
          </div>
        </div>
      </div>

    </>
  );
};

export default Home;
