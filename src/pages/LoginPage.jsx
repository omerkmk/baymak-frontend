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
      navigate("/");
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
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelBase}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputBase}
            />
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
            Hesabınız yok mu?{" "}
            <Link
              to="/register"
              style={{ color: "#009639", fontWeight: 700, textDecoration: "none" }}
            >
              Kayıt ol
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

