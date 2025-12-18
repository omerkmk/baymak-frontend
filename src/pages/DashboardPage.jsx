import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function DashboardPage() {
  const role = localStorage.getItem("role");
  const [devices, setDevices] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [users, setUsers] = useState(null);
  const [technicians, setTechnicians] = useState(null);
  const [serviceReports, setServiceReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (role === "CUSTOMER") {
        // Customer Dashboard
        const [devicesRes, appointmentsRes] = await Promise.all([
          axiosClient.get("/api/devices/my"),
          axiosClient.get("/api/appointments/my"),
        ]);
        setDevices(devicesRes.data || []);
        setAppointments(appointmentsRes.data || []);
      } else if (role === "TECHNICIAN") {
        // Technician Dashboard
        const [appointmentsRes, reportsRes] = await Promise.all([
          axiosClient.get("/api/appointments/assigned"),
          axiosClient.get("/api/service-reports/my").catch(() => ({ data: [] })), // Optional
        ]);
        setAppointments(appointmentsRes.data || []);
        setServiceReports(reportsRes.data || []);
      } else if (role === "ADMIN") {
        // Admin Dashboard
        const [usersRes, techniciansRes, appointmentsRes] = await Promise.all([
          axiosClient.get("/api/users"),
          axiosClient.get("/api/technicians"),
          axiosClient.get("/api/appointments/all"),
        ]);
        setUsers(usersRes.data || []);
        setTechnicians(techniciansRes.data || []);
        setAppointments(appointmentsRes.data || []);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while loading dashboard data.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Customer Statistics
  const getCustomerStats = () => {
    const totalDevices = devices?.length || 0;
    const activeAppointments =
      appointments?.filter(
        (apt) => apt.status === "PENDING" || apt.status === "IN_PROGRESS"
      ).length || 0;
    return { totalDevices, activeAppointments };
  };

  // Technician Statistics
  const getTechnicianStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const assignedToday = appointments?.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === today.toDateString();
    }).length || 0;

    const assignedTomorrow = appointments?.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === tomorrow.toDateString();
    }).length || 0;

    const assignedUpcoming = appointments?.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate > today && apt.status !== "CANCELLED" && apt.status !== "COMPLETED";
    }).length || 0;

    const completedThisMonth = appointments?.filter((apt) => {
      if (apt.status !== "COMPLETED") return false;
      const aptDate = new Date(apt.date);
      return aptDate >= today && aptDate <= endOfMonth;
    }).length || 0;

    const pendingAppointments = appointments?.filter(
      (apt) => apt.status === "PENDING" || apt.status === "ASSIGNED"
    ) || [];

    return {
      assignedToday,
      assignedTomorrow,
      assignedUpcoming,
      completedThisMonth,
      pendingAppointments: pendingAppointments.slice(0, 5),
    };
  };

  // Admin Statistics
  const getAdminStats = () => {
    const totalUsers = users?.length || 0;
    const totalTechnicians = technicians?.length || 0;
    const totalAppointments = appointments?.length || 0;
    const pendingAppointments = appointments?.filter((apt) => apt.status === "PENDING").length || 0;
    const inProgressAppointments =
      appointments?.filter((apt) => apt.status === "IN_PROGRESS").length || 0;
    const completedAppointments =
      appointments?.filter((apt) => apt.status === "COMPLETED").length || 0;
    const cancelledAppointments =
      appointments?.filter((apt) => apt.status === "CANCELLED").length || 0;

    const recentUsers = users
      ? [...users]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          })
          .slice(0, 5)
      : [];

    const unassignedAppointments = appointments?.filter(
      (apt) => !apt.technicianName && apt.status === "PENDING"
    ) || [];

    return {
      totalUsers,
      totalTechnicians,
      totalAppointments,
      pendingAppointments,
      inProgressAppointments,
      completedAppointments,
      cancelledAppointments,
      recentUsers,
      unassignedAppointments: unassignedAppointments.slice(0, 5),
    };
  };

  // Get last 5 devices (Customer)
  const lastDevices = devices
    ? [...devices]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        })
        .slice(0, 5)
    : [];

  // Get upcoming 5 appointments (Customer)
  const upcomingAppointments = appointments
    ? [...appointments]
        .filter((apt) => {
          const appointmentDate = new Date(apt.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return appointmentDate >= today && apt.status !== "CANCELLED";
        })
        .sort((a, b) => {
          const dateA = new Date(a.date + "T" + a.time);
          const dateB = new Date(b.date + "T" + b.time);
          return dateA - dateB;
        })
        .slice(0, 5)
    : [];

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5); // HH:mm format
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.3px",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    };

    switch (status) {
      case "PENDING":
        return {
          ...baseStyle,
          backgroundColor: "#FEF3C7",
          color: "#92400E",
          border: "1px solid #FDE68A",
        };
      case "ASSIGNED":
        return {
          ...baseStyle,
          backgroundColor: "#DBEAFE",
          color: "#1E40AF",
          border: "1px solid #BFDBFE",
        };
      case "IN_PROGRESS":
        return {
          ...baseStyle,
          backgroundColor: "#DBEAFE",
          color: "#1E40AF",
          border: "1px solid #BFDBFE",
        };
      case "COMPLETED":
        return {
          ...baseStyle,
          backgroundColor: "#D1FAE5",
          color: "#065F46",
          border: "1px solid #A7F3D0",
        };
      case "CANCELLED":
        return {
          ...baseStyle,
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FECACA",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#F3F4F6",
          color: "#374151",
          border: "1px solid #E5E7EB",
        };
    }
  };

  // Get status label
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

  // Container styles
  const containerStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px 24px",
    minHeight: "100vh",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "40px",
    paddingBottom: "24px",
    borderBottom: "2px solid #E5E7EB",
  };

  const logoStyle = {
    width: "64px",
    height: "64px",
    objectFit: "contain",
    userSelect: "none",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
  };

  const titleStyle = {
    fontSize: "36px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #007c30 0%, #009639 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
    letterSpacing: "-0.5px",
  };

  // Statistics cards container
  const statsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "48px",
  };

  const statCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #F3F4F6",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  };

  const statCardTitleStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  };

  const statCardValueStyle = {
    fontSize: "42px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #007c30 0%, #009639 50%, #00b347 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "8px",
    lineHeight: "1.1",
  };

  // Section styles
  const sectionStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    marginBottom: "32px",
    border: "1px solid #F3F4F6",
    transition: "all 0.3s ease",
  };

  const sectionHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    paddingBottom: "20px",
    borderBottom: "2px solid #F3F4F6",
  };

  const sectionTitleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
    letterSpacing: "-0.3px",
  };

  const viewAllLinkStyle = {
    color: "#009639",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  };

  // Table styles
  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
  };

  const thStyle = {
    textAlign: "left",
    padding: "16px 20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    borderBottom: "2px solid #F3F4F6",
    backgroundColor: "#FAFBFC",
  };

  const tdStyle = {
    padding: "18px 20px",
    fontSize: "14px",
    color: "#111827",
    borderBottom: "1px solid #F3F4F6",
    transition: "background-color 0.15s ease",
  };

  const emptyStateStyle = {
    textAlign: "center",
    padding: "40px 20px",
    color: "#6c757d",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <h1 style={titleStyle}>Dashboard</h1>
        </div>
        <p style={{ color: "#6c757d" }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <h1 style={titleStyle}>Dashboard</h1>
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

  // Customer Dashboard
  if (role === "CUSTOMER") {
    const { totalDevices, activeAppointments } = getCustomerStats();

    return (
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <h1 style={titleStyle}>Dashboard</h1>
        </div>

        {/* Statistics Cards */}
        <div style={statsContainerStyle}>
          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 150, 57, 0.15), 0 10px 10px -5px rgba(0, 150, 57, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Total Devices
            </div>
            <div style={statCardValueStyle}>{totalDevices}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {totalDevices === 1 ? "device" : "devices"} registered
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(245, 158, 11, 0.15), 0 10px 10px -5px rgba(245, 158, 11, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Active Appointments
            </div>
            <div style={statCardValueStyle}>{activeAppointments}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {activeAppointments === 1 ? "appointment" : "appointments"} in progress
            </div>
          </div>
        </div>

        {/* Last Devices Section */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>Recent Devices</h2>
            <Link
              to="/devices"
              style={viewAllLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#007c30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#009639";
              }}
            >
              View All →
            </Link>
          </div>

          {lastDevices.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No devices added yet.</p>
              <Link
                to="/devices"
                style={{
                  ...viewAllLinkStyle,
                  display: "inline-block",
                  marginTop: "8px",
                }}
              >
                Add Your First Device
              </Link>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Device Type</th>
                  <th style={thStyle}>Model</th>
                  <th style={thStyle}>Serial No</th>
                  <th style={thStyle}>Added Date</th>
                </tr>
              </thead>
              <tbody>
                {lastDevices.map((device, index) => (
                  <tr
                    key={device.id}
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
                          display: "inline-block",
                          padding: "4px 12px",
                          backgroundColor: "#e7f5e7",
                          color: "#009639",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {device.deviceType || "-"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "500" }}>
                      {device.model || "-"}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: "#6c757d",
                          fontFamily: "monospace",
                          fontSize: "13px",
                        }}
                      >
                        {device.serialNumber || "-"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: "#6c757d", fontSize: "13px" }}>
                        {formatDate(device.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upcoming Appointments Section */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>Upcoming Appointments</h2>
            <Link
              to="/appointments"
              style={viewAllLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#007c30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#009639";
              }}
            >
              View All →
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No upcoming appointments.</p>
              <Link
                to="/appointments"
                style={{
                  ...viewAllLinkStyle,
                  display: "inline-block",
                  marginTop: "8px",
                }}
              >
                Create Your First Appointment
              </Link>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Device</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Technician</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment, index) => (
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
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#ffffff" : "#fafbfc";
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: "500" }}>
                      {appointment.deviceModel || "-"}
                    </td>
                    <td style={tdStyle}>{formatDate(appointment.date)}</td>
                    <td style={tdStyle}>{formatTime(appointment.time)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Technician Dashboard
  if (role === "TECHNICIAN") {
    const {
      assignedToday,
      assignedTomorrow,
      assignedUpcoming,
      completedThisMonth,
      pendingAppointments,
    } = getTechnicianStats();

    return (
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <h1 style={titleStyle}>Dashboard</h1>
        </div>

        {/* Statistics Cards */}
        <div style={statsContainerStyle}>
          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Today's Appointments
            </div>
            <div style={statCardValueStyle}>{assignedToday}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {assignedToday === 1 ? "appointment" : "appointments"} scheduled
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(99, 102, 241, 0.15), 0 10px 10px -5px rgba(99, 102, 241, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Tomorrow's Appointments
            </div>
            <div style={statCardValueStyle}>{assignedTomorrow}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {assignedTomorrow === 1 ? "appointment" : "appointments"} scheduled
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(245, 158, 11, 0.15), 0 10px 10px -5px rgba(245, 158, 11, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Upcoming Appointments
            </div>
            <div style={statCardValueStyle}>{assignedUpcoming}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {assignedUpcoming === 1 ? "appointment" : "appointments"} pending
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #d1fae5 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 10px 10px -5px rgba(16, 185, 129, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Completed This Month
            </div>
            <div style={statCardValueStyle}>{completedThisMonth}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {completedThisMonth === 1 ? "appointment" : "appointments"} completed
            </div>
          </div>
        </div>

        {/* Pending Appointments Section */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>Pending Appointments</h2>
            <Link
              to="/appointments"
              style={viewAllLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#007c30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#009639";
              }}
            >
              View All →
            </Link>
          </div>

          {pendingAppointments.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No pending appointments.</p>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Device</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Customer</th>
                </tr>
              </thead>
              <tbody>
                {pendingAppointments.map((appointment, index) => (
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
                        #{appointment.id}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "500" }}>
                      {appointment.deviceModel || "-"}
                    </td>
                    <td style={tdStyle}>{formatDate(appointment.date)}</td>
                    <td style={tdStyle}>{formatTime(appointment.time)}</td>
                    <td style={tdStyle}>
                      <span style={getStatusBadgeStyle(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {appointment.customerName || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Service Reports Section */}
        {serviceReports && serviceReports.length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>Recent Service Reports</h2>
              <Link
                to="/reports"
                style={viewAllLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#007c30";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#009639";
                }}
              >
                View All →
              </Link>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Report ID</th>
                  <th style={thStyle}>Appointment ID</th>
                  <th style={thStyle}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {serviceReports.slice(0, 5).map((report, index) => (
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
                          color: "#1F2937",
                        }}
                      >
                        #{report.appointmentId || "-"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: "#6c757d", fontSize: "13px" }}>
                        {formatDate(report.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Admin Dashboard
  if (role === "ADMIN") {
    const {
      totalUsers,
      totalTechnicians,
      totalAppointments,
      pendingAppointments,
      inProgressAppointments,
      completedAppointments,
      cancelledAppointments,
      recentUsers,
      unassignedAppointments,
    } = getAdminStats();

    return (
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <h1 style={titleStyle}>Dashboard</h1>
        </div>

        {/* Statistics Cards */}
        <div style={statsContainerStyle}>
          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(99, 102, 241, 0.15), 0 10px 10px -5px rgba(99, 102, 241, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Total Users
            </div>
            <div style={statCardValueStyle}>{totalUsers}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {totalUsers === 1 ? "user" : "users"} registered
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Total Technicians
            </div>
            <div style={statCardValueStyle}>{totalTechnicians}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {totalTechnicians === 1 ? "technician" : "technicians"} registered
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 150, 57, 0.15), 0 10px 10px -5px rgba(0, 150, 57, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Total Appointments
            </div>
            <div style={statCardValueStyle}>{totalAppointments}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {totalAppointments === 1 ? "appointment" : "appointments"} total
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(245, 158, 11, 0.15), 0 10px 10px -5px rgba(245, 158, 11, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Pending Appointments
            </div>
            <div style={statCardValueStyle}>{pendingAppointments}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {pendingAppointments === 1 ? "appointment" : "appointments"} pending
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              In Progress
            </div>
            <div style={statCardValueStyle}>{inProgressAppointments}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {inProgressAppointments === 1 ? "appointment" : "appointments"} in progress
            </div>
          </div>

          <div
            style={{
              ...statCardStyle,
              background: "linear-gradient(135deg, #ffffff 0%, #d1fae5 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 10px 10px -5px rgba(16, 185, 129, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={statCardTitleStyle}>
              Completed
            </div>
            <div style={statCardValueStyle}>{completedAppointments}</div>
            <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
              {completedAppointments === 1 ? "appointment" : "appointments"} completed
            </div>
          </div>
        </div>

        {/* Unassigned Appointments Section */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>Unassigned Appointments</h2>
            <Link
              to="/appointments"
              style={viewAllLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#007c30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#009639";
              }}
            >
              View All →
            </Link>
          </div>

          {unassignedAppointments.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No unassigned appointments.</p>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Device</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {unassignedAppointments.map((appointment, index) => (
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
                        #{appointment.id}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "500" }}>
                      {appointment.customerName || "-"}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "500" }}>
                      {appointment.deviceModel || "-"}
                    </td>
                    <td style={tdStyle}>{formatDate(appointment.date)}</td>
                    <td style={tdStyle}>{formatTime(appointment.time)}</td>
                    <td style={tdStyle}>
                      <span style={getStatusBadgeStyle(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Users Section */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>Recent Users</h2>
            <Link
              to="/users"
              style={viewAllLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#007c30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#009639";
              }}
            >
              View All →
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No users registered yet.</p>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, index) => (
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
                    <td style={{ ...tdStyle, fontWeight: "500" }}>
                      {user.name || "-"}
                    </td>
                    <td style={tdStyle}>{user.email || "-"}</td>
                    <td style={tdStyle}>{user.phone || "-"}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          backgroundColor: "#e7f5e7",
                          color: "#009639",
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
        <h1 style={titleStyle}>Dashboard</h1>
      </div>
      <p style={{ color: "#6c757d" }}>Please login to view your dashboard.</p>
    </div>
  );
}
