import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { complaintService } from "../services/api";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await complaintService.getComplaints();
      setComplaints(data);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("Failed to fetch complaints. Please try again.");
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await complaintService.getComplaints();
        if (!ignore) {
          setComplaints(data);
          setErrorMessage("");
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage("Failed to fetch complaints. Please try again.");
        }
        console.error("Error fetching complaints:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredComplaints = useMemo(() => {
    if (statusFilter === "all") {
      return complaints;
    }
    return complaints.filter((c) => c.status === statusFilter);
  }, [complaints, statusFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "status-open";
      case "In Progress":
        return "status-progress";
      case "Resolved":
        return "status-resolved";
      default:
        return "";
    }
  };

  const getCategoryClass = (category) => {
    const map = {
      "Roads & Infrastructure": "category-infrastructure",
      "Water Supply": "category-water",
      "Sanitation & Waste": "category-sanitation",
      "Street Lighting": "category-lighting",
      "Public Safety": "category-safety",
      "Environmental Issues": "category-environmental",
      "Noise Pollution": "category-noise",
      Other: "category-other",
    };
    return map[category] || "category-other";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="my-complaints-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your complaints...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="my-complaints-container">
        <div className="error-container">
          <p className="error-message">{errorMessage}</p>
          <button onClick={fetchComplaints} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="my-complaints-container">
        <div className="no-complaints">
          <div className="no-complaints-icon">📝</div>
          <h2>No Complaints Yet</h2>
          <p>
            You haven't submitted any complaints yet. Start by reporting an
            issue in your community.
          </p>
          <Link to="/submit-complaint" className="new-complaint-btn">
            Submit Your First Complaint
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-complaints-container">
      <div className="my-complaints-header">
        <h1>My Complaints</h1>
        <p>Track the status of your submitted complaints</p>

        <div className="header-actions">
          <div className="filter-controls">
            <label htmlFor="status-filter">Filter by status:</label>
            <select
              id="status-filter"
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <Link to="/submit-complaint" className="new-complaint-btn">
            Submit New Complaint
          </Link>
        </div>
      </div>

      <div className="complaints-grid">
        {filteredComplaints.map((item) => (
          <div key={item._id} className="complaint-card">
            <div className="complaint-header">
              <div className="complaint-id">ID: {item.complaintId}</div>
              <span className={`status-badge ${getStatusClass(item.status)}`}>
                {item.status}
              </span>
            </div>

            <div className="complaint-content">
              <h3 className="complaint-name">{item.name}</h3>

              <div className="complaint-details">
                <div className="detail-item">
                  <span className="detail-label">Ward:</span>
                  <span className="detail-value">{item.ward}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{item.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span
                    className={`category-badge ${getCategoryClass(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Submitted:</span>
                  <span className="detail-value">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                {item.updatedAt !== item.createdAt && (
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {formatDate(item.updatedAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="complaint-description">
                <span className="detail-label">Description:</span>
                <p>{item.description}</p>
              </div>

              {item.photoUrl && (
                <div className="complaint-photo">
                  <span className="detail-label">Photo:</span>
                  <img
                    src={item.photoUrl}
                    alt="Complaint photo"
                    className="photo-thumbnail"
                  />
                </div>
              )}

              {item.resolutionNote && (
                <div className="resolution-note">
                  <span className="detail-label">Resolution Note:</span>
                  <p className="note-content">{item.resolutionNote}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredComplaints.length === 0 && complaints.length > 0 && (
        <div className="no-results">
          <p>No complaints found with the selected status.</p>
          <button
            onClick={() => setStatusFilter("all")}
            className="clear-filter-btn"
          >
            Show All Complaints
          </button>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;