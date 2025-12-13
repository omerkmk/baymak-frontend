import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export default function DevicesPage() {
  const [devices, setDevices] = useState(null);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    deviceType: "",
    model: "",
    serialNumber: "",
  });

  // Brand: Only Baymak
  const BRAND = "Baymak";

  // Device type list - Baymak products
  const deviceTypes = [
    "Air Conditioner",
    "Combi Boiler",
    "Water Heater",
    "Instant Water Heater",
    "Heater",
    "Solar Energy",
    "Pump",
    "Thermostat",
    "Ventilation",
  ];

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = () => {
    setError(null);
    axiosClient
      .get("/api/devices/my")
      .then((res) => {
        setDevices(res.data || []);
      })
      .catch((err) => {
        console.error("Devices fetch error:", err);
        const errorMsg =
          err.response?.data?.message || "An error occurred while loading devices.";
        setError(errorMsg);
        setDevices([]); // Set empty array in case of error
      });
  };



  const handleDeviceTypeChange = (deviceType) => {
    setFormData({ ...formData, deviceType });
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: Required fields
    if (!formData.deviceType || !formData.model) {
      setError("Please fill in all required fields (Device Type, Model).");
      return;
    }

    try {
      // Data to send to backend - Brand is automatically added as "Baymak"
      const deviceData = {
        deviceType: formData.deviceType,
        model: `${BRAND} ${formData.model}`.trim(),
        serialNumber: formData.serialNumber,
      };
      
      await axiosClient.post("/api/devices", deviceData);
      setShowAddModal(false);
      setFormData({ deviceType: "", model: "", serialNumber: "" });
      fetchDevices();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while adding the device.";
      setError(errorMsg);
    }
  };

  const handleEditDevice = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Data to send to backend - Brand is automatically added as "Baymak"
      const deviceData = {
        deviceType: formData.deviceType,
        model: `${BRAND} ${formData.model}`.trim(),
        serialNumber: formData.serialNumber,
      };
      
      await axiosClient.put(`/api/devices/${editingDevice.id}`, deviceData);
      setShowEditModal(false);
      setEditingDevice(null);
      setFormData({ deviceType: "", model: "", serialNumber: "" });
      fetchDevices();
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message || "An error occurred while updating the device.";
      setError(errorMsg);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) {
      return;
    }

    try {
      await axiosClient.delete(`/api/devices/${id}`);
      fetchDevices();
    } catch (err) {
      console.error(err);
      setError("An error occurred while deleting the device.");
    }
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    
    // Extract "Baymak" brand from model
    let model = device.model || "";
    if (model.startsWith(BRAND)) {
      model = model.substring(BRAND.length).trim();
    }
    
    setFormData({
      deviceType: device.deviceType || "",
      model: model,
      serialNumber: device.serialNumber || "",
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingDevice(null);
    setFormData({ deviceType: "", model: "", serialNumber: "" });
    setError(null);
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


  if (devices === null) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/baymak.png" alt="Baymak Logo" style={logoStyle} />
          <div style={{ flex: 1 }}>
            <h1 style={titleStyle}>My Devices</h1>
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
            <h1 style={titleStyle}>My Devices</h1>
            <p style={{ color: "#6c757d", margin: "8px 0 0 0", fontSize: "15px" }}>
              {devices.length} {devices.length === 1 ? "device" : "devices"} registered
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
            onClick={() => setShowAddModal(true)}
          >
            <span style={{ fontSize: "18px" }}>+</span> Add New Device
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

      {devices.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📱</div>
          <p style={{ color: "#6c757d", fontSize: "16px", margin: "8px 0" }}>
            No devices added yet.
          </p>
          <p style={{ color: "#adb5bd", fontSize: "14px", margin: "4px 0 0 0" }}>
            Click the button above to add your first device.
          </p>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Device Type</th>
              <th style={thStyle}>Model</th>
              <th style={thStyle}>Serial No</th>
              <th style={thStyle}>Created Date</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
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
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#fafbfc";
                }}
              >
                <td style={tdStyle}>
                  <span style={{ 
                    fontWeight: "600", 
                    color: "#009639",
                    fontSize: "13px"
                  }}>
                    #{device.id}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    backgroundColor: "#e7f5e7",
                    color: "#009639",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}>
                    {device.deviceType || "-"}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: "500" }}>{device.model || "-"}</td>
                <td style={tdStyle}>
                  <span style={{ color: "#6c757d", fontFamily: "monospace", fontSize: "13px" }}>
                    {device.serialNumber || "-"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{ color: "#6c757d", fontSize: "13px" }}>
                    {device.createdAt
                      ? new Date(device.createdAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
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
                    onClick={() => openEditModal(device)}
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
                    onClick={() => handleDeleteDevice(device.id)}
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
            <h2 style={modalTitleStyle}>Add New Device</h2>
            <form onSubmit={handleAddDevice}>
              <div>
                <label style={labelStyle}>
                  Brand
                </label>
                <input
                  type="text"
                  value={BRAND}
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
              </div>

              <div>
                <label style={labelStyle}>
                  Cihaz Tipi <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => handleDeviceTypeChange(e.target.value)}
                  required
                  style={{
                    ...selectStyle,
                    ...(formData.deviceType && {
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
                  <option value="">Select Device Type</option>
                  {deviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Model <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.model && {
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
                  placeholder="e.g., Elegant Plus, Duo, Comfort..."
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Serial Number <span style={{ color: "#6c757d", fontSize: "12px", fontWeight: "400" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#009639";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 150, 57, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Device serial number"
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

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "28px" }}>
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
                  ✓ Save
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
            <h2 style={modalTitleStyle}>Edit Device</h2>
            <form onSubmit={handleEditDevice}>
              <div>
                <label style={labelStyle}>
                  Brand
                </label>
                <input
                  type="text"
                  value={BRAND}
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
              </div>

              <div>
                <label style={labelStyle}>
                  Cihaz Tipi <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => handleDeviceTypeChange(e.target.value)}
                  required
                  style={{
                    ...selectStyle,
                    ...(formData.deviceType && {
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
                  <option value="">Select Device Type</option>
                  {deviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Model <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  style={{
                    ...inputStyle,
                    ...(formData.model && {
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
                  placeholder="Model information"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Serial Number <span style={{ color: "#6c757d", fontSize: "12px", fontWeight: "400" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#009639";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 150, 57, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e9ecef";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Device serial number"
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "28px" }}>
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
                  ✓ Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

