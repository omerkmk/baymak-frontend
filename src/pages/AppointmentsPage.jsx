import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(null);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    deviceId: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    fetchAppointments();
    fetchDevices();
  }, []);

  const fetchAppointments = () => {
    setError(null);
    axiosClient
      .get("/api/appointments/my")
      .then((res) => {
        setAppointments(res.data || []);
      })
      .catch((err) => {
        console.error("Appointments fetch error:", err);
        const errorMsg =
          err.response?.data?.message || "Randevular yüklenirken bir hata oluştu.";
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

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.deviceId || !formData.date || !formData.time) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    // Date validation - past dates cannot be selected
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError("Geçmiş bir tarih seçemezsiniz. Lütfen bugünden ileri bir tarih seçin.");
      return;
    }

    try {
      const appointmentData = {
        deviceId: parseInt(formData.deviceId),
        date: formData.date,
        time: formData.time,
      };

      await axiosClient.post("/api/appointments", appointmentData);
      setShowCreateModal(false);
      setFormData({ deviceId: "", date: "", time: "" });
      fetchAppointments();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "Randevu oluşturulurken bir hata oluştu.";
      setError(errorMsg);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) {
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
        err.response?.data?.message || "Randevu iptal edilirken bir hata oluştu.";
      alert(errorMsg);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await axiosClient.get(`/api/appointments/my/${id}`);
      setSelectedAppointment(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "Randevu detayları yüklenirken bir hata oluştu.";
      alert(errorMsg);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedAppointment(null);
    setFormData({ deviceId: "", date: "", time: "" });
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
        return "Beklemede";
      case "IN_PROGRESS":
        return "Devam Ediyor";
      case "COMPLETED":
        return "Tamamlandı";
      case "CANCELLED":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5); // HH:mm format
  };

  // Styles - Modern & Aesthetic
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
            <h1 style={titleStyle}>Randevularım</h1>
            <p style={{ color: "#6c757d", margin: "8px 0 0 0" }}>Yükleniyor...</p>
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
            <h1 style={titleStyle}>Randevularım</h1>
            <p style={{ color: "#6c757d", margin: "8px 0 0 0", fontSize: "15px" }}>
              {appointments.length} {appointments.length === 1 ? "randevu" : "randevu"} kayıtlı
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
            onClick={() => setShowCreateModal(true)}
            disabled={devices.length === 0}
          >
            <span style={{ fontSize: "18px" }}>+</span> Yeni Randevu
          </button>
        </div>
      </div>

      {devices.length === 0 && (
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
          ⚠️ Randevu oluşturmak için önce bir cihaz eklemeniz gerekiyor.{" "}
          <a href="/devices" style={{ color: "#009639", fontWeight: "600", textDecoration: "none" }}>
            Cihazlarım
          </a> sayfasına gidin.
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
            Henüz randevu oluşturulmamış.
          </p>
          <p style={{ color: "#adb5bd", fontSize: "14px", margin: "4px 0 0 0" }}>
            İlk randevunuzu oluşturmak için yukarıdaki butona tıklayın.
          </p>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Cihaz</th>
                <th style={thStyle}>Tarih</th>
                <th style={thStyle}>Saat</th>
                <th style={thStyle}>Durum</th>
                <th style={thStyle}>Teknisyen</th>
                <th style={thStyle}>İşlemler</th>
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
                        Atanmadı
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
                      👁️ Detay
                    </button>
                    {appointment.status === "PENDING" && (
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
                        🗑️ İptal
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Yeni Randevu Oluştur</h2>
            <form onSubmit={handleCreateAppointment}>
              <div>
                <label style={labelStyle}>
                  Cihaz <span style={{ color: "#dc3545" }}>*</span>
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
                  <option value="">Cihaz Seçiniz</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.model} ({device.deviceType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Tarih <span style={{ color: "#dc3545" }}>*</span>
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
                  Saat <span style={{ color: "#dc3545" }}>*</span>
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
                  İptal
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
                  ✓ Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Randevu Detayı</h2>
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
                    Randevu ID
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
                    Durum
                  </span>
                  <div style={{ marginTop: "6px" }}>
                    <span style={getStatusBadgeStyle(selectedAppointment.status)}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
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
                  Cihaz Bilgileri
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
                  Tarih ve Saat
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
                    Atanan Teknisyen
                  </span>
                  <div style={{ marginTop: "8px", fontSize: "15px", fontWeight: "500" }}>
                    {selectedAppointment.technicianName}
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
                    Oluşturulma Tarihi
                  </span>
                  <div style={{ marginTop: "8px", fontSize: "13px", color: "#6c757d" }}>
                    {new Date(selectedAppointment.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              {selectedAppointment.status === "PENDING" && (
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
                  🗑️ İptal Et
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
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
