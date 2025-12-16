import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!email || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await axiosClient.post("/api/auth/reset-password", {
        email,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while resetting password.");
    }
  };

  const pageStyle = {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
    padding: "20px",
    boxSizing: "border-box",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "40px",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
    boxSizing: "border-box",
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
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #D1D5DB",
    fontSize: "15px",
    color: "#111827",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "100%",
    padding: "16px",
    backgroundColor: "#009639",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "0.2s ease",
  };

  if (success) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>✓</div>
            <h1 style={titleStyle}>Password Reset Successful!</h1>
            <p style={subtitleStyle}>Your password has been reset successfully.</p>
            <p style={{ ...subtitleStyle, marginTop: "8px", color: "#009639" }}>
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <img
            src="/baymak.png"
            alt="Baymak Logo"
            style={{ width: "200px", marginBottom: "18px", userSelect: "none" }}
          />
          <h1 style={titleStyle}>Reset Password</h1>
          <p style={subtitleStyle}>Enter your email and new password</p>
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
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelBase}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={inputBase}
              placeholder="Enter new password (min 6 characters)"
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelBase}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={inputBase}
              placeholder="Confirm new password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#007c30")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#009639")}
          >
            Reset Password
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
            Remember your password?{" "}
            <Link
              to="/login"
              style={{ color: "#009639", fontWeight: 700, textDecoration: "none" }}
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


