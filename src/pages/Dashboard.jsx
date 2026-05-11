import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient.js";
import { Package, AlertTriangle, Clock, TrendingUp, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalSupplies: 0, lowStock: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === "jcesperanza@neu.edu.ph") setIsSuperAdmin(true);

      const { count } = await supabase.from("product").select("*", { count: 'exact', head: true }).eq("record_status", "ACTIVE");
      const { data: all } = await supabase.from("product").select("quantity, reorder_level").eq("record_status", "ACTIVE");
      const lowStockCount = all?.filter(p => p.quantity <= p.reorder_level).length || 0;

      const { data: recent } = await supabase.from("product").select("*").eq("record_status", "ACTIVE").order("stamp", { ascending: false }).limit(6);

      setStats({ totalSupplies: count || 0, lowStock: lowStockCount });
      setRecentItems(recent || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#f4f7fe", minHeight: "100vh" }}>
      <h1 style={{ fontWeight: "800", color: "#1e293b" }}>Supplies Overview</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px", marginTop: "30px" }}>
        {/* TOTAL CARD */}
        <div style={{ ...cardStyle, background: "linear-gradient(135deg, #185FA5 0%, #003566 100%)", color: "white", gridColumn: "span 2" }}>
          <Package size={28} />
          <h2 style={{ fontSize: "48px", margin: "10px 0" }}>{stats.totalSupplies}</h2>
          <p>TOTAL ACTIVE PRODUCTS </p>
        </div>

        {/* LOW STOCK CARD */}
        <div style={{ ...cardStyle, backgroundColor: "white", borderTop: "8px solid #ef4444" }}>
          <AlertTriangle color="#ef4444" size={28} />
          <h2 style={{ fontSize: "48px", margin: "10px 0", color: "#1e293b" }}>{stats.lowStock}</h2>
          <p style={{ color: "#64748b" }}>LOW STOCK ITEMS</p>
        </div>

        {/* REP_002 SECTION - EXCLUSIVE TO SUPERADMIN */}
        {isSuperAdmin && (
          <div style={{ ...cardStyle, gridColumn: "span 3", backgroundColor: "#fff", borderLeft: "8px solid #185FA5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#185FA5" }}>
              <ShieldCheck />
              <h3 style={{ margin: 0 }}>REP_002: Top Selling Products (Superadmin Only)</h3>
            </div>
            <div style={{ marginTop: "20px", padding: "20px", textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: "12px", color: "#94a3b8" }}>
              Sales data integration pending - Rights verified for REP_002.
            </div>
          </div>
        )}

        {/* RECENT ITEMS */}
        <div style={{ ...cardStyle, gridColumn: "span 3", backgroundColor: "white" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><Clock size={20}/> Recently Added</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
            {recentItems.map(item => (
              <div key={item.prodcode} style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <b style={{ color: "#185FA5" }}>{item.prodcode}</b>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { padding: "30px", borderRadius: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" };