import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    
    // Validate password length
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    try {
      // Registration process - only send password, not confirmPassword
      const { confirmPassword, ...registerData } = form;
      const registerRes = await axiosClient.post("/api/auth/register", registerData);
      
      // Registration successful, now perform automatic login
      try {
        const loginRes = await axiosClient.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        
        localStorage.setItem("token", loginRes.data.token);
        localStorage.setItem("role", loginRes.data.role);
        localStorage.setItem("email", loginRes.data.email);
        
        // Store user info in localStorage for profile page
        const userInfo = {
          id: registerRes.data.id,
          name: registerRes.data.name,
          email: registerRes.data.email,
          phone: registerRes.data.phone,
          address: registerRes.data.address,
          role: registerRes.data.role,
        };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        
        navigate("/dashboard");
      } catch (loginErr) {
        // Registration successful but login failed - redirect to login page
        setError("Registration successful! Please login with your credentials.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      // Log error details to console
      console.error("Register error:", err);
      console.error("Error response:", err.response);
      
      // Parse error message from backend
      let errorMessage = "Registration failed. Please check your details.";
      
      // Network error (CORS, connection, etc.)
      if (!err.response) {
        errorMessage = "Network error: Could not connect to server. Please check if backend is running.";
        setError(errorMessage);
        return;
      }
      
      if (err.response && err.response.data) {
        const backendMessage = err.response.data.message;
        
        if (backendMessage) {
          // Make validation errors more readable
          if (backendMessage.includes("Validation failed")) {
            // Parse "Validation failed for field 'email': Email is not valid" format
            const fieldErrors = backendMessage
              .split(", ")
              .map((error) => {
                // "Validation failed for field 'email': Email is not valid" -> "Email: Email is not valid"
                const match = error.match(/field '(\w+)': (.+)/);
                if (match) {
                  const field = match[1];
                  const message = match[2];
                  // Translate field names to English (for user display)
                  const fieldNames = {
                    name: "Name",
                    email: "Email",
                    phone: "Phone",
                    address: "Address",
                    password: "Password",
                  };
                  return `${fieldNames[field] || field}: ${message}`;
                }
                return error;
              })
              .join("\n");
            errorMessage = fieldErrors || backendMessage;
          } else if (backendMessage.includes("already exists")) {
            // Email already registered error
            errorMessage = "This email address is already registered. Please use a different email.";
          } else {
            // Other error messages
            errorMessage = backendMessage;
          }
        }
      }
      
      setError(errorMessage);
    }
  };

  const pageStyle = {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #f0f9ff 50%, #e0f2fe 75%, #f0fdf4 100%)",
    padding: "20px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "520px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    padding: "48px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 150, 57, 0.1)",
    boxSizing: "border-box",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "30px",
  };

  const titleStyle = {
    margin: 0,
    fontSize: "26px",
    fontWeight: 700,
    color: "#1F2937",
  };

  const subtitleStyle = {
    marginTop: "10px",
    marginBottom: 0,
    fontSize: "15px",
    color: "#6B7280",
  };

  const labelBase = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
  };

  const inputBase = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "2px solid #E5E7EB",
    fontSize: "15px",
    color: "#111827",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  };

  const buttonStyle = {
    width: "100%",
    padding: "16px 24px",
    background: "linear-gradient(135deg, #007c30 0%, #009639 50%, #00b347 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 6px -1px rgba(0, 150, 57, 0.3), 0 2px 4px -1px rgba(0, 150, 57, 0.2)",
    letterSpacing: "0.3px",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <img
            src="/baymak.png"
            alt="Baymak Logo"
            style={{ width: "180px", marginBottom: "16px", userSelect: "none" }}
          />
          <h1 style={titleStyle}>Create Your Account</h1>
          <p style={subtitleStyle}>Register to access the Baymak Service Panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelBase}>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              required
              style={inputBase}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelBase}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
              style={inputBase}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelBase}>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={handleChange("phone")}
              required
              style={inputBase}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelBase}>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={handleChange("address")}
              required
              style={inputBase}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelBase}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              required
              minLength={6}
              style={{
                ...inputBase,
                ...(form.password && form.confirmPassword && form.password !== form.confirmPassword && {
                  borderColor: "#b91c1c",
                  backgroundColor: "#fee2e2",
                }),
                ...(form.password && form.confirmPassword && form.password === form.confirmPassword && {
                  borderColor: "#009639",
                  backgroundColor: "#f0f7f3",
                }),
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelBase}>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              required
              minLength={6}
              style={{
                ...inputBase,
                ...(form.password && form.confirmPassword && form.password !== form.confirmPassword && {
                  borderColor: "#b91c1c",
                  backgroundColor: "#fee2e2",
                }),
                ...(form.password && form.confirmPassword && form.password === form.confirmPassword && {
                  borderColor: "#009639",
                  backgroundColor: "#f0f7f3",
                }),
              }}
            />
            {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
              <div style={{
                marginTop: "6px",
                fontSize: "12px",
                color: "#b91c1c",
                fontWeight: 500,
              }}>
                Passwords do not match
              </div>
            )}
            {form.password && form.confirmPassword && form.password === form.confirmPassword && (
              <div style={{
                marginTop: "6px",
                fontSize: "12px",
                color: "#009639",
                fontWeight: 500,
              }}>
                Passwords match ✓
              </div>
            )}
          </div>

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#007c30")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#009639")
            }
          >
            Register
          </button>

          {error && (
            <div
              style={{
                color: "#b91c1c",
                fontSize: "14px",
                fontWeight: 600,
                textAlign: "center",
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#fee2e2",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                whiteSpace: "pre-line",
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

