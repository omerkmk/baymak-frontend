import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export default function AppointmentsPage() {
  const role = localStorage.getItem("role");
  const [appointments, setAppointments] = useState(null);
  const [devices, setDevices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    deviceId: "",
    date: "",
    time: "",
    problemDescription: "",
  });

  useEffect(() => {
    fetchAppointments();
    if (role === "CUSTOMER") {
      fetchDevices();
    }
    if (role === "ADMIN") {
      fetchTechnicians();
    }
  }, [role, statusFilter]);

  const fetchAppointments = () => {
    setError(null);
    let endpoint = "";

    if (role === "CUSTOMER") {
      endpoint = "/api/appointments/my";
    } else if (role === "TECHNICIAN") {
      endpoint = "/api/appointments/assigned";
    } else if (role === "ADMIN") {
      if (statusFilter === "ALL") {
        endpoint = "/api/appointments/all";
      } else {
        endpoint = `/api/appointments/status/${statusFilter}`;
      }
    } else {
      setAppointments([]);
      return;
    }

    axiosClient
      .get(endpoint)
      .then((res) => {
        setAppointments(res.data || []);
      })
      .catch((err) => {
        console.error("Appointments fetch error:", err);
        const errorMsg =
          err.response?.data?.message || "An error occurred while loading appointments.";
        setError(errorMsg);
        setAppointments([]);
      });
  };

  const fetchDevices = () => {
    axiosClient
      .get("/api/devices/my")
      .then((res) => {
        setDevices(res.data || []);
      })
      .catch((err) => {
        console.error("Devices fetch error:", err);
      });
  };

  const fetchTechnicians = () => {
    axiosClient
      .get("/api/technicians")
      .then((res) => {
        setTechnicians(res.data || []);
      })
      .catch((err) => {
        console.error("Technicians fetch error:", err);
      });
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.deviceId || !formData.date || !formData.time) {
      setError("Please fill in all fields.");
      return;
    }

    // Date validation - past dates cannot be selected
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("You cannot select a past date. Please select a date from today onwards.");
      return;
    }

    try {
      const appointmentData = {
        deviceId: parseInt(formData.deviceId),
        date: formData.date,
        time: formData.time,
        problemDescription: formData.problemDescription || null,
      };

      await axiosClient.post("/api/appointments", appointmentData);
      setShowCreateModal(false);
      setFormData({ deviceId: "", date: "", time: "", problemDescription: "" });
      fetchAppointments();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while creating the appointment.";
      setError(errorMsg);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await axiosClient.put(`/api/appointments/my/${id}/cancel`);
      fetchAppointments();
      if (showDetailModal) {
        setShowDetailModal(false);
        setSelectedAppointment(null);
      }
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while canceling the appointment.";
      alert(errorMsg);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      let endpoint = "";
      if (role === "CUSTOMER") {
        endpoint = `/api/appointments/my/${id}`;
      } else if (role === "TECHNICIAN") {
        // For technician, we can use the appointment from the list
        const appointment = appointments.find((apt) => apt.id === id);
        if (appointment) {
          setSelectedAppointment(appointment);
          setShowDetailModal(true);
          return;
        }
      } else if (role === "ADMIN") {
        // For admin, we can use the appointment from the list
        const appointment = appointments.find((apt) => apt.id === id);
        if (appointment) {
          setSelectedAppointment(appointment);
          setShowDetailModal(true);
          return;
        }
      }

      if (endpoint) {
        const res = await axiosClient.get(endpoint);
        setSelectedAppointment(res.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while loading appointment details.";
      alert(errorMsg);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !selectedAppointment) {
      setError("Please select a status.");
      return;
    }

    try {
      await axiosClient.put(`/api/appointments/${selectedAppointment.id}/status`, {
        status: selectedStatus,
      });
      setShowStatusModal(false);
      setSelectedStatus("");
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while updating appointment status.";
      alert(errorMsg);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechnicianId || !selectedAppointment) {
      setError("Please select a technician.");
      return;
    }

    try {
      await axiosClient.put(`/api/appointments/${selectedAppointment.id}/assign`, {
        technicianId: parseInt(selectedTechnicianId),
      });
      setShowAssignModal(false);
      setSelectedTechnicianId("");
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while assigning technician.";
      alert(errorMsg);
    }
  };

  const openStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedStatus(appointment.status);
    setShowStatusModal(true);
  };

  const openAssignModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTechnicianId(appointment.technicianId || "");
    setShowAssignModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setShowStatusModal(false);
    setShowAssignModal(false);
    setSelectedAppointment(null);
    setSelectedStatus("");
    setSelectedTechnicianId("");
    setFormData({ deviceId: "", date: "", time: "", problemDescription: "" });
    setError(null);
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      letterSpacing: "0.3px",
    };

    switch (status) {
      case "PENDING":
        return {
          ...baseStyle,
          backgroundColor: "#fff3cd",
          color: "#856404",
        };
      case "ASSIGNED":
        return {
          ...baseStyle,
          backgroundColor: "#cfe2ff",
          color: "#084298",
        };
      case "IN_PROGRESS":
        return {
          ...baseStyle,
          backgroundColor: "#cce5ff",
          color: "#004085",
        };
      case "COMPLETED":
        return {
          ...baseStyle,
          backgroundColor: "#d4edda",
          color: "#155724",
        };
      case "CANCELLED":
        return {
          ...baseStyle,
          backgroundColor: "#f8d7da",
          color: "#721c24",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#e9ecef",
          color: "#495057",
        };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "ASSIGNED":
        return "Assigned";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPageTitle = () => {
    if (role === "CUSTOMER") return "My Appointments";
    if (role === "TECHNICIAN") return "Assigned Appointments";
    if (role === "ADMIN") return "All Appointments";
    return "Appointments";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5); // HH:mm format
  };

  // Styles
  const containerStyle = {
    padding: "32px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "32px",
    gap: "20px",
  };

  const logoStyle = {
    width: "120px",
    height: "auto",
    userSelect: "none",
  };

  const titleSectionStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const titleStyle = {
    margin: 0,
    color: "#1a1a1a",
    fontSize: "28px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  };

  const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: "#009639",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
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

  if (appointments === null) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <div style={{ flex: 1 }}>
            <h1 style={titleStyle}>{getPageTitle()}</h1>
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
            <h1 style={titleStyle}>{getPageTitle()}</h1>
            <p style={{ color: "#6c757d", margin: "8px 0 0 0", fontSize: "15px" }}>
              {appointments.length} {appointments.length === 1 ? "appointment" : "appointments"} registered
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* Status Filter for Admin */}
            {role === "ADMIN" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  ...selectStyle,
                  marginBottom: 0,
                  padding: "10px 16px",
                  width: "auto",
                  minWidth: "150px",
                }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            )}

            {/* Create Button for Customer */}
            {role === "CUSTOMER" && (
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
                onClick={() => setShowCreateModal(true)}
                disabled={devices.length === 0}
              >
                <span style={{ fontSize: "18px" }}>+</span> New Appointment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Warning for Customer without devices */}
      {role === "CUSTOMER" && devices.length === 0 && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px 20px",
            backgroundColor: "#fff3cd",
            borderRadius: "12px",
            border: "2px solid #ffc107",
            color: "#856404",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          ⚠️ You need to add a device first to create an appointment.{" "}
          <a href="/devices" style={{ color: "#009639", fontWeight: "600", textDecoration: "none" }}>
            My Devices
          </a> page.
        </div>
      )}

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

      {appointments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📅</div>
          <p style={{ color: "#6c757d", fontSize: "16px", margin: "8px 0" }}>
            {role === "CUSTOMER" && "No appointments created yet."}
            {role === "TECHNICIAN" && "No appointments assigned to you yet."}
            {role === "ADMIN" && "No appointments found."}
          </p>
          <p style={{ color: "#adb5bd", fontSize: "14px", margin: "4px 0 0 0" }}>
            {role === "CUSTOMER" && "Click the button above to create your first appointment."}
            {role === "TECHNICIAN" && "You will see appointments here when they are assigned to you."}
            {role === "ADMIN" && "Appointments will appear here when customers create them."}
          </p>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                {role === "ADMIN" && <th style={thStyle}>Customer</th>}
                <th style={thStyle}>Device</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Technician</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr
                  key={appointment.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f7f3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#fafbfc";
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
                      #{appointment.id}
                    </span>
                  </td>
                  {role === "ADMIN" && (
                    <td style={tdStyle}>
                      <span style={{ fontWeight: "500" }}>
                        {appointment.customerName || "-"}
                      </span>
                    </td>
                  )}
                  <td style={tdStyle}>
                    <div>
                      <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                        {appointment.deviceModel || "-"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6c757d",
                        }}
                      >
                        {appointment.deviceType || "-"}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{formatDate(appointment.date)}</td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
                      {formatTime(appointment.time)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={getStatusBadgeStyle(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {appointment.technicianName || (
                      <span style={{ color: "#6c757d", fontStyle: "italic" }}>
                        Not Assigned
                      </span>
                    )}
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
                      onClick={() => handleViewDetail(appointment.id)}
                    >
                      👁️ Detail
                    </button>

                    {/* Customer Actions */}
                    {role === "CUSTOMER" && appointment.status === "PENDING" && (
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
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        🗑️ Cancel
                      </button>
                    )}

                    {/* Technician Actions */}
                    {role === "TECHNICIAN" &&
                      (appointment.status === "PENDING" ||
                        appointment.status === "ASSIGNED" ||
                        appointment.status === "IN_PROGRESS") && (
                        <button
                          style={{
                            ...actionButtonStyle,
                            backgroundColor: "#007bff",
                            color: "#ffffff",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#0056b3";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#007bff";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onClick={() => openStatusModal(appointment)}
                        >
                          🔄 Update Status
                        </button>
                      )}

                    {/* Admin Actions */}
                    {role === "ADMIN" && (
                      <>
                        {appointment.status === "PENDING" && (
                          <button
                            style={{
                              ...actionButtonStyle,
                              backgroundColor: "#ffc107",
                              color: "#000000",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#e0a800";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#ffc107";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                            onClick={() => openAssignModal(appointment)}
                          >
                            👤 Assign
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Appointment Modal (Customer only) */}
      {showCreateModal && role === "CUSTOMER" && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Create New Appointment</h2>
            <form onSubmit={handleCreateAppointment}>
              <div>
                <label style={labelStyle}>
                  Device <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  value={formData.deviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceId: e.target.value })
                  }
                  required
                  style={{
                    ...selectStyle,
                    ...(formData.deviceId && {
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
                >
                  <option value="">Select Device</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.model} ({device.deviceType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Date <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    ...inputStyle,
                    ...(formData.date && {
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

              <div>
                <label style={labelStyle}>
                  Time <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.time && {
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

              <div>
                <label style={labelStyle}>
                  Problem Description <span style={{ color: "#6c757d", fontSize: "12px" }}>(Optional)</span>
                </label>
                <textarea
                  value={formData.problemDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, problemDescription: e.target.value })
                  }
                  placeholder="Describe the problem or issue with your device..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    minHeight: "100px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    ...(formData.problemDescription && {
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

              {error && (
                <div
                  style={{
                    marginTop: "8px",
                    marginBottom: "8px",
                    padding: "14px 16px",
                    backgroundColor: "#f8d7da",
                    border: "2px solid #f5c6cb",
                    borderRadius: "10px",
                    color: "#721c24",
                    fontSize: "14px",
                    fontWeight: "500",
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
                  marginTop: "28px",
                }}
              >
                <button
                  type="button"
                  onClick={closeModals}
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
                  ✓ Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal (Technician) */}
      {showStatusModal && role === "TECHNICIAN" && selectedAppointment && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Update Appointment Status</h2>
            <div>
              <label style={labelStyle}>
                Status <span style={{ color: "#dc3545" }}>*</span>
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                required
                style={{
                  ...selectStyle,
                  ...(selectedStatus && {
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
              >
                <option value="">Select Status</option>
                {selectedAppointment.status === "PENDING" && (
                  <>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </>
                )}
                {selectedAppointment.status === "ASSIGNED" && (
                  <>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </>
                )}
                {selectedAppointment.status === "IN_PROGRESS" && (
                  <option value="COMPLETED">Completed</option>
                )}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "28px",
              }}
            >
              <button
                type="button"
                onClick={closeModals}
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
                type="button"
                onClick={handleUpdateStatus}
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
                ✓ Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal (Admin) */}
      {showAssignModal && role === "ADMIN" && selectedAppointment && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Assign Technician</h2>
            <div>
              <label style={labelStyle}>
                Technician <span style={{ color: "#dc3545" }}>*</span>
              </label>
              <select
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                required
                style={{
                  ...selectStyle,
                  ...(selectedTechnicianId && {
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
              >
                <option value="">Select Technician</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} ({technician.email})
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "28px",
              }}
            >
              <button
                type="button"
                onClick={closeModals}
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
                type="button"
                onClick={handleAssignTechnician}
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
                ✓ Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Appointment Detail</h2>
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  marginBottom: "20px",
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Appointment ID
                  </span>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#009639" }}>
                    #{selectedAppointment.id}
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Status
                  </span>
                  <div style={{ marginTop: "6px" }}>
                    <span style={getStatusBadgeStyle(selectedAppointment.status)}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </div>
                </div>
              </div>

              {role === "ADMIN" && selectedAppointment.customerName && (
                <div style={{ marginBottom: "20px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: "12px",
                    }}
                  >
                    Customer Information
                  </span>
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#e7f3ff",
                      borderRadius: "12px",
                      border: "1px solid #b8daff",
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6c757d",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "4px",
                        }}
                      >
                        Name
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#009639" }}>
                        {selectedAppointment.customerName}
                      </div>
                    </div>
                    {selectedAppointment.customerEmail && (
                      <div style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6c757d",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "4px",
                          }}
                        >
                          Email
                        </div>
                        <div style={{ fontSize: "14px", color: "#495057" }}>
                          {selectedAppointment.customerEmail}
                        </div>
                      </div>
                    )}
                    {selectedAppointment.customerPhone && (
                      <div style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6c757d",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "4px",
                          }}
                        >
                          Phone
                        </div>
                        <div style={{ fontSize: "14px", color: "#495057", fontFamily: "monospace" }}>
                          {selectedAppointment.customerPhone}
                        </div>
                      </div>
                    )}
                    {selectedAppointment.customerAddress && (
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6c757d",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "4px",
                          }}
                        >
                          Address
                        </div>
                        <div style={{ fontSize: "14px", color: "#495057", lineHeight: "1.5" }}>
                          {selectedAppointment.customerAddress}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Device Information
                </span>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    backgroundColor: "#e7f5e7",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    {selectedAppointment.deviceModel || "-"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6c757d" }}>
                    {selectedAppointment.deviceType || "-"}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Date and Time
                </span>
                <div style={{ marginTop: "8px", fontSize: "15px", fontWeight: "500" }}>
                  {formatDate(selectedAppointment.date)} - {formatTime(selectedAppointment.time)}
                </div>
              </div>

              {selectedAppointment.technicianName && (
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Assigned Technician
                  </span>
                  <div style={{ marginTop: "8px", fontSize: "15px", fontWeight: "500" }}>
                    {selectedAppointment.technicianName}
                  </div>
                </div>
              )}

              {selectedAppointment.problemDescription && (
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Problem Description
                  </span>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "12px",
                      backgroundColor: "#fff3cd",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#856404",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6",
                    }}
                  >
                    {selectedAppointment.problemDescription}
                  </div>
                </div>
              )}

              {selectedAppointment.createdAt && (
                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Created Date
                  </span>
                  <div style={{ marginTop: "8px", fontSize: "13px", color: "#6c757d" }}>
                    {new Date(selectedAppointment.createdAt).toLocaleString("en-US")}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              {role === "CUSTOMER" && selectedAppointment.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => handleCancelAppointment(selectedAppointment.id)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#dc3545",
                    boxShadow: "0 4px 12px rgba(220, 53, 69, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#c82333";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc3545";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  🗑️ Cancel
                </button>
              )}
              <button
                type="button"
                onClick={closeModals}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
