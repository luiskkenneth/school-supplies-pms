import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient.js";
import { Plus, X, Search, Edit3, Trash2, Archive, AlertTriangle, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Inventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // --- STATES FOR PRICE HISTORY ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [priceHistData, setPriceHistData] = useState([]);
  const [selectedProdName, setSelectedProdName] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [userAccess, setUserAccess] = useState({
    role: "USER",
    canAdd: false,
    canEdit: false,
    canDelete: false
  });

  const [newProduct, setNewProduct] = useState({
    prodcode: "",        
    description: "",
    unit: "",
    price: 0,
    quantity: 0, 
    reorder_level: 5,
    record_status: "ACTIVE" 
  });

  useEffect(() => {
    fetchProducts();
    checkPermissions();
  }, []);

  async function checkPermissions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userEmail = user.email.toLowerCase();
      const SUPER_ADMIN_EMAIL = "jcesperanza@neu.edu.ph";
      const ADMIN_EMAILS = [
        "luiskenneth.fajardo@neu.edu.ph",
        "romeofelipe.fetalvo@neu.edu.ph",
        "robbyrein.barrera@neu.edu.ph",
        "kayelaine.diaz@neu.edu.ph",
        "cassandrajadealiyah.perez@neu.edu.ph"
      ];

      const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;
      const isAdmin = ADMIN_EMAILS.includes(userEmail);

      if (isSuperAdmin || isAdmin) {
        setUserAccess({
          role: isSuperAdmin ? "SUPER ADMIN" : "ADMIN",
          canAdd: true,
          canEdit: true,
          canDelete: true
        });
        return; 
      }

      const { data: rights } = await supabase
        .from("user_rights")
        .select("right_code, value")
        .eq("user_id", user.id);

      setUserAccess({
        role: "USER",
        canAdd: rights?.find(r => r.right_code === 'PRD_ADD')?.value === 1,
        canEdit: rights?.find(r => r.right_code === 'PRD_EDIT')?.value === 1,
        canDelete: rights?.find(r => r.right_code === 'PRD_DEL')?.value === 1
      });

    } catch (err) {
      console.error("Permission Check Error:", err.message);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("record_status", "ACTIVE") 
        .order('prodcode', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- FETCH PRICE HISTORY (Aligned with unitprice column) ---
  const handleFetchHistory = async (prodcode, description) => {
    try {
      const { data, error } = await supabase
        .from("priceHist")
        .select("*")
        .eq("prodcode", prodcode)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setPriceHistData(data || []);
      setSelectedProdName(description);
      setShowHistoryModal(true);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || "Unknown User";

      if (isEditing) {
        // Get old price to compare
        const { data: oldData } = await supabase
          .from("product")
          .select("price")
          .eq("prodcode", newProduct.prodcode)
          .single();

        const { data, error } = await supabase
          .from("product")
          .update({ 
            description: newProduct.description, 
            unit: newProduct.unit,
            price: parseFloat(newProduct.price),
            quantity: parseInt(newProduct.quantity),
            reorder_level: parseInt(newProduct.reorder_level),
            stamp: `UPDATED BY ${userEmail} ON ${new Date().toLocaleString()}` 
          })
          .eq("prodcode", newProduct.prodcode)
          .select();

        if (error) throw error;

        // Insert to priceHist if price changed (Using unitprice column from your DB)
        if (oldData && parseFloat(oldData.price) !== parseFloat(newProduct.price)) {
          await supabase.from("priceHist").insert([{
            prodcode: newProduct.prodcode,
            unitprice: parseFloat(newProduct.price), // Aligned with your DB screenshot
            record_status: 'ACTIVE',
            stamp: `PRICE UPDATED BY ${userEmail} ON ${new Date().toLocaleString()}`
          }]);
        }

        alert("Product and Price History updated successfully!");
        setProducts(prev => prev.map(p => p.prodcode === newProduct.prodcode ? data[0] : p));
      } else {
        const { data, error } = await supabase
          .from("product")
          .insert([{ 
            ...newProduct, 
            price: parseFloat(newProduct.price),
            quantity: parseInt(newProduct.quantity),
            reorder_level: parseInt(newProduct.reorder_level),
            record_status: "ACTIVE",
            stamp: `CREATED BY ${userEmail} ON ${new Date().toLocaleString()}` 
          }])
          .select();

        if (error) throw error;

        // Log initial price to history
        if (data) {
           await supabase.from("priceHist").insert([{
            prodcode: newProduct.prodcode,
            unitprice: parseFloat(newProduct.price),
            record_status: 'ACTIVE',
            stamp: `INITIAL PRICE SET BY ${userEmail} ON ${new Date().toLocaleString()}`
          }]);
          setProducts(prev => [...prev, data[0]]);
        }
        alert("Product added successfully!");
      }
      handleCloseModal();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleOpenEditModal = (product) => {
    setIsEditing(true);
    setNewProduct({ ...product }); 
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setNewProduct({ prodcode: "", description: "", unit: "", price: 0, quantity: 0, reorder_level: 5, record_status: "ACTIVE" });
  };

  const handleDelete = async (targetCode) => {
    const confirmDelete = window.confirm(`Are you sure you want to move ${targetCode} to trash?`);
    if (confirmDelete) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("product")
          .update({ 
            record_status: "INACTIVE",
            stamp: `DELETED BY ${user?.email} ON ${new Date().toLocaleString()}`
          }) 
          .eq("prodcode", targetCode);

        if (error) throw error;
        setProducts(current => current.filter(item => item.prodcode !== targetCode));
        alert("Product moved to trash successfully!");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.prodcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "100%", padding: "20px", boxSizing: "border-box" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ color: "#1e293b", margin: 0, fontWeight: "800" }}>Inventory Management</h1>
          <p style={{ color: "#64748b" }}>Role: <b style={{color: "#185FA5"}}>{userAccess.role}</b></p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          {userAccess.role !== "USER" && (
            <button onClick={() => navigate("/archive")} style={secondaryBtnStyle}><Archive size={18} /> View Trash</button>
          )}
          {userAccess.canAdd && (
            <button onClick={() => setShowModal(true)} style={primaryBtnStyle}><Plus size={18} /> Add Product</button>
          )}
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={20} />
        <input 
          type="text" 
          placeholder="Search product code or description..."
          style={searchBarStyle}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={tableContainerStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr style={{ textAlign: "left" }}>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Unit</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Stock</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p.prodcode} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ ...tdStyle, fontWeight: "700", color: "#185FA5" }}>{p.prodcode}</td>
                  <td style={tdStyle}>{p.description}</td>
                  <td style={tdStyle}>{p.unit}</td>
                  <td style={{ ...tdStyle, fontWeight: "600" }}>₱{p.price?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "700", color: p.quantity <= p.reorder_level ? "#ef4444" : "#1e293b" }}>
                      {p.quantity} {p.quantity <= p.reorder_level && <AlertTriangle size={14} />}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "12px", alignItems: "center" }}>
                      <History 
                        size={18} 
                        style={{cursor: "pointer", color: "#64748b"}} 
                        onClick={() => handleFetchHistory(p.prodcode, p.description)}
                        title="Price History"
                      />
                      {userAccess.canEdit && <Edit3 size={18} style={{cursor: "pointer", color: "#185FA5"}} onClick={() => handleOpenEditModal(p)} />}
                      {userAccess.canDelete && <Trash2 size={18} style={{cursor: "pointer", color: "#ef4444"}} onClick={() => handleDelete(p.prodcode)} />}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PRICE HISTORY MODAL (Fully aligned with unitprice screenshot) */}
      {showHistoryModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, width: "650px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>Price History: {selectedProdName}</h2>
              <X style={{ cursor: "pointer" }} onClick={() => setShowHistoryModal(false)} />
            </div>
            <div style={{ maxHeight: "350px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid #f1f5f9" }}>
                    <th style={thStyle}>New Price</th>
                    <th style={thStyle}>Updated On</th>
                    <th style={thStyle}>Stamp Details</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistData.length > 0 ? (
                    priceHistData.map((h, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ ...tdStyle, fontWeight: "700" }}>
                          ₱{(h.unitprice || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td style={tdStyle}>
                          {h.created_at ? new Date(h.created_at).toLocaleDateString() : "---"}
                        </td>
                        <td style={{ ...tdStyle, fontSize: "11px", color: "#64748b" }}>
                          {h.stamp || "No log details"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>No price history records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <button onClick={() => setShowHistoryModal(false)} style={{ ...saveBtnStyle, marginTop: "20px", backgroundColor: "#64748b" }}>Close</button>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>{isEditing ? "Edit Product" : "New Product"}</h2>
              <X style={{ cursor: "pointer" }} onClick={handleCloseModal} />
            </div>
            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Product Code</label>
                <input type="text" required disabled={isEditing} style={{ ...inputStyle, backgroundColor: isEditing ? "#f1f5f9" : "white" }} value={newProduct.prodcode} onChange={e => setNewProduct({...newProduct, prodcode: e.target.value})} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Description</label>
                <input type="text" required style={inputStyle} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Price</label>
                  <input type="number" step="0.01" required style={inputStyle} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Unit</label>
                  <input type="text" required style={inputStyle} value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Quantity</label>
                  <input type="number" required style={inputStyle} value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Reorder Level</label>
                  <input type="number" required style={inputStyle} value={newProduct.reorder_level} onChange={e => setNewProduct({...newProduct, reorder_level: e.target.value})} />
                </div>
              </div>
              <button type="submit" style={saveBtnStyle}>{isEditing ? "Update Changes" : "Save Product"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: "16px", color: "#64748b", fontWeight: "600", fontSize: "14px" };
const tdStyle = { padding: "16px", fontSize: "14px", color: "#334155" };
const labelStyle = { display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "600", color: "#475569" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box", outline: "none" };
const tableContainerStyle = { backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflowX: "auto" };
const searchBarStyle = { width: "100%", padding: "12px 12px 12px 45px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", boxSizing: "border-box" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle = { backgroundColor: "white", padding: "30px", borderRadius: "20px", width: "450px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" };
const primaryBtnStyle = { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#185FA5", color: "white", border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" };
const secondaryBtnStyle = { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#64748b", color: "white", border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer" };
const saveBtnStyle = { width: "100%", backgroundColor: "#185FA5", color: "white", padding: "12px", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" };