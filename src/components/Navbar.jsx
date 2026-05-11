import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Navbar() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata.full_name || user.email);
      }
    };
    getUser();
  }, []);

  return (
    <nav style={{
      height: "80px", 
      backgroundColor: "#185FA5", 
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 40px", 
      color: "white",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      zIndex: 100
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* No more white background here */}
        <img src="/logo.png" alt="Logo" style={{ width: "45px", height: "45px", objectFit: "contain" }} />
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", letterSpacing: "1px" }}>HopeDB PMS</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>ADMIN PANEL</p>
        </div>
      </div>

      <div style={{ 
        fontSize: "15px", 
        fontWeight: "600",
        padding: "10px 24px",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.3)"
      }}>
        {userName || "Loading..."}
      </div>
    </nav>
  );
}