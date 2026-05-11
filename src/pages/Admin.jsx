import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    categories: 0
  });

  useEffect(() => {
    // Check kung sino ang naka-login
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    
    // Dito mo pwedeng ilagay ang logic para kumuha ng real stats mula sa DB mo
    setStats({
      totalProducts: 124,
      lowStock: 5,
      categories: 8
    });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar - Fix width para hindi gumagalaw */}
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />

        <main style={{ padding: "32px", flex: 1 }}>
          {/* Header Section */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
              Dashboard Overview
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Welcome back, {user?.email?.split('@')[0] || "Admin"}! Here's what's happening today.
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
            gap: "24px",
            marginBottom: "40px" 
          }}>
            <StatCard title="Total Products" value={stats.totalProducts} icon="📦" color="#185FA5" />
            <StatCard title="Low Stock Alert" value={stats.lowStock} icon="⚠️" color="#dc2626" />
            <StatCard title="Categories" value={stats.categories} icon="📁" color="#059669" />
          </div>

          {/* Quick Actions or Recent Activity */}
          <div style={{ 
            backgroundColor: "#ffffff", 
            padding: "24px", 
            borderRadius: "16px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e2e8f0"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Recent Inventory Updates</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "40px 0" }}>
              No recent activity to show. Start adding products to see them here!
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper Component para sa Stats
function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "24px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e2e8f0"
    }}>
      <div style={{ 
        fontSize: "24px", 
        backgroundColor: `${color}10`, 
        padding: "12px", 
        borderRadius: "12px" 
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: "500" }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#1e293b" }}>{value}</h3>
      </div>
    </div>
  );
}