import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const roles = ["CUSTOMER", "TECHNICIAN", "ADMIN"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setError(null);
    
    // Check if user is admin
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    
    console.log("UsersPage - Role:", role);
    console.log("UsersPage - Token exists:", !!token);
    console.log("UsersPage - Token length:", token ? token.length : 0);
    
    if (role !== "ADMIN") {
      setError("Access denied. Admin role required. Current role: " + (role || "none"));
      setUsers([]);
      return;
    }
    
    if (!token) {
      setError("No authentication token found. Please login again.");
      setUsers([]);
      return;
    }
    
    axiosClient
      .get("/api/users")
      .then((res) => {
        console.log("UsersPage - Success:", res.data);
        setUsers(res.data || []);
      })
      .catch((err) => {
        console.error("UsersPage - Fetch error:", err);
        console.error("UsersPage - Error status:", err.response?.status);
        console.error("UsersPage - Error data:", err.response?.data);
        console.error("UsersPage - Error headers:", err.response?.headers);
        
        if (err.response?.status === 401) {
          const errorMsg = err.response?.data?.message || "Authentication failed. Token may be expired. Please login again.";
          setError(errorMsg);
          // Don't redirect immediately, show error first
          setTimeout(() => {
            if (err.response?.status === 401) {
              localStorage.clear();
              window.location.href = "/login";
            }
          }, 3000); // Give user 3 seconds to see the error
        } else if (err.response?.status === 403) {
          const errorMsg = "Access denied. Admin role required.";
          setError(errorMsg);
        } else {
          const errorMsg =
            err.response?.data?.message || "An error occurred while loading users.";
          setError(errorMsg);
        }
        setUsers([]);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    });
    setError(null);
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      password: "", // Password is optional for updates
    });
    setError(null);
    setShowEditModal(true);
  };

  const openDetailModal = async (user) => {
    try {
      const res = await axiosClient.get(`/api/users/${user.id}`);
      setSelectedUser(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("User detail fetch error:", err);
      setError(
        err.response?.data?.message || "An error occurred while loading user details."
      );
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: Required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.password) {
      setError("Please fill in all fields. Password is required for new users.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await axiosClient.post("/api/users", formData);
      setShowAddModal(false);
      setFormData({ name: "", email: "", phone: "", address: "", password: "" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while adding the user.";
      setError(errorMsg);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: Required fields (password is optional for updates)
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError("Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      // Only send password if it's provided
      const updateData = { ...formData };
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }

      await axiosClient.put(`/api/users/${editingUser.id}`, updateData);
      setShowEditModal(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", phone: "", address: "", password: "" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while updating the user.";
      setError(errorMsg);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await axiosClient.delete(`/api/users/${userToDelete.id}`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while deleting the user.";
      setError(errorMsg);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setShowDeleteConfirm(false);
    setEditingUser(null);
    setSelectedUser(null);
    setUserToDelete(null);
    setFormData({ name: "", email: "", phone: "", address: "", password: "" });
    setError(null);
  };

  const getRoleBadgeStyle = (role) => {
    const styles = {
      CUSTOMER: {
        backgroundColor: "#e7f5e7",
        color: "#009639",
      },
      TECHNICIAN: {
        backgroundColor: "#fff3cd",
        color: "#856404",
      },
      ADMIN: {
        backgroundColor: "#d1ecf1",
        color: "#0c5460",
      },
    };
    return styles[role] || styles.CUSTOMER;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // Styles
  const containerStyle = {
    padding: "32px",
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "32px",
  };

  const logoStyle = {
    width: "80px",
    height: "80px",
    objectFit: "contain",
  };

  const titleSectionStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  };

  const titleStyle = {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a1a1a",
  };

  const buttonStyle = {
    padding: "14px 28px",
    backgroundColor: "#009639",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 150, 57, 0.25)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const tableContainerStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
  };

  const thStyle = {
    backgroundColor: "#f8f9fa",
    padding: "18px 20px",
    textAlign: "left",
    fontWeight: "600",
    color: "#495057",
    borderBottom: "2px solid #e9ecef",
    fontSize: "14px",
    letterSpacing: "0.3px",
  };

  const tdStyle = {
    padding: "18px 20px",
    borderBottom: "1px solid #f0f0f0",
    color: "#212529",
    fontSize: "14px",
  };

  const actionButtonStyle = {
    padding: "8px 16px",
    marginRight: "8px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  };

  const modalStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    width: "90%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const modalTitleStyle = {
    marginTop: 0,
    marginBottom: "24px",
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "700",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "20px",
    border: "2px solid #e9ecef",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "10px",
    fontWeight: "600",
    color: "#495057",
    fontSize: "14px",
  };

  if (users === null) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <div style={{ flex: 1 }}>
            <h1 style={titleStyle}>Users</h1>
            <p style={{ color: "#6c757d", margin: "8px 0 0 0" }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header with Logo */}
      <div style={headerStyle}>
        <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
        <div style={titleSectionStyle}>
          <div>
            <h1 style={titleStyle}>Users</h1>
            <p style={{ color: "#6c757d", margin: "8px 0 0 0", fontSize: "15px" }}>
              {users.length} {users.length === 1 ? "user" : "users"} registered
            </p>
          </div>
          <button
            style={buttonStyle}
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
            onClick={openAddModal}
          >
            <span style={{ fontSize: "18px" }}>+</span> Add New User
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: "#721c24",
            marginBottom: "24px",
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
      )}

      {users.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>👥</div>
          <p style={{ color: "#6c757d", fontSize: "16px", margin: "8px 0" }}>
            No users registered yet.
          </p>
          <p style={{ color: "#adb5bd", fontSize: "14px", margin: "4px 0 0 0" }}>
            Click the button above to add your first user.
          </p>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Created Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f7f3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "#ffffff" : "#fafbfc";
                  }}
                >
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#009639",
                        fontSize: "13px",
                      }}
                    >
                      #{user.id}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "500" }}>{user.name || "-"}</td>
                  <td style={tdStyle}>
                    <span style={{ color: "#6c757d", fontSize: "13px" }}>
                      {user.email || "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#6c757d", fontFamily: "monospace", fontSize: "13px" }}>
                      {user.phone || "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        ...getRoleBadgeStyle(user.role),
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {user.role || "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#6c757d", fontSize: "13px" }}>
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: "#009639",
                        color: "#ffffff",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#007c30";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#009639";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      onClick={() => openDetailModal(user)}
                    >
                      👁️ View
                    </button>
                    <button
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: "#009639",
                        color: "#ffffff",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#007c30";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#009639";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      onClick={() => openEditModal(user)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: "#dc3545",
                        color: "#ffffff",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#c82333";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc3545";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      onClick={() => handleDeleteClick(user)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Add New User</h2>
            {error && (
              <div
                style={{
                  color: "#721c24",
                  marginBottom: "20px",
                  padding: "12px 16px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "8px",
                  border: "1px solid #f5c6cb",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}
            <form onSubmit={handleAddUser}>
              <div>
                <label style={labelStyle}>
                  Name <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.name && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div>
                <label style={labelStyle}>
                  Email <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.email && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div>
                <label style={labelStyle}>
                  Phone <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.phone && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div>
                <label style={labelStyle}>
                  Address <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.address && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div>
                <label style={labelStyle}>
                  Password <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.password && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={closeModals}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#6c757d",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#5a6268";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#6c757d";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#009639",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#007c30";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#009639";
                  }}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Edit User</h2>
            {error && (
              <div
                style={{
                  color: "#721c24",
                  marginBottom: "20px",
                  padding: "12px 16px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "8px",
                  border: "1px solid #f5c6cb",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}
            <form onSubmit={handleEditUser}>
              <div>
                <label style={labelStyle}>
                  Name <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.name && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div>
                <label style={labelStyle}>
                  Email <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.email && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div>
                <label style={labelStyle}>
                  Phone <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.phone && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div>
                <label style={labelStyle}>
                  Address <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.address && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div>
                <label style={labelStyle}>
                  Password <span style={{ color: "#6c757d", fontSize: "12px" }}>(Optional - leave empty to keep current password)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle,
                    ...(formData.password && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
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

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={closeModals}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#6c757d",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#5a6268";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#6c757d";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#009639",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#007c30";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#009639";
                  }}
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>User Details</h2>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>ID</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#009639",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  #{selectedUser.id}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Name</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#212529",
                    fontSize: "14px",
                  }}
                >
                  {selectedUser.name || "-"}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Email</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#212529",
                    fontSize: "14px",
                  }}
                >
                  {selectedUser.email || "-"}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Phone</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#212529",
                    fontSize: "14px",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedUser.phone || "-"}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Address</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#212529",
                    fontSize: "14px",
                  }}
                >
                  {selectedUser.address || "-"}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Role</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      ...getRoleBadgeStyle(selectedUser.role),
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {selectedUser.role || "-"}
                  </span>
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Created Date</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#6c757d",
                    fontSize: "14px",
                  }}
                >
                  {formatDate(selectedUser.createdAt)}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={closeModals}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#009639",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#007c30";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#009639";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Confirm Delete</h2>
            <p style={{ marginBottom: "24px", color: "#495057", fontSize: "15px" }}>
              Are you sure you want to delete user <strong>{userToDelete.name}</strong> (
              {userToDelete.email})? This action cannot be undone.
            </p>
            {error && (
              <div
                style={{
                  color: "#721c24",
                  marginBottom: "20px",
                  padding: "12px 16px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "8px",
                  border: "1px solid #f5c6cb",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={closeModals}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#6c757d",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5a6268";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6c757d";
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#dc3545",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#c82333";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc3545";
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
