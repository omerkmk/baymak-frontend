import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState(null);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [technicianToDelete, setTechnicianToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = () => {
    setError(null);
    axiosClient
      .get("/api/technicians")
      .then((res) => {
        setTechnicians(res.data || []);
      })
      .catch((err) => {
        console.error("Technicians fetch error:", err);
        const errorMsg =
          err.response?.data?.message || "An error occurred while loading technicians.";
        setError(errorMsg);
        setTechnicians([]);
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
      password: "",
      specialization: "",
    });
    setError(null);
    setShowAddModal(true);
  };

  const openEditModal = (technician) => {
    setEditingTechnician(technician);
    setFormData({
      name: technician.name || "",
      email: technician.email || "",
      phone: technician.phone || "",
      password: "", // Password is optional for updates
      specialization: technician.specialization || "",
    });
    setError(null);
    setShowEditModal(true);
  };

  const openDetailModal = async (technician) => {
    try {
      const res = await axiosClient.get(`/api/technicians/${technician.id}`);
      setSelectedTechnician(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Technician detail fetch error:", err);
      setError(
        err.response?.data?.message || "An error occurred while loading technician details."
      );
    }
  };

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: Required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill in all required fields (Name, Email, Phone, Password).");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await axiosClient.post("/api/technicians", formData);
      setShowAddModal(false);
      setFormData({ name: "", email: "", phone: "", password: "", specialization: "" });
      fetchTechnicians();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while adding the technician.";
      setError(errorMsg);
    }
  };

  const handleEditTechnician = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: Required fields (password is optional for updates)
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all required fields (Name, Email, Phone).");
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

      await axiosClient.put(`/api/technicians/${editingTechnician.id}`, updateData);
      setShowEditModal(false);
      setEditingTechnician(null);
      setFormData({ name: "", email: "", phone: "", password: "", specialization: "" });
      fetchTechnicians();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while updating the technician.";
      setError(errorMsg);
    }
  };

  const handleDeleteClick = (technician) => {
    setTechnicianToDelete(technician);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!technicianToDelete) return;

    try {
      await axiosClient.delete(`/api/technicians/${technicianToDelete.id}`);
      setShowDeleteConfirm(false);
      setTechnicianToDelete(null);
      fetchTechnicians();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while deleting the technician.";
      setError(errorMsg);
      setShowDeleteConfirm(false);
      setTechnicianToDelete(null);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setShowDeleteConfirm(false);
    setEditingTechnician(null);
    setSelectedTechnician(null);
    setTechnicianToDelete(null);
    setFormData({ name: "", email: "", phone: "", password: "", specialization: "" });
    setError(null);
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

  if (technicians === null) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <div style={{ flex: 1 }}>
            <h1 style={titleStyle}>Technicians</h1>
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
            <h1 style={titleStyle}>Technicians</h1>
            <p style={{ color: "#6c757d", margin: "8px 0 0 0", fontSize: "15px" }}>
              {technicians.length} {technicians.length === 1 ? "technician" : "technicians"} registered
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
            <span style={{ fontSize: "18px" }}>+</span> Add New Technician
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

      {technicians.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔧</div>
          <p style={{ color: "#6c757d", fontSize: "16px", margin: "8px 0" }}>
            No technicians registered yet.
          </p>
          <p style={{ color: "#adb5bd", fontSize: "14px", margin: "4px 0 0 0" }}>
            Click the button above to add your first technician.
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
                <th style={thStyle}>Specialization</th>
                <th style={thStyle}>Created Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {technicians.map((technician, index) => (
                <tr
                  key={technician.id}
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
                      #{technician.id}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "500" }}>{technician.name || "-"}</td>
                  <td style={tdStyle}>
                    <span style={{ color: "#6c757d", fontSize: "13px" }}>
                      {technician.email || "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#6c757d", fontFamily: "monospace", fontSize: "13px" }}>
                      {technician.phone || "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {technician.specialization ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          backgroundColor: "#fff3cd",
                          color: "#856404",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {technician.specialization}
                      </span>
                    ) : (
                      <span style={{ color: "#adb5bd", fontStyle: "italic" }}>Not specified</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#6c757d", fontSize: "13px" }}>
                      {formatDate(technician.createdAt)}
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
                      onClick={() => openDetailModal(technician)}
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
                      onClick={() => openEditModal(technician)}
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
                      onClick={() => handleDeleteClick(technician)}
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
            <h2 style={modalTitleStyle}>Add New Technician</h2>
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
            <form onSubmit={handleAddTechnician}>
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

              <div>
                <label style={labelStyle}>
                  Specialization <span style={{ color: "#6c757d", fontSize: "12px" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., HVAC, Plumbing, Electrical"
                  style={{
                    ...inputStyle,
                    ...(formData.specialization && {
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
                  Add Technician
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
            <h2 style={modalTitleStyle}>Edit Technician</h2>
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
            <form onSubmit={handleEditTechnician}>
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

              <div>
                <label style={labelStyle}>
                  Specialization <span style={{ color: "#6c757d", fontSize: "12px" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., HVAC, Plumbing, Electrical"
                  style={{
                    ...inputStyle,
                    ...(formData.specialization && {
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
                  Update Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTechnician && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Technician Details</h2>
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
                  #{selectedTechnician.id}
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
                  {selectedTechnician.name || "-"}
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
                  {selectedTechnician.email || "-"}
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
                  {selectedTechnician.phone || "-"}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Specialization</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                  }}
                >
                  {selectedTechnician.specialization ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        backgroundColor: "#fff3cd",
                        color: "#856404",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {selectedTechnician.specialization}
                    </span>
                  ) : (
                    <span style={{ color: "#adb5bd", fontStyle: "italic" }}>Not specified</span>
                  )}
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
                  {formatDate(selectedTechnician.createdAt)}
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
      {showDeleteConfirm && technicianToDelete && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Confirm Delete</h2>
            <p style={{ marginBottom: "24px", color: "#495057", fontSize: "15px" }}>
              Are you sure you want to delete technician <strong>{technicianToDelete.name}</strong> (
              {technicianToDelete.email})? This action cannot be undone.
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
