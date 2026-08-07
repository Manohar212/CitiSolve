const API_BASE_URL = "https://citisolve-smarter-complaint-resolution.onrender.com/api";

export const getToken = () => {
  const token = localStorage.getItem("token");
  console.log("getToken called, token:", token ? "exists" : "not found");
  return token;
};

export const getUserRole = () => {
  const role = localStorage.getItem("userRole");
  console.log("getUserRole called, role:", role);
  return role;
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    ...options,
    headers: {
      ...options.headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Network error occurred");
  }
};

export const authService = {
  login: async (credentials) =>
    apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }),
  register: async (userData) =>
    apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }),
  getCurrentUser: async () => apiFetch("/auth/me"),
};

export const complaintService = {
  createComplaint: async (data) =>
    data instanceof FormData
      ? apiFetch("/complaints", { method: "POST", body: data })
      : apiFetch("/complaints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
  getComplaints: async () => apiFetch("/complaints"),
  updateComplaintStatus: async (id, statusData) =>
    apiFetch(`/complaints/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statusData),
    }),
  deleteComplaint: async (id) =>
    apiFetch(`/complaints/${id}`, { method: "DELETE" }),
};