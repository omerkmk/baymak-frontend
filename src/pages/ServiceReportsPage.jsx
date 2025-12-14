import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export default function ServiceReportsPage() {
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";
  const isTechnician = role === "TECHNICIAN";

  const [reports, setReports] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    appointmentId: "",
    description: "",
    partsUsed: "",
    price: "",
  });

  useEffect(() => {
    fetchReports();
    // Only fetch appointments for technicians (they need to create reports)
    if (isTechnician) {
      fetchAvailableAppointments();
    }
  }, [isTechnician]);

  const fetchReports = () => {
    setError(null);
    // Admin fetches all reports, Technician fetches their own reports
    const endpoint = isAdmin ? "/api/service-reports/all" : "/api/service-reports/my";
    axiosClient
      .get(endpoint)
      .then((res) => {
        setReports(res.data || []);
      })
      .catch((err) => {
        console.error("Service reports fetch error:", err);
        const errorMsg =
          err.response?.data?.message || "An error occurred while loading service reports.";
        setError(errorMsg);
        setReports([]);
      });
  };

  const fetchAvailableAppointments = () => {
    // Fetch assigned appointments that are ASSIGNED or IN_PROGRESS (can create report for these)
    axiosClient
      .get("/api/appointments/assigned")
      .then((res) => {
        // Filter appointments that are ASSIGNED or IN_PROGRESS (not COMPLETED or CANCELLED)
        const available = (res.data || []).filter(
          (apt) => apt.status === "ASSIGNED" || apt.status === "IN_PROGRESS"
        );
        setAppointments(available);
      })
      .catch((err) => {
        console.error("Appointments fetch error:", err);
        setAppointments([]);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openCreateModal = () => {
    setFormData({
      appointmentId: "",
      description: "",
      partsUsed: "",
      price: "",
    });
    setError(null);
    fetchAvailableAppointments(); // Refresh available appointments
    setShowCreateModal(true);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: Required fields
    if (!formData.appointmentId) {
      setError("Please select an appointment.");
      return;
    }

    // Price validation (if provided, must be a valid number)
    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) < 0)) {
      setError("Price must be a valid positive number.");
      return;
    }

    try {
      const reportData = {
        appointmentId: parseInt(formData.appointmentId),
        description: formData.description || null,
        partsUsed: formData.partsUsed || null,
        price: formData.price ? parseFloat(formData.price) : null,
      };

      await axiosClient.post("/api/service-reports", reportData);
      setShowCreateModal(false);
      setFormData({ appointmentId: "", description: "", partsUsed: "", price: "" });
      fetchReports();
      fetchAvailableAppointments(); // Refresh to update appointment statuses
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while creating the service report.";
      setError(errorMsg);
    }
  };

  const handleViewDetail = async (report) => {
    try {
      const res = await axiosClient.get(`/api/service-reports/${report.id}`);
      setSelectedReport(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Service report detail fetch error:", err);
      setError(
        err.response?.data?.message || "An error occurred while loading service report details."
      );
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedReport(null);
    setFormData({ appointmentId: "", description: "", partsUsed: "", price: "" });
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

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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
    maxWidth: "600px",
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

  const textareaStyle = {
    ...inputStyle,
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    backgroundColor: "#ffffff",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "10px",
    fontWeight: "600",
    color: "#495057",
    fontSize: "14px",
  };

  if (reports === null) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <div style={{ flex: 1 }}>
            <h1 style={titleStyle}>Service Reports</h1>
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
            <h1 style={titleStyle}>Service Reports</h1>
            <p style={{ color: "#6c757d", margin: "8px 0 0 0", fontSize: "15px" }}>
              {isAdmin 
                ? `${reports.length} ${reports.length === 1 ? "report" : "reports"} total`
                : `${reports.length} ${reports.length === 1 ? "report" : "reports"} created`}
            </p>
          </div>
          {isTechnician && (
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
              onClick={openCreateModal}
            >
              <span style={{ fontSize: "18px" }}>+</span> Create New Report
            </button>
          )}
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

      {reports.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📋</div>
          <p style={{ color: "#6c757d", fontSize: "16px", margin: "8px 0" }}>
            No service reports created yet.
          </p>
          <p style={{ color: "#adb5bd", fontSize: "14px", margin: "4px 0 0 0" }}>
            Click the button above to create your first service report.
          </p>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Appointment ID</th>
                {isAdmin && <th style={thStyle}>Technician</th>}
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Parts Used</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Created Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr
                  key={report.id}
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
                      #{report.id}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontWeight: "500",
                        color: "#009639",
                        fontSize: "13px",
                      }}
                    >
                      #{report.appointmentId}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={tdStyle}>
                      <span style={{ color: "#495057", fontSize: "13px" }}>
                        {report.technicianName || "-"}
                      </span>
                    </td>
                  )}
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: "#495057",
                        fontSize: "13px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "300px",
                      }}
                    >
                      {report.description || "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#6c757d", fontSize: "13px" }}>
                      {report.partsUsed || "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#009639",
                        fontSize: "14px",
                      }}
                    >
                      {formatCurrency(report.price)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#6c757d", fontSize: "13px" }}>
                      {formatDate(report.createdAt)}
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
                      onClick={() => handleViewDetail(report)}
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Create Service Report</h2>
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
            {appointments.length === 0 && (
              <div
                style={{
                  color: "#856404",
                  marginBottom: "20px",
                  padding: "12px 16px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "8px",
                  border: "1px solid #ffeaa7",
                  fontSize: "13px",
                }}
              >
                ⚠️ No available appointments. You can only create reports for ASSIGNED or IN_PROGRESS appointments.
              </div>
            )}
            <form onSubmit={handleCreateReport}>
              <div>
                <label style={labelStyle}>
                  Appointment <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  name="appointmentId"
                  value={formData.appointmentId}
                  onChange={handleInputChange}
                  required
                  disabled={appointments.length === 0}
                  style={{
                    ...selectStyle,
                    ...(formData.appointmentId && {
                      borderColor: "#009639",
                      backgroundColor: "#f0f7f3",
                    }),
                    ...(appointments.length === 0 && {
                      backgroundColor: "#f5f5f5",
                      cursor: "not-allowed",
                    }),
                  }}
                  onFocus={(e) => {
                    if (appointments.length > 0) {
                      e.currentTarget.style.borderColor = "#009639";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 150, 57, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="">
                    {appointments.length === 0
                      ? "No available appointments"
                      : "Select Appointment"}
                  </option>
                  {appointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      Appointment #{apt.id} - {apt.deviceType} ({apt.deviceModel}) -{" "}
                      {new Date(apt.date).toLocaleDateString()} {apt.time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Description <span style={{ color: "#6c757d", fontSize: "12px" }}>(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the work performed..."
                  style={{
                    ...textareaStyle,
                    ...(formData.description && {
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
                  Parts Used <span style={{ color: "#6c757d", fontSize: "12px" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  name="partsUsed"
                  value={formData.partsUsed}
                  onChange={handleInputChange}
                  placeholder="e.g., Filter, Gasket, O-ring"
                  style={{
                    ...inputStyle,
                    ...(formData.partsUsed && {
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
                  Price <span style={{ color: "#6c757d", fontSize: "12px" }}>(Optional, USD)</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{
                    ...inputStyle,
                    ...(formData.price && {
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
                  disabled={appointments.length === 0}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: appointments.length === 0 ? "#6c757d" : "#009639",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: appointments.length === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: appointments.length === 0 ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (appointments.length > 0) {
                      e.currentTarget.style.backgroundColor = "#007c30";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (appointments.length > 0) {
                      e.currentTarget.style.backgroundColor = "#009639";
                    }
                  }}
                >
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Service Report Details</h2>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Report ID</label>
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
                  #{selectedReport.id}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Appointment ID</label>
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
                  #{selectedReport.appointmentId}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Technician</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#212529",
                    fontSize: "14px",
                  }}
                >
                  {selectedReport.technicianName || "-"}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Description</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#212529",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap",
                    minHeight: "60px",
                  }}
                >
                  {selectedReport.description || "-"}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Parts Used</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#212529",
                    fontSize: "14px",
                  }}
                >
                  {selectedReport.partsUsed || "-"}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ ...labelStyle, marginBottom: "6px" }}>Price</label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    color: "#009639",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {formatCurrency(selectedReport.price)}
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
                  {formatDate(selectedReport.createdAt)}
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
    </div>
  );
}



