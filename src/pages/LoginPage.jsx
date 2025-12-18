import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axiosClient.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", res.data.email);
      
      // Store user info in localStorage for profile page
      if (res.data.id) {
        const userInfo = {
          id: res.data.id,
          name: res.data.name || "",
          email: res.data.email,
          phone: res.data.phone || "",
          address: res.data.address || "",
          role: res.data.role,
        };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
      
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
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
    maxWidth: "480px",
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
    fontSize: "28px",
    fontWeight: 700,
    color: "#1F2937",
  };

  const subtitleStyle = {
    marginTop: "12px",
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
            style={{ width: "200px", marginBottom: "18px", userSelect: "none" }}
          />
          <h1 style={titleStyle}>Baymak Service Panel</h1>
          <p style={subtitleStyle}>Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelBase}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#009639";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 150, 57, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={labelBase}>Password</label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "13px",
                  color: "#009639",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#009639";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 150, 57, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 150, 57, 0.4), 0 4px 6px -2px rgba(0, 150, 57, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 150, 57, 0.3), 0 2px 4px -1px rgba(0, 150, 57, 0.2)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1)";
            }}
          >
            Sign In
          </button>

          {error && (
            <div
              style={{
                color: "#b91c1c",
                fontSize: "14px",
                fontWeight: 600,
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: "18px",
              textAlign: "center",
              fontSize: "14px",
              color: "#4B5563",
              fontWeight: 500,
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ color: "#009639", fontWeight: 700, textDecoration: "none" }}
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

