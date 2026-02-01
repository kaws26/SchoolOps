import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

const SchoolHome = () => {
  const [courses, setCourses] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryData, setEnquiryData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: '',
    course: ''
  });

  useEffect(() => {
    fetchHomeData();
    fetchGallery();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/home`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/gallery`);
      if (response.ok) {
        const data = await response.json();
        setGallery(data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/enquery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enquiryData)
      });

      if (response.ok) {
        alert('Enquiry submitted successfully! We will contact you soon.');
        setShowEnquiryModal(false);
        setEnquiryData({
          name: '',
          email: '',
          mobile: '',
          subject: '',
          message: '',
          course: ''
        });
      } else {
        alert('Failed to submit enquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-background"></div>
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-100 py-5">
            <div className="col-lg-6 text-white">
              <h1 className="display-3 fw-bold mb-4 animate-fade-in">
                Welcome to Our School
              </h1>
              <p className="lead mb-4 animate-fade-in-delay">
                Nurturing minds, building futures. Experience excellence in education with modern facilities and dedicated faculty.
              </p>
              <div className="d-flex gap-3 animate-fade-in-delay-2">
                <button 
                  className="btn btn-light btn-lg px-4"
                  onClick={() => scrollToSection('courses-section')}
                >
                  <i className="bi bi-book me-2"></i>Explore Courses
                </button>
                <button 
                  className="btn btn-outline-light btn-lg px-4"
                  onClick={() => setShowEnquiryModal(true)}
                >
                  <i className="bi bi-envelope me-2"></i>Enquire Now
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-illustration animate-float">
                <i className="bi bi-mortarboard-fill text-white opacity-75" style={{ fontSize: '20rem' }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3 col-sm-6">
              <div className="stat-card p-4">
                <i className="bi bi-book-fill text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                <h3 className="fw-bold text-primary mb-2">{courses.length}+</h3>
                <p className="text-muted mb-0">Courses Offered</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card p-4">
                <i className="bi bi-people-fill text-success mb-3" style={{ fontSize: '3rem' }}></i>
                <h3 className="fw-bold text-success mb-2">
                  {courses.reduce((sum, course) => sum + (course.studentCount || 0), 0)}+
                </h3>
                <p className="text-muted mb-0">Active Students</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card p-4">
                <i className="bi bi-award-fill text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                <h3 className="fw-bold text-warning mb-2">100%</h3>
                <p className="text-muted mb-0">Success Rate</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card p-4">
                <i className="bi bi-star-fill text-danger mb-3" style={{ fontSize: '3rem' }}></i>
                <h3 className="fw-bold text-danger mb-2">4.9/5</h3>
                <p className="text-muted mb-0">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses-section" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-primary mb-3">Our Courses</h2>
            <p className="lead text-muted">Discover our diverse range of programs designed for excellence</p>
          </div>

          <div className="row g-4">
            {courses.map((course, index) => (
              <div key={course.id} className="col-md-6 col-lg-4">
                <div className="course-card h-100 shadow-sm" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="course-image">
                    {course.profile ? (
                      <img src={course.profile} alt={course.name} />
                    ) : (
                      <div className="course-placeholder">
                        <i className="bi bi-book"></i>
                      </div>
                    )}
                    {course.studentCount > 0 && (
                      <div className="course-badge">
                        <i className="bi bi-people-fill me-1"></i>
                        {course.studentCount} Students
                      </div>
                    )}
                  </div>
                  <div className="card-body p-4">
                    <h5 className="card-title text-primary fw-bold mb-3">{course.name}</h5>
                    <p className="card-text text-muted mb-3">
                      {course.about && course.about.length > 100
                        ? `${course.about.substring(0, 100)}...`
                        : course.about || 'Comprehensive course designed for success'}
                    </p>
                    <div className="course-details">
                      {course.duration && (
                        <div className="detail-item">
                          <i className="bi bi-clock text-primary me-2"></i>
                          <span>{course.duration}</span>
                        </div>
                      )}
                      {course.fees && (
                        <div className="detail-item">
                          <i className="bi bi-currency-rupee text-success me-2"></i>
                          <span className="fw-bold">₹{course.fees}</span>
                        </div>
                      )}
                      {course.teacherName && (
                        <div className="detail-item">
                          <i className="bi bi-person text-info me-2"></i>
                          <span>{course.teacherName}</span>
                        </div>
                      )}
                    </div>
                    <button 
                      className="btn btn-outline-primary w-100 mt-3"
                      onClick={() => {
                        setEnquiryData({ ...enquiryData, course: course.name });
                        setShowEnquiryModal(true);
                      }}
                    >
                      <i className="bi bi-info-circle me-2"></i>Enquire Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-primary mb-3">Our Gallery</h2>
              <p className="lead text-muted">Glimpses of our vibrant campus life</p>
            </div>

            <div className="row g-3">
              {gallery.slice(0, 8).map((item, index) => (
                <div key={item.id} className="col-md-3 col-sm-6">
                  <div 
                    className="gallery-item"
                    onClick={() => setSelectedImage(item)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <img src={item.pic} alt={item.caption || 'Gallery image'} />
                    <div className="gallery-overlay">
                      <i className="bi bi-zoom-in"></i>
                      {item.caption && <p className="mb-0 mt-2">{item.caption}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {gallery.length > 8 && (
              <div className="text-center mt-4">
                <Link to="/gallery" className="btn btn-primary btn-lg">
                  View Complete Gallery
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-primary mb-3">Why Choose Us</h2>
            <p className="lead text-muted">Excellence in every aspect of education</p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="feature-card text-center p-4 h-100">
                <div className="feature-icon bg-primary bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="bi bi-mortarboard-fill text-primary"></i>
                </div>
                <h5 className="fw-bold mb-3">Expert Faculty</h5>
                <p className="text-muted">Learn from experienced and dedicated teachers</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card text-center p-4 h-100">
                <div className="feature-icon bg-success bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="bi bi-laptop-fill text-success"></i>
                </div>
                <h5 className="fw-bold mb-3">Modern Facilities</h5>
                <p className="text-muted">State-of-the-art infrastructure and resources</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card text-center p-4 h-100">
                <div className="feature-icon bg-warning bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="bi bi-trophy-fill text-warning"></i>
                </div>
                <h5 className="fw-bold mb-3">Proven Results</h5>
                <p className="text-muted">Track record of student success and achievements</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="feature-card text-center p-4 h-100">
                <div className="feature-icon bg-info bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="bi bi-people-fill text-info"></i>
                </div>
                <h5 className="fw-bold mb-3">Supportive Community</h5>
                <p className="text-muted">Nurturing environment for holistic development</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 text-white position-relative">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="display-6 fw-bold mb-3">Ready to Start Your Journey?</h2>
              <p className="lead mb-0">Join our community of learners and achievers today!</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button 
                className="btn btn-light btn-lg px-5"
                onClick={() => setShowEnquiryModal(true)}
              >
                Get Started
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      <div className={`modal fade ${showEnquiryModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Submit Enquiry</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEnquiryModal(false)}
              ></button>
            </div>
            <form onSubmit={handleEnquirySubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enquiryData.name}
                    onChange={(e) => setEnquiryData({...enquiryData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={enquiryData.email}
                    onChange={(e) => setEnquiryData({...enquiryData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={enquiryData.mobile}
                    onChange={(e) => setEnquiryData({...enquiryData, mobile: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enquiryData.subject}
                    onChange={(e) => setEnquiryData({...enquiryData, subject: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Course of Interest</label>
                  <select
                    className="form-select"
                    value={enquiryData.course}
                    onChange={(e) => setEnquiryData({...enquiryData, course: e.target.value})}
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.name}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={enquiryData.message}
                    onChange={(e) => setEnquiryData({...enquiryData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEnquiryModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-send me-2"></i>Submit Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Gallery Lightbox */}
      {selectedImage && (
        <div className="gallery-lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
              <i className="bi bi-x-lg"></i>
            </button>
            <img src={selectedImage.imageUrl} alt={selectedImage.caption || 'Gallery image'} />
            {selectedImage.caption && (
              <div className="lightbox-caption">
                <p className="mb-0">{selectedImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showEnquiryModal && <div className="modal-backdrop fade show"></div>}

      <style jsx>{`
        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }

        .hero-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          overflow: hidden;
          line-height: 0;
        }

        .hero-wave svg {
          position: relative;
          display: block;
          width: calc(100% + 1.3px);
          height: 60px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 0.8s ease-out 0.4s both;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Stats Section */
        .stat-card {
          background: white;
          border-radius: 15px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        /* Course Cards */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .course-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: slideUp 0.6s ease-out both;
        }

        .course-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .course-image {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .course-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .course-card:hover .course-image img {
          transform: scale(1.1);
        }

        .course-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255,255,255,0.5);
        }

        .course-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255,255,255,0.95);
          color: #667eea;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .course-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
        }

        /* Gallery */
        .gallery-item {
          position: relative;
          border-radius: 15px;
          overflow: hidden;
          cursor: pointer;
          height: 200px;
          animation: slideUp 0.6s ease-out both;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .gallery-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(102, 126, 234, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;
          padding: 20px;
          text-align: center;
        }

        .gallery-overlay i {
          font-size: 2rem;
        }

        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        .gallery-item:hover img {
          transform: scale(1.1);
        }

        /* Gallery Lightbox */
        .gallery-lightbox {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .lightbox-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          animation: fadeIn 0.3s ease-out;
        }

        .lightbox-content img {
          max-width: 100%;
          max-height: 80vh;
          border-radius: 10px;
        }

        .lightbox-close {
          position: absolute;
          top: -50px;
          right: 0;
          background: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .lightbox-close:hover {
          background: #667eea;
          color: white;
        }

        .lightbox-caption {
          background: white;
          padding: 15px;
          border-radius: 10px;
          margin-top: 15px;
        }

        /* Features */
        .feature-card {
          background: white;
          border-radius: 15px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .feature-card:hover {
          border-color: #667eea;
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-icon i {
          font-size: 2.5rem;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-section {
            min-height: auto;
          }

          .hero-illustration {
            display: none;
          }

          .display-3 {
            font-size: 2.5rem;
          }

          .gallery-item {
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default SchoolHome;