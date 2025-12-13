import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile first
      const userRes = await axiosClient.get("/api/users/me");
      const currentUser = userRes.data;
      setUser(currentUser);
      setFormData({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });

      // Update localStorage with user info
      const userInfo = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
        role: currentUser.role,
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      // Only fetch devices and appointments for CUSTOMER role
      // Admin and Technician don't have access to these endpoints
      if (currentUser.role === "CUSTOMER") {
        try {
          const [devicesRes, appointmentsRes] = await Promise.all([
            axiosClient.get("/api/devices/my"),
            axiosClient.get("/api/appointments/my"),
          ]);
          setDevices(devicesRes.data || []);
          setAppointments(appointmentsRes.data || []);
        } catch (err) {
          // If devices/appointments fetch fails, just log it but don't show error
          // User profile is the main data, devices/appointments are just statistics
          console.warn("Could not fetch devices/appointments:", err);
          setDevices([]);
          setAppointments([]);
        }
      } else {
        // For Admin and Technician, set empty arrays
        setDevices([]);
        setAppointments([]);
      }
    } catch (err) {
      console.error("Profile data fetch error:", err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while loading profile data.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    // Validation
    if (!formData.name || !formData.phone || !formData.address) {
      setUpdateError("Please fill in all fields.");
      return;
    }

    try {
      // Use /api/users/me endpoint to update own profile
      // Don't send password field if it's empty (password update not supported in this form)
      const updateData = {
        name: formData.name,
        email: user.email, // Email cannot be changed
        phone: formData.phone,
        address: formData.address,
      };
      
      const updatedUser = await axiosClient.put("/api/users/me", updateData);

      const updatedUserData = updatedUser.data;
      setUser(updatedUserData);
      
      // Update localStorage with new user info
      const userInfo = {
        id: updatedUserData.id,
        name: updatedUserData.name,
        email: updatedUserData.email,
        phone: updatedUserData.phone,
        address: updatedUserData.address,
        role: updatedUserData.role,
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while updating profile.";
      setUpdateError(errorMsg);
    }
  };

  // Calculate statistics
  const totalDevices = devices.length;
  const totalAppointments = appointments.length;

  // Container styles
  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "32px",
  };

  const logoStyle = {
    width: "60px",
    height: "60px",
    objectFit: "contain",
    userSelect: "none",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1F2937",
    margin: 0,
  };

  // Profile card styles
  const profileCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    marginBottom: "32px",
  };

  const profileHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e9ecef",
  };

  const profileTitleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1F2937",
    margin: 0,
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#009639",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 150, 57, 0.25)",
  };

  // Info section styles
  const infoSectionStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  };

  const infoItemStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const valueStyle = {
    fontSize: "16px",
    fontWeight: "500",
    color: "#1F2937",
  };

  // Input styles
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e9ecef",
    fontSize: "15px",
    color: "#1F2937",
    backgroundColor: "#ffffff",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };

  // Statistics cards styles
  const statsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
    marginTop: "32px",
  };

  const statCardStyle = {
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    border: "1px solid #e9ecef",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  const statCardValueStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#009639",
    marginBottom: "8px",
  };

  const statCardLabelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <h1 style={titleStyle}>My Profile</h1>
        </div>
        <p style={{ color: "#6c757d" }}>Loading...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <h1 style={titleStyle}>My Profile</h1>
        </div>
        <div
          style={{
            color: "#721c24",
            padding: "16px 20px",
            backgroundColor: "#f8d7da",
            borderRadius: "12px",
            border: "2px solid #f5c6cb",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
        <h1 style={titleStyle}>My Profile</h1>
      </div>

      {/* Profile Card */}
      <div style={profileCardStyle}>
        <div style={profileHeaderStyle}>
          <h2 style={profileTitleStyle}>Personal Information</h2>
          {!isEditing && (
            <button
              style={buttonStyle}
              onClick={handleEdit}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#007c30";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 150, 57, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#009639";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 150, 57, 0.25)";
              }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {updateSuccess && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              backgroundColor: "#d1e7dd",
              border: "2px solid #badbcc",
              borderRadius: "10px",
              color: "#0f5132",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ✓ Profile updated successfully!
          </div>
        )}

        {updateError && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              backgroundColor: "#f8d7da",
              border: "2px solid #f5c6cb",
              borderRadius: "10px",
              color: "#721c24",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {updateError}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div style={infoSectionStyle}>
              <div style={infoItemStyle}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.name && {
                      borderColor: "#009639",
                    }),
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#009639";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 150, 57, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={infoItemStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{
                    ...inputStyle,
                    backgroundColor: "#f0f7f3",
                    color: "#009639",
                    cursor: "not-allowed",
                    fontWeight: "600",
                    borderColor: "#c3e6cb",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px" }}>
                  Email cannot be changed
                </span>
              </div>

              <div style={infoItemStyle}>
                <label style={labelStyle}>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.phone && {
                      borderColor: "#009639",
                    }),
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#009639";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 150, 57, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={infoItemStyle}>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={handleChange("address")}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.address && {
                      borderColor: "#009639",
                    }),
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#009639";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 150, 57, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "28px" }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#6c757d",
                  boxShadow: "0 4px 12px rgba(108, 117, 125, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5a6268";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6c757d";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={buttonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 150, 57, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 150, 57, 0.25)";
                }}
              >
                ✓ Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div style={infoSectionStyle}>
            <div style={infoItemStyle}>
              <span style={labelStyle}>Name</span>
              <span style={valueStyle}>{user?.name || "-"}</span>
            </div>

            <div style={infoItemStyle}>
              <span style={labelStyle}>Email</span>
              <span style={valueStyle}>{user?.email || "-"}</span>
            </div>

            <div style={infoItemStyle}>
              <span style={labelStyle}>Phone</span>
              <span style={valueStyle}>{user?.phone || "-"}</span>
            </div>

            <div style={infoItemStyle}>
              <span style={labelStyle}>Address</span>
              <span style={valueStyle}>{user?.address || "-"}</span>
            </div>

            <div style={infoItemStyle}>
              <span style={labelStyle}>Role</span>
              <span
                style={{
                  ...valueStyle,
                  display: "inline-block",
                  padding: "4px 12px",
                  backgroundColor: "#e7f5e7",
                  color: "#009639",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {user?.role || "-"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={statsContainerStyle}>
        <div
          style={statCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={statCardValueStyle}>{totalDevices}</div>
          <div style={statCardLabelStyle}>Total Devices</div>
        </div>

        <div
          style={statCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={statCardValueStyle}>{totalAppointments}</div>
          <div style={statCardLabelStyle}>Total Appointments</div>
        </div>
      </div>
    </div>
  );
}
