import { Link, useLocation, Outlet } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const adminMenu = [
    { path: "/", label: "Dashboard" },
    { path: "/users", label: "Kullanıcılar" },
    { path: "/technicians", label: "Teknisyenler" },
    { path: "/appointments", label: "Tüm Randevular" },
    { path: "/profile", label: "Profilim" },
  ];

  const customerMenu = [
    { path: "/", label: "Dashboard" },
    { path: "/appointments", label: "Randevularım" },
    { path: "/devices", label: "Cihazlarım" },
    { path: "/profile", label: "Profilim" },
  ];

  const technicianMenu = [
    { path: "/", label: "Dashboard" },
    { path: "/appointments", label: "Atanan Randevular" },
    { path: "/reports", label: "Servis Raporları" },
    { path: "/profile", label: "Profilim" },
  ];

  let menuItems =
    role === "ADMIN"
      ? adminMenu
      : role === "TECHNICIAN"
      ? technicianMenu
      : customerMenu;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "#111827",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Baymak Panel</h2>

        <div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "block",
                padding: "10px",
                marginBottom: "8px",
                textDecoration: "none",
                borderRadius: "6px",
                background:
                  location.pathname === item.path ? "#2563eb" : "transparent",
                color:
                  location.pathname === item.path ? "#fff" : "#9ca3af",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Page */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}
