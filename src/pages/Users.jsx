import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient.js";
import { 
  Users as UsersIcon, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  UserCircle, 
  AlertCircle, 
  PlusCircle,
  Mail,
  ChevronRight
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);

  const SUPER_ADMIN_EMAIL = "jcesperanza@neu.edu.ph";

  useEffect(() => {
    fetchAllUserData();
  }, []);

  async function fetchAllUserData() {
    try {
      setLoading(true);
      setErrorInfo(null);
      const { data: appUsers, error: userError } = await supabase.from("app_user").select("*");
      if (userError) throw userError;

      const { data: userRights } = await supabase.from("user_rights").select("*");
      const safeRights = userRights || [];

      const combinedData = appUsers.map(u => {
        const userRight = safeRights.find(r => r.user_id === u.userid);
        return {
          userid: u.userid,
          fullname: `${u.firstname} ${u.lastname}`,
          role: u.user_type,
          right_code: userRight ? userRight.right_code : "PRD_ADD", // Default code
          value: userRight ? userRight.value : 0,
          hasRecord: !!userRight
        };
      });
      setUsers(combinedData);
    } catch (err) {
      setErrorInfo(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleAccess = async (user) => {
    if (user.role === "SUPERADMIN") return;
    const newValue = user.value === 1 ? 0 : 1;
    try {
      const { error } = await supabase.from("user_rights").upsert({ 
        user_id: user.userid, 
        right_code: user.right_code, 
        value: newValue,
        record_status: 'ACTIVE'
      }, { onConflict: 'user_id, right_code' });
      if (error) throw error;
      fetchAllUserData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={pageWrapper}>
      
      {/* HEADER SECTION */}
      <div style={headerContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={iconBox}><UsersIcon size={24} color="#1e40af" /></div>
          <div>
            <h1 style={titleStyle}>User Access Management</h1>
            <div style={breadcrumbStyle}>
              <span>System</span> <ChevronRight size={12} /> <span>Users</span> <ChevronRight size={12} /> <span style={{ color: "#1e40af", fontWeight: "600" }}>Permissions</span>
            </div>
          </div>
        </div>
        <button onClick={fetchAllUserData} style={refreshBtnStyle} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing..." : "Sync Database"}
        </button>
      </div>

      {errorInfo && (
        <div style={errorBoxStyle}><AlertCircle size={18} /> {errorInfo}</div>
      )}

      {/* DATA TABLE - UPDATED WITHOUT PERMISSION KEY */}
      <div style={tableCard}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {/* Redistribution of widths para mas pantay */}
              <th style={{ ...thStyle, width: "45%" }}>Users/Email</th>
              <th style={{ ...thStyle, width: "20%" }}>Role / Type</th>
              <th style={{ ...thStyle, width: "15%" }}>Authorization</th>
              <th style={{ ...thStyle, width: "20%", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={emptyStateStyle}>Fetching records...</td></tr>
            ) : users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} style={rowStyle}>
                  
                  {/* COLUMN 1: PROFILE */}
                  <td style={tdStyle}>
                    <div style={flexAlign}>
                      <div style={avatarStyle}><UserCircle size={24} color="#94a3b8" /></div>
                      <div>
                        <div style={nameStyle}>{user.fullname}</div>
                        <div style={emailStyle}><Mail size={11} /> {user.userid}</div>
                      </div>
                    </div>
                  </td>

                  {/* COLUMN 2: ROLE */}
                  <td style={tdStyle}>
                    <span style={{ 
                      ...badgeBase, 
                      backgroundColor: user.role === "SUPERADMIN" ? "#eff6ff" : "#f8fafc",
                      color: user.role === "SUPERADMIN" ? "#2563eb" : "#475569",
                      border: "1px solid #e2e8f0"
                    }}>
                      {user.role}
                    </span>
                  </td>

                  {/* COLUMN 3: STATUS */}
                  <td style={tdStyle}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px", 
                      color: user.value === 1 ? "#10b981" : "#f43f5e",
                      fontWeight: "700",
                      fontSize: "13px"
                    }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: user.value === 1 ? "#10b981" : "#f43f5e" }} />
                      {user.value === 1 ? "Active" : "Disabled"}
                    </div>
                  </td>

                  {/* COLUMN 4: ACTIONS */}
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button 
                      onClick={() => handleToggleAccess(user)}
                      disabled={user.role === "SUPERADMIN"}
                      style={{ 
                        ...actionBtn, 
                        backgroundColor: user.value === 1 ? "#fff1f2" : "#f0fdf4",
                        color: user.value === 1 ? "#e11d48" : "#16a34a",
                        opacity: user.role === "SUPERADMIN" ? 0.3 : 1,
                        cursor: user.role === "SUPERADMIN" ? "not-allowed" : "pointer"
                      }}
                    >
                      {user.value === 1 ? "Revoke Access" : "Grant Access"}
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={emptyStateStyle}>No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- CSS STYLES ---
const pageWrapper = { padding: "40px", backgroundColor: "#fbfcfd", minHeight: "100vh", fontFamily: "'Inter', sans-serif" };
const headerContainer = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const iconBox = { backgroundColor: "#dbeafe", padding: "10px", borderRadius: "12px", display: "flex" };
const titleStyle = { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 };
const breadcrumbStyle = { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b", marginTop: "5px" };

const tableCard = { backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" };
const tableStyle = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };

const thStyle = { 
  padding: "16px 25px", 
  backgroundColor: "#f8fafc", 
  color: "#64748b", 
  fontSize: "11px", 
  fontWeight: "700", 
  textTransform: "uppercase", 
  letterSpacing: "0.05em", 
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left"
};

const tdStyle = { 
  padding: "18px 25px", 
  borderBottom: "1px solid #f1f5f9", 
  verticalAlign: "middle"
};

const flexAlign = { display: "flex", alignItems: "center", gap: "12px" };
const rowStyle = { transition: "background-color 0.2s" };

const nameStyle = { fontWeight: "700", color: "#1e293b", fontSize: "14px" };
const emailStyle = { fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" };
const avatarStyle = { minWidth: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" };

const badgeBase = { padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", display: "inline-block" };
const actionBtn = { width: "140px", padding: "10px 0", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "12px", cursor: "pointer", transition: "0.2s" };

const refreshBtnStyle = { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#0f172a", color: "white", padding: "12px 24px", borderRadius: "12px", border: "none", fontWeight: "700", fontSize: "14px", cursor: "pointer" };
const emptyStateStyle = { textAlign: "center", padding: "100px", color: "#94a3b8", fontSize: "14px" };
const errorBoxStyle = { backgroundColor: "#fef2f2", color: "#b91c1c", padding: "15px 25px", borderRadius: "12px", marginBottom: "25px", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #fee2e2" };