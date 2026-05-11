import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Users, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", avatar: "" });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          name: user.user_metadata.full_name || "Admin User",
          avatar: user.user_metadata.avatar_url
        });
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/login"; 
    } catch (error) {
      console.error("Error signing out:", error.message);
      navigate("/login");
    }
  };

  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={22} /> },
    { name: "Products", path: "/inventory", icon: <ClipboardList size={22} /> }, 
    { name: "Users & Access", path: "/users", icon: <Users size={22} /> },
  ];

  return (
    <div style={{
      width: "300px",
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 80px)",
      padding: "30px 20px",
      boxSizing: "border-box"
    }}>
      
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path} style={{
              display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px",
              borderRadius: "15px", textDecoration: "none", marginBottom: "12px",
              color: isActive ? "#ffffff" : "#64748b",
              backgroundColor: isActive ? "#185FA5" : "transparent",
              fontWeight: isActive ? "700" : "500", transition: "0.3s ease"
            }}>
              {item.icon}
              <span style={{ flex: 1, fontSize: "15px" }}>{item.name}</span>
              {isActive && <ChevronRight size={18} />}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "15px", padding: "20px",
          backgroundColor: "#f1f5f9", borderRadius: "24px", marginBottom: "15px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", border: "2px solid #185FA5" }}>
            <img 
              src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}`} 
              alt="Profile" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
              <div style={{ width: "8px", height: "8px", backgroundColor: "#22c55e", borderRadius: "50%" }}></div>
              <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "800" }}>ONLINE</span>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          padding: "16px", color: "#ef4444", backgroundColor: "#fff1f1",
          border: "none", borderRadius: "16px", cursor: "pointer", fontWeight: "700", fontSize: "15px"
        }}>
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </div>
  );
}