import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { complaintService } from "../services/api";

const CATEGORIES = [
  "Roads & Infrastructure",
  "Water Supply",
  "Sanitation & Waste",
  "Street Lighting",
  "Public Safety",
  "Environmental Issues",
  "Noise Pollution",
  "Other",
];

const SubmitComplaints = () => {
  const [formData, setFormData] = useState({
    name: "",
    ward: "",
    location: "",
    category: "",
    description: "",
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          photo: "Please select an image file",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photo: "Image size should be less than 5MB",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, photo: file }));
      setErrors((prev) => ({ ...prev, photo: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.ward.trim()) {
      newErrors.ward = "Ward is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("ward", formData.ward.trim());
      data.append("location", formData.location.trim());
      data.append("category", formData.category);
      data.append("description", formData.description.trim());
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      await complaintService.createComplaint(data);
      setSuccessMessage(
        "Complaint submitted successfully! Redirecting to your complaints..."
      );
      setTimeout(() => {
        navigate("/my-complaints");
      }, 2000);
    } catch (err) {
      setErrorMessage(
        err.message || "Failed to submit complaint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <div className="complaint-form-card">
        <h2>Submit a Complaint</h2>
        <p className="form-subtitle">
          Help us improve your community by reporting issues that need attention
        </p>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="name">Your Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="ward">Ward *</label>
            <input
              type="text"
              id="ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className={errors.ward ? "error" : ""}
              placeholder="Enter your ward number or name"
            />
            {errors.ward && <span className="error-text">{errors.ward}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? "error" : ""}
              placeholder="Enter specific location (street, landmark, etc.)"
            />
            {errors.location && (
              <span className="error-text">{errors.location}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`${errors.category ? "error" : ""} ${
                formData.category ? "has-value" : ""
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {formData.category && (
              <div className="selected-category">
                Selected: <strong>{formData.category}</strong>
              </div>
            )}
            {errors.category && (
              <span className="error-text">{errors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? "error" : ""}
              placeholder="Describe the issue in detail..."
              rows="5"
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="photo">Photo (Optional)</label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            {errors.photo && <span className="error-text">{errors.photo}</span>}
            <small className="photo-hint">
              Upload a photo to help us better understand the issue. Supported
              formats: JPG, PNG, GIF. Max size: 5MB.
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/my-complaints")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaints;