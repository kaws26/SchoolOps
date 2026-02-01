import { useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [formData, setFormData] = useState({
    about: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/gallery`, {
        headers: auth.getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setGallery(data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select an image file');
      return;
    }

    try {
      const submitData = new FormData();
      
      // Create a blob from JSON and append as gallery
      const galleryBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' });
      submitData.append('gallery', galleryBlob, 'gallery.json');
      submitData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/api/admin/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`
        },
        body: submitData
      });

      if (response.ok) {
        fetchGallery();
        setShowModal(false);
        resetForm();
        alert('Image uploaded successfully');
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading to gallery:', error);
      alert('Error uploading image: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/gallery/${id}`, {
          method: 'DELETE',
          headers: auth.getAuthHeaders()
        });
        if (response.ok) {
          fetchGallery();
        }
      } catch (error) {
        console.error('Error deleting gallery item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      about: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFile(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openViewModal = (item) => {
    setSelectedGalleryItem(item);
    setShowViewModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid image file');
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Gallery Management</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>Add Image
        </button>
      </div>

      <div className="row g-4">
        {gallery.map(item => (
          <div key={item.id} className="col-md-4 col-lg-3">
            <div 
              className="card h-100 shadow"
              onClick={() => openViewModal(item)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="card-img-container" style={{ height: '200px', overflow: 'hidden' }}>
                <img
                  src={item.pic}
                  alt={item.about}
                  className="card-img-top"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <div className="card-body d-flex flex-column">
                <p className="card-text text-muted small flex-grow-1">
                  {item.about ? item.about.substring(0, 100) + (item.about.length > 100 ? '...' : '') : 'No description'}
                </p>
                <div className="mt-auto">
                  <small className="text-muted">
                    {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-images display-4 text-muted"></i>
          <h4 className="text-muted mt-3">No gallery items found</h4>
          <p className="text-muted">Upload images to showcase school activities and events.</p>
        </div>
      )}

      {/* Add Image Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Image to Gallery</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">About/Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.about}
                      onChange={(e) => setFormData({...formData, about: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Image File</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                    />
                    <div className="form-text">
                      Accepted formats: JPG, JPEG, PNG, GIF, WebP
                    </div>
                    {selectedFile && (
                      <div className="mt-2">
                        <small className="text-success">
                          Selected: {selectedFile.name}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Image
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && <div className="modal-backdrop fade show"></div>}

      {/* View Gallery Item Modal */}
      <div className={`modal fade ${showViewModal ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Gallery Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedGalleryItem && (
                <div>
                  <div className="mb-4">
                    <img
                      src={selectedGalleryItem.pic}
                      alt={selectedGalleryItem.about}
                      className="img-fluid rounded"
                      style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted">Description</h6>
                    <p className="lead">
                      {selectedGalleryItem.about || 'No description available'}
                    </p>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted">Date</h6>
                    <p className="lead">
                      {selectedGalleryItem.date ? new Date(selectedGalleryItem.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted">ID</h6>
                    <p className="text-monospace text-muted">
                      {selectedGalleryItem.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  handleDelete(selectedGalleryItem.id);
                  setShowViewModal(false);
                }}
              >
                <i className="bi bi-trash me-1"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {showViewModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Gallery;