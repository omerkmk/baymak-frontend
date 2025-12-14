import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userName = userInfo.name || userInfo.email || "User";

  const adminMenu = [
  { path: "/", label: "Dashboard" },
  { path: "/users", label: "Users" },
  { path: "/technicians", label: "Technicians" },
    { path: "/appointments", label: "All Appointments" },
    { path: "/reports", label: "Service Reports" },
    { path: "/profile", label: "My Profile" },
  ];

  const customerMenu = [
    { path: "/", label: "Dashboard" },
    { path: "/appointments", label: "My Appointments" },
    { path: "/devices", label: "My Devices" },
    { path: "/profile", label: "My Profile" },
  ];

  const technicianMenu = [
    { path: "/", label: "Dashboard" },
    { path: "/appointments", label: "Assigned Appointments" },
    { path: "/reports", label: "Service Reports" },
  { path: "/profile", label: "My Profile" },
];

  let menuItems =
    role === "ADMIN"
      ? adminMenu
      : role === "TECHNICIAN"
      ? technicianMenu
      : customerMenu;

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          background: "linear-gradient(180deg, #007c30 0%, #009639 100%)",
          color: "#fff",
          padding: "0",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />

        {/* Header with Logo */}
        <div
          style={{
            padding: "28px 24px",
            position: "relative",
            zIndex: 1,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "12px",
                padding: "6px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <img
                src="/baymak.png"
                alt="Baymak Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  userSelect: "none",
                }}
                onError={(e) => {
                  console.error("Logo failed to load");
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#fff",
                  letterSpacing: "0.5px",
                }}
              >
                Baymak
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Service Panel
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div
          style={{
            flex: 1,
            padding: "20px 16px",
            position: "relative",
            zIndex: 1,
            overflowY: "auto",
          }}
        >
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 16px",
                  marginBottom: "6px",
                  textDecoration: "none",
                  borderRadius: "12px",
                  background: isActive
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                  color: isActive ? "#fff" : "rgba(255, 255, 255, 0.85)",
                  fontWeight: isActive ? "600" : "500",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  border: isActive
                    ? "1px solid rgba(255, 255, 255, 0.3)"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <span style={{ marginRight: "12px", fontSize: "18px" }}>
                  {item.path === "/" && "📊"}
                  {item.path === "/appointments" && "📅"}
                  {item.path === "/devices" && "📱"}
                  {item.path === "/users" && "👥"}
                  {item.path === "/technicians" && "🔧"}
                  {item.path === "/reports" && "📋"}
                  {item.path === "/profile" && "👤"}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Info and Logout */}
        <div
          style={{
            padding: "20px 16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              padding: "16px",
              marginBottom: "12px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: "6px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Logged in as
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginBottom: "4px",
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255, 255, 255, 0.8)",
                textTransform: "uppercase",
                fontWeight: "600",
                letterSpacing: "0.5px",
                padding: "4px 8px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                display: "inline-block",
              }}
            >
              {role || "USER"}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "rgba(220, 53, 69, 0.9)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(200, 35, 51, 1)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(220, 53, 69, 0.9)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
            }}
          >
            <span style={{ fontSize: "16px" }}>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Page */}
      <main
        style={{
          flex: 1,
          padding: "0",
          backgroundColor: "#f5f7fa",
          overflow: "auto",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
