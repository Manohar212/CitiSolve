import { useState, useEffect, useMemo, useCallback } from "react";
import { complaintService } from "../services/api";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusForms, setStatusForms] = useState({});

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
    let list = complaints;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q)) ||
          (c.ward && c.ward.toLowerCase().includes(q)) ||
          (c.complaintId && c.complaintId.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      list = list.filter((c) => c.category === categoryFilter);
    }
    return list;
  }, [complaints, searchQuery, statusFilter, categoryFilter]);

  const initStatusForm = (id) => {
    if (!statusForms[id]) {
      const item = complaints.find((c) => c._id === id);
      setStatusForms((prev) => ({
        ...prev,
        [id]: {
          status: item?.status || "",
          resolutionNote: item?.resolutionNote || "",
        },
      }));
    }
  };

  const handleFormChange = (id, field, value) => {
    setStatusForms((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleStatusUpdate = async (id) => {
    const formData = statusForms[id];
    if (!formData || !formData.status) {
      alert("Please select a status");
      return;
    }
    if (formData.status === "Resolved" && !formData.resolutionNote?.trim()) {
      alert("Resolution note is required when status is Resolved");
      return;
    }

    try {
      setUpdatingId(id);
      await complaintService.updateComplaintStatus(id, formData);
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                status: formData.status,
                resolutionNote: formData.resolutionNote,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
      setStatusForms((prev) => ({
        ...prev,
        [id]: { status: "", resolutionNote: "" },
      }));
      setUpdatingId(null);
    } catch (err) {
      alert("Failed to update status: " + err.message);
      setUpdatingId(null);
    }
  };

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

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "Open").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  const categories = [...new Set(complaints.map((c) => c.category))].filter(
    Boolean
  );

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <p className="error-message">{errorMessage}</p>
          <button onClick={fetchComplaints} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage and monitor all citizen complaints</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card open">
          <div className="stat-number">{stats.open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-filter">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search complaints by ID, name, description, location, or ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="complaints-table-container">
        <table className="complaints-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Citizen</th>
              <th>Ward</th>
              <th>Location</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((item) => (
              <tr key={item._id}>
                <td className="complaint-id">{item.complaintId}</td>
                <td className="citizen-info">
                  <div className="citizen-name">{item.name}</div>
                  <div className="citizen-email">{item.user?.email}</div>
                </td>
                <td>{item.ward}</td>
                <td>{item.location}</td>
                <td>
                  <span
                    className={`category-badge ${getCategoryClass(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="description-cell">
                  <div className="description-text">{item.description}</div>
                  {item.photoUrl && <div className="photo-indicator">📷</div>}
                </td>
                <td>
                  <span
                    className={`status-badge ${getStatusClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{formatDate(item.createdAt)}</td>
                <td>{formatDate(item.updatedAt)}</td>
                <td className="actions-cell">
                  <div className="status-update-form">
                    <select
                      className="status-select"
                      value={statusForms[item._id]?.status || ""}
                      onChange={(e) =>
                        handleFormChange(item._id, "status", e.target.value)
                      }
                      onFocus={() => initStatusForm(item._id)}
                    >
                      <option value="">Select Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    {statusForms[item._id]?.status === "Resolved" && (
                      <textarea
                        className="resolution-note-input"
                        placeholder="Enter resolution note..."
                        value={statusForms[item._id]?.resolutionNote || ""}
                        onChange={(e) =>
                          handleFormChange(
                            item._id,
                            "resolutionNote",
                            e.target.value
                          )
                        }
                        onFocus={() => initStatusForm(item._id)}
                        rows="3"
                      />
                    )}

                    <button
                      className="update-status-btn"
                      onClick={() => handleStatusUpdate(item._id)}
                      disabled={updatingId === item._id}
                    >
                      {updatingId === item._id ? "Updating..." : "Update"}
                    </button>
                  </div>

                  {item.resolutionNote && (
                    <div className="resolution-note-display">
                      <strong>Resolution:</strong> {item.resolutionNote}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredComplaints.length === 0 && (
          <div className="no-complaints">
            <p>No complaints found matching the current filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
