import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Login field ${name} changed to:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validate()) return;

    setLoading(true);
    try {
      console.log("Attempting login with:", formData);
      const res = await authService.login(formData);
      console.log("Login response:", res);

      localStorage.setItem("token", res.token);
      localStorage.setItem("userRole", res.user.role);
      localStorage.setItem("userName", res.user.name);
      localStorage.setItem("userId", res.user._id);

      console.log("Stored in localStorage:", {
        token: localStorage.getItem("token"),
        userRole: localStorage.getItem("userRole"),
        userName: localStorage.getItem("userName"),
        userId: localStorage.getItem("userId"),
      });

      if (res.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/my-complaints");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to Citizen Resolution</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${errors.email ? "error" : ""} ${
                formData.email ? "has-value" : ""
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${errors.password ? "error" : ""} ${
                formData.password ? "has-value" : ""
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
