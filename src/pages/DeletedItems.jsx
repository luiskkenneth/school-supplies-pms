import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient.js";
import { RefreshCcw, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DeletedItems() {
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  async function fetchDeletedProducts() {
    try {
      setLoading(true);
      // DAPAT TUGMA: record_status must be 'INACTIVE'
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("record_status", "INACTIVE") 
        .order('prodcode', { ascending: true });

      if (error) throw error;
      setDeletedProducts(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRestore = async (targetCode) => {
    const confirmRestore = window.confirm(`Restore product ${targetCode} to active list?`);
    if (confirmRestore) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from("product")
          .update({ 
            record_status: "ACTIVE",
            stamp: `RESTORED BY ${user?.email} ON ${new Date().toLocaleString()}`
          }) 
          .eq("prodcode", targetCode);

        if (error) throw error;

        // Alisin sa listahan ng deleted items pagkatapos i-restore
        setDeletedProducts(current => current.filter(item => item.prodcode !== targetCode));
        alert("Product restored successfully! ");
      } catch (err) {
        alert("Restore Failed: " + err.message);
      }
    }
  };

  const filtered = deletedProducts.filter(p => 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.prodcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "100%", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button 
            onClick={() => navigate("/inventory")} 
            style={{ background: "#f1f5f9", border: "none", cursor: "pointer", padding: "10px", borderRadius: "10px" }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ color: "#1e293b", margin: 0, fontWeight: "800" }}>Archive / Trash Bin</h1>
            <p style={{ color: "#64748b" }}>These are products marked as INACTIVE.</p>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={20} />
        <input 
          type="text" 
          placeholder="Search deleted items..."
          style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: "16px", color: "#64748b" }}>Code</th>
              <th style={{ padding: "16px", color: "#64748b" }}>Description</th>
              <th style={{ padding: "16px", color: "#64748b" }}>Last Audit (Stamp)</th>
              <th style={{ padding: "16px", color: "#64748b", textAlign: "center" }}>Restore</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>Loading trash bin...</td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.prodcode} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px", fontWeight: "700", color: "#64748b" }}>{p.prodcode}</td>
                  <td style={{ padding: "16px" }}>{p.description}</td>
                  <td style={{ padding: "16px", fontSize: "12px", color: "#94a3b8" }}>{p.stamp || "No record"}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button 
                      onClick={() => handleRestore(p.prodcode)} 
                      style={{ border: "none", backgroundColor: "#f0fdf4", color: "#15803d", padding: "8px 15px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      <RefreshCcw size={18} /> Restore
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>The trash bin is empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}